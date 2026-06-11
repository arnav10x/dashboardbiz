'use client'

import { useCallback, useEffect, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, DollarSign, CreditCard, Wallet, Target, Flame,
  ArrowUpRight, ArrowDownRight, Plus, ChevronDown, ChevronUp,
  Monitor, Users, Megaphone, Building2, Wrench, MoreHorizontal,
  ShieldCheck, AlertTriangle, X, Receipt, Zap, RefreshCw, Unlink,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────────── */
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
type ExpenseLog = {
  id: string
  amount: number
  category: string
  vendor: string | null
  description: string | null
  expense_date: string
}

/* ─── Constants ─────────────────────────────────────────────── */
const CATS = [
  { id: 'software',  label: 'Software / SaaS',      color: '#3b82f6', icon: Monitor     },
  { id: 'payroll',   label: 'Payroll / Contractors', color: '#22c55e', icon: Users       },
  { id: 'marketing', label: 'Marketing / Ads',       color: '#ec4899', icon: Megaphone   },
  { id: 'office',    label: 'Office / Rent',         color: '#f59e0b', icon: Building2   },
  { id: 'tools',     label: 'Tools / Equipment',     color: 'var(--accent)', icon: Wrench      },
  { id: 'other',     label: 'Other',                 color: '#94a3b8', icon: MoreHorizontal },
]

/* ─── Helpers ────────────────────────────────────────────────── */
const money = (n: number) => `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString()}`
const pct   = (a: number, b: number) => b ? Math.round((a / b) * 100) : 0
const catFor = (id: string) => CATS.find(c => c.id === id) ?? CATS[5]

const S = {
  label: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.16em', color: 'var(--text-muted)' },
  big:   { fontSize: 26, fontWeight: 800, fontVariantNumeric: 'tabular-nums' as const, lineHeight: 1.1, letterSpacing: '-0.04em' },
}

/* ─── Shared UI ──────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="app-card" style={style}>
      <div className="app-card-inner">{children}</div>
      <div className="app-card-glow" />
    </div>
  )
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span style={{ color: p.color, fontWeight: 700, marginLeft: 'auto', paddingLeft: 16, fontVariantNumeric: 'tabular-nums' }}>
            {p.name === 'Margin' ? `${p.value}%` : `$${Number(p.value).toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function FinancePage() {
  const [wsName, setWsName]       = useState('prspectve')
  const [periods, setPeriods]     = useState<PeriodEntry[]>([])
  const [revLogs, setRevLogs]     = useState<RevenueLog[]>([])
  const [expLogs, setExpLogs]     = useState<ExpenseLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [expTableReady, setExpTableReady] = useState(true)

  // Stripe Connect state
  const [stripeConnected, setStripeConnected]   = useState(false)
  const [stripeAccountId, setStripeAccountId]   = useState<string | null>(null)
  const [stripeLastSynced, setStripeLastSynced] = useState<string | null>(null)
  const [stripeSyncing, setStripeSyncing]       = useState(false)
  const [stripeMsg, setStripeMsg]               = useState<string | null>(null)

  // Add expense form
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ amount: '', category: 'software', vendor: '', description: '', expense_date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving]       = useState(false)

  // UI toggles
  const [expFilter, setExpFilter]         = useState('all')
  const [showAllExps, setShowAllExps]     = useState(false)
  const [showAllRevs, setShowAllRevs]     = useState(false)
  const [showAllPeriods, setShowAllPeriods] = useState(false)

  /* ─── Data Load ─── */
  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [{ data: ws }, { data: pe }, { data: rl }, expResult, { data: stripeSettings }] = await Promise.all([
      supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
      supabase.from('period_entries')
        .select('period_date,revenue,expenses,new_leads,new_customers,revenue_target')
        .eq('user_id', user.id).order('period_date', { ascending: true }).limit(24),
      supabase.from('revenue_logs')
        .select('id,amount,client_name,logged_at')
        .eq('user_id', user.id).order('logged_at', { ascending: false }).limit(100),
      supabase.from('expense_logs')
        .select('id,amount,category,vendor,description,expense_date')
        .eq('user_id', user.id).order('expense_date', { ascending: false }).limit(300),
      supabase.from('user_settings')
        .select('stripe_account_id,stripe_last_synced_at')
        .eq('user_id', user.id).maybeSingle(),
    ])

    if (ws?.name) setWsName(ws.name)
    setStripeConnected(!!stripeSettings?.stripe_account_id)
    setStripeAccountId(stripeSettings?.stripe_account_id ?? null)
    setStripeLastSynced(stripeSettings?.stripe_last_synced_at ?? null)
    setPeriods((pe || []).map(e => ({
      period_date: e.period_date as string,
      revenue:         Number(e.revenue)         || 0,
      expenses:        Number(e.expenses)        || 0,
      new_leads:       Number(e.new_leads)       || 0,
      new_customers:   Number(e.new_customers)   || 0,
      revenue_target:  Number(e.revenue_target)  || 0,
    })))
    setRevLogs((rl || []) as RevenueLog[])

    if (expResult.error?.code === '42P01') {
      setExpTableReady(false)
      setExpLogs([])
    } else {
      setExpTableReady(true)
      setExpLogs((expResult.data || []) as ExpenseLog[])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Show toast if redirected back from Stripe OAuth
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const s = p.get('stripe')
    if (s === 'connected') setStripeMsg('Stripe connected! Click Sync to import your charges.')
    if (s === 'denied')    setStripeMsg('Stripe connection was cancelled.')
    if (s === 'error')     setStripeMsg('Stripe connection failed. Please try again.')
    if (s) window.history.replaceState({}, '', window.location.pathname)
  }, [])

  /* ─── Save expense ─── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount))) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('expense_logs').insert({
      user_id: user.id,
      amount: Number(form.amount),
      category: form.category,
      vendor: form.vendor || null,
      description: form.description || null,
      expense_date: form.expense_date,
    })
    if (!error) {
      setForm({ amount: '', category: 'software', vendor: '', description: '', expense_date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      await load()
    }
    setSaving(false)
  }

  async function stripeSync() {
    setStripeSyncing(true)
    setStripeMsg(null)
    const res = await fetch('/api/stripe/sync', { method: 'POST' })
    const json = await res.json()
    if (res.ok) {
      setStripeMsg(`Synced ${json.synced} charge${json.synced !== 1 ? 's' : ''} from Stripe.`)
      setStripeLastSynced(new Date().toISOString())
      await load()
    } else {
      setStripeMsg('Sync failed. Please try again.')
    }
    setStripeSyncing(false)
  }

  async function stripeDisconnect() {
    if (!confirm('Disconnect Stripe? This will remove all Stripe-synced revenue entries.')) return
    await fetch('/api/stripe/disconnect', { method: 'DELETE' })
    setStripeConnected(false)
    setStripeAccountId(null)
    setStripeLastSynced(null)
    setStripeMsg('Stripe disconnected.')
    await load()
  }

  async function deleteExp(id: string) {
    const supabase = createClient()
    await supabase.from('expense_logs').delete().eq('id', id)
    setExpLogs(prev => prev.filter(e => e.id !== id))
  }

  /* ─── Derived metrics ─── */
  const latest  = periods[periods.length - 1] ?? null
  const prev    = periods[periods.length - 2] ?? null

  const totalRev    = periods.reduce((s, e) => s + e.revenue,   0)
  const totalExp    = periods.reduce((s, e) => s + e.expenses,  0)
  const totalProfit = totalRev - totalExp
  const avgMargin   = totalRev > 0 ? Math.round((totalProfit / totalRev) * 100) : 0

  const thisRev    = latest?.revenue   ?? 0
  const thisExp    = latest?.expenses  ?? 0
  const thisProfit = thisRev - thisExp
  const thisMargin = thisRev > 0 ? Math.round((thisProfit / thisRev) * 100) : 0

  const lastRev     = prev?.revenue ?? 0
  const revGrowth   = lastRev > 0 ? Math.round(((thisRev - lastRev) / lastRev) * 100) : null
  const burnRate    = periods.length > 0 ? Math.round(totalExp / periods.length) : 0
  const avgDeal     = revLogs.length > 0 ? Math.round(revLogs.reduce((s, r) => s + r.amount, 0) / revLogs.length) : 0

  // Expense breakdown by category
  const totalLoggedExp = expLogs.reduce((s, e) => s + e.amount, 0)
  const expByCat = CATS
    .map(cat => ({ ...cat, total: expLogs.filter(e => e.category === cat.id).reduce((s, e) => s + e.amount, 0) }))
    .map(c => ({ ...c, pct: totalLoggedExp > 0 ? Math.round((c.total / totalLoggedExp) * 100) : 0 }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  // Health score
  const health = (() => {
    if (!latest) return null
    const scores = [
      thisMargin >= 40 ? 3 : thisMargin >= 20 ? 2 : 1,
      revGrowth === null ? 2 : revGrowth >= 10 ? 3 : revGrowth >= 0 ? 2 : 1,
      thisRev > 0 ? (thisExp / thisRev < 0.6 ? 3 : thisExp / thisRev < 0.8 ? 2 : 1) : 2,
    ]
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (avg >= 2.5) return { label: 'Healthy',  color: '#22c55e', icon: ShieldCheck  }
    if (avg >= 1.5) return { label: 'Caution',  color: '#f59e0b', icon: AlertTriangle }
    return             { label: 'At Risk',  color: '#f43f5e', icon: Flame         }
  })()

  // Chart data
  const chartData = periods.map(e => ({
    label:    new Date(e.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Revenue:  e.revenue,
    Expenses: e.expenses,
    Profit:   e.revenue - e.expenses,
    Margin:   e.revenue > 0 ? Math.round(((e.revenue - e.expenses) / e.revenue) * 100) : 0,
  }))

  // Expense table - filtered + paginated
  const filteredExps = expFilter === 'all' ? expLogs : expLogs.filter(e => e.category === expFilter)
  const visibleExps  = showAllExps  ? filteredExps        : filteredExps.slice(0, 10)
  const visibleRevs  = showAllRevs  ? revLogs             : revLogs.slice(0, 8)

  /* ─── Loading ─── */
  if (loading) return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Finance" workspaceName={wsName} showGreeting hasData={false} actionLabel="Log period" actionHref="/dashboard/period-entry" />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading financial data…</p>
      </div>
    </div>
  )

  /* ─── Render ─── */
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Finance" workspaceName={wsName} showGreeting hasData={periods.length > 0} actionLabel="Log period" actionHref="/dashboard/period-entry" />

      <div className="fo-page ov-page-padding" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

        {/* ── Migration notice ── */}
        {!expTableReady && (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', fontSize: 12 }}>
            <span style={{ color: '#f5a623', fontWeight: 700 }}>Setup needed: </span>
            <span style={{ color: 'var(--text-muted)' }}>Run the migration in </span>
            <code style={{ color: 'var(--text-primary)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 4 }}>supabase/migrations/20240604_expense_logs.sql</code>
            <span style={{ color: 'var(--text-muted)' }}> to enable expense tracking.</span>
          </div>
        )}

        {/* ── Stripe message toast ── */}
        {stripeMsg && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,.09)', border: '1px solid rgba(99,102,241,.22)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-primary)' }}>{stripeMsg}</span>
            <button onClick={() => setStripeMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}><X style={{ width: 12, height: 12 }} /></button>
          </div>
        )}

        {/* ── Stripe Connect banner ── */}
        {stripeConnected ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.2)', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: '#22c55e' }}>Stripe Connected</span>
              {stripeAccountId && <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>· {stripeAccountId}</span>}
              {stripeLastSynced && <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>· Last synced {new Date(stripeLastSynced).toLocaleDateString()}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={stripeSync} disabled={stripeSyncing}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.1)', color: '#22c55e', cursor: stripeSyncing ? 'not-allowed' : 'pointer', opacity: stripeSyncing ? 0.6 : 1 }}>
                <RefreshCw style={{ width: 11, height: 11 }} />{stripeSyncing ? 'Syncing…' : 'Sync Now'}
              </button>
              <button onClick={stripeDisconnect}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Unlink style={{ width: 11, height: 11 }} />Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.18)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Connect Stripe to auto-import revenue</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sync your last 90 days of charges directly into your revenue logs — no manual entry needed.</p>
            </div>
            <a href="/api/stripe/connect"
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008', textDecoration: 'none', flexShrink: 0 }}>
              <Zap style={{ width: 13, height: 13 }} />Connect Stripe
            </a>
          </div>
        )}

        {/* ── No period data ── */}
        {periods.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
            <DollarSign style={{ width: 36, height: 36, color: 'var(--text-muted)', opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No financial data yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Log your first period to unlock the full finance dashboard.</p>
            <a href="/dashboard/period-entry" style={{ fontSize: 13, fontWeight: 700, padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008', textDecoration: 'none' }}>
              Log first period →
            </a>
          </div>
        )}

        {periods.length > 0 && (
          <>
            {/* ══ 1. HEALTH BANNER ══════════════════════════════════════ */}
            {health && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, border: `1px solid ${health.color}25`, background: `${health.color}0c` }}>
                <health.icon style={{ width: 15, height: 15, color: health.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: health.color, marginRight: 4 }}>Financial Health: {health.label}</span>
                <span style={{ width: 1, height: 14, background: 'var(--border)', flexShrink: 0 }} />
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', flex: 1 }}>
                  {[
                    { k: 'Margin',     v: `${thisMargin}%`,         c: thisMargin >= 40 ? '#22c55e' : thisMargin >= 20 ? '#f59e0b' : '#f43f5e' },
                    { k: 'MoM Growth', v: revGrowth !== null ? `${revGrowth >= 0 ? '+' : ''}${revGrowth}%` : 'N/A', c: revGrowth === null ? 'var(--text-muted)' : revGrowth >= 0 ? '#22c55e' : '#f43f5e' },
                    { k: 'Burn Rate',  v: money(burnRate) + '/mo',  c: 'var(--text-primary)' },
                    { k: 'Avg Deal',   v: avgDeal > 0 ? money(avgDeal) : '—', c: 'var(--text-primary)' },
                    { k: 'All-time Profit', v: money(totalProfit),  c: totalProfit >= 0 ? '#22c55e' : '#f43f5e' },
                  ].map(({ k, v, c }) => (
                    <span key={k} style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {k}: <strong style={{ color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ══ 2. KPI ROW (5 cards) ══════════════════════════════════ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5" style={{ gap: 12 }}>
              {/* This Month Revenue */}
              <Card>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={S.label}>Revenue</span>
                    <TrendingUp style={{ width: 13, height: 13, color: 'var(--accent)', opacity: 0.7 }} />
                  </div>
                  <p style={{ ...S.big, color: 'var(--accent)', marginBottom: 4 }}>{money(thisRev)}</p>
                  {revGrowth !== null ? (
                    <p style={{ fontSize: 10, fontWeight: 700, color: revGrowth >= 0 ? '#22c55e' : '#f43f5e', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {revGrowth >= 0
                        ? <ArrowUpRight style={{ width: 11, height: 11 }} />
                        : <ArrowDownRight style={{ width: 11, height: 11 }} />}
                      {revGrowth >= 0 ? '+' : ''}{revGrowth}% vs last month
                    </p>
                  ) : (
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>This month</p>
                  )}
                </div>
              </Card>

              {/* This Month Expenses */}
              <Card>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={S.label}>Expenses</span>
                    <CreditCard style={{ width: 13, height: 13, color: 'var(--accent)', opacity: 0.7 }} />
                  </div>
                  <p style={{ ...S.big, color: 'var(--accent)', marginBottom: 4 }}>{money(thisExp)}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {thisRev > 0 ? `${pct(thisExp, thisRev)}% of revenue` : 'This month'}
                  </p>
                </div>
              </Card>

              {/* Net Profit */}
              <Card>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={S.label}>Net Profit</span>
                    <Wallet style={{ width: 13, height: 13, color: 'var(--accent)', opacity: 0.7 }} />
                  </div>
                  <p style={{ ...S.big, color: thisProfit >= 0 ? 'var(--accent)' : '#f43f5e', marginBottom: 4 }}>{money(thisProfit)}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: thisMargin >= 40 ? '#22c55e' : thisMargin >= 20 ? '#f59e0b' : '#f43f5e' }}>
                    {thisMargin}% margin
                  </p>
                </div>
              </Card>

              {/* Burn Rate */}
              <Card>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={S.label}>Burn Rate</span>
                    <Flame style={{ width: 13, height: 13, color: 'var(--accent)', opacity: 0.7 }} />
                  </div>
                  <p style={{ ...S.big, color: 'var(--text-primary)', marginBottom: 4 }}>{money(burnRate)}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>avg/month · {periods.length} mo</p>
                </div>
              </Card>

              {/* Revenue vs Target */}
              <Card>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={S.label}>vs Target</span>
                    <Target style={{ width: 13, height: 13, color: 'var(--accent)', opacity: 0.7 }} />
                  </div>
                  <p style={{ ...S.big, color: latest?.revenue_target && thisRev >= latest.revenue_target ? '#22c55e' : 'var(--accent)', marginBottom: 6 }}>
                    {latest?.revenue_target ? `${pct(thisRev, latest.revenue_target)}%` : '—'}
                  </p>
                  {latest?.revenue_target ? (
                    <>
                      <div style={{ height: 3, borderRadius: 999, background: 'var(--fo-soft-line-bg)', overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', width: `${Math.min(100, pct(thisRev, latest.revenue_target))}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 999 }} />
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Goal: {money(latest.revenue_target)}</p>
                    </>
                  ) : <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>No goal set yet</p>}
                </div>
              </Card>
            </div>

            {/* ══ 3. EXPENSE BREAKDOWN + P&L SUMMARY ═══════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>

              {/* Expense Breakdown */}
              <Card>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={S.label}>Expense Breakdown</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {expLogs.length} entries · <strong style={{ color: 'var(--accent)' }}>{money(totalLoggedExp)}</strong>
                    </span>
                  </div>

                  {expByCat.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 8 }}>
                      <Receipt style={{ width: 28, height: 28, color: 'var(--text-muted)', opacity: 0.35 }} />
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                        No expenses logged yet.<br />Use the ledger below to track your costs.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {/* Donut chart */}
                      <div style={{ flexShrink: 0 }}>
                        <PieChart width={120} height={120}>
                          <Pie data={expByCat} cx={55} cy={55} innerRadius={33} outerRadius={52} dataKey="total" paddingAngle={2} stroke="none">
                            {expByCat.map((c, i) => <Cell key={i} fill={c.color} />)}
                          </Pie>
                          <Tooltip content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const p = payload[0].payload
                            return (
                              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', borderRadius: 6, padding: '5px 9px', fontSize: 11 }}>
                                <span style={{ color: p.color, fontWeight: 700 }}>{p.label}</span><br />
                                <span style={{ color: 'var(--text-primary)' }}>{money(p.total)} ({p.pct}%)</span>
                              </div>
                            )
                          }} />
                        </PieChart>
                      </div>

                      {/* Category bars */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                        {expByCat.map(cat => (
                          <div key={cat.id}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 7, height: 7, borderRadius: 2, background: cat.color, display: 'inline-block', flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cat.label}</span>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{money(cat.total)}</span>
                            </div>
                            <div style={{ height: 3, borderRadius: 999, background: 'var(--fo-soft-line-bg)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${cat.pct}%`, background: cat.color, borderRadius: 999, opacity: 0.7 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* P&L Waterfall */}
              <Card>
                <div style={{ padding: '20px' }}>
                  <span style={{ ...S.label, display: 'block', marginBottom: 16 }}>This Month — P&L</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Revenue */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Revenue</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{money(thisRev)}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: 'var(--fo-soft-line-bg)' }}>
                        <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 999 }} />
                      </div>
                    </div>

                    {/* Expenses */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Expenses</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{money(thisExp)}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: 'var(--fo-soft-line-bg)' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, thisRev > 0 ? pct(thisExp, thisRev) : 100)}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', opacity: 0.65, borderRadius: 999 }} />
                      </div>
                    </div>

                    {/* Net Profit */}
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Net Profit</span>
                        <span style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: thisProfit >= 0 ? '#22c55e' : '#f43f5e' }}>{money(thisProfit)}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: 'var(--fo-soft-line-bg)' }}>
                        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, thisMargin))}%`, borderRadius: 999, background: thisProfit >= 0 ? 'linear-gradient(90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #f43f5e, #fb7185)' }} />
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        {thisMargin}% margin · {thisMargin >= 40 ? '✓ Excellent' : thisMargin >= 20 ? '~ Good' : '↓ Below target'}
                      </p>
                    </div>

                    {/* All-time row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      {[
                        { k: 'Total Revenue',  v: money(totalRev),    c: 'var(--accent)'  },
                        { k: 'Total Expenses', v: money(totalExp),    c: '#f97316'        },
                        { k: 'All-Time Profit',v: money(totalProfit), c: totalProfit >= 0 ? '#22c55e' : '#f43f5e' },
                      ].map(({ k, v, c }) => (
                        <div key={k}>
                          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>{k}</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: c, fontVariantNumeric: 'tabular-nums' }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* ══ 4. EXPENSE LEDGER ════════════════════════════════════ */}
            <Card>
              <div style={{ padding: '18px 20px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showForm ? 14 : (expLogs.length > 0 ? 12 : 0) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={S.label}>Expense Ledger</span>
                    {expLogs.length > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {expLogs.length} entries · {money(totalLoggedExp)}
                      </span>
                    )}
                  </div>
                  {expTableReady && (
                    <button
                      onClick={() => setShowForm(s => !s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700,
                        padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                        background: showForm ? 'var(--bg-hover)' : 'linear-gradient(180deg, var(--accent-hover), var(--accent))',
                        color: showForm ? 'var(--text-muted)' : '#031008',
                      }}
                    >
                      {showForm ? <X style={{ width: 12, height: 12 }} /> : <Plus style={{ width: 12, height: 12 }} />}
                      {showForm ? 'Cancel' : '+ Add Expense'}
                    </button>
                  )}
                </div>

                {/* Add expense form */}
                {showForm && (
                  <form onSubmit={handleSave} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Amount *</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13, pointerEvents: 'none' }}>$</span>
                          <input type="number" min="0" step="0.01" placeholder="0.00" required
                            value={form.amount} onChange={ev => setForm(f => ({ ...f, amount: ev.target.value }))}
                            className="input-base" style={{ paddingLeft: 22, width: '100%' }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Category *</label>
                        <select value={form.category} onChange={ev => setForm(f => ({ ...f, category: ev.target.value }))}
                          className="input-base" style={{ width: '100%' }}>
                          {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Date *</label>
                        <input type="date" required value={form.expense_date}
                          onChange={ev => setForm(f => ({ ...f, expense_date: ev.target.value }))}
                          className="input-base" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Vendor / Company</label>
                        <input type="text" placeholder="e.g. AWS, Stripe, Figma"
                          value={form.vendor} onChange={ev => setForm(f => ({ ...f, vendor: ev.target.value }))}
                          className="input-base" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ ...S.label, display: 'block', marginBottom: 6 }}>Description (optional)</label>
                        <input type="text" placeholder="Brief note about this expense"
                          value={form.description} onChange={ev => setForm(f => ({ ...f, description: ev.target.value }))}
                          className="input-base" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button type="button" onClick={() => setShowForm(false)}
                        style={{ fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={saving}
                        style={{ fontSize: 12, fontWeight: 700, padding: '7px 20px', borderRadius: 7, border: 'none', background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                        {saving ? 'Saving…' : 'Save Expense'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Category filter pills */}
                {expLogs.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {['all', ...CATS.filter(c => expLogs.some(e => e.category === c.id)).map(c => c.id)].map(catId => {
                      const cat = catId === 'all' ? null : CATS.find(c => c.id === catId)
                      const active = expFilter === catId
                      const count  = catId === 'all' ? expLogs.length : expLogs.filter(e => e.category === catId).length
                      const color  = cat?.color ?? 'var(--accent)'
                      return (
                        <button key={catId} onClick={() => { setExpFilter(catId); setShowAllExps(false) }}
                          style={{
                            fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, cursor: 'pointer',
                            border: active ? 'none' : '1px solid var(--border)',
                            background: active ? color + '22' : 'transparent',
                            color: active ? color : 'var(--text-muted)',
                          }}>
                          {catId === 'all' ? `All (${count})` : `${cat?.label} (${count})`}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Expense table */}
                {filteredExps.length > 0 ? (
                  <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Date', 'Vendor', 'Description', 'Category', 'Amount', ''].map(h => (
                            <th key={h} style={{ padding: '5px 10px', textAlign: h === 'Amount' ? 'right' : 'left', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleExps.map((exp, i) => {
                          const cat = catFor(exp.category)
                          return (
                            <tr key={exp.id} style={{ borderBottom: i < visibleExps.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                              <td style={{ padding: '9px 10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                                {new Date(exp.expense_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td style={{ padding: '9px 10px', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {exp.vendor || '—'}
                              </td>
                              <td style={{ padding: '9px 10px', color: 'var(--text-muted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {exp.description || '—'}
                              </td>
                              <td style={{ padding: '9px 10px' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: cat.color + '1a', color: cat.color }}>
                                  {cat.label}
                                </span>
                              </td>
                              <td style={{ padding: '9px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                                {money(exp.amount)}
                              </td>
                              <td style={{ padding: '9px 4px', textAlign: 'right' }}>
                                <button onClick={() => deleteExp(exp.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: 'var(--text-muted)', opacity: 0.45 }}
                                  title="Delete expense">
                                  <X style={{ width: 11, height: 11 }} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {filteredExps.length > 10 && (
                      <button onClick={() => setShowAllExps(s => !s)}
                        style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                        {showAllExps ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                        {showAllExps ? 'Show less' : `Show all ${filteredExps.length} entries`}
                      </button>
                    )}
                  </>
                ) : expLogs.length === 0 && !showForm && expTableReady && (
                  <div style={{ textAlign: 'center', padding: '28px 0 8px', color: 'var(--text-muted)', fontSize: 12 }}>
                    Click <strong style={{ color: 'var(--accent)' }}>+ Add Expense</strong> to start tracking your costs by category.
                  </div>
                )}
              </div>
            </Card>

            {/* ══ 5. CHARTS ════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr]" style={{ gap: 14 }}>
              {/* Revenue vs Expenses bar */}
              <Card>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={S.label}>Revenue vs Expenses — Monthly</span>
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} />Revenue
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--accent)', opacity: 0.55, display: 'inline-block' }} />Expenses
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={2}>
                      <CartesianGrid strokeDasharray="2 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(255,255,255,0.025)' }} />
                      <Bar dataKey="Revenue" fill="var(--accent)" radius={[3, 3, 0, 0]} maxBarSize={26} />
                      <Bar dataKey="Expenses" fill="var(--accent)" fillOpacity={0.5} radius={[3, 3, 0, 0]} maxBarSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Profit margin trend */}
              <Card>
                <div style={{ padding: '20px' }}>
                  <span style={{ ...S.label, display: 'block', marginBottom: 14 }}>Profit Margin Trend (%)</span>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[-10, 100]} />
                      <Tooltip content={<ChartTip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="Margin" stroke="#22c55e" strokeWidth={2} fill="url(#marginGrad)"
                        dot={false} activeDot={{ r: 3, fill: '#22c55e', stroke: 'var(--bg-card)', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Net profit trend */}
            {chartData.length > 1 && (
              <Card>
                <div style={{ padding: '20px' }}>
                  <span style={{ ...S.label, display: 'block', marginBottom: 14 }}>Net Profit Trend</span>
                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 3" stroke="var(--chart-grid)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<ChartTip />} cursor={{ stroke: 'var(--chart-grid)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="Profit" stroke="var(--accent)" strokeWidth={2} fill="url(#profitGrad)"
                        dot={false} activeDot={{ r: 3, fill: 'var(--accent)', stroke: 'var(--bg-card)', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* ══ 6. REVENUE LOGS ══════════════════════════════════════ */}
            {revLogs.length > 0 && (
              <Card>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span style={S.label}>Revenue Logs — Individual Deals</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                      {revLogs.length} deals · {money(revLogs.reduce((s, r) => s + r.amount, 0))}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {visibleRevs.map((log, i) => (
                      <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 4px', borderBottom: i < visibleRevs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--accent-faint)', border: '1px solid var(--accent-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <DollarSign style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.client_name || 'Revenue logged'}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(log.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{money(log.amount)}</span>
                      </div>
                    ))}
                  </div>
                  {revLogs.length > 8 && (
                    <button onClick={() => setShowAllRevs(s => !s)}
                      style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                      {showAllRevs ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                      {showAllRevs ? 'Show less' : `Show all ${revLogs.length} deals`}
                    </button>
                  )}
                </div>
              </Card>
            )}

            {/* ══ 7. PERIOD BREAKDOWN TABLE ════════════════════════════ */}
            <Card>
              <div style={{ padding: '20px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={S.label}>Monthly Period Breakdown</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{periods.length} months</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Period', 'Revenue', 'Expenses', 'Profit', 'Margin', 'Leads', 'Customers'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: h === 'Period' ? 'left' : 'right', fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllPeriods ? [...periods].reverse() : [...periods].reverse().slice(0, 6)).map((e, i) => {
                      const profit = e.revenue - e.expenses
                      const margin = e.revenue > 0 ? Math.round((profit / e.revenue) * 100) : 0
                      return (
                        <tr key={e.period_date} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'rgba(255,255,255,0.012)' : 'transparent' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {new Date(e.period_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(e.revenue)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(e.expenses)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: profit >= 0 ? 'var(--accent)' : '#f43f5e', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(profit)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, color: margin >= 40 ? '#22c55e' : margin >= 20 ? '#f5a623' : '#f43f5e', background: margin >= 40 ? '#22c55e18' : margin >= 20 ? 'rgba(245,166,35,0.12)' : 'rgba(244,63,94,0.1)' }}>
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
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{money(totalRev)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{money(totalExp)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: totalProfit >= 0 ? 'var(--accent)' : '#f43f5e', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{money(totalProfit)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, color: avgMargin >= 40 ? '#22c55e' : avgMargin >= 20 ? '#f5a623' : '#f43f5e', background: avgMargin >= 40 ? '#22c55e18' : avgMargin >= 20 ? 'rgba(245,166,35,0.12)' : 'rgba(244,63,94,0.1)' }}>
                          {avgMargin}%
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{periods.reduce((s, e) => s + e.new_leads, 0)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{periods.reduce((s, e) => s + e.new_customers, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
                {periods.length > 6 && (
                  <button onClick={() => setShowAllPeriods(s => !s)}
                    style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
                    {showAllPeriods ? <ChevronUp style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
                    {showAllPeriods ? 'Show less' : `Show all ${periods.length} periods`}
                  </button>
                )}
              </div>
            </Card>

          </>
        )}
      </div>
    </div>
  )
}
