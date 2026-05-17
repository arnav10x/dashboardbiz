import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFounderSnapshot } from '@/lib/founderos/engine'
import { generateBriefing } from '@/lib/founderos/next-phase'
import { syncAiMemory } from '@/lib/founderos/intelligence'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const snapshot = await getFounderSnapshot(supabase as any, user.id)
  const memory = await syncAiMemory(supabase as any, user.id, { ...snapshot, briefing: generateBriefing(snapshot) })
  return NextResponse.json({ ok: true, memory })
}
