import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: settings } = await supabase
    .from('user_settings')
    .select('stripe_plan, stripe_subscription_status, stripe_current_period_end, stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const isPro = settings?.stripe_plan === 'pro' && settings?.stripe_subscription_status === 'active'

  return NextResponse.json({
    plan: settings?.stripe_plan || 'free',
    status: settings?.stripe_subscription_status || null,
    isPro,
    currentPeriodEnd: settings?.stripe_current_period_end || null,
    hasCustomer: !!settings?.stripe_customer_id,
  })
}
