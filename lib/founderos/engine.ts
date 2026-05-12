import type { SupabaseClient } from '@supabase/supabase-js'
import { generateBriefing, recordActivity } from './next-phase'

export const XP_LEVELS = [0, 1200, 3000, 6000, 11000, 18000, 28000, 42000, 60000, 85000, 120000, 170000, 240000, 340000, 480000, 675000, 950000, 1300000, 1750000, 2350000, 3150000, 4200000]

// XP is intentionally harder now. FounderOS should reward meaningful execution, not page reloads.
export const XP_AWARDS: Record<string, number> = {
  daily_checkin: 10,
  complete_task: 15,
  complete_high_priority_task: 30,
  complete_all_tasks: 40,
  log_period: 80,
  log_daily_pnl: 15,
  add_lead: 20,
  win_deal: 150,
  add_team_member: 25,
  use_ai_copilot: 0,
}

export function getLevel(xp: number): number {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) if (xp >= XP_LEVELS[i]) return i + 1
  return 1
}

export function levelProgress(xp: number) {
  const level = getLevel(xp)
  const currentFloor = XP_LEVELS[level - 1] ?? 0
  const nextCeiling = XP_LEVELS[level] ?? XP_LEVELS[XP_LEVELS.length - 1]
  const xpInLevel = Math.max(0, xp - currentFloor)
  const xpForNext = Math.max(1, nextCeiling - currentFloor)
  return { level, xpInLevel, xpForNext, pct: Math.min(100, Math.round((xpInLevel / xpForNext) * 100)) }
}

export const FOUNDER_RANKS = [
  { base: 'Rookie', division: 'I', color: '#22c55e' },
  { base: 'Rookie', division: 'II', color: '#22c55e' },
  { base: 'Rookie', division: 'III', color: '#22c55e' },
  { base: 'Silver', division: 'I', color: '#cfd8dc' },
  { base: 'Silver', division: 'II', color: '#cfd8dc' },
  { base: 'Silver', division: 'III', color: '#cfd8dc' },
  { base: 'Gold', division: 'I', color: '#f6c343' },
  { base: 'Gold', division: 'II', color: '#f6c343' },
  { base: 'Gold', division: 'III', color: '#f6c343' },
  { base: 'Diamond', division: 'I', color: '#38bdf8' },
  { base: 'Diamond', division: 'II', color: '#38bdf8' },
  { base: 'Diamond', division: 'III', color: '#38bdf8' },
  { base: 'Elite', division: 'I', color: '#a855f7' },
  { base: 'Elite', division: 'II', color: '#a855f7' },
  { base: 'Elite', division: 'III', color: '#a855f7' },
  { base: 'Founder', division: 'I', color: '#fb7185' },
  { base: 'Founder', division: 'II', color: '#fb7185' },
  { base: 'Founder', division: 'III', color: '#fb7185' },
]

export function rankInfo(level: number) {
  return FOUNDER_RANKS[Math.max(0, Math.min(FOUNDER_RANKS.length - 1, level - 1))]
}

export function rankName(level: number) {
  const rank = rankInfo(level)
  return rank.division ? `${rank.base} ${rank.division}` : rank.base
}

export function isoDate(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export async function ensureGamification(supabase: SupabaseClient, userId: string) {
  await supabase.from('user_gamification').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
  const { data } = await supabase.from('user_gamification').select('*').eq('user_id', userId).maybeSingle()
  return data || { user_id: userId, total_xp: 0, level: 1, current_streak: 0, longest_streak: 0, streak_freezes: 0, xp_history: [] }
}

export async function applyGamificationAction(supabase: SupabaseClient, userId: string, action: string) {
  const row = await ensureGamification(supabase, userId)
  const today = isoDate()
  const yesterday = isoDate(-1)
  const baseXpGain = XP_AWARDS[action] ?? 0
  let xpGain = baseXpGain
  let currentStreak = Number(row.current_streak) || 0
  let longestStreak = Number(row.longest_streak) || 0
  let streakFreezes = Number(row.streak_freezes) || 0
  const lastActive = row.last_active_date as string | null

  if (action === 'daily_checkin' || !lastActive || lastActive !== today) {
    if (lastActive === today) {
      // Idempotent daily check-in: reloading/clicking pages updates no streak and earns no XP.
      if (action === 'daily_checkin') xpGain = 0
    } else if (lastActive === yesterday) {
      currentStreak += 1
    } else if (lastActive) {
      const missed = Math.max(0, Math.floor((new Date(today).getTime() - new Date(lastActive).getTime()) / 86400000) - 1)
      if (missed > 0 && missed <= streakFreezes) {
        streakFreezes -= missed
        currentStreak += 1
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak)
  let bonusXp = 0
  if (action === 'daily_checkin') {
    if ([3, 7, 14, 30, 60, 100].includes(currentStreak)) bonusXp = currentStreak * 25
  }

  const beforeLevel = getLevel(Number(row.total_xp) || 0)
  const totalXp = (Number(row.total_xp) || 0) + xpGain + bonusXp
  const progress = levelProgress(totalXp)
  const history = Array.isArray(row.xp_history) ? row.xp_history.slice(-75) : []
  const entry = { action, xp: xpGain + bonusXp, ts: new Date().toISOString() }

  await supabase.from('user_gamification').update({
    total_xp: totalXp,
    level: progress.level,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    streak_freezes: streakFreezes,
    last_active_date: today,
    xp_history: [...history, entry],
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)

  await recordActivity(supabase, userId, action, `Earned ${xpGain + bonusXp} XP`, { action, xp: xpGain + bonusXp, level: progress.level }).catch(() => null)
  if (progress.level > beforeLevel) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'success',
        title: `Level ${progress.level} reached`,
        body: `You ranked up to ${rankName(progress.level)}. Keep the daily loop going.`,
        href: '/dashboard/achievements'
      })
    } catch {}
  }

  return { ...progress, totalXp, streak: currentStreak, longestStreak, streakFreezes, xpGained: xpGain + bonusXp, rank: rankName(progress.level) }
}


function toNumber(v: any) { return Number(v) || 0 }
function uniqueDays(values: (string | null | undefined)[]) {
  return [...new Set(values.filter(Boolean).map(v => String(v).slice(0, 10)))]
}

export function consecutiveStreak(days: string[]) {
  const set = new Set(days)
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = isoDate(-i)
    if (set.has(d)) streak++
    else if (i > 0) break
  }
  return streak
}

export async function getFounderSnapshot(supabase: SupabaseClient, userId: string) {
  const [{ data: workspace }, { data: settings }, { data: tasks }, { data: entries }, { data: daily }, { data: leads }, { data: events }, { data: gam }, { data: integrations }, { data: team }, { data: activity }, { data: unlocked }] = await Promise.all([
    supabase.from('workspaces').select('*').eq('owner_id', userId).maybeSingle(),
    supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(250),
    supabase.from('period_entries').select('*').eq('user_id', userId).order('period_date', { ascending: false }).limit(60),
    supabase.from('cal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false }).limit(120),
    supabase.from('pipeline_leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(300),
    supabase.from('calendar_events').select('*').eq('user_id', userId).order('event_date', { ascending: true }).limit(200),
    supabase.from('user_gamification').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('integration_connections').select('*').eq('user_id', userId),
    supabase.from('team_members').select('*').eq('user_id', userId),
    supabase.from('activity_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    supabase.from('user_achievements').select('*').eq('user_id', userId),
  ])

  const safeTasks = tasks || []
  const safeEntries = entries || []
  const safeDaily = daily || []
  const safeLeads = leads || []
  const latest = safeEntries[0]
  const currentRevenue = toNumber(latest?.revenue) || safeDaily.reduce((sum: number, e: any) => sum + toNumber(e.revenue), 0)
  const currentExpenses = toNumber(latest?.expenses) || safeDaily.reduce((sum: number, e: any) => sum + toNumber(e.expenses), 0)
  const profit = currentRevenue - currentExpenses
  const margin = currentRevenue > 0 ? Math.round((profit / currentRevenue) * 100) : 0
  const completedTasks = safeTasks.filter((t: any) => t.is_completed)
  const taskCompletionRate = safeTasks.length ? Math.round((completedTasks.length / safeTasks.length) * 100) : 0
  const taskStreak = consecutiveStreak(uniqueDays(completedTasks.map((t: any) => t.completed_at || t.updated_at || t.created_at)))
  const wonLeads = safeLeads.filter((l: any) => String(l.stage || l.status || '').toLowerCase().includes('won') || String(l.stage || l.status || '').toLowerCase().includes('closed'))
  const pipelineValue = safeLeads.reduce((sum: number, l: any) => sum + toNumber(l.value || l.deal_value), 0)
  const totalXp = toNumber(gam?.total_xp)
  const progress = levelProgress(totalXp)
  const revenueTarget = toNumber(settings?.revenue_target || latest?.revenue_target)

  return {
    workspace: workspace || null,
    settings: settings || null,
    tasks: safeTasks,
    periodEntries: safeEntries,
    dailyEntries: safeDaily,
    leads: safeLeads,
    events: events || [],
    integrations: integrations || [],
    teamMembers: team || [],
    activity: activity || [],
    unlockedAchievements: unlocked || [],
    gamification: {
      totalXp,
      level: progress.level,
      rank: rankName(progress.level),
      xpInLevel: progress.xpInLevel,
      xpForNext: progress.xpForNext,
      pct: progress.pct,
      streak: toNumber(gam?.current_streak),
      longestStreak: toNumber(gam?.longest_streak),
      streakFreezes: toNumber(gam?.streak_freezes),
      taskStreak,
    },
    metrics: {
      revenue: currentRevenue,
      expenses: currentExpenses,
      profit,
      margin,
      revenueTarget,
      revenueProgress: revenueTarget ? Math.min(100, Math.round((currentRevenue / revenueTarget) * 100)) : 0,
      taskCount: safeTasks.length,
      openTasks: safeTasks.length - completedTasks.length,
      completedTasks: completedTasks.length,
      taskCompletionRate,
      leadCount: safeLeads.length,
      wonDeals: wonLeads.length,
      pipelineValue,
      closeRate: safeLeads.length ? Math.round((wonLeads.length / safeLeads.length) * 100) : 0,
      activeDays: uniqueDays([...completedTasks.map((t: any) => t.completed_at), ...safeDaily.map((e: any) => e.entry_date), ...safeEntries.map((e: any) => e.period_date)]).length,
    },
    briefing: null as any,
  }
}

export type FounderSnapshot = Awaited<ReturnType<typeof getFounderSnapshot>>


export function buildNotifications(snapshot: Awaited<ReturnType<typeof getFounderSnapshot>>) {
  const notes: { id: string; type: 'warning'|'info'|'success'|'urgent'; title: string; body: string; href?: string }[] = []
  const m = snapshot.metrics
  if (m.openTasks > 0) notes.push({ id: 'open-tasks', type: 'info', title: `${m.openTasks} tasks still open`, body: 'Finish your highest-value execution tasks to earn XP and keep momentum.', href: '/dashboard/tasks' })
  if (m.revenueTarget > 0 && m.revenueProgress < 70) notes.push({ id: 'revenue-gap', type: 'warning', title: 'Revenue goal needs attention', body: `You are ${m.revenueProgress}% to goal. Check Reports for the gap and next actions.`, href: '/dashboard/reports' })
  if (m.leadCount === 0) notes.push({ id: 'no-pipeline', type: 'urgent', title: 'No pipeline leads yet', body: 'Add leads so FounderOS can track close rate, pipeline value, and sales momentum.', href: '/dashboard/pipeline' })
  if (snapshot.gamification.streak >= 7) notes.push({ id: 'streak-win', type: 'success', title: `${snapshot.gamification.streak}-day login streak`, body: 'Your consistency streak is building trophy progress.', href: '/dashboard/achievements' })
  if (m.taskCompletionRate >= 80 && m.taskCount > 0) notes.push({ id: 'execution-strong', type: 'success', title: 'Execution score is strong', body: `${m.taskCompletionRate}% task completion. Keep the daily loop alive.`, href: '/dashboard/tasks' })
  return notes
}

export function buildAiContext(snapshot: Awaited<ReturnType<typeof getFounderSnapshot>>) {
  const w = snapshot.workspace as any
  const m = snapshot.metrics
  const g = snapshot.gamification
  const topOpenTasks = snapshot.tasks.filter((t: any) => !t.is_completed).slice(0, 8).map((t: any) => t.title).join('; ') || 'none'
  const teamCount = snapshot.teamMembers?.length || 0
  const connectedIntegrations = (snapshot.integrations || []).filter((i: any) => i.status === 'connected').map((i: any) => i.provider).join(', ') || 'none'
  const recentActivity = (snapshot.activity || []).slice(0, 8).map((a: any) => a.title || a.type).join('; ') || 'none'
  const recentEvents = snapshot.events.slice(0, 8).map((e: any) => `${e.event_date || ''} ${e.start_time || ''} ${e.title || ''}`.trim()).join('; ') || 'none'
  return `FounderOS live context\nBusiness: ${w?.name || 'Unknown'}\nType: ${w?.business_type || 'unknown'}\nStage: ${w?.stage || 'unknown'}\nSummary: ${w?.business_summary || 'not provided'}\nRevenue: $${m.revenue.toLocaleString()}\nExpenses: $${m.expenses.toLocaleString()}\nProfit: $${m.profit.toLocaleString()}\nMargin: ${m.margin}%\nRevenue target progress: ${m.revenueProgress}%\nTasks: ${m.completedTasks}/${m.taskCount} completed (${m.taskCompletionRate}%)\nOpen tasks: ${topOpenTasks}\nPipeline leads: ${m.leadCount}\nWon deals: ${m.wonDeals}\nClose rate: ${m.closeRate}%\nPipeline value: $${m.pipelineValue.toLocaleString()}\nLevel: ${g.level}\nRank: ${g.rank}\nXP: ${g.totalXp}\nLogin streak: ${g.streak}\nTask streak: ${g.taskStreak}\nRecent/upcoming calendar: ${recentEvents}
Team members: ${teamCount}
Connected integrations: ${connectedIntegrations}
Recent activity: ${recentActivity}`
}
