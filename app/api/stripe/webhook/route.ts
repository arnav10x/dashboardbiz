import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const supabase = createClient()

  const getUserId = (metadata?: Stripe.Metadata | null): string | null =>
    metadata?.supabase_user_id || null

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = getUserId(session.subscription
        ? (await stripe.subscriptions.retrieve(session.subscription as string)).metadata
        : session.metadata)
      if (!userId) break
      await supabase.from('user_settings').upsert(
        { user_id: userId, stripe_customer_id: session.customer as string, stripe_plan: 'pro', stripe_subscription_status: 'active', stripe_subscription_id: session.subscription as string },
        { onConflict: 'user_id' }
      )
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = getUserId(sub.metadata)
      if (!userId) break
      const isPro = sub.status === 'active' || sub.status === 'trialing'
      await supabase.from('user_settings').upsert(
        {
          user_id: userId,
          stripe_subscription_id: sub.id,
          stripe_subscription_status: sub.status,
          stripe_plan: isPro ? 'pro' : 'free',
          stripe_current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        },
        { onConflict: 'user_id' }
      )
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = getUserId(sub.metadata)
      if (!userId) break
      await supabase.from('user_settings').upsert(
        { user_id: userId, stripe_plan: 'free', stripe_subscription_status: 'canceled', stripe_subscription_id: null, stripe_current_period_end: null },
        { onConflict: 'user_id' }
      )
      break
    }
  }

  return NextResponse.json({ received: true })
}
