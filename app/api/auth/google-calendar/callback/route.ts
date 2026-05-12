import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard/integrations?error=google_denied`)
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${origin}/api/auth/google-calendar/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/dashboard/integrations?error=not_configured`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokenRes.ok || !tokens.access_token) {
    return NextResponse.redirect(`${origin}/dashboard/integrations?error=token_exchange_failed`)
  }

  // Save tokens to user_settings
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('integration_connections').upsert({ user_id: user.id, provider: 'google_calendar', status: 'connected', connected_at: new Date().toISOString(), updated_at: new Date().toISOString(), metadata: { source: 'oauth' } }, { onConflict: 'user_id,provider' })
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      google_cal_access_token: tokens.access_token,
      google_cal_refresh_token: tokens.refresh_token ?? null,
      google_cal_token_expiry: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      google_cal_connected: true,
    }, { onConflict: 'user_id' })
  }

  return NextResponse.redirect(`${origin}/dashboard/integrations?connected=google_calendar`)
}
