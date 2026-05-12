import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyGamificationAction, buildAiContext, buildNotifications, getFounderSnapshot } from '@/lib/founderos/engine'
import { generateBriefing } from '@/lib/founderos/next-phase'
import { buildAutomationRules, buildCeoReport, buildHealthSignals, syncAiMemory } from '@/lib/founderos/intelligence'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await applyGamificationAction(supabase as any, user.id, 'daily_checkin')
  const snapshot = await getFounderSnapshot(supabase as any, user.id)
  const briefing = generateBriefing(snapshot)
  const enrichedSnapshot = { ...snapshot, briefing }
  const ceoReport = buildCeoReport(enrichedSnapshot)
  const healthSignals = buildHealthSignals(snapshot)
  const automations = buildAutomationRules(snapshot)
  await syncAiMemory(supabase as any, user.id, enrichedSnapshot).catch(() => null)
  return NextResponse.json({ ...enrichedSnapshot, notifications: buildNotifications(snapshot), aiContext: buildAiContext(snapshot), ceoReport, healthSignals, automations })
}
