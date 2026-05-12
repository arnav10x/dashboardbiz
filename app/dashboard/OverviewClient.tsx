'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, X, TrendingUp, TrendingDown, Check, Target,
  Users, CheckSquare, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Zap,
  Flame, Snowflake, BarChart3, Bell, Trophy,
} from 'lucide-react'
import { TodaysFocus } from '@/components/strata/TodaysFocus'
import { ProactiveAlerts } from '@/components/strata/ProactiveAlerts'

interface Entry {
  period_date: string
  revenue: number
  expenses: number
  new_leads: number
  new_customers: number
  revenue_target: number
}
interface Task { id: string; title: string; is_completed: boolean; notes?: string }
interface Props {
  userName: string
  workspaceName: string
  businessType: string
  businessSummary: string
  entries: Entry[]
  todayTasks: Task[]
}

const SUGGESTED_TASKS: Record<string, string[]> = {
  Agency:     ['Send 10 cold DMs to ideal prospects', 'Follow up with 3 warm leads', 'Post a client win or case study', 'Book a discovery call', 'Refine your offer and pricing page'],
  SaaS:       ['Reach out to 5 unconverted trial users', 'Review churn metrics and user drop-off', 'Ship one UX improvement or bug fix', 'Schedule 2 user interviews this week', 'Post a product update on social'],
  Ecommerce:  ['Check ROAS and pause underperformers', 'Post a product showcase on social', 'Review inventory and reorder stock', 'Test new copy on your top SKU listing', 'Send a retention email to past customers'],
  Consulting: ['Reach out to 5 past clients for referrals', 'Follow up on all outstanding proposals', 'Write and publish 1 insight post', 'Review scope and upsell current clients', 'Build a new productized offer package'],
  Freelance:  ['Send 5 cold pitches to new clients', 'Follow up on unpaid invoices', 'Post a work sample on LinkedIn', 'Ask 2 past clients for testimonials', 'Apply to 3 relevant platforms or boards'],
  Creator:    ['Post 1 piece of content today', 'Engage with 20 followers or comments', 'Reach out to 3 potential collab partners', 'Review analytics from last 7 days', 'Script or outline your next major piece'],
}

type ChartView = 'monthly' | 'yearly'

function useCountUp(to: number, duration = 900): number {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number>()
  const prevRef = useRef(0)
  useEffect(() => {
    const from = prevRef.current
    prevRef.current = to
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (p < 1) rafRef.current = requestAnimationFrame(animate)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [to, duration])
  return displayed
}

function computeHealth(revenue: number, revenueTarget: number, goalPct: number, margin: number, conversionRate: number, leads: number, completedTasks: number, totalTasks: number) {
  const pacing = revenueTarget > 0
    ? goalPct >= 100 ? 25 : goalPct >= 80 ? 22 : goalPct >= 60 ? 18 : goalPct >= 40 ? 12 : 6
    : margin >= 40 ? 25 : margin >= 20 ? 18 : margin >= 0 ? 12 : revenue === 0 ? 10 : 5
  const marginScore = margin >= 60 ? 25 : margin >= 40 ? 22 : margin >= 30 ? 18 : margin >= 20 ? 14 : margin >= 10 ? 10 : margin >= 0 ? 5 : revenue === 0 ? 10 : 0
  const pipeline = leads === 0 ? 12 : conversionRate >= 40 ? 25 : conversionRate >= 25 ? 20 : conversionRate >= 15 ? 15 : conversionRate >= 5 ? 10 : 5
  const execution = totalTasks === 0 ? 12 : completedTasks === totalTasks ? 25 : completedTasks / totalTasks >= 0.75 ? 20 : completedTasks / totalTasks >= 0.5 ? 15 : completedTasks / totalTasks >= 0.25 ? 10 : 5
  return { total: pacing + marginScore + pipeline + execution, pacing, marginScore, pipeline, execution }
}

function getSuggestedTasks(type: string): string[] {
  const key = Object.keys(SUGGESTED_TASKS).find(k => type?.toLowerCase().includes(k.toLowerCase()))
  return SUGGESTED_TASKS[key || 'Agency']
}

function Ring({ pct, size, stroke, color }: { pct: number; size: number; stroke: number; color: string }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

function QuickLogModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [revenue, setRevenue] = useState('')
  const [expenses, setExpenses] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const handleSave = async () => {
    if (!revenue) { setError('Revenue is required'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { data: ws } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).maybeSingle()
    const periodDate = new Date().toISOString().split('T')[0].slice(0, 7) + '-01'
    const { error: err } = await supabase.from('period_entries').upsert({
      user_id: user.id, workspace_id: ws?.id?.toString() ?? null, period_date: periodDate,
      revenue: Number(revenue) || 0, expenses: Number(expenses) || 0,
      leads: 0, customers: 0, proposals: 0,
    }, { onConflict: 'user_id,period_date' })
    setSaving(false)
    if (err) { setError(err.message); return }
    onSaved()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Quick Revenue Log</p>
          <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/[0.06]" style={{ color: 'var(--text-muted)' }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-3">
          {[{ label: 'Revenue ($)', value: revenue, set: setRevenue }, { label: 'Expenses ($)', value: expenses, set: setExpenses }].map(f => (
            <div key={f.label}>
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--text-muted)' }}>$</span>
                <input type="number" className="input-base" style={{ paddingLeft: '1.5rem' }} placeholder="0" value={f.value} onChange={e => f.set(e.target.value)} />
              </div>
            </div>
          ))}
          {revenue && (
            <div className="p-3 rounded-lg" style={{ background: 'var(--bg-raised)' }}>
              <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Profit</p>
              <p className="text-lg font-black" style={{ color: Number(revenue) - Number(expenses) >= 0 ? 'var(--accent)' : '#f43f5e' }}>
                ${(Number(revenue) - Number(expenses)).toFixed(0)}
              </p>
            </div>
          )}
          {error && <p className="text-xs" style={{ color: '#f43f5e' }}>{error}</p>}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
            style={{ background: 'linear-gradient(180deg,#35e680,#22bf63)', color: '#031008' }}>
            {saving ? 'Saving…' : 'Save entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg p-2.5 text-xs shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
      <p className="font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name.charAt(0).toUpperCase() + p.name.slice(1)}</span>
          <span className="font-bold ml-auto tabular-nums" style={{ color: p.color }}>${Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export function OverviewClient({ userName, workspaceName, businessType, businessSummary, entries, todayTasks }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(todayTasks)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(entries.length > 0 ? entries.length - 1 : 0)
  const [chartView, setChartView] = useState<ChartView>('monthly')
  const [toast, setToast] = useState<string | null>(null)
  const [addingTask, setAddingTask] = useState<string | null>(null)
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set())
  const [gamification, setGamification] = useState({ streak: 0, longestStreak: 0, streakFreezes: 0, level: 1, rank: 'Rookie I', totalXp: 0, xpInLevel: 0, xpForNext: 1200, pct: 0 })

  useEffect(() => { setTasks(todayTasks) }, [todayTasks])
  useEffect(() => { if (entries.length > 0) setSelectedPeriodIdx(entries.length - 1) }, [entries.length])
  useEffect(() => {
    const loadGamification = async () => {
      try {
        await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'daily_checkin' }) })
        const res = await fetch('/api/gamification', { cache: 'no-store' })
        if (res.ok) setGamification(await res.json())
      } catch {}
    }
    loadGamification()
  }, [])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800) }

  const awardXp = useCallback(async (action: string) => {
    try {
      const res = await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
      if (res.ok) setGamification(await res.json())
    } catch {}
  }, [])

  const toggleTask = async (task: Task) => {
    if (togglingId) return
    setTogglingId(task.id)
    const newVal = !task.is_completed
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, is_completed: newVal } : t)
    setTasks(updatedTasks)
    const supabase = createClient()
    await supabase.from('tasks').update({ is_completed: newVal, completed_at: newVal ? new Date().toISOString() : null }).eq('id', task.id)
    setTogglingId(null)
    if (newVal) {
      await awardXp('complete_task')
      if (updatedTasks.every(t => t.is_completed)) await awardXp('complete_all_tasks')
    }
  }

  const addSuggestedTask = async (title: string) => {
    if (addingTask || addedTasks.has(title)) return
    setAddingTask(title)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('tasks').insert({ user_id: user.id, title, is_completed: false, completed_at: null }).select('id,title,notes').single()
      if (data) {
        const newTask: Task = { id: String(data.id), title: String(data.title), is_completed: false, notes: data.notes || undefined }
        setTasks(prev => [newTask, ...prev.map(t => ({ ...t }))])
        setAddedTasks(prev => new Set([...prev, title]))
        showToast(`Added: ${title.length > 40 ? title.slice(0, 40) + '…' : title}`)
      }
    } finally { setAddingTask(null) }
  }

  const hasData = entries.length > 0
  const selected = entries[selectedPeriodIdx] ?? null
  const prev = entries[selectedPeriodIdx - 1] ?? null

  const revenue = selected?.revenue ?? 0
  const prevRevenue = prev?.revenue ?? 0
  const expenses = selected?.expenses ?? 0
  const profit = revenue - expenses
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const leads = selected?.new_leads ?? 0
  const customers = selected?.new_customers ?? 0
  const revenueTarget = selected?.revenue_target ?? 0
  const conversionRate = leads > 0 ? Math.round((customers / leads) * 100) : 0
  const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null
  const isUp = growth !== null && growth >= 0
  const goalPct = revenueTarget > 0 ? Math.min(100, Math.round((revenue / revenueTarget) * 100)) : 0

  const animRevenue = useCountUp(revenue)
  const animProfit = useCountUp(profit)
  const animLeads = useCountUp(leads)
  const completedCount = tasks.filter(t => t.is_completed).length
  const health = computeHealth(revenue, revenueTarget, goalPct, margin, conversionRate, leads, completedCount, tasks.length)
  const animHealth = useCountUp(health.total, 1200)
  const healthLabel = health.total >= 60 ? 'Good' : 'Needs work'
  const healthColor = health.total >= 60 ? 'var(--accent)' : '#ff4d4d'

  const monthlyChartData = entries.map(e => ({
    label: new Date(e.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    revenue: e.revenue, expenses: e.expenses, profit: e.revenue - e.expenses,
  }))
  const yearlyChartData = (() => {
    const byYear: Record<string, { revenue: number; expenses: number }> = {}
    entries.forEach(e => {
      const yr = e.period_date.slice(0, 4)
      if (!byYear[yr]) byYear[yr] = { revenue: 0, expenses: 0 }
      byYear[yr].revenue += e.revenue; byYear[yr].expenses += e.expenses
    })
    return Object.entries(byYear).sort().map(([yr, d]) => ({ label: yr, revenue: d.revenue, expenses: d.expenses, profit: d.revenue - d.expenses }))
  })()
  const chartData = chartView === 'yearly' ? yearlyChartData : monthlyChartData
  const suggestedTasks = getSuggestedTasks(businessType)
  const periodLabel = selected
    ? new Date(selected.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'No data'

  const pipelineStages = [
    { label: 'Prospects', count: leads,                           color: '#7aa2ff' },
    { label: 'Contacted', count: Math.round(leads * 0.6),         color: '#b56cff' },
    { label: 'Replied',   count: Math.round(leads * 0.3),         color: '#f59e0b' },
    { label: 'Booked',    count: customers > 0 ? customers : 0,   color: 'var(--accent)' },
    { label: 'Closed',    count: customers,                        color: 'rgba(255,255,255,.55)' },
  ]

  const S = {
    card: {
      background: 'linear-gradient(145deg, rgba(17,20,23,0.98), rgba(5,6,7,0.98))',
      border: '1px solid rgba(255,255,255,0.065)',
      borderRadius: 13,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.028), 0 18px 45px rgba(0,0,0,0.24)',
    } as React.CSSProperties,
    label: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.16em', color: 'rgba(196,201,197,0.62)' },
    value: { fontSize: 30, fontWeight: 950, fontVariantNumeric: 'tabular-nums' as const, lineHeight: 1.05, letterSpacing: '-0.045em', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
    sub: { fontSize: 11, color: 'var(--text-muted)' },
    bar: { height: 5, background: 'rgba(255,255,255,0.055)', borderRadius: 999, overflow: 'hidden' as const },
  }

  const rankTitle = gamification.rank || 'Rookie I'



  return (
    <div className="flex-1 overflow-y-auto fo-page" style={{ padding: '20px 28px 22px', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

      {showModal && <QuickLogModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); window.location.reload() }} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-xl"
          style={{ transform: 'translateX(-50%)', background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{toast}</p>
        </div>
      )}

      {/* Period selector */}
      {hasData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, background: 'linear-gradient(145deg, rgba(15,17,20,0.98), rgba(5,6,7,0.98))', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>
            <button disabled={selectedPeriodIdx === 0} onClick={() => setSelectedPeriodIdx(i => i - 1)}
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: selectedPeriodIdx === 0 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronLeft style={{ width: 12, height: 12 }} />
            </button>
            <span style={{ padding: '0 18px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              {periodLabel}
            </span>
            <button disabled={selectedPeriodIdx === entries.length - 1} onClick={() => setSelectedPeriodIdx(i => i + 1)}
              style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: selectedPeriodIdx === entries.length - 1 ? 0.3 : 1, background: 'none', border: 'none', cursor: 'pointer' }}>
              <ChevronRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {selectedPeriodIdx + 1} of {entries.length} period{entries.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
        {[
          { label: 'Revenue', value: `$${animRevenue.toLocaleString()}`, sub: revenueTarget > 0 ? `$${Math.max(0, revenueTarget - revenue).toLocaleString()} to goal` : 'No target set', icon: Target, color: 'var(--text-primary)', bar: revenueTarget > 0, barPct: goalPct },
          { label: 'Net Profit', value: `$${animProfit.toLocaleString()}`, sub: `${margin}% margin`, icon: TrendingUp, color: profit < 0 ? '#f43f5e' : 'var(--text-primary)', bar: false },
          { label: 'Pipeline Leads', value: animLeads.toString(), sub: `${conversionRate}% conv. rate`, icon: Users, color: 'var(--text-primary)', bar: false },
          { label: 'Tasks Done', value: `${completedCount}/${tasks.length}`, sub: 'today', icon: CheckSquare, color: tasks.length > 0 && completedCount === tasks.length ? 'var(--accent)' : 'var(--text-primary)', bar: false },
        ].map(card => (
          <div key={card.label} style={{ ...S.card, padding: '18px 18px 16px', minHeight: 126 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={S.label}>{card.label}</span>
              <card.icon style={{ width: 14, height: 14, color: 'var(--accent)', opacity: 0.85, flexShrink: 0 }} />
            </div>
            <p style={{ ...S.value, color: card.color, marginBottom: 3 }}>{card.value}</p>
            <p style={S.sub}>{card.sub}</p>
            {card.bar && (
              <div style={{ ...S.bar, marginTop: 16 }}>
                <div style={{ height: '100%', width: `${card.barPct}%`, background: 'linear-gradient(90deg,#22c763,#4be588)', borderRadius: 999, transition: 'width 1s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Business health */}
      {hasData && (
        <div style={{ ...S.card, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Ring pct={health.total} size={70} stroke={7} color={healthColor} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 950, color: healthColor }}>{animHealth}</span>
                </div>
              </div>
              <div>
                <p style={{ ...S.label, marginBottom: 4 }}>Business Health</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${healthColor}18`, color: healthColor }}>
                  {healthLabel}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, minWidth: 0 }}>
              {[
                { label: 'Revenue Pacing', score: health.pacing },
                { label: 'Margin Health', score: health.marginScore },
                { label: 'Pipeline', score: health.pipeline },
                { label: 'Execution', score: health.execution },
              ].map(s => {
                const pct = (s.score / 25) * 100
                const c = pct >= 60 ? 'var(--accent)' : '#ff4d4d'
                return (
                  <div key={s.label}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>{s.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 900, color: c }}>{s.score}/25</span>
                    </div>
                    <div style={S.bar}>
                      <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 1, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3-col: Revenue History | Monthly Target | Lead Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1.1fr 0.8fr', gap: 14 }}>

        {/* Revenue History */}
        <div style={{ ...S.card, padding: '20px 20px 18px', minHeight: 226 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={S.label}>Revenue History</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {growth !== null && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, color: isUp ? 'var(--accent)' : '#f43f5e', background: isUp ? 'rgba(34,197,94,0.08)' : 'rgba(244,63,94,0.08)' }}>
                  {isUp ? <TrendingUp style={{ width: 10, height: 10 }} /> : <TrendingDown style={{ width: 10, height: 10 }} />}
                  {isUp ? '+' : ''}{growth}%
                </span>
              )}
              {hasData && (
                <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                  {(['monthly', 'yearly'] as const).map((v, i) => (
                    <button key={v} onClick={() => setChartView(v)} style={{ padding: '2px 7px', fontSize: 9, fontWeight: 700, cursor: 'pointer', background: chartView === v ? 'rgba(34,197,94,0.1)' : 'transparent', color: chartView === v ? 'var(--accent)' : 'var(--text-muted)', border: 'none', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      {v === 'monthly' ? 'MO' : 'YR'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p style={{ ...S.value, fontSize: 26, color: 'var(--text-primary)', marginBottom: 10 }}>${animRevenue.toLocaleString()}</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={128}>
              <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={1.5} fill="url(#revGrad)" dot={false}
                  activeDot={{ r: 2.5, fill: '#22c55e', stroke: 'var(--bg-card)', strokeWidth: 1.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 128, borderRadius: 8, background: 'var(--bg-raised)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <p style={S.sub}>Log first entry to unlock chart</p>
              <button onClick={() => setShowModal(true)} style={{ fontSize: 10, fontWeight: 600, padding: '4px 10px', borderRadius: 5, background: 'linear-gradient(180deg,#35e680,#22bf63)', color: '#031008', border: 'none', cursor: 'pointer' }}>
                + Quick log
              </button>
            </div>
          )}
        </div>

        {/* Monthly Target */}
        <div style={{ ...S.card, padding: '20px 20px 18px', minHeight: 226, display: 'flex', flexDirection: 'column' }}>
          <p style={{ ...S.label, marginBottom: 14 }}>Monthly Target</p>
          {revenueTarget > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Ring pct={goalPct} size={118} stroke={9} color={'#22c55e'} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 950, color: '#22c55e', lineHeight: 1 }}>{goalPct}%</span>
                  <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>of goal</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 30, fontWeight: 950, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', marginBottom: 2 }}>${animRevenue.toLocaleString()}</p>
                <p style={{ ...S.sub, marginBottom: 10 }}>/ ${revenueTarget.toLocaleString()} goal</p>
                <p style={{ fontSize: 10, fontWeight: 600, marginBottom: 7, color: 'var(--accent)' }}>
                  {goalPct >= 100 ? 'Goal achieved!' : `$${Math.max(0, revenueTarget - revenue).toLocaleString()} remaining`}
                </p>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${goalPct}%`, background: goalPct >= 100 ? 'linear-gradient(90deg,#22c763,#4be588)' : 'linear-gradient(90deg,#22c763,#4be588)', borderRadius: 999, transition: 'width 1s ease' }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center' }}>
              <Target style={{ width: 22, height: 22, color: 'var(--text-muted)', opacity: 0.35 }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 0 }}>No revenue target</p>
              <p style={{ ...S.sub, marginBottom: 8 }}>Set a monthly goal to track pacing.</p>
              <Link href="/dashboard/settings" style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: 'linear-gradient(180deg,#35e680,#22bf63)', color: '#031008', textDecoration: 'none' }}>
                Set target →
              </Link>
            </div>
          )}
        </div>

        {/* Lead Pipeline */}
        <div style={{ ...S.card, padding: '20px 20px 18px', minHeight: 226, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={S.label}>Lead Pipeline</span>
            <Link href="/dashboard/pipeline" style={{ fontSize: 10, color: 'var(--text-muted)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {leads > 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {pipelineStages.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right', flexShrink: 0, color: s.color }}>{s.count}</span>
                  <span style={{ fontSize: 11, width: 62, flexShrink: 0, color: 'var(--text-muted)' }}>{s.label}</span>
                  <div style={{ flex: 1, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((s.count / leads) * 100)}%`, background: s.color, borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, textAlign: 'center' }}>
              <Users style={{ width: 20, height: 20, color: 'var(--text-muted)', opacity: 0.35 }} />
              <p style={S.sub}>Pipeline empty</p>
              <Link href="/dashboard/pipeline" style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 6, background: 'linear-gradient(180deg,#35e680,#22bf63)', color: '#031008', textDecoration: 'none' }}>
                Add first lead →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Tasks | TodaysFocus */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.45fr', gap: 14, alignItems: 'stretch' }}>

        {/* Tasks */}
        <div style={{ ...S.card, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', minHeight: 318 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Today&apos;s Tasks</span>
              {tasks.length > 0 && completedCount === tasks.length && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 3, background: 'rgba(34,197,94,0.1)', color: 'var(--accent)' }}>ALL DONE</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{completedCount}/{tasks.length}</span>
              <Link href="/dashboard/tasks" style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)', textDecoration: 'none' }}>
                Manage →
              </Link>
            </div>
          </div>

          {tasks.length > 0 ? (
            <div style={{ marginBottom: 14 }}>
              {tasks.slice(0, 4).map((task, i) => (
                <div key={task.id} onClick={() => toggleTask(task)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < Math.min(tasks.length, 4) - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                  <div style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${task.is_completed ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`, background: task.is_completed ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                    {togglingId === task.id
                      ? <Loader2 style={{ width: 9, height: 9, color: 'white' }} className="animate-spin" />
                      : task.is_completed ? <Check style={{ width: 9, height: 9, color: 'white' }} strokeWidth={3} /> : null}
                  </div>
                  <p style={{ fontSize: 11, flex: 1, color: task.is_completed ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </p>
                  {task.is_completed && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3, color: 'var(--accent)', background: 'rgba(34,197,94,0.1)' }}>DONE</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '14px 0', textAlign: 'center', marginBottom: 14 }}>
              <CheckSquare style={{ width: 20, height: 20, color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 5px' }} />
              <p style={S.sub}>No tasks yet — add your non-negotiables</p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ ...S.label, whiteSpace: 'nowrap' as const }}>{businessType} Priorities</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {suggestedTasks.slice(0, 5).map((task, i) => {
              const isAdded = addedTasks.has(task)
              const isAdding = addingTask === task
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 4px', borderRadius: 5, background: isAdded ? 'rgba(34,197,94,0.05)' : 'transparent' }}>
                  <button onClick={(e) => { e.stopPropagation(); addSuggestedTask(task) }} disabled={isAdded || !!addingTask}
                    style={{ width: 15, height: 15, borderRadius: 3, border: `1px solid ${isAdded ? 'var(--accent)' : 'rgba(34,197,94,0.2)'}`, background: isAdded ? 'rgba(39,211,110,0.05)' : 'rgba(39,211,110,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: isAdded ? 'not-allowed' : 'pointer', opacity: isAdded ? 0.65 : 1 }}>
                    {isAdding
                      ? <Loader2 style={{ width: 7, height: 7, color: 'var(--accent)' }} className="animate-spin" />
                      : <Plus style={{ width: 7, height: 7, color: isAdded ? 'rgba(39,211,110,0.45)' : 'var(--accent)' }} />}
                  </button>
                  <p style={{ fontSize: 11, flex: 1, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    {task}
                  </p>
                </div>
              )
            })}
          </div>
          <Link href="/dashboard/tasks" style={{ marginTop: 10, fontSize: 10, fontWeight: 500, padding: '6px', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.14)', background: 'rgba(34,197,94,0.04)', textDecoration: 'none' }}>
            View all tasks
          </Link>
        </div>

        <TodaysFocus
          userName={userName}
          businessType={businessType}
          hasData={hasData}
          revenue={revenue}
          expenses={expenses}
          leads={leads}
          conversionRate={conversionRate}
          margin={margin}
          profit={profit}
          completedTasks={completedCount}
          totalTasks={tasks.length}
          revenueTarget={revenueTarget}
        />

      </div>

      <div style={{ ...S.card, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <Bell style={{ width: 16, height: 16, color: '#fbbf24' }} />
        <span style={{ ...S.label, color: 'var(--text-primary)' }}>AI Alerts</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: conversionRate === 0 && leads > 0 ? '#fbbf24' : 'var(--accent)', background: conversionRate === 0 && leads > 0 ? 'rgba(251,191,36,.08)' : 'rgba(39,211,110,.08)', border: conversionRate === 0 && leads > 0 ? '1px solid rgba(251,191,36,.2)' : '1px solid rgba(39,211,110,.2)', borderRadius: 999, padding: '3px 8px' }}>{conversionRate === 0 && leads > 0 ? 'warning' : 'live'}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: conversionRate === 0 && leads > 0 ? '#fbbf24' : 'var(--accent)' }}>{leads > 0 ? `${conversionRate}% conversion rate across ${leads} logged leads` : tasks.length ? `${completedCount}/${tasks.length} tasks completed today` : 'Log leads, revenue, or tasks to generate alerts'}</span>
        <ChevronRight style={{ marginLeft: 'auto', width: 14, height: 14, color: 'var(--text-muted)', transform: 'rotate(90deg)' }} />
      </div>

      <div style={{ display: 'none' }}>
      <ProactiveAlerts
        hasData={hasData}
        revenue={revenue}
        prevRevenue={prevRevenue}
        expenses={expenses}
        profit={profit}
        margin={margin}
        leads={leads}
        conversionRate={conversionRate}
        completedTasks={completedCount}
        totalTasks={tasks.length}
        revenueTarget={revenueTarget}
        healthScore={health.total}
        growth={growth}
      />
      </div>

      {!hasData && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
          <div style={{ ...S.card, padding: 24, textAlign: 'center', width: '100%', maxWidth: 360 }}>
            <Zap style={{ width: 28, height: 28, color: 'var(--accent)', margin: '0 auto 10px', opacity: 0.75 }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Log your first period</p>
            <p style={{ ...S.sub, marginBottom: 16, lineHeight: 1.5 }}>Enter revenue, expenses, leads, and customers to unlock your full dashboard.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowModal(true)} style={{ flex: 1, padding: '9px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: 'linear-gradient(180deg,#35e680,#22bf63)', color: '#031008', border: 'none', cursor: 'pointer' }}>
                Quick log
              </button>
              <Link href="/dashboard/period-entry" style={{ flex: 1, padding: '9px', borderRadius: 7, fontSize: 12, fontWeight: 600, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none', textAlign: 'center' }}>
                Full entry →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
