import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFounderSnapshot } from '@/lib/founderos/engine'
import { generateMissions, recordActivity } from '@/lib/founderos/next-phase'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { missionId } = await req.json().catch(() => ({ missionId: '' }))
  const snapshot = await getFounderSnapshot(supabase as any, user.id)
  const mission = generateMissions(snapshot).find(m => m.id === missionId) || generateMissions(snapshot)[0]
  if (!mission) return NextResponse.json({ error: 'No mission available' }, { status: 400 })
  const { data: task } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: mission.title,
    notes: `${mission.description}\n\nWhy: ${mission.reason}`,
    is_completed: false,
    completed_at: null,
  }).select('id,title,notes,is_completed').single()
  await supabase.from('daily_mission_logs').upsert({
    user_id: user.id,
    mission_id: mission.id,
    status: 'activated',
    task_id: task?.id || null,
    log_date: new Date().toISOString().slice(0, 10),
  }, { onConflict: 'user_id,mission_id,log_date' })
  await recordActivity(supabase as any, user.id, 'mission_activated', `Activated mission: ${mission.title}`, { mission })
  return NextResponse.json({ ok: true, mission, task })
}
