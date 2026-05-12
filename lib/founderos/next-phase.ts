import type { SupabaseClient } from '@supabase/supabase-js'
import { XP_AWARDS, type FounderSnapshot } from './engine'

export type Mission = {
  id: string
  title: string
  description: string
  category: 'sales' | 'execution' | 'finance' | 'systems' | 'ai'
  priority: 'high' | 'medium' | 'low'
  xp: number
  reason: string
  href: string
}

function money(n: number) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`
}

export function founderScore(snapshot: FounderSnapshot) {
  const m = snapshot.metrics
  const g = snapshot.gamification
  const revenue = m.revenueTarget > 0 ? Math.min(100, m.revenueProgress) : m.revenue > 0 ? 55 : 15
  const execution = m.taskCount > 0 ? m.taskCompletionRate : 20
  const pipeline = m.leadCount > 0 ? Math.min(100, Math.max(20, m.closeRate * 2 + Math.min(40, m.leadCount * 4))) : 10
  const consistency = Math.min(100, Math.max(g.streak * 8, g.taskStreak * 12, m.activeDays * 4))
  const total = Math.round(revenue * 0.28 + execution * 0.28 + pipeline * 0.24 + consistency * 0.20)
  return { total, revenue, execution, pipeline, consistency }
}

export function generateMissions(snapshot: FounderSnapshot): Mission[] {
  const m = snapshot.metrics
  const g = snapshot.gamification
  const missions: Mission[] = []

  if (m.openTasks > 0) {
    missions.push({
      id: 'finish-top-task',
      title: 'Finish your highest leverage task',
      description: `You have ${m.openTasks} open tasks. Complete the most valuable one first.`,
      category: 'execution', priority: 'high', xp: XP_AWARDS.complete_high_priority_task,
      reason: 'Execution is the fastest way to keep XP, streaks, and momentum moving.', href: '/dashboard/tasks'
    })
  } else {
    missions.push({
      id: 'create-growth-task',
      title: 'Create one growth task for today',
      description: 'Add a task that directly creates revenue, leads, or retention.',
      category: 'execution', priority: 'medium', xp: XP_AWARDS.complete_task,
      reason: 'Your task board is clear, so the next move is creating a new growth action.', href: '/dashboard/tasks'
    })
  }

  if (m.leadCount === 0) {
    missions.push({
      id: 'add-first-lead',
      title: 'Add your first pipeline lead',
      description: 'Create one real lead so FounderOS can start tracking close rate and pipeline value.',
      category: 'sales', priority: 'high', xp: XP_AWARDS.add_lead,
      reason: 'A business OS becomes useful when the pipeline has real opportunities inside it.', href: '/dashboard/pipeline'
    })
  } else if (m.closeRate < 20) {
    missions.push({
      id: 'move-lead-forward',
      title: 'Move one lead to the next stage',
      description: `Your close rate is ${m.closeRate}%. Push one active lead forward today.`,
      category: 'sales', priority: 'high', xp: XP_AWARDS.add_lead,
      reason: 'Pipeline movement is the leading indicator before revenue increases.', href: '/dashboard/pipeline'
    })
  }

  if (m.revenue === 0) {
    missions.push({
      id: 'log-revenue-baseline',
      title: 'Log your first revenue baseline',
      description: 'Add revenue and expenses so reports, AI, and goals become specific.',
      category: 'finance', priority: 'high', xp: XP_AWARDS.log_period,
      reason: 'Without financial data, reports and AI can only give generic advice.', href: '/dashboard/period-entry'
    })
  } else if (m.revenueTarget > 0 && m.revenueProgress < 75) {
    missions.push({
      id: 'close-revenue-gap',
      title: 'Create a revenue-gap action',
      description: `You are ${m.revenueProgress}% to your goal. Add one action to close the gap.`,
      category: 'finance', priority: 'medium', xp: XP_AWARDS.complete_task,
      reason: `Current revenue is ${money(m.revenue)} against a ${money(m.revenueTarget)} target.`, href: '/dashboard/reports'
    })
  }

  if (g.streak > 0 && g.streak % 7 === 0) {
    missions.push({
      id: 'streak-milestone',
      title: `Protect your ${g.streak}-day streak`,
      description: 'Complete at least one meaningful action today to lock in the streak momentum.',
      category: 'systems', priority: 'medium', xp: 75,
      reason: 'Weekly streak milestones should feel rewarding and competitive.', href: '/dashboard/achievements'
    })
  }

  missions.push({
    id: 'ask-ai-copilot',
    title: 'Ask AI for one bottleneck diagnosis',
    description: 'Use your live data to get a next-action recommendation from AI Copilot.',
    category: 'ai', priority: 'low', xp: XP_AWARDS.use_ai_copilot,
    reason: 'The copilot becomes more valuable when it reasons from your actual tasks, revenue, and pipeline.', href: '/dashboard/ai-copilot'
  })

  return missions.slice(0, 5)
}

export function generateBriefing(snapshot: FounderSnapshot) {
  const m = snapshot.metrics
  const g = snapshot.gamification
  const score = founderScore(snapshot)
  const missions = generateMissions(snapshot)
  const risks: string[] = []
  const wins: string[] = []

  if (m.openTasks > 3) risks.push(`${m.openTasks} open tasks could slow execution.`)
  if (m.leadCount === 0) risks.push('Pipeline is empty, so sales reporting has no real signal yet.')
  if (m.revenueTarget > 0 && m.revenueProgress < 50) risks.push(`Revenue is only ${m.revenueProgress}% to target.`)
  if (m.taskCompletionRate >= 80 && m.taskCount > 0) wins.push(`Execution is strong at ${m.taskCompletionRate}% task completion.`)
  if (g.streak >= 3) wins.push(`${g.streak}-day login streak is active.`)
  if (m.profit > 0) wins.push(`Profit is positive at ${money(m.profit)}.`)

  return {
    generatedAt: new Date().toISOString(),
    founderScore: score,
    headline: score.total >= 75 ? 'Momentum is strong. Keep stacking wins.' : score.total >= 45 ? 'You have momentum, but there are clear gaps to close.' : 'FounderOS needs more real data and daily execution to become useful.',
    wins,
    risks,
    missions,
    nextBestAction: missions[0] || null,
  }
}

export async function recordActivity(supabase: SupabaseClient, userId: string, type: string, title: string, metadata: Record<string, unknown> = {}) {
  try {
    await supabase.from('activity_events').insert({ user_id: userId, type, title, metadata })
  } catch {}
}

export async function syncNotification(supabase: SupabaseClient, userId: string, note: { id?: string; type: string; title: string; body: string; href?: string }) {
  try {
    await supabase.from('notifications').insert({ user_id: userId, type: note.type, title: note.title, body: note.body, href: note.href || null })
  } catch {}
}
