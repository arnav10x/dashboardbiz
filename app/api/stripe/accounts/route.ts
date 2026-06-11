// POST /api/stripe/accounts
// Creates a Stripe V2 connected account for the authenticated user and stores the
// account ID in the database. One connected account per prspectve user.
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { displayName, contactEmail } = await request.json()
  if (!displayName || !contactEmail) {
    return NextResponse.json({ error: 'displayName and contactEmail are required' }, { status: 400 })
  }

  // Check if a connected account already exists for this user
  const { data: existing } = await supabase
    .from('stripe_connected_accounts')
    .select('stripe_account_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ accountId: existing.stripe_account_id })
  }

  // Create a V2 connected account using the new Stripe API.
  // Using dashboard: 'full' and fees_collector/losses_collector: 'stripe' so Stripe handles
  // compliance. The merchant configuration requests card_payments capability.
  // NOTE: Never pass type: 'express' | 'standard' | 'custom' at the top level with V2 accounts.
  const account = await (stripeClient as any).v2.core.accounts.create({
    display_name: displayName,
    contact_email: contactEmail,
    identity: { country: 'us' },
    dashboard: 'full',
    defaults: {
      responsibilities: {
        fees_collector: 'stripe',
        losses_collector: 'stripe',
      },
    },
    configuration: {
      customer: {},
      merchant: {
        capabilities: {
          card_payments: { requested: true },
        },
      },
    },
  })

  // Store the mapping from prspectve user → Stripe account ID
  await supabase.from('stripe_connected_accounts').insert({
    user_id: user.id,
    stripe_account_id: account.id,
    display_name: displayName,
  })

  return NextResponse.json({ accountId: account.id })
}

// GET /api/stripe/accounts — fetch the user's connected account from the DB
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('stripe_connected_accounts')
    .select('stripe_account_id, display_name, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ account: data ?? null })
}
