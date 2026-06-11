import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: settings } = await supabase
    .from('user_settings')
    .select('stripe_access_token, stripe_account_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Deauthorize on Stripe's side so they lose access too
  if (settings?.stripe_account_id && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
    await stripe.oauth.deauthorize({
      client_id: process.env.STRIPE_CLIENT_ID!,
      stripe_user_id: settings.stripe_account_id,
    }).catch(() => null) // swallow — still disconnect locally on failure
  }

  await Promise.all([
    supabase.from('user_settings').update({
      stripe_access_token:   null,
      stripe_account_id:     null,
      stripe_last_synced_at: null,
    }).eq('user_id', user.id),
    // Remove all Stripe-synced revenue entries
    supabase.from('revenue_logs').delete().eq('user_id', user.id).eq('source', 'stripe'),
  ])

  return NextResponse.json({ ok: true })
}
