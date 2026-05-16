'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import { Check, Plus, X, Flame, Sparkles, RefreshCw, Trash2, ChevronRight } from 'lucide-react'

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
    { title: "Check yesterday's revenue and expenses", notes: 'Tracking • Medium', priority: 'Medium' },
    { title: 'Ask AI for a conversion improvement script', notes: 'AI Copilot • Low', priority: 'Low' },
  ],
  [
    { title: 'Send a value-first message to 5 warm leads', notes: 'Outreach • High', priority: 'High' },
    { title: 'Update next action dates for all leads', notes: 'Pipeline • Medium', priority: 'Medium' },
    { title: 'Review tasks that have been sitting unfinished', notes: 'Operations • Medium', priority: 'Medium' },
    { title: 'Clean up one integration or workflow', notes: 'Systems • Low', priority: 'Low' },
  ],
]

const priorityMeta: Record<Priority, { color: string; bg: string; border: string; sectionBg: string }> = {
  High:   { color: '#ff4d4d', bg: 'rgba(255,77,77,.10)',    border: 'rgba(255,77,77,.22)',    sectionBg: 'rgba(255,77,77,.05)'    },
  Medium: { color: '#f5a623', bg: 'rgba(245,166,35,.12)',   border: 'rgba(245,166,35,.22)',   sectionBg: 'rgba(245,166,35,.05)'   },
  Low:    { color: '#2fd976', bg: 'rgba(45,217,118,.10)',   border: 'rgba(45,217,118,.18)',   sectionBg: 'rgba(45,217,118,.04)'   },
}

function getPriority(task: { priority?: string | null }): Priority {
  const p = (task.priority || '').toLowerCase()
  if (p.includes('high'))   return 'High'
  if (p.includes('medium')) return 'Medium'
  return 'Low'
}

function card(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    background: 'linear-gradient(145deg, var(--bg-card), var(--bg-raised))',
    border: '1px solid var(--accent-muted)',
    borderRadius: 16,
    boxShadow: 'inset 0 1px 0 var(--inset-highlight), 0 18px 45px rgba(0,0,0,.24)',
    ...extra,
  }
}

function TaskRow({ task, onToggle, onRemove }: { task: Task; onToggle: (t: Task) => void; onRemove: (t: Task) => void }) {
  const pr = getPriority(task)
  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[.025]"
      style={{ background: 'transparent' }}>
      <button
        onClick={() => onToggle(task)}
        className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full transition-colors"
        style={{
          background: task.is_completed ? priorityMeta[pr].color : 'transparent',
          border: task.is_completed ? 'none' : `2px solid ${priorityMeta[pr].color}`,
          color: '#031008',
        }}
      >
        {task.is_completed && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug truncate"
          style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? 'var(--text-muted)' : 'var(--text-primary)' }}>
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{task.notes}</p>
        )}
      </div>
      {!task.is_completed && (
        <span className="flex-shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold"
          style={{ color: priorityMeta[pr].color, background: priorityMeta[pr].bg }}>
          {pr}
        </span>
      )}
      <button
        onClick={() => onRemove(task)}
        className="flex-shrink-0 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
      >
        <Trash2 className="h-3.5 w-3.5" style={{ color: '#ff6b6b' }} />
      </button>
    </div>
  )
}

function PrioritySection({ label, tasks, priority, onToggle, onRemove }: {
  label: string; tasks: Task[]; priority: Priority;
  onToggle: (t: Task) => void; onRemove: (t: Task) => void
}) {
  if (!tasks.length) return null
  const m = priorityMeta[priority]
  return (
    <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${m.border}` }}>
      <div className="flex items-center gap-2.5 px-5 py-2.5" style={{ background: m.sectionBg }}>
        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
        <span className="text-[11px] font-black uppercase tracking-[.14em]" style={{ color: m.color }}>{label}</span>
        <span className="ml-auto rounded-md px-2 py-0.5 text-[11px] font-bold"
          style={{ background: m.bg, color: m.color }}>{tasks.length}</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,.04)' }}>
        {tasks.map(t => <TaskRow key={t.id} task={t} onToggle={onToggle} onRemove={onRemove} />)}
      </div>
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl px-4 py-3 text-center" style={card({ borderRadius: 12 })}>
      <p className="text-xl font-black" style={{ color }}>{value}</p>
      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  )
}

function AddTaskModal({ onClose, onAdd }: {
  onClose: () => void
  onAdd: (title: string, notes: string, priority: Priority) => Promise<void>
}) {
  const [title, setTitle]       = useState('')
  const [notes, setNotes]       = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [saving, setSaving]     = useState(false)

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onAdd(title.trim(), notes.trim(), priority)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.78)' }}
      onClick={e => e.currentTarget === e.target && onClose()}>
      <div className="w-full max-w-md p-5" style={card({ background: 'var(--modal-bg)', borderRadius: 20 })}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black">New Task</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Starts unchecked in your task list.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/5"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <input className="input-base" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Task name" autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
          <input className="input-base" value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Category or notes (optional)" />
          <div className="grid grid-cols-3 gap-2">
            {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
              <button key={p} onClick={() => setPriority(p)} className="py-2 text-xs font-bold"
                style={{
                  borderRadius: 9,
                  border: `1px solid ${priority === p ? priorityMeta[p].color : 'var(--glass-border)'}`,
                  background: priority === p ? priorityMeta[p].bg : 'var(--overlay-micro)',
                  color: priorityMeta[p].color,
                }}>{p}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl py-2 text-xs font-bold"
            style={{ background: 'var(--overlay-faint)', border: '1px solid var(--glass-border)' }}>Cancel</button>
          <button onClick={save} disabled={saving || !title.trim()}
            className="flex-1 rounded-xl py-2 text-xs font-black disabled:opacity-50"
            style={{ background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008' }}>
            {saving ? 'Saving…' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function TasksPage() {
  const [tasks, setTasks]               = useState<Task[]>([])
  const [workspaceName, setWorkspaceName] = useState('Founder OS')
  const [loading, setLoading]           = useState(true)
  const [modalOpen, setModalOpen]       = useState(false)
  const [completedOpen, setCompletedOpen] = useState(false)
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

  const completed  = tasks.filter(t =>  t.is_completed)
  const openTasks  = tasks.filter(t => !t.is_completed)
  const highTasks  = openTasks.filter(t => getPriority(t) === 'High')
  const medTasks   = openTasks.filter(t => getPriority(t) === 'Medium')
  const lowTasks   = openTasks.filter(t => getPriority(t) === 'Low')

  // AI suggestions are always pulled from the static bank — never from user tasks
  const suggestions = useMemo(() => suggestionBanks[suggestionIndex % suggestionBanks.length], [suggestionIndex])

  const total   = tasks.length
  const done    = completed.length
  const pct     = total ? Math.round((done / total) * 100) : 0
  const streak  = done > 0 ? 1 : 0

  const addTask = async (title: string, notes: string, priority: Priority) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks')
      .insert({ user_id: user.id, title, notes, priority: priority.toLowerCase(), is_completed: false, completed_at: null })
      .select('*').single()
    if (data) setTasks(prev => [data as Task, ...prev])
  }

  const toggleTask = async (task: Task) => {
    const next = !task.is_completed
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: next, completed_at: next ? new Date().toISOString() : null } : t))
    const supabase = createClient()
    await supabase.from('tasks').update({ is_completed: next, completed_at: next ? new Date().toISOString() : null }).eq('id', task.id)
    if (next) {
      await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: getPriority(task) === 'High' ? 'complete_high_priority_task' : 'complete_task' }) }).catch(() => null)
    }
  }

  const removeTask = async (task: Task) => {
    setTasks(prev => prev.filter(t => t.id !== task.id))
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', task.id)
  }

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Tasks" workspaceName={workspaceName} showGreeting />
      <div className="flex-1 overflow-y-auto px-7 py-7 animate-in">

        {/* ── Productivity Streak Banner ─────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, rgba(245,166,35,.11) 0%, rgba(255,107,53,.07) 100%)',
            border: '1px solid rgba(245,166,35,.22)',
          }}>
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8" style={{ color: '#f5a623', filter: 'drop-shadow(0 0 8px rgba(245,166,35,.6))' }} />
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: '#f5a623' }}>
                {streak} day{streak !== 1 ? 's' : ''}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {streak > 0 ? 'Streak active — keep it up!' : 'Complete a task to start your streak'}
              </p>
            </div>
          </div>

          <div className="flex items-end gap-2">
            {DAYS.map((d, i) => {
              const active = i === 0 && done > 0
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all"
                    style={{
                      background: active ? '#f5a623' : 'rgba(255,255,255,.06)',
                      color: active ? '#031008' : 'var(--text-muted)',
                      border: `1px solid ${active ? '#f5a623' : 'rgba(255,255,255,.08)'}`,
                      boxShadow: active ? '0 0 12px rgba(245,166,35,.5)' : 'none',
                    }}>
                    {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : d.charAt(0)}
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d}</span>
                </div>
              )
            })}
          </div>

          <div className="ml-auto flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black leading-none" style={{ color: pct >= 80 ? 'var(--accent)' : pct >= 50 ? '#f5a623' : 'var(--text-primary)' }}>{pct}%</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black leading-none" style={{ color: 'var(--text-primary)' }}>{done}/{total}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>tasks done</p>
            </div>
          </div>
        </div>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-black tracking-tight">Today&rsquo;s Tasks</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{todayLabel}</p>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black"
            style={{ background: 'linear-gradient(180deg,#2fd976,#14b457)', color: '#031008' }}>
            <Plus className="h-4 w-4" /> New Task
          </button>
        </div>

        {/* ── Progress bar ────────────────────────────────────────── */}
        <div className="mb-7 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--fo-soft-line-bg)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#14b457,#2fd976)', boxShadow: '0 0 14px rgba(45,217,118,.45)' }} />
        </div>

        {/* ── Two-column layout ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_340px]">

          {/* Left — task list ────────────────────────────────────── */}
          <div className="space-y-3">
            <PrioritySection label="High Priority"   tasks={highTasks} priority="High"   onToggle={toggleTask} onRemove={removeTask} />
            <PrioritySection label="Medium Priority" tasks={medTasks}  priority="Medium" onToggle={toggleTask} onRemove={removeTask} />
            <PrioritySection label="Low Priority"    tasks={lowTasks}  priority="Low"    onToggle={toggleTask} onRemove={removeTask} />

            {openTasks.length === 0 && !loading && (
              <div className="rounded-2xl px-6 py-14 text-center"
                style={{ border: '1px dashed rgba(255,255,255,.09)' }}>
                <p className="text-xl font-black mb-2">
                  {total > 0 ? 'All tasks complete!' : 'No tasks yet'}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {total > 0 ? 'Excellent work today.' : 'Add a task or grab one from AI Tailored Tasks →'}
                </p>
              </div>
            )}
            {loading && openTasks.length === 0 && (
              <div className="rounded-2xl px-6 py-10 text-center" style={{ border: '1px dashed rgba(255,255,255,.09)' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Loading tasks…</p>
              </div>
            )}

            {/* Completed section — collapsible */}
            {completed.length > 0 && (
              <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255,255,255,.06)' }}>
                <button
                  onClick={() => setCompletedOpen(o => !o)}
                  className="w-full flex items-center gap-2 px-5 py-3 transition-colors hover:bg-white/5"
                  style={{ background: 'rgba(255,255,255,.02)' }}>
                  <ChevronRight className="h-4 w-4 transition-transform flex-shrink-0"
                    style={{ transform: completedOpen ? 'rotate(90deg)' : 'none', color: 'var(--text-muted)' }} />
                  <span className="text-[11px] font-black uppercase tracking-[.14em]" style={{ color: 'var(--text-muted)' }}>
                    Completed
                  </span>
                  <span className="ml-auto rounded-md px-2 py-0.5 text-[11px] font-bold"
                    style={{ background: 'rgba(255,255,255,.06)', color: 'var(--text-muted)' }}>{done}</span>
                </button>
                {completedOpen && (
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,.04)' }}>
                    {completed.map(t => <TaskRow key={t.id} task={t} onToggle={toggleTask} onRemove={removeTask} />)}
                  </div>
                )}
              </div>
            )}

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <StatPill label="Completed" value={String(done)} color="var(--accent)" />
              <StatPill label="Remaining" value={String(openTasks.length)} color="var(--text-primary)" />
              <StatPill label="Rate" value={`${pct}%`}
                color={pct >= 80 ? 'var(--accent)' : pct >= 50 ? '#f5a623' : '#ff4d4d'} />
            </div>
          </div>

          {/* Right — AI Tailored (always shows suggestions, never user tasks) ── */}
          <div className="space-y-4">
            <div className="p-5" style={card()}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-black uppercase tracking-[.15em]" style={{ color: 'var(--accent)' }}>
                    AI Tailored Tasks
                  </span>
                </div>
                <button
                  onClick={() => setSuggestionIndex(i => i + 1)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-opacity hover:opacity-80"
                  style={{ background: 'var(--overlay-micro)', border: '1px solid var(--glass-border)' }}>
                  <RefreshCw className="h-3 w-3" /> Reroll
                </button>
              </div>

              <div className="space-y-2.5">
                {suggestions.map(s => {
                  const m = priorityMeta[s.priority]
                  return (
                    <div key={s.title} className="flex items-start gap-3 rounded-xl px-4 py-3.5"
                      style={{ background: 'rgba(255,255,255,.026)', border: '1px solid rgba(255,255,255,.06)' }}>
                      <div className="mt-[5px] h-2 w-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-snug">{s.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.notes}</p>
                      </div>
                      <button
                        onClick={() => addTask(s.title, s.notes, s.priority)}
                        className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-black transition-opacity hover:opacity-80"
                        style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                        + Add
                      </button>
                    </div>
                  )
                })}
              </div>

              <p className="mt-4 text-center text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Curated for founders · Reroll for fresh ideas
              </p>
            </div>

            {/* Task breakdown mini card */}
            <div className="p-5" style={card()}>
              <h3 className="mb-4 text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Breakdown
              </h3>
              <div className="space-y-3 text-sm">
                {([['High', highTasks.length], ['Medium', medTasks.length], ['Low', lowTasks.length]] as [Priority, number][]).map(([pr, count]) => {
                  const m = priorityMeta[pr]
                  const barPct = openTasks.length ? Math.round((count / openTasks.length) * 100) : 0
                  return (
                    <div key={pr}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: m.color }}>{pr}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%`, background: m.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <AddTaskModal onClose={() => setModalOpen(false)} onAdd={addTask} />}
    </div>
  )
}
