import type { FounderSnapshot } from './engine'

type Priority = 'urgent' | 'high' | 'medium' | 'low'

function money(value: number) {
  return `$${Math.round(Number(value) || 0).toLocaleString()}`
}

export function buildExecutiveBriefing(snapshot: FounderSnapshot) {
  const m = snapshot.metrics
  const g = snapshot.gamification
  const openTasks = snapshot.tasks.filter((t: any) => !t.is_completed)
  const overdueTasks = openTasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date())
  const noRevenue = m.revenue <= 0
  const noPipeline = m.leadCount <= 0
  const lowClose = m.leadCount > 0 && m.closeRate < 15
  const weakExecution = m.taskCount > 0 && m.taskCompletionRate < 60

  const priorities: { title: string; reason: string; href: string; priority: Priority }[] = []
  if (noRevenue) priorities.push({ title: 'Log first revenue period', reason: 'Reports, pacing, and financial AI are limited without real revenue data.', href: '/dashboard/period-entry', priority: 'urgent' })
  if (noPipeline) priorities.push({ title: 'Add first real lead', reason: 'FounderOS cannot calculate pipeline health until leads exist.', href: '/dashboard/pipeline', priority: noRevenue ? 'high' : 'urgent' })
  if (lowClose) priorities.push({ title: 'Fix pipeline conversion', reason: `${m.closeRate}% close rate across ${m.leadCount} leads. Follow-up speed and lead quality need attention.`, href: '/dashboard/pipeline', priority: 'high' })
  if (overdueTasks.length) priorities.push({ title: 'Clear overdue tasks', reason: `${overdueTasks.length} task${overdueTasks.length === 1 ? '' : 's'} are overdue and blocking execution momentum.`, href: '/dashboard/tasks', priority: 'high' })
  if (weakExecution) priorities.push({ title: 'Raise execution rate', reason: `${m.completedTasks}/${m.taskCount} tasks completed. Finish one high-value task before adding more.`, href: '/dashboard/tasks', priority: 'medium' })
  if (g.streak < 3) priorities.push({ title: 'Build the daily login streak', reason: `Current streak is ${g.streak} day${g.streak === 1 ? '' : 's'}. Daily consistency unlocks badges and progression.`, href: '/dashboard/achievements', priority: 'medium' })
  if (!priorities.length) priorities.push({ title: 'Push for the next growth milestone', reason: `${money(m.revenue)} revenue, ${m.taskCompletionRate}% task completion, and ${g.rank}. Keep compounding.`, href: '/dashboard/reports', priority: 'low' })

  return {
    generatedAt: new Date().toISOString(),
    headline: priorities[0]?.title || 'FounderOS is ready',
    summary: `Snapshot: ${money(m.revenue)} revenue, ${money(m.profit)} profit, ${m.completedTasks}/${m.taskCount} tasks completed, ${m.leadCount} leads, ${g.rank} with ${g.totalXp.toLocaleString()} XP.`,
    priorities: priorities.slice(0, 5),
    suggestedQuestions: [
      'What should I do first today?',
      'What is my biggest business bottleneck?',
      'How do I earn the most XP today?',
      'What should my next sales task be?',
      'Generate my CEO report.'
    ],
  }
}

export function buildExecutiveAssistantContext(snapshot: FounderSnapshot) {
  const briefing = buildExecutiveBriefing(snapshot)
  const p = briefing.priorities.map((item, i) => `${i + 1}. [${item.priority}] ${item.title} — ${item.reason}`).join('\n')
  return `Executive Assistant Layer\nHeadline: ${briefing.headline}\nSummary: ${briefing.summary}\nTop priorities:\n${p}\nAI behavior: be direct, use the founder's real metrics, turn insights into actions, and never invent data.`
}
