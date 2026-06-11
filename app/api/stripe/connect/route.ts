import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeClient } from '@/lib/stripe'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const apiKey: string = String(body.apiKey || '').trim()
  const accountName: string = String(body.accountName || '').trim() || 'My Stripe Account'

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required.' }, { status: 400 })
  }
  if (
    !apiKey.startsWith('rk_test_') &&
    !apiKey.startsWith('rk_live_') &&
    !apiKey.startsWith('sk_test_') &&
    !apiKey.startsWith('sk_live_')
  ) {
    return NextResponse.json(
      { error: 'Invalid key format. Use a Restricted Key (rk_…) or Secret Key (sk_…).' },
      { status: 400 },
    )
  }

  // Validate the key against Stripe
  try {
    const stripe = createStripeClient(apiKey)
    await stripe.balance.retrieve()
  } catch (err: any) {
    const msg: string = err?.message ?? 'Unknown error'
    return NextResponse.json({ error: `Stripe rejected the key: ${msg}` }, { status: 400 })
  }

  const { error } = await supabase
    .from('stripe_connections')
    .upsert(
      { user_id: user.id, api_key: apiKey, account_name: accountName, connected_at: new Date().toISOString() },
      { onConflict: 'user_id' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, accountName })
}
