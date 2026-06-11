// POST /api/stripe/accounts/[accountId]/onboard
// Creates a Stripe Account Link so the connected account can complete onboarding.
// The link is single-use and expires after a short time.
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: Request, { params }: { params: { accountId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { origin } = new URL(request.url)
  const accountId = params.accountId

  // Create a V2 account link for onboarding both merchant and customer configurations.
  // refresh_url: where to send the user if the link expires (regenerate a new one)
  // return_url: where to send the user after completing or skipping onboarding
  const accountLink = await (stripeClient as any).v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: 'account_onboarding',
      account_onboarding: {
        configurations: ['merchant', 'customer'],
        refresh_url: `${origin}/dashboard/stripe-connect?refresh=true&accountId=${accountId}`,
        return_url: `${origin}/dashboard/stripe-connect?accountId=${accountId}&onboarded=true`,
      },
    },
  })

  return NextResponse.json({ url: accountLink.url })
}
