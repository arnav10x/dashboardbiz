'use client'
import { useEffect, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Target, Users, CheckSquare, Zap } from 'lucide-react'
import Link from 'next/link'

interface FunnelData { prospects: number; replied: number; booked: number; closed: number }
interface DailyPoint { label: string; dms: number }

function CircularProgress({ pct, size = 96, stroke = 8 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-raised)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        className="progress-ring-circle"
        style={{ filter: 'drop-shadow(0 0 6px var(--accent-glow))' }}
      />
    </svg>
  )
}

function CountdownTimer() {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      setSecs(Math.floor((midnight.getTime() - now.getTime()) / 1000))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  const urgency = secs < 3600

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: `1px solid ${urgency ? 'rgba(244,63,94,0.3)' : 'var(--border)'}` }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: urgency ? '#f43f5e' : 'var(--text-muted)' }}>
        ⏱ Time remaining today
      </p>
      <div className="flex items-end gap-0.5">
        <span className="text-3xl font-black tabular-nums" style={{ color: urgency ? '#f43f5e' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
      </div>
      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
        {urgency ? 'Under 1 hour — close your tasks now.' : 'Complete tasks before midnight to keep your streak.'}
      </p>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl p-3 text-xs shadow-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function ProgressPage() {
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [startDay, setStartDay] = useState(1)
  const [revenue, setRevenue] = useState(0)
  const [goal, setGoal] = useState(2500)
  const [clientsWon, setClientsWon] = useState(0)
  const [avgDeal, setAvgDeal] = useState(0)
  const [activeDays, setActiveDays] = useState(0)
  const [streak, setStreak] = useState(0)
  const [consistency, setConsistency] = useState(0)
  const [funnel, setFunnel] = useState<FunnelData>({ prospects: 0, replied: 0, booked: 0, closed: 0 })
  const [heatmap, setHeatmap] = useState<{ date: string; count: number }[]>([])
  const [outreachData, setOutreachData] = useState<DailyPoint[]>([])
  const [tasksDone, setTasksDone] = useState(0)
  const [tasksTotal, setTasksTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: ws },
        { data: entries },
        { data: leads },
        { data: tasks },
        { data: calEntries },
      ] = await Promise.all([
        supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
        supabase.from('period_entries').select('revenue, expenses, period_date, revenue_target').eq('user_id', user.id).order('period_date', { ascending: true }),
        supabase.from('pipeline_leads').select('stage, created_at').eq('user_id', user.id),
        supabase.from('tasks').select('is_completed, completed_at, created_at').eq('user_id', user.id),
        supabase.from('cal_entries').select('entry_date').eq('user_id', user.id),
      ])

      if (ws) setWorkspaceName(ws.name || 'My Workspace')

      // Revenue & goal
      if (entries && entries.length > 0) {
        const latest = entries[entries.length - 1]
        const r = Number(latest.revenue) || 0
        const g = Number(latest.revenue_target) || 2500
        setRevenue(r)
        setGoal(g)
      }

      // Pipeline funnel
      if (leads) {
        const f = { prospects: 0, replied: 0, booked: 0, closed: 0 }
        leads.forEach((l: any) => {
          const s = (l.stage || '').toLowerCase()
          if (s.includes('prospect') || s.includes('new')) f.prospects++
          if (s.includes('replied') || s.includes('proposal')) f.replied++
          if (s.includes('call') || s.includes('meeting')) f.booked++
          if (s.includes('won') || s.includes('close')) f.closed++
        })
        setFunnel(f)
        setClientsWon(f.closed)
        setAvgDeal(f.closed > 0 ? Math.round(revenue / f.closed) : 0)
      }

      // Tasks
      if (tasks) {
        const done = tasks.filter((t: any) => t.is_completed).length
        setTasksDone(done)
        setTasksTotal(tasks.length)

        // Streak
        const completedDays = new Set(
          tasks.filter((t: any) => t.is_completed && t.completed_at)
            .map((t: any) => t.completed_at.split('T')[0])
        )
        const today = new Date()
        let s = 0
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          if (completedDays.has(d.toISOString().split('T')[0])) s++
          else if (i > 0) break
        }
        setStreak(s)
      }

      // Activity heatmap (last 30 days from cal_entries + tasks)
      const actMap = new Map<string, number>()
      calEntries?.forEach((e: any) => {
        const d = e.entry_date?.split('T')[0]
        if (d) actMap.set(d, (actMap.get(d) || 0) + 1)
      })
      tasks?.filter((t: any) => t.is_completed && t.completed_at).forEach((t: any) => {
        const d = t.completed_at.split('T')[0]
        actMap.set(d, (actMap.get(d) || 0) + 1)
      })

      const days30: { date: string; count: number }[] = []
      const now = new Date()
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const key = d.toISOString().split('T')[0]
        days30.push({ date: key, count: actMap.get(key) || 0 })
      }
      setHeatmap(days30)
      const activeDaysCount = days30.filter(d => d.count > 0).length
      setActiveDays(activeDaysCount)
      setConsistency(Math.round((activeDaysCount / 30) * 100))

      // Outreach volume chart (last 14 days from leads created_at)
      const outreach: DailyPoint[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const key = d.toISOString().split('T')[0]
        const dms = (leads || []).filter((l: any) => l.created_at?.split('T')[0] === key).length
        outreach.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), dms })
      }
      setOutreachData(outreach)

      // Start day (days since account creation)
      const { data: { user: freshUser } } = await supabase.auth.getUser()
      if (freshUser) {
        const daysSince = Math.max(1, Math.ceil((Date.now() - new Date(freshUser.created_at).getTime()) / 86400000))
        setStartDay(Math.min(daysSince, 30))
      }

      setLoading(false)
    }
    load()
  }, [])

  const goalPct = goal > 0 ? Math.min(100, Math.round((revenue / goal) * 100)) : 0

  const heatClass = (count: number) => {
    if (count === 0) return 'heat-0'
    if (count === 1) return 'heat-1'
    if (count <= 3) return 'heat-2'
    return 'heat-3'
  }

  const funnelStages = [
    { label: 'Prospects', count: funnel.prospects, color: 'var(--accent)' },
    { label: 'Replied', count: funnel.replied, color: '#60a5fa' },
    { label: 'Calls Booked', count: funnel.booked, color: '#f59e0b' },
    { label: 'Clients Closed', count: funnel.closed, color: '#10b981' },
  ]
  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Progress" workspaceName={workspaceName} hasData={true} showGreeting />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
            Performance Record
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
              Day {startDay} of 30
            </span>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Task Execution: {tasksDone}/{tasksTotal}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Cash Collected */}
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 90% 50%, var(--accent-faint) 0%, transparent 60%)' }} />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Cash Collected</p>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-black number-shine" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${revenue.toLocaleString()}
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--accent)', opacity: 0.7 }}>USD</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Link href="/dashboard/period-entry"
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--accent)', color: 'white' }}>
                      <Zap className="h-3 w-3" /> Log Deal
                    </Link>
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Goal Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${goalPct}%`, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      ${revenue.toLocaleString()} / ${goal.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Circular ring */}
                <div className="relative flex-shrink-0 ml-4">
                  <CircularProgress pct={goalPct} size={88} stroke={7} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-black" style={{ color: 'var(--accent)' }}>{goalPct}%</span>
                  </div>
                </div>
              </div>
              {/* Stats row */}
              <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Clients Won</p>
                  <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{clientsWon}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Avg Deal Size</p>
                  <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                    {clientsWon > 0 ? `$${Math.round(revenue / clientsWon).toLocaleString()}` : '$0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Activity log + stats */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                30-Day Activity Log
              </p>
              {/* 30-day heatmap (5 rows × 6 cols) */}
              <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                {heatmap.map((d, i) => (
                  <div key={i} className={`h-6 rounded-md ${heatClass(d.count)}`} title={`${d.date}: ${d.count} action(s)`} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Active Days</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{activeDays}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Current Streak</p>
                  <p className="text-2xl font-black" style={{ color: streak > 0 ? 'var(--accent)' : '#f43f5e' }}>{streak}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Consistency</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{consistency}%</p>
                </div>
              </div>
            </div>

            {/* Countdown timer */}
            <CountdownTimer />
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Conversion Funnel */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                Conversion Funnel
              </p>
              <div className="space-y-3">
                {funnelStages.map(stage => (
                  <div key={stage.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{stage.label}</span>
                      </div>
                      <span className="text-sm font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>{stage.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.round((stage.count / maxFunnel) * 100)}%`,
                          background: stage.color,
                          boxShadow: `0 0 8px ${stage.color}60`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {funnelStages.every(s => s.count === 0) && (
                <div className="mt-4 text-center py-4">
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>No pipeline data yet</p>
                  <Link href="/dashboard/pipeline" className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--accent)', color: 'white' }}>Add leads →</Link>
                </div>
              )}
            </div>

            {/* 30-Day Outreach Volume */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
                30-Day Outreach Volume
              </p>
              {outreachData.some(d => d.dms > 0) ? (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={outreachData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="outreachGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false}
                      interval={Math.floor(outreachData.length / 5)} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="dms" name="DMs sent" stroke="#6366f1" strokeWidth={2} fill="url(#outreachGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-36 rounded-xl flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-raised)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No outreach data yet</p>
                  <Link href="/dashboard/pipeline" className="text-xs font-bold px-3 py-1.5 rounded-lg"
                    style={{ background: 'var(--accent)', color: 'white' }}>Add leads →</Link>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Tasks Done', value: `${tasksDone}/${tasksTotal}`, icon: CheckSquare, color: 'var(--accent)' },
                { label: 'Pipeline Leads', value: (funnel.prospects + funnel.replied + funnel.booked + funnel.closed).toString(), icon: Users, color: '#60a5fa' },
              ].map(s => (
                <div key={s.label} className="app-card" style={{ minHeight: 100 }}>
                  <div className="app-card-inner" style={{ padding: '16px 18px 14px' }}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="fo-kicker">{s.label}</p>
                      <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    </div>
                    <p className="text-2xl font-black" style={{ color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
                  </div>
                  <div className="app-card-glow" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
