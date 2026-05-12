import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await Promise.all([
    supabase.from('period_entries').delete().eq('user_id', user.id),
    supabase.from('tasks').delete().eq('user_id', user.id),
    supabase.from('pipeline_leads').delete().eq('user_id', user.id),
    supabase.from('cal_entries').delete().eq('user_id', user.id),
    supabase.from('calendar_events').delete().eq('user_id', user.id),
    supabase.from('user_gamification').delete().eq('user_id', user.id),
    supabase.from('user_achievements').delete().eq('user_id', user.id),
  ])
  try { await supabase.from('notifications').delete().eq('user_id', user.id) } catch {}
  return NextResponse.json({ ok: true })
}
