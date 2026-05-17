import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyGamificationAction } from '@/lib/founderos/engine'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await applyGamificationAction(supabase as any, user.id, 'daily_checkin')
  return NextResponse.json(result)
}
