export interface GoogleCalendarSyncResult {
  synced: number
  error?: string
}

export async function syncGoogleCalendarEvents(
  supabase: any,
  userId: string
): Promise<GoogleCalendarSyncResult> {
  const { data: settings } = await supabase
    .from('user_settings')
    .select('google_cal_access_token, google_cal_refresh_token, google_cal_token_expiry')
    .eq('user_id', userId)
    .maybeSingle()

  if (!settings?.google_cal_access_token) {
    return { synced: 0, error: 'Google Calendar not connected' }
  }

  let accessToken: string = settings.google_cal_access_token
  const tokenExpiry: string | null = settings.google_cal_token_expiry

  // Refresh access token if it expires within 60 seconds
  if (tokenExpiry && new Date(tokenExpiry).getTime() < Date.now() + 60_000) {
    if (!settings.google_cal_refresh_token) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: userId, google_cal_connected: false }, { onConflict: 'user_id' })
      return { synced: 0, error: 'Token expired — please reconnect Google Calendar.' }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return { synced: 0, error: 'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set.' }
    }

    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: settings.google_cal_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const refreshData = await refreshRes.json()
    if (!refreshRes.ok || !refreshData.access_token) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: userId, google_cal_connected: false }, { onConflict: 'user_id' })
      return { synced: 0, error: 'Failed to refresh token — please reconnect Google Calendar.' }
    }

    accessToken = refreshData.access_token
    await supabase.from('user_settings').upsert({
      user_id: userId,
      google_cal_access_token: accessToken,
      google_cal_token_expiry: refreshData.expires_in
        ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
        : null,
    }, { onConflict: 'user_id' })
  }

  // Fetch events: 30 days back, 60 days forward
  const timeMin = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const timeMax = new Date(Date.now() + 60 * 86_400_000).toISOString()

  const calRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    `&maxResults=250&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!calRes.ok) {
    if (calRes.status === 401) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: userId, google_cal_connected: false }, { onConflict: 'user_id' })
      return { synced: 0, error: 'Google Calendar access revoked — please reconnect.' }
    }
    const err = await calRes.json().catch(() => ({}))
    return { synced: 0, error: `Google Calendar API error: ${err?.error?.message || calRes.status}` }
  }

  const calData = await calRes.json()
  const googleEvents: any[] = calData.items || []

  const startDate = timeMin.slice(0, 10)
  const endDate = timeMax.slice(0, 10)

  // Remove stale synced events in the window before reinserting
  await supabase
    .from('calendar_events')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'google')
    .gte('event_date', startDate)
    .lte('event_date', endDate)

  const eventsToInsert = googleEvents
    .filter((e: any) => e.status !== 'cancelled' && (e.start?.date || e.start?.dateTime))
    .map((e: any) => {
      const isAllDay = !!e.start?.date
      const eventDate = isAllDay ? e.start.date : e.start.dateTime.slice(0, 10)
      const startTime = isAllDay ? null : e.start.dateTime.slice(11, 19)
      const endTime = isAllDay ? null : (e.end?.dateTime?.slice(11, 19) || null)
      return {
        user_id: userId,
        title: (e.summary || 'Untitled Event').slice(0, 200),
        description: e.description ? String(e.description).slice(0, 500) : null,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        all_day: isAllDay,
        color: '#4285F4',
        source: 'google',
      }
    })

  if (eventsToInsert.length > 0) {
    await supabase.from('calendar_events').insert(eventsToInsert)
  }

  return { synced: eventsToInsert.length }
}
