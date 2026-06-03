import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.STRIPE_PRO_PRICE_ID) {
    return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
  }

  // Get or create Stripe customer
  const { data: settings } = await supabase
    .from('user_settings')
    .select('stripe_customer_id, full_name')
    .eq('user_id', user.id)
    .maybeSingle()

  let customerId = settings?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: settings?.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('user_settings').upsert(
      { user_id: user.id, stripe_customer_id: customerId },
      { onConflict: 'user_id' }
    )
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/dashboard/billing?upgraded=true`,
    cancel_url: `${origin}/dashboard/billing`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  })

  return NextResponse.json({ url: session.url })
}
