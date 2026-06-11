import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: conn }, { data: payments }] = await Promise.all([
    supabase
      .from('stripe_connections')
      .select('account_name, connected_at, last_synced_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('stripe_payments')
      .select('stripe_charge_id, amount, currency, customer_name, customer_email, description, stripe_created_at')
      .eq('user_id', user.id)
      .order('stripe_created_at', { ascending: false })
      .limit(50),
  ])

  if (!conn) return NextResponse.json({ connected: false })

  const totalRevenue = (payments ?? []).reduce((s: number, p: { amount: unknown }) => s + Number(p.amount), 0)

  return NextResponse.json({
    connected: true,
    accountName: conn.account_name,
    connectedAt: conn.connected_at,
    lastSyncedAt: conn.last_synced_at,
    paymentCount: payments?.length ?? 0,
    totalRevenue,
    payments: payments ?? [],
  })
}
