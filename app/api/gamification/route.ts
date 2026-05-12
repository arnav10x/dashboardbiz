import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyGamificationAction, ensureGamification, levelProgress, rankName } from '@/lib/founderos/engine'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const row = await ensureGamification(supabase as any, user.id)
  const totalXp = Number(row.total_xp) || 0
  const prog = levelProgress(totalXp)
  return NextResponse.json({
    streak: Number(row.current_streak) || 0,
    longestStreak: Number(row.longest_streak) || 0,
    level: prog.level,
    rank: rankName(prog.level),
    totalXp,
    xpInLevel: prog.xpInLevel,
    xpForNext: prog.xpForNext,
    pct: prog.pct,
    streakFreezes: Number(row.streak_freezes) || 0,
    lastActiveDate: row.last_active_date,
  })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { action } = await req.json().catch(() => ({ action: 'daily_checkin' }))
  const result = await applyGamificationAction(supabase as any, user.id, action || 'daily_checkin')
  return NextResponse.json(result)
}
