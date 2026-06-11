import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch connection to check if it was OAuth
  const { data: conn } = await supabase
    .from('stripe_connections')
    .select('stripe_user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Revoke OAuth token so Stripe knows too
  const secretKey  = process.env.STRIPE_SECRET_KEY
  const clientId   = process.env.STRIPE_CLIENT_ID
  if (conn?.stripe_user_id && secretKey && clientId) {
    try {
      const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' })
      await stripe.oauth.deauthorize({ client_id: clientId, stripe_user_id: conn.stripe_user_id })
    } catch {}
  }

  await Promise.all([
    supabase.from('stripe_connections').delete().eq('user_id', user.id),
    supabase.from('stripe_payments').delete().eq('user_id', user.id),
  ])

  return NextResponse.json({ ok: true })
}
