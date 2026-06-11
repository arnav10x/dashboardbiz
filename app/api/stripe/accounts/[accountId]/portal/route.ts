// POST /api/stripe/accounts/[accountId]/portal
// Creates a Stripe Billing Portal session so a connected account can manage their
// prspectve Pro subscription (upgrade, downgrade, cancel, update payment method).
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: Request, { params }: { params: { accountId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { origin } = new URL(request.url)

  // For V2 accounts, use customer_account instead of customer to identify the subscriber
  const session = await stripeClient.billingPortal.sessions.create({
    customer_account: params.accountId,
    return_url: `${origin}/dashboard/stripe-connect`,
  } as any)

  return NextResponse.json({ url: session.url })
}
