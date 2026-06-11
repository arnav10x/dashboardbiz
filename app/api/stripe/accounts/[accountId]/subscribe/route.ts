// POST /api/stripe/accounts/[accountId]/subscribe
// Creates a subscription Checkout Session so a connected account can subscribe to the
// prspectve Pro plan. Uses customer_account (V2) instead of customer (V1).
//
// REQUIRED ENV: STRIPE_PRICE_ID — the price ID for the prspectve Pro subscription plan.
// Create this in your Stripe dashboard: Products → Add product → Add a recurring price.
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: Request, { params }: { params: { accountId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    return NextResponse.json(
      { error: 'STRIPE_PRICE_ID is not configured. Create a recurring price in the Stripe dashboard and add its ID to your environment variables.' },
      { status: 500 }
    )
  }

  const { origin } = new URL(request.url)

  // For V2 connected accounts, use customer_account (the account ID) instead of customer.
  // The connected account acts as both the customer identity and the payment source.
  const session = await stripeClient.checkout.sessions.create({
    customer_account: params.accountId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/stripe-connect?subscribed=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/stripe-connect`,
  })

  return NextResponse.json({ url: session.url })
}
