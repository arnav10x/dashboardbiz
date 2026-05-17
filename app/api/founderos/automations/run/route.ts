import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function daysAgo(dateLike?: string | null) {
  if (!dateLike) return 999
  const t = new Date(dateLike).getTime()
  if (!Number.isFinite(t)) return 999
  return Math.floor((Date.now() - t) / 86400000)
}

async function notifyOnce(supabase: any, userId: string, type: string, title: string, body: string, href: string | null, key: string, metadata: Record<string, any> = {}) {
  const { data: existing } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('type', type)
    .contains('metadata', { automation_key: key })
    .gte('created_at', `${todayKey()}T00:00:00.000Z`)
    .limit(1)
  if (existing?.length) return null
  const { data } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    href,
    metadata: { ...metadata, automation_key: key, generated_by: 'automation_runner' },
  }).select('*').single()
  return data || null
}

async function createTaskOnce(supabase: any, userId: string, title: string, notes: string, priority: string, key: string, dueDate?: string | null, workspaceId?: string | null) {
  const { data: existing } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .contains('automation_metadata', { automation_key: key })
    .limit(1)
  if (existing?.length) return null

  const { data } = await supabase.from('tasks').insert({
    user_id: userId,
    workspace_id: workspaceId || null,
    title,
    notes,
    priority,
    due_date: dueDate || null,
    is_completed: false,
    completed_at: null,
    source: 'automation',
    automation_metadata: { automation_key: key, created_at: new Date().toISOString() },
  }).select('*').single()
  return data || null
}

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: workspace } = await supabase.from('workspaces').select('id,name').eq('owner_id', user.id).maybeSingle()
  const { data: leads } = await supabase
    .from('pipeline_leads')
    .select('id,name,company,stage,created_at,follow_up_date,last_contacted_at,value,workspace_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id,title,is_completed,due_date,recurrence,created_at,completed_at,priority,automation_metadata,workspace_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(300)

  const created: any[] = []
  const notifications: any[] = []
  const now = new Date()
  const today = todayKey()

  for (const lead of leads || []) {
    if (lead.stage === 'won' || lead.stage === 'lost') continue
    const followUpDate = lead.follow_up_date ? String(lead.follow_up_date).slice(0, 10) : null
    const overdue = followUpDate && followUpDate < today
    const stale = daysAgo(lead.last_contacted_at || lead.created_at) >= 5
    if (!overdue && !stale) continue

    const key = `lead-follow-up-${lead.id}-${today}`
    const task = await createTaskOnce(
      supabase,
      user.id,
      `Follow up with ${lead.name}`,
      `${overdue ? 'Overdue follow-up' : 'Stale lead'} from Pipeline${lead.company ? ` • ${lead.company}` : ''}. Keep the deal moving or mark it lost.`,
      'high',
      key,
      today,
      lead.workspace_id || workspace?.id || null,
    )
    if (task) created.push(task)

    const note = await notifyOnce(
      supabase,
      user.id,
      'automation_follow_up',
      overdue ? 'Overdue follow-up created' : 'Stale lead needs attention',
      `${lead.name}${lead.company ? ` at ${lead.company}` : ''} needs a follow-up. I added a task so it does not slip.`,
      '/dashboard/pipeline',
      key,
      { lead_id: lead.id },
    )
    if (note) notifications.push(note)
  }

  for (const task of tasks || []) {
    if (task.is_completed || !task.due_date) continue
    const due = String(task.due_date).slice(0, 10)
    if (due >= today) continue
    const key = `overdue-task-${task.id}-${today}`
    const note = await notifyOnce(
      supabase,
      user.id,
      'automation_overdue_task',
      'Task is overdue',
      `${task.title} is past due. Move it, finish it, or delete it so the system stays clean.`,
      '/dashboard/tasks',
      key,
      { task_id: task.id },
    )
    if (note) notifications.push(note)
  }

  for (const task of tasks || []) {
    if (!task.recurrence || task.is_completed === false) continue
    const recurrence = String(task.recurrence).toLowerCase()
    if (!['daily', 'weekly', 'monthly'].includes(recurrence)) continue
    const sourceKey = task.automation_metadata?.recurring_source_id || task.id
    const completedAt = task.completed_at || task.created_at
    const elapsed = daysAgo(completedAt)
    const shouldRecur = recurrence === 'daily' ? elapsed >= 1 : recurrence === 'weekly' ? elapsed >= 7 : elapsed >= 28
    if (!shouldRecur) continue
    const key = `recurring-${sourceKey}-${today}`
    const newTask = await createTaskOnce(
      supabase,
      user.id,
      task.title,
      `Recurring ${recurrence} task generated automatically.`,
      task.priority || 'medium',
      key,
      today,
      task.workspace_id || workspace?.id || null,
    )
    if (newTask) created.push(newTask)
  }

  if ((created.length || notifications.length) > 0) {
    try {
      await supabase.from('activity_events').insert({
        user_id: user.id,
        workspace_id: workspace?.id || null,
        type: 'automation_run',
        title: `Automation created ${created.length} task${created.length === 1 ? '' : 's'} and ${notifications.length} alert${notifications.length === 1 ? '' : 's'}`,
        metadata: { created_count: created.length, notification_count: notifications.length },
      })
    } catch {}
  }

  return NextResponse.json({ ok: true, created, notifications, checked_at: now.toISOString() })
}
