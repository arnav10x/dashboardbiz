import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: settings } = await supabase
    .from('user_settings')
    .select('stripe_access_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!settings?.stripe_access_token) {
    return NextResponse.json({ error: 'Stripe not connected' }, { status: 400 })
  }

  // Use the connected account's access_token as the API key (Standard Connect)
  const stripe = new Stripe(settings.stripe_access_token, { apiVersion: '2024-06-20' as any })

  // Fetch last 90 days of successful charges
  const since = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000)
  const charges = await stripe.charges.list({ limit: 100, created: { gte: since } })

  const successfulCharges = charges.data.filter(c => c.paid && c.status === 'succeeded' && !c.refunded)

  // Replace all previous Stripe-sourced logs for this user
  await supabase.from('revenue_logs').delete().eq('user_id', user.id).eq('source', 'stripe')

  if (successfulCharges.length > 0) {
    const logs = successfulCharges.map(c => ({
      user_id:     user.id,
      amount:      c.amount / 100,
      client_name: c.billing_details?.name || null,
      logged_at:   new Date(c.created * 1000).toISOString(),
      source:      'stripe',
    }))
    await supabase.from('revenue_logs').insert(logs)
  }

  await supabase.from('user_settings')
    .update({ stripe_last_synced_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({ synced: successfulCharges.length })
}
