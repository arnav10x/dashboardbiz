import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const secretKey = process.env.STRIPE_SECRET_KEY
  const financeUrl = `${siteUrl}/dashboard/finance`

  if (!user)      return NextResponse.redirect(`${siteUrl}/login`)
  if (!secretKey) return NextResponse.redirect(`${financeUrl}?stripe_error=not_configured`)

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')

  // User denied on Stripe's page
  if (oauthError) {
    return NextResponse.redirect(`${financeUrl}?stripe_error=${encodeURIComponent(oauthError)}`)
  }

  // Verify CSRF state
  const storedState = req.cookies.get('stripe_oauth_state')?.value
  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${financeUrl}?stripe_error=invalid_state`)
  }

  try {
    const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })

    // Exchange authorization code → access token
    const token = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const accessToken  = token.access_token!
    const stripeUserId = token.stripe_user_id!

    // Get a human-readable account name
    let accountName = 'Stripe Account'
    try {
      const acct = await stripe.accounts.retrieve(stripeUserId)
      accountName =
        acct.settings?.dashboard?.display_name ??
        acct.business_profile?.name ??
        acct.email ??
        'Stripe Account'
    } catch {}

    // Persist connection
    await supabase
      .from('stripe_connections')
      .upsert(
        {
          user_id:       user.id,
          access_token:  accessToken,
          stripe_user_id: stripeUserId,
          account_name:  accountName,
          connected_at:  new Date().toISOString(),
          api_key:       null,
        },
        { onConflict: 'user_id' },
      )

    // Auto-sync last 180 days of payments in the background
    try {
      const connectedStripe = new Stripe(accessToken, { apiVersion: '2023-10-16' })
      const since   = Math.floor((Date.now() - 180 * 24 * 60 * 60 * 1000) / 1000)
      const charges = await connectedStripe.charges.list({ limit: 100, created: { gte: since } })
      const succeeded = charges.data.filter((c: Stripe.Charge) => c.status === 'succeeded')

      if (succeeded.length > 0) {
        const rows = succeeded.map((c: Stripe.Charge) => ({
          user_id:          user.id,
          stripe_charge_id: c.id,
          amount:           c.amount / 100,
          currency:         c.currency,
          customer_name:    c.billing_details?.name    ?? null,
          customer_email:   c.billing_details?.email   ?? null,
          description:      c.description              ?? null,
          stripe_created_at: new Date(c.created * 1000).toISOString(),
          synced_at:        new Date().toISOString(),
        }))
        await supabase
          .from('stripe_payments')
          .upsert(rows, { onConflict: 'user_id,stripe_charge_id' })
      }
      await supabase
        .from('stripe_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('user_id', user.id)
    } catch {}

    const res = NextResponse.redirect(`${financeUrl}?stripe_connected=1`)
    res.cookies.delete('stripe_oauth_state')
    return res
  } catch (err: any) {
    return NextResponse.redirect(
      `${financeUrl}?stripe_error=${encodeURIComponent(err?.message ?? 'oauth_failed')}`,
    )
  }
}
