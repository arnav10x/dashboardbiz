'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import { Check, Plus, MoreHorizontal, X, Flame, Sparkles, ChevronDown, ArrowRight, RefreshCw, Trash2 } from 'lucide-react'

type Priority = 'High' | 'Medium' | 'Low'

type Task = {
  id: string
  title: string
  notes?: string | null
  is_completed: boolean
  completed_at?: string | null
  created_at: string
  priority?: string | null
}

const suggestionBanks: { title: string; notes: string; priority: Priority }[][] = [
  [
    { title: 'Follow up with every open pipeline lead', notes: 'Follow Up • High', priority: 'High' },
    { title: 'Send 10 targeted cold DMs', notes: 'Outreach • High', priority: 'High' },
    { title: 'Move 2 stuck leads to the next stage', notes: 'Pipeline • Medium', priority: 'Medium' },
    { title: 'Write one client win or case study post', notes: 'Content • Low', priority: 'Low' },
  ],
  [
    { title: 'Book one discovery call', notes: 'Sales • High', priority: 'High' },
    { title: 'Rewrite your weakest offer headline', notes: 'Offer • Medium', priority: 'Medium' },
    { title: 'Check yesterday’s revenue and expenses', notes: 'Tracking • Medium', priority: 'Medium' },
    { title: 'Ask AI for a conversion improvement script', notes: 'AI Copilot • Low', priority: 'Low' },
  ],
  [
    { title: 'Send a value-first message to 5 warm leads', notes: 'Outreach • High', priority: 'High' },
    { title: 'Update next action dates for all leads', notes: 'Pipeline • Medium', priority: 'Medium' },
    { title: 'Review tasks that have been sitting unfinished', notes: 'Operations • Medium', priority: 'Medium' },
    { title: 'Clean up one integration or workflow', notes: 'Systems • Low', priority: 'Low' },
  ],
]

const priorityStyle: Record<Priority, { color: string; bg: string }> = {
  High: { color: '#ff4d4d', bg: 'rgba(255, 77, 77, .10)' },
  Medium: { color: '#f5a623', bg: 'rgba(245, 166, 35, .12)' },
  Low: { color: 'var(--accent)', bg: 'var(--accent-faint)' },
}

function getPriority(task: Task | { priority?: string | null }): Priority {
  const p = (task.priority || '').toLowerCase()
  if (p.includes('high')) return 'High'
  if (p.includes('medium')) return 'Medium'
  return 'Low'
}

function cardStyle(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: 'linear-gradient(145deg, rgba(13,16,19,0.99), rgba(5,6,8,0.99))',
    border: '1px solid var(--accent-muted)',
    borderRadius: 13,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.028), 0 18px 45px rgba(0,0,0,.24)',
    ...extra,
  }
}

function AddTaskModal({ onClose, onAdd }: { onClose: () => void; onAdd: (title: string, notes: string, priority: Priority) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onAdd(title.trim(), notes.trim(), priority)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.78)' }} onClick={e => e.currentTarget === e.target && onClose()}>
      <div className="w-full max-w-md p-5" style={cardStyle({ background: '#0c0e11' })}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">Add Task</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>New tasks start unchecked.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <input className="input-base" value={title} onChange={e => setTitle(e.target.value)} placeholder="Task name" autoFocus />
          <input className="input-base" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Category or notes" />
          <div className="grid grid-cols-3 gap-2">
            {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
              <button key={p} onClick={() => setPriority(p)} className="py-2 text-xs font-bold" style={{ borderRadius: 9, border: '1px solid rgba(255,255,255,.08)', background: priority === p ? priorityStyle[p].bg : 'rgba(255,255,255,.03)', color: priorityStyle[p].color }}>{p}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2 text-xs font-bold" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>Cancel</button>
          <button onClick={save} disabled={saving || !title.trim()} className="flex-1 rounded-xl py-2 text-xs font-black disabled:opacity-50" style={{ background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008' }}>{saving ? 'Saving…' : 'Add Task'}</button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-xl px-4 py-8 text-center" style={{ background: 'rgba(255,255,255,.02)', border: '1px dashed rgba(255,255,255,.10)', color: 'var(--text-muted)' }}><p className="font-bold text-white">{title}</p><p className="mt-1 text-sm">{body}</p></div>
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [workspaceName, setWorkspaceName] = useState('Founder OS')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [allTasksOpen, setAllTasksOpen] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const [{ data: ws }, { data }] = await Promise.all([
      supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    if (ws?.name) setWorkspaceName(ws.name)
    setTasks((data || []) as Task[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const completed = tasks.filter(t => t.is_completed)
  const openTasks = tasks.filter(t => !t.is_completed)
  const suggestions = useMemo(() => suggestionBanks[suggestionIndex % suggestionBanks.length], [suggestionIndex])
  const aiTasks = openTasks.slice(0, 3)
  const totalCount = tasks.length
  const doneCount = completed.length
  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0

  const addTask = async (title: string, notes: string, priority: Priority) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tasks').insert({ user_id: user.id, title, notes, priority: priority.toLowerCase(), is_completed: false, completed_at: null }).select('*').single()
    if (data) setTasks(prev => [data as Task, ...prev])
  }

  const toggleTask = async (task: Task) => {
    const next = !task.is_completed
    const updated = tasks.map(t => t.id === task.id ? { ...t, is_completed: next, completed_at: next ? new Date().toISOString() : null } : t)
    setTasks(updated)
    const supabase = createClient()
    await supabase.from('tasks').update({ is_completed: next, completed_at: next ? new Date().toISOString() : null }).eq('id', task.id)
    if (next) {
      await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: getPriority(task) === 'High' ? 'complete_high_priority_task' : 'complete_task' }) }).catch(() => null)
      if (updated.length > 0 && updated.every(t => t.is_completed)) {
        await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'complete_all_tasks' }) }).catch(() => null)
      }
    }
  }

  const removeTask = async (task: Task) => {
    setTasks(prev => prev.filter(t => t.id !== task.id))
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', task.id)
  }

  const addSuggestion = async (s: { title: string; notes: string; priority: Priority }) => {
    await addTask(s.title, s.notes, s.priority)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Tasks" workspaceName={workspaceName} showGreeting />
      <div className="flex-1 overflow-y-auto px-7 py-7 animate-in">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[28px] font-black tracking-tight">Today&apos;s Tasks</h1>
              <span className="rounded-md px-2 py-1 text-[10px] font-black uppercase" style={{ color: pct === 100 && totalCount > 0 ? 'var(--accent)' : '#f5a623', background: pct === 100 && totalCount > 0 ? 'var(--accent-faint)' : 'rgba(245,166,35,.08)' }}>{pct === 100 && totalCount > 0 ? 'All Done' : `${openTasks.length} Open`}</span>
            </div>
            <p className="mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>{doneCount} of {totalCount} tasks completed</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black" style={{ background: 'linear-gradient(180deg,#2fd976,#14b457)', color: '#031008' }}><Plus className="h-4 w-4" /> Add Task</button>
            <button onClick={load} className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold" style={{ ...cardStyle(), color: 'var(--text-primary)' }}>Refresh <ChevronDown className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-5">
          <div className="h-2 flex-1 rounded-full" style={{ background: 'rgba(255,255,255,.06)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)', boxShadow: '0 0 18px var(--accent-muted)' }} /></div>
          <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full text-xs font-black" style={{ border: '3px solid var(--accent)', color: '#fff' }}>{pct}%</div><span className="font-bold">Complete</span></div>
        </div>

        <div className="mb-4 p-5" style={cardStyle({ minHeight: 220 })}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[.18em]" style={{ color: 'var(--accent)' }}><Sparkles className="h-4 w-4" /> AI Tailored Tasks</div>
            <button onClick={() => setSuggestionIndex(i => i + 1)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold" style={cardStyle()}><RefreshCw className="h-3.5 w-3.5" /> Reroll</button>
          </div>
          <div className="space-y-3">
            {aiTasks.length > 0 ? aiTasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 rounded-xl px-4 py-4" style={{ background: 'rgba(255,255,255,.028)', border: '1px solid rgba(255,255,255,.06)' }}>
                <button onClick={() => toggleTask(task)} className="grid h-7 w-7 place-items-center rounded-full" style={{ background: task.is_completed ? 'var(--accent)' : 'transparent', border: task.is_completed ? 'none' : '2px solid rgba(255,255,255,.18)', color: '#031008' }}>{task.is_completed && <Check className="h-4 w-4" />}</button>
                <div className="flex-1"><p className="font-bold">{task.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.notes || `${getPriority(task)} Priority`}</p></div>
                <button onClick={() => removeTask(task)} className="rounded-lg p-2 hover:bg-white/5"><Trash2 className="h-4 w-4" style={{ color: '#ff6b6b' }} /></button>
              </div>
            )) : suggestions.slice(0, 3).map(s => (
              <div key={s.title} className="flex items-center gap-4 rounded-xl px-4 py-4" style={{ background: 'rgba(255,255,255,.028)', border: '1px solid rgba(255,255,255,.06)' }}>
                <Sparkles className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <div className="flex-1"><p className="font-bold">{s.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.notes}</p></div>
                <button onClick={() => addSuggestion(s)} className="rounded-lg px-3 py-2 text-xs font-black" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--accent-ring)' }}>Add</button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="p-5" style={cardStyle()}>
            <div className="mb-5 flex items-center gap-2"><h2 className="text-xl font-black">Upcoming Tasks</h2><span className="grid h-6 min-w-6 place-items-center rounded-md px-1 text-xs font-black" style={{ background: 'rgba(255,255,255,.06)' }}>{openTasks.length}</span></div>
            <div className="space-y-3">
              {openTasks.length ? openTasks.slice(0, 4).map(task => {
                const pr = getPriority(task)
                return <div key={task.id} className="flex items-center gap-4 rounded-xl px-4 py-4" style={{ background: 'rgba(255,255,255,.028)', border: '1px solid rgba(255,255,255,.06)' }}>
                  <button onClick={() => toggleTask(task)} className="h-7 w-7 rounded-full" style={{ border: '2px solid rgba(255,255,255,.18)' }} />
                  <div className="flex-1"><p className="font-bold">{task.title}</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{task.notes || `${pr} priority`}</p></div>
                  <span className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ color: priorityStyle[pr].color, background: priorityStyle[pr].bg }}>{pr}</span>
                  <button onClick={() => removeTask(task)} className="rounded-lg p-2 hover:bg-white/5"><Trash2 className="h-4 w-4" style={{ color: '#ff6b6b' }} /></button>
                </div>
              }) : <EmptyState title={loading ? 'Loading tasks…' : 'No upcoming tasks'} body="Add a task manually or add one from AI Tailored Tasks." />}
            </div>
            <button onClick={() => setAllTasksOpen(true)} className="mx-auto mt-7 flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--accent)' }}>View all tasks <ArrowRight className="h-4 w-4" /></button>
          </div>

          <div className="space-y-4">
            <div className="p-6" style={cardStyle({ minHeight: 278 })}>
              <div className="mb-7 flex items-center justify-between"><h2 className="text-xl font-black">Task Summary</h2><button className="rounded-xl px-4 py-2 text-xs font-bold" style={cardStyle()}>Today <ChevronDown className="ml-2 inline h-3 w-3" /></button></div>
              <div className="flex items-center gap-9">
                <div className="grid h-44 w-44 place-items-center rounded-full" style={{ border: '13px solid var(--accent)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.05)' }}><div className="text-center"><p className="text-3xl font-black">{doneCount}/{totalCount}</p><p>Tasks</p></div></div>
                <div className="flex-1 space-y-5 text-sm">
                  <div className="flex justify-between"><span>Completed</span><b style={{ color: 'var(--accent)' }}>{doneCount}</b></div>
                  <div className="flex justify-between"><span>Remaining</span><b>{openTasks.length}</b></div>
                  <div className="flex justify-between"><span>Overdue</span><b style={{ color: '#ff4d4d' }}>0</b></div>
                  <div className="flex justify-between"><span>Completion Rate</span><b style={{ color: 'var(--accent)' }}>{pct}%</b></div>
                </div>
              </div>
            </div>
            <div className="p-6" style={cardStyle()}>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black"><Flame className="h-5 w-5" style={{ color: '#f5a623' }} /> Productivity Streak</h2>
              <div className="flex items-center gap-8"><div><span className="text-4xl font-black" style={{ color: 'var(--accent)' }}>{doneCount > 0 ? 1 : 0}</span><span className="ml-3 text-xl">day</span><p className="text-sm" style={{ color: 'var(--text-muted)' }}>{doneCount > 0 ? 'Keep it going!' : 'Complete a task to start.'}</p></div><div className="flex gap-4">{['M','T','W','T','F','S'].map((d,i)=><div key={i} className="text-center"><div className="mb-2 grid h-8 w-8 place-items-center rounded-full" style={{ border: '1px solid rgba(255,255,255,.18)', background: i===0 && doneCount>0 ? 'var(--accent)' : 'transparent', color: i===0 && doneCount>0 ? '#031008' : 'var(--text-muted)' }}>{i===0 && doneCount>0 ? <Check className="h-4 w-4" /> : ''}</div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d}</span></div>)}</div></div>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && <AddTaskModal onClose={() => setModalOpen(false)} onAdd={addTask} />}
      {allTasksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.78)' }} onClick={e => e.currentTarget === e.target && setAllTasksOpen(false)}>
          <div className="w-full max-w-3xl p-5" style={cardStyle({ background: '#0c0e11' })}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><h3 className="text-lg font-black">View All Tasks</h3><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add AI tasks, reroll suggestions, complete tasks, or delete tasks.</p></div>
              <div className="flex gap-2"><button onClick={() => setSuggestionIndex(i => i + 1)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold" style={cardStyle()}><RefreshCw className="h-3.5 w-3.5" /> Reroll</button><button onClick={() => setAllTasksOpen(false)} className="rounded-lg p-2 hover:bg-white/5"><X className="h-4 w-4" /></button></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div><p className="mb-3 text-xs font-black uppercase tracking-[.16em]" style={{ color: 'var(--accent)' }}>AI Suggestions</p><div className="space-y-2">{suggestions.map(s => <div key={s.title} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: 'rgba(255,255,255,.028)', border: '1px solid rgba(255,255,255,.06)' }}><div className="flex-1"><p className="font-bold">{s.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.notes}</p></div><button onClick={() => addSuggestion(s)} className="rounded-lg px-3 py-2 text-xs font-black" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid var(--accent-ring)' }}>Add</button></div>)}</div></div>
              <div><p className="mb-3 text-xs font-black uppercase tracking-[.16em]" style={{ color: '#fff' }}>Your Tasks</p><div className="max-h-[420px] space-y-2 overflow-auto pr-1">{tasks.length ? tasks.map(task => <div key={task.id} className="flex items-center gap-3 rounded-xl px-3 py-3" style={{ background: 'rgba(255,255,255,.028)', border: '1px solid rgba(255,255,255,.06)' }}><button onClick={() => toggleTask(task)} className="grid h-6 w-6 place-items-center rounded-full" style={{ background: task.is_completed ? 'var(--accent)' : 'transparent', border: task.is_completed ? 'none' : '2px solid rgba(255,255,255,.18)', color: '#031008' }}>{task.is_completed && <Check className="h-3.5 w-3.5" />}</button><div className="min-w-0 flex-1"><p className="truncate font-bold" style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? 'var(--text-muted)' : '#fff' }}>{task.title}</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{task.notes || `${getPriority(task)} priority`}</p></div><button onClick={() => removeTask(task)} className="rounded-lg p-2 hover:bg-white/5"><Trash2 className="h-4 w-4" style={{ color: '#ff6b6b' }} /></button></div>) : <EmptyState title="No saved tasks" body="Add a suggestion to start your upcoming task list." />}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
