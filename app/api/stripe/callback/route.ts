import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${origin}/dashboard/finance?stripe=denied`)
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.redirect(`${origin}/dashboard/finance?stripe=not_configured`)
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_secret: secretKey,
      code,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokenRes.ok || tokens.error || !tokens.access_token) {
    return NextResponse.redirect(`${origin}/dashboard/finance?stripe=error`)
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== state) {
    return NextResponse.redirect(`${origin}/dashboard/finance?stripe=error`)
  }

  await supabase.from('user_settings').upsert({
    user_id: user.id,
    stripe_access_token: tokens.access_token,
    stripe_account_id:   tokens.stripe_user_id,
  }, { onConflict: 'user_id' })

  return NextResponse.redirect(`${origin}/dashboard/finance?stripe=connected`)
}
