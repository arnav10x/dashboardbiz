import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    const { origin } = new URL(request.url)
    return NextResponse.redirect(`${origin}/dashboard/integrations?error=oauth-not-configured`)
  }

  const redirectUri = `${origin}/api/auth/google-calendar/callback`
  const scope = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
