import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeClient } from '@/lib/stripe'
import Stripe from 'stripe'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabase
    .from('stripe_connections')
    .select('api_key, access_token')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!conn) return NextResponse.json({ error: 'No Stripe connection found.' }, { status: 404 })

  // OAuth access_token takes priority over a manually supplied api_key
  const key = (conn.access_token ?? conn.api_key) as string | null
  if (!key) return NextResponse.json({ error: 'No Stripe credentials found.' }, { status: 404 })

  try {
    const stripe = createStripeClient(key)

    const since   = Math.floor((Date.now() - 180 * 24 * 60 * 60 * 1000) / 1000)
    const charges = await stripe.charges.list({ limit: 100, created: { gte: since } })
    const succeeded = charges.data.filter((c: Stripe.Charge) => c.status === 'succeeded')

    if (succeeded.length > 0) {
      const rows = succeeded.map((c: Stripe.Charge) => ({
        user_id:          user.id,
        stripe_charge_id: c.id,
        amount:           c.amount / 100,
        currency:         c.currency,
        customer_name:    c.billing_details?.name  ?? null,
        customer_email:   c.billing_details?.email ?? null,
        description:      c.description            ?? null,
        stripe_created_at: new Date(c.created * 1000).toISOString(),
        synced_at:        new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('stripe_payments')
        .upsert(rows, { onConflict: 'user_id,stripe_charge_id' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await supabase
      .from('stripe_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true, synced: succeeded.length })
  } catch (err: any) {
    return NextResponse.json({ error: `Stripe error: ${err.message ?? 'Unknown'}` }, { status: 400 })
  }
}
