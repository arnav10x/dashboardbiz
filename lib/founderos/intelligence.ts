import type { SupabaseClient } from '@supabase/supabase-js'
import type { FounderSnapshot } from './engine'
import { XP_AWARDS } from './engine'

export type HealthSignal = {
  id: string
  label: string
  score: number
  status: 'strong' | 'watch' | 'danger'
  insight: string
  action: string
  href: string
}

export type AutomationRule = {
  id: string
  title: string
  description: string
  trigger: string
  action: string
  enabledByDefault: boolean
}

function money(value: number) {
  return `$${Math.round(Number(value) || 0).toLocaleString()}`
}

function status(score: number): HealthSignal['status'] {
  if (score >= 70) return 'strong'
  if (score >= 40) return 'watch'
  return 'danger'
}

export function buildHealthSignals(snapshot: FounderSnapshot): HealthSignal[] {
  const m = snapshot.metrics
  const g = snapshot.gamification
  const revenueScore = m.revenueTarget > 0 ? Math.min(100, m.revenueProgress) : m.revenue > 0 ? 55 : 10
  const executionScore = m.taskCount > 0 ? m.taskCompletionRate : 15
  const pipelineScore = m.leadCount > 0 ? Math.min(100, Math.max(25, m.closeRate * 2 + Math.min(40, m.leadCount * 3))) : 8
  const consistencyScore = Math.min(100, Math.max(g.streak * 8, g.taskStreak * 12, m.activeDays * 4))
  const profitScore = m.revenue > 0 ? Math.max(0, Math.min(100, 50 + m.margin)) : 10

  return [
    {
      id: 'revenue-health',
      label: 'Revenue Health',
      score: Math.round(revenueScore),
      status: status(revenueScore),
      insight: m.revenueTarget > 0 ? `${money(m.revenue)} logged toward a ${money(m.revenueTarget)} target.` : m.revenue > 0 ? `${money(m.revenue)} revenue logged without a target.` : 'Revenue is not logged yet, so financial reporting is limited.',
      action: m.revenueTarget > 0 ? 'Review the revenue gap and create one task tied to sales.' : 'Set a revenue target and log your baseline.',
      href: '/dashboard/reports',
    },
    {
      id: 'execution-health',
      label: 'Execution Health',
      score: executionScore,
      status: status(executionScore),
      insight: `${m.completedTasks}/${m.taskCount} tasks completed with ${m.openTasks} still open.`,
      action: m.openTasks > 0 ? 'Clear one high-priority task today.' : 'Create a new growth task for the next operating cycle.',
      href: '/dashboard/tasks',
    },
    {
      id: 'pipeline-health',
      label: 'Pipeline Health',
      score: Math.round(pipelineScore),
      status: status(pipelineScore),
      insight: `${m.leadCount} leads, ${m.wonDeals} won deals, ${m.closeRate}% close rate, ${money(m.pipelineValue)} pipeline value.`,
      action: m.leadCount === 0 ? 'Add your first real lead.' : 'Move one lead forward or follow up with stalled deals.',
      href: '/dashboard/pipeline',
    },
    {
      id: 'consistency-health',
      label: 'Consistency Health',
      score: Math.round(consistencyScore),
      status: status(consistencyScore),
      insight: `${g.streak}-day login streak, ${g.taskStreak}-day task streak, ${m.activeDays} active data days.`,
      action: 'Open FounderOS daily and complete at least one meaningful action.',
      href: '/dashboard/achievements',
    },
    {
      id: 'profit-health',
      label: 'Profit Health',
      score: Math.round(profitScore),
      status: status(profitScore),
      insight: `${money(m.profit)} profit with ${m.margin}% margin.`,
      action: m.margin < 20 ? 'Review expenses and find one cost or pricing lever.' : 'Keep tracking profit while scaling revenue.',
      href: '/dashboard/reports',
    },
  ]
}

export function buildAutomationRules(snapshot: FounderSnapshot): AutomationRule[] {
  return [
    {
      id: 'streak-risk-alert',
      title: 'Streak risk alert',
      description: 'Warn the founder when no meaningful action has been logged today.',
      trigger: 'No completed task, log, or pipeline update today by evening.',
      action: 'Create a notification and AI nudge pointing to the fastest XP action.',
      enabledByDefault: true,
    },
    {
      id: 'overdue-task-escalation',
      title: 'Overdue task escalation',
      description: 'Surface overdue tasks in Overview, Reports, and AI Coach.',
      trigger: `${snapshot.metrics.openTasks} open tasks exist, including any overdue tasks.`,
      action: 'Create a priority mission and show the task in Today’s Focus.',
      enabledByDefault: true,
    },
    {
      id: 'pipeline-stall-detection',
      title: 'Pipeline stall detection',
      description: 'Detect low sales movement and push a follow-up mission.',
      trigger: snapshot.metrics.leadCount === 0 ? 'Pipeline is empty.' : `Close rate is ${snapshot.metrics.closeRate}%.`,
      action: 'Suggest adding leads, following up, or moving a lead to the next stage.',
      enabledByDefault: true,
    },
    {
      id: 'weekly-ceo-report',
      title: 'Weekly CEO report',
      description: 'Generate a weekly operating summary from tasks, revenue, pipeline, team, and streaks.',
      trigger: 'Every week or when the Reports page is opened.',
      action: 'Generate wins, risks, bottlenecks, and next actions from real data.',
      enabledByDefault: true,
    },
  ]
}

export function buildCeoReport(snapshot: FounderSnapshot) {
  const signals = buildHealthSignals(snapshot)
  const weakest = [...signals].sort((a, b) => a.score - b.score)[0]
  const strongest = [...signals].sort((a, b) => b.score - a.score)[0]
  const m = snapshot.metrics
  const g = snapshot.gamification
  return {
    generatedAt: new Date().toISOString(),
    headline: weakest?.score < 40 ? `Main bottleneck: ${weakest.label}` : `FounderOS momentum is building around ${strongest?.label || 'execution'}`,
    founderSummary: `Current operating snapshot: ${money(m.revenue)} revenue, ${money(m.profit)} profit, ${m.completedTasks}/${m.taskCount} tasks completed, ${m.leadCount} pipeline leads, level ${g.level} ${g.rank}.`,
    strongestArea: strongest,
    weakestArea: weakest,
    signals,
    nextActions: signals.slice().sort((a, b) => a.score - b.score).slice(0, 3).map(signal => ({
      title: signal.action,
      reason: signal.insight,
      href: signal.href,
    })),
    xpOpportunities: [
      { action: 'Complete one high priority task', xp: XP_AWARDS.complete_high_priority_task, href: '/dashboard/tasks' },
      { action: 'Add or move a pipeline lead', xp: XP_AWARDS.add_lead, href: '/dashboard/pipeline' },
      { action: 'Log revenue / P&L', xp: XP_AWARDS.log_period, href: '/dashboard/period-entry' },
      { action: 'Ask AI Copilot for a bottleneck diagnosis', xp: XP_AWARDS.use_ai_copilot, href: '/dashboard/ai-copilot' },
    ],
  }
}

export async function syncAiMemory(supabase: SupabaseClient, userId: string, snapshot: FounderSnapshot) {
  const report = buildCeoReport(snapshot)
  const memory = {
    updatedAt: new Date().toISOString(),
    metrics: snapshot.metrics,
    gamification: snapshot.gamification,
    briefing: snapshot.briefing,
    ceoReport: report,
    openTasks: snapshot.tasks.filter((task: any) => !task.is_completed).slice(0, 25),
    recentActivity: snapshot.activity.slice(0, 25),
  }
  await supabase.from('ai_memory').upsert({
    user_id: userId,
    memory_key: 'live_operating_context',
    memory_value: memory,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,memory_key' })
  return memory
}
