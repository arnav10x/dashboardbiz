import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${origin}/login`)

  const clientId = process.env.STRIPE_CLIENT_ID
  if (!clientId) {
    return NextResponse.redirect(`${origin}/dashboard/finance?stripe=not_configured`)
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'read_only',
    redirect_uri: `${origin}/api/stripe/callback`,
    state: user.id,
  })

  return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params}`)
}
