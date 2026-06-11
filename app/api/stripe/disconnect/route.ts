import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await Promise.all([
    supabase.from('stripe_connections').delete().eq('user_id', user.id),
    supabase.from('stripe_payments').delete().eq('user_id', user.id),
  ])

  return NextResponse.json({ ok: true })
}
