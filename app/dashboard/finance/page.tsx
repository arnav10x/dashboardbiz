'use client'

import { useCallback, useEffect, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, Target,
  ArrowUpRight, ArrowDownRight, BarChart3, Plus, ChevronDown, ChevronUp, Info,
} from 'lucide-react'

type PeriodEntry = {
  period_date: string
  revenue: number
  expenses: number
  new_leads: number
  new_customers: number
  revenue_target: number
}

type RevenueLog = {
  id: string
  amount: number
  client_name: string | null
  logged_at: string
}

type CalEntry = {
  entry_date: string
  revenue: number
  expenses: number
}

function money(n: number) {
  const abs = Math.abs(n)
  return `${n < 0 ? '-' : ''}$${abs.toLocaleString()}`
}

function pct(a: number, b: number) {
  if (!b) return 0
  return Math.round((a / b) * 100)
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="app-card" style={style}>
      <div className="app-card-inner">{children}</div>
      <div className="app-card-glow" />
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
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span className="font-bold ml-auto tabular-nums" style={{ color: p.color }}>${Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function FinancePage() {
  const [workspaceName, setWorkspaceName] = useState('Founder OS')
  const [periods, setPeriods] = useState<PeriodEntry[]>([])
  const [revenueLogs, setRevenueLogs] = useState<RevenueLog[]>([])
  const [calEntries, setCalEntries] = useState<CalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllLogs, setShowAllLogs] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [{ data: ws }, { data: pe }, { data: rl }, { data: ce }] = await Promise.all([
      supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
      supabase.from('period_entries')
        .select('period_date, revenue, expenses, new_leads, new_customers, revenue_target')
        .eq('user_id', user.id).order('period_date', { ascending: true }).limit(24),
      supabase.from('revenue_logs')
        .select('id, amount, client_name, logged_at')
        .eq('user_id', user.id).order('logged_at', { ascending: false }).limit(50),
      supabase.from('cal_entries')
        .select('entry_date, revenue, expenses')
        .eq('user_id', user.id).order('entry_date', { ascending: false }).limit(90),
    ])

    if (ws?.name) setWorkspaceName(ws.name)
    setPeriods((pe || []).map(e => ({
      period_date: e.period_date as string,
      revenue: Number(e.revenue) || 0,
      expenses: Number(e.expenses) || 0,
      new_leads: Number(e.new_leads) || 0,
      new_customers: Number(e.new_customers) || 0,
      revenue_target: Number(e.revenue_target) || 0,
    })))
    setRevenueLogs((rl || []) as RevenueLog[])
    setCalEntries((ce || []) as CalEntry[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Aggregate from most recent period (or all time)
  const latest = periods[periods.length - 1] ?? null
  const prev = periods[periods.length - 2] ?? null

  const totalRevenue = periods.reduce((s, e) => s + e.revenue, 0)
  const totalExpenses = periods.reduce((s, e) => s + e.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const avgMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0

  const thisMonthRevenue = latest?.revenue ?? 0
  const thisMonthExpenses = latest?.expenses ?? 0
  const thisMonthProfit = thisMonthRevenue - thisMonthExpenses
  const lastMonthRevenue = prev?.revenue ?? 0
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : null

  const totalLoggedRevenue = revenueLogs.reduce((s, r) => s + r.amount, 0)
  const avgDealSize = revenueLogs.length > 0 ? Math.round(totalLoggedRevenue / revenueLogs.length) : 0

  // Best and worst months
  const bestMonth = [...periods].sort((a, b) => b.revenue - a.revenue)[0]
  const highestExpenseMonth = [...periods].sort((a, b) => b.expenses - a.expenses)[0]

  // Chart data — monthly P&L
  const chartData = periods.map(e => ({
    label: new Date(e.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Revenue: e.revenue,
    Expenses: e.expenses,
    Profit: e.revenue - e.expenses,
  }))

  // Daily trend (last 30 days from cal_entries)
  const last30 = [...calEntries].slice(0, 30).reverse()
  const dailyData = last30.map(e => ({
    label: new Date(e.entry_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Revenue: e.revenue,
    Expenses: e.expenses,
    Profit: e.revenue - e.expenses,
  }))

  const visibleLogs = showAllLogs ? revenueLogs : revenueLogs.slice(0, 8)

  const S = {
    label: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.16em', color: 'var(--text-muted)' },
    value: { fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums' as const, lineHeight: 1.1, letterSpacing: '-0.04em' },
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Finance" workspaceName={workspaceName} showGreeting hasData={periods.length > 0} actionLabel="Log entry" actionHref="/dashboard/period-entry" />
      <div className="flex-1 overflow-y-auto fo-page" style={{ padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading financial data…</p>
          </div>
        )}

        {!loading && periods.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <DollarSign style={{ width: 36, height: 36, color: 'var(--text-muted)', opacity: 0.35, marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No financial data yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Log your first period to see revenue, expenses, and profit here.</p>
            <a href="/dashboard/period-entry" style={{ fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008', textDecoration: 'none' }}>
              Log first entry →
            </a>
          </div>
        )}

        {!loading && periods.length > 0 && (
          <>
            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
              {[
                {
                  label: 'All-Time Revenue', value: money(totalRevenue), icon: TrendingUp,
                  sub: `${periods.length} period${periods.length !== 1 ? 's' : ''} logged`,
                  color: 'var(--accent)',
                },
                {
                  label: 'All-Time Expenses', value: money(totalExpenses), icon: CreditCard,
                  sub: highestExpenseMonth ? `Peak: ${new Date(highestExpenseMonth.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}` : 'No data',
                  color: '#f97316',
                },
                {
                  label: 'Net Profit', value: money(totalProfit), icon: Wallet,
                  sub: `${avgMargin}% avg margin`,
                  color: totalProfit >= 0 ? 'var(--accent)' : '#f43f5e',
                },
                {
                  label: 'Avg Deal Size', value: revenueLogs.length > 0 ? money(avgDealSize) : '—', icon: Target,
                  sub: `${revenueLogs.length} deal${revenueLogs.length !== 1 ? 's' : ''} logged`,
                  color: 'var(--text-primary)',
                },
              ].map(card => (
                <Card key={card.label}>
                  <div style={{ padding: '18px 18px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={S.label}>{card.label}</span>
                      <card.icon style={{ width: 14, height: 14, color: 'var(--accent)', opacity: 0.85, flexShrink: 0 }} />
                    </div>
                    <p style={{ ...S.value, color: card.color, marginBottom: 3 }}>{card.value}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.sub}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* This month spotlight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Card>
                <div style={{ padding: '20px 20px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={S.label}>This Month</span>
                    {revenueGrowth !== null && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, color: revenueGrowth >= 0 ? 'var(--accent)' : '#f43f5e', background: revenueGrowth >= 0 ? 'var(--accent-faint)' : 'rgba(244,63,94,0.08)' }}>
                        {revenueGrowth >= 0 ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
                        {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% vs last month
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    {[
                      { label: 'Revenue', value: money(thisMonthRevenue), color: 'var(--accent)' },
                      { label: 'Expenses', value: money(thisMonthExpenses), color: '#f97316' },
                      { label: 'Profit', value: money(thisMonthProfit), color: thisMonthProfit >= 0 ? 'var(--accent)' : '#f43f5e' },
                    ].map(m => (
                      <div key={m.label}>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>{m.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: m.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  {latest?.revenue_target ? (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Goal progress</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{pct(thisMonthRevenue, latest.revenue_target)}% of {money(latest.revenue_target)}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: 'var(--fo-soft-line-bg)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, pct(thisMonthRevenue, latest.revenue_target))}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 999, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </Card>

              {/* Key metrics */}
              <Card>
                <div style={{ padding: '20px 20px 18px' }}>
                  <span style={{ ...S.label, display: 'block', marginBottom: 16 }}>Financial Health Metrics</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      {
                        label: 'Profit Margin (this month)',
                        value: thisMonthRevenue > 0 ? `${Math.round((thisMonthProfit / thisMonthRevenue) * 100)}%` : '—',
                        note: 'Target: 40%+',
                        good: thisMonthRevenue > 0 && thisMonthProfit / thisMonthRevenue >= 0.4,
                      },
                      {
                        label: 'Avg Monthly Revenue',
                        value: periods.length > 0 ? money(Math.round(totalRevenue / periods.length)) : '—',
                        note: `Over ${periods.length} months`,
                        good: true,
                      },
                      {
                        label: 'Avg Monthly Expenses',
                        value: periods.length > 0 ? money(Math.round(totalExpenses / periods.length)) : '—',
                        note: 'Keep below revenue',
                        good: totalExpenses <= totalRevenue,
                      },
                      {
                        label: 'Revenue per Lead',
                        value: (() => {
                          const totalLeads = periods.reduce((s, e) => s + e.new_leads, 0)
                          return totalLeads > 0 ? money(Math.round(totalRevenue / totalLeads)) : '—'
                        })(),
                        note: 'Revenue ÷ leads logged',
                        good: true,
                      },
                    ].map(m => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.note}</p>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: m.good ? 'var(--accent)' : '#f97316', fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Revenue vs Expenses chart */}
            <Card>
              <div style={{ padding: '20px 20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={S.label}>Revenue vs Expenses — Monthly</span>
                  {bestMonth && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      Best month: {new Date(bestMonth.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} ({money(bestMonth.revenue)})
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 3" stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="Revenue" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="Expenses" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Profit trend */}
            {chartData.length > 1 && (
              <Card>
                <div style={{ padding: '20px 20px 18px' }}>
                  <span style={{ ...S.label, display: 'block', marginBottom: 14 }}>Net Profit Trend</span>
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="Profit" stroke="var(--accent)" strokeWidth={2} fill="url(#profitGrad)" dot={false}
                        activeDot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--bg-card)', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Period P&L table */}
            <Card>
              <div style={{ padding: '20px 20px 18px', overflowX: 'auto' }}>
                <span style={{ ...S.label, display: 'block', marginBottom: 14 }}>Month-by-Month Breakdown</span>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Period', 'Revenue', 'Expenses', 'Profit', 'Margin', 'Leads', 'Customers'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: h === 'Period' ? 'left' : 'right', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...periods].reverse().map((e, i) => {
                      const profit = e.revenue - e.expenses
                      const margin = e.revenue > 0 ? Math.round((profit / e.revenue) * 100) : 0
                      return (
                        <tr key={e.period_date} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {new Date(e.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(e.revenue)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f97316', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(e.expenses)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: profit >= 0 ? 'var(--accent)' : '#f43f5e', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(profit)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4, color: margin >= 40 ? 'var(--accent)' : margin >= 20 ? '#f5a623' : '#f43f5e', background: margin >= 40 ? 'var(--accent-faint)' : margin >= 20 ? 'rgba(245,166,35,0.12)' : 'rgba(244,63,94,0.1)' }}>
                              {margin}%
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{e.new_leads}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{e.new_customers}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 800, fontSize: 11, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{money(totalRevenue)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: '#f97316', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{money(totalExpenses)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: totalProfit >= 0 ? 'var(--accent)' : '#f43f5e', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{money(totalProfit)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 4, color: avgMargin >= 40 ? 'var(--accent)' : avgMargin >= 20 ? '#f5a623' : '#f43f5e', background: avgMargin >= 40 ? 'var(--accent-faint)' : avgMargin >= 20 ? 'rgba(245,166,35,0.12)' : 'rgba(244,63,94,0.1)' }}>
                          {avgMargin}%
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{periods.reduce((s, e) => s + e.new_leads, 0)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{periods.reduce((s, e) => s + e.new_customers, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* Revenue logs */}
            {revenueLogs.length > 0 && (
              <Card>
                <div style={{ padding: '20px 20px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={S.label}>Revenue Logs — Individual Deals</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{revenueLogs.length} total · {money(totalLoggedRevenue)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {visibleLogs.map((log, i) => (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: i < visibleLogs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-faint)', border: '1px solid var(--accent-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <DollarSign style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.client_name || 'Revenue logged'}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
                          {money(log.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {revenueLogs.length > 8 && (
                    <button
                      onClick={() => setShowAllLogs(s => !s)}
                      style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                    >
                      {showAllLogs ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                      {showAllLogs ? 'Show less' : `Show all ${revenueLogs.length} logs`}
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* Daily activity if cal_entries exist */}
            {dailyData.length > 1 && (
              <Card>
                <div style={{ padding: '20px 20px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={S.label}>Daily P&amp;L — Last 30 Days</span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>From Calendar entries</span>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={dailyData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revDaily" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expDaily" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} axisLine={false} tickLine={false} interval={Math.ceil(dailyData.length / 8)} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="Revenue" stroke="var(--accent)" strokeWidth={1.5} fill="url(#revDaily)" dot={false} activeDot={{ r: 2.5 }} />
                      <Area type="monotone" dataKey="Expenses" stroke="#f97316" strokeWidth={1.5} fill="url(#expDaily)" dot={false} activeDot={{ r: 2.5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
