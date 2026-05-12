import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const TABLES = [
  'tasks','period_entries','cal_entries','pipeline_leads','calendar_events','notifications',
  'user_gamification','user_achievements','activity_events','integration_connections',
  'team_members','workspace_members','user_settings','user_profiles','ai_memory','sync_logs'
]

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  for (const table of TABLES) {
    try { await supabase.from(table).delete().eq('user_id', user.id) } catch {}
  }
  try { await supabase.from('workspaces').delete().eq('owner_id', user.id) } catch {}
  return NextResponse.json({ ok: true })
}
