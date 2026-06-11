import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const clientId = process.env.STRIPE_CLIENT_ID
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL

  if (!clientId || !siteUrl) {
    return NextResponse.json(
      { error: 'Stripe Connect is not configured on this server.' },
      { status: 500 },
    )
  }
  if (!user) {
    return NextResponse.redirect(`${siteUrl}/login`)
  }

  // CSRF state: userId + random bytes so the callback can verify the session
  const state = `${user.id}:${randomBytes(16).toString('hex')}`

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'read_only',
    state,
    redirect_uri: `${siteUrl}/api/stripe/oauth/callback`,
  })

  const res = NextResponse.redirect(
    `https://connect.stripe.com/oauth/authorize?${params}`,
  )
  res.cookies.set('stripe_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
