import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFounderSnapshot } from '@/lib/founderos/engine'
import { generateMissions, recordActivity } from '@/lib/founderos/next-phase'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snapshot = await getFounderSnapshot(supabase as any, user.id)
  return NextResponse.json({ missions: generateMissions(snapshot) })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const snapshot = await getFounderSnapshot(supabase as any, user.id)
  const mission = generateMissions(snapshot).find(m => m.id === body?.missionId) || generateMissions(snapshot)[0]
  if (!mission) return NextResponse.json({ error: 'No mission available' }, { status: 400 })
  const { data, error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: mission.title,
    notes: `${mission.category} • ${mission.reason}`,
    priority: mission.priority,
    is_completed: false,
    completed_at: null,
  }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await recordActivity(supabase as any, user.id, 'mission_added', `Added mission: ${mission.title}`, { missionId: mission.id })
  return NextResponse.json({ task: data, mission })
}
