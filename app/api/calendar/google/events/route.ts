import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function refreshAccessToken(supabase: any, userId: string, refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  await supabase.from('user_oauth_tokens').update({
    access_token: data.access_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId).eq('provider', 'google');

  return data.access_token as string;
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: token } = await supabase
      .from('user_oauth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single();

    if (!token) return NextResponse.json({ events: [] });

    let accessToken = token.access_token;

    // Refresh if expired or within 5 min of expiry
    if (token.expires_at && new Date(token.expires_at).getTime() - Date.now() < 300_000) {
      if (!token.refresh_token) return NextResponse.json({ events: [], error: 'Token expired, please reconnect Google Calendar' });
      accessToken = await refreshAccessToken(supabase, user.id, token.refresh_token);
    }

    // Fetch next 60 days of events from Google Calendar
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 60 * 86_400_000).toISOString();

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
      new URLSearchParams({ timeMin, timeMax, singleEvents: 'true', orderBy: 'startTime', maxResults: '100' }),
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch Google events');
    }

    const data = await res.json();
    const events = (data.items || []).map((e: any) => ({
      id: e.id,
      title: e.summary || '(No title)',
      description: e.description,
      location: e.location,
      start_time: e.start?.dateTime || e.start?.date,
      end_time: e.end?.dateTime || e.end?.date,
      source: 'google',
    }));

    return NextResponse.json({ events });
  } catch (e: any) {
    console.error('Google events fetch error:', e);
    return NextResponse.json({ events: [], error: e.message }, { status: 200 });
  }
}
