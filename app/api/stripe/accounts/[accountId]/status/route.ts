// GET /api/stripe/accounts/[accountId]/status
// Fetches live onboarding status directly from the Stripe V2 API.
// Status is never cached in the database — always fetched fresh per the requirements.
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function GET(_req: Request, { params }: { params: { accountId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Retrieve the account with merchant configuration and requirements included
  const account = await (stripeClient as any).v2.core.accounts.retrieve(
    params.accountId,
    { include: ['configuration.merchant', 'requirements'] }
  )

  // card_payments must be 'active' for the account to process payments
  const readyToProcessPayments =
    account?.configuration?.merchant?.capabilities?.card_payments?.status === 'active'

  // Onboarding is complete when there are no currently_due or past_due requirements
  const requirementsStatus = account?.requirements?.summary?.minimum_deadline?.status
  const onboardingComplete =
    requirementsStatus !== 'currently_due' && requirementsStatus !== 'past_due'

  return NextResponse.json({
    accountId: params.accountId,
    readyToProcessPayments,
    onboardingComplete,
    requirementsStatus: requirementsStatus ?? 'none',
    displayName: account.display_name,
  })
}
