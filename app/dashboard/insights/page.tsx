import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Star, TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react'
import Link from 'next/link'

function InsightCard({ type, title, body }: { type: 'good' | 'warn' | 'info'; title: string; body: string }) {
  const colors = {
    good: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: '#10b981', Icon: TrendingUp },
    warn: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', icon: '#fbbf24', Icon: AlertTriangle },
    info: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.15)', icon: 'var(--accent)', Icon: Zap },
  }
  const c = colors[type]
  return (
    <div className="rounded-xl p-5 flex items-start gap-4" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <c.Icon className="h-4 w-4" style={{ color: c.icon }} />
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{body}</p>
      </div>
    </div>
  )
}

export default async function InsightsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase.from('workspaces').select('id, name').eq('owner_id', user.id).maybeSingle()

  const { data: entries } = await supabase
    .from('period_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('period_date', { ascending: false })
    .limit(6)

  const hasData = entries && entries.length > 0
  const latest = hasData ? entries[0] : null
  const prev = hasData && entries.length > 1 ? entries[1] : null

  // Compute insights
  const revenue = Number(latest?.revenue) || 0
  const expenses = Number(latest?.expenses) || 0
  const profit = revenue - expenses
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const prevRevenue = Number(prev?.revenue) || 0
  const revenueGrowth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null
  const leads = Number(latest?.new_leads) || Number(latest?.leads) || 0
  const customers = Number(latest?.new_customers) || Number(latest?.customers) || 0
  const convRate = leads > 0 ? Math.round((customers / leads) * 100) : 0

  const insights: { type: 'good' | 'warn' | 'info'; title: string; body: string }[] = []

  if (hasData) {
    if (margin >= 50) insights.push({ type: 'good', title: 'Strong profit margin', body: `${margin}% margin is healthy. Most service businesses aim for 40–60%.` })
    else if (margin < 20 && margin >= 0) insights.push({ type: 'warn', title: 'Thin margin — check expenses', body: `${margin}% margin is below typical targets. Review your largest expense categories.` })
    else if (profit < 0) insights.push({ type: 'warn', title: 'Net loss this period', body: `Expenses exceeded revenue by $${Math.abs(profit).toLocaleString()}. Identify which expense category is largest.` })

    if (revenueGrowth !== null) {
      if (revenueGrowth > 0) insights.push({ type: 'good', title: `Revenue up ${revenueGrowth}% vs last period`, body: `Grew from $${prevRevenue.toLocaleString()} to $${revenue.toLocaleString()}. Momentum is positive.` })
      else if (revenueGrowth < -10) insights.push({ type: 'warn', title: `Revenue down ${Math.abs(revenueGrowth)}% vs last period`, body: `Declined from $${prevRevenue.toLocaleString()} to $${revenue.toLocaleString()}. Check if it was a seasonal dip or structural.` })
    }

    if (leads > 0 && convRate < 20) insights.push({ type: 'warn', title: 'Low lead conversion rate', body: `Only ${convRate}% of leads became customers. Focus on follow-up speed, proposal quality, or lead qualification.` })
    else if (leads > 0 && convRate >= 40) insights.push({ type: 'good', title: 'Strong lead conversion', body: `${convRate}% of leads closed. Your sales process is working well.` })

    if (revenue > 0 && (Number(latest?.revenue_target) || 0) > 0) {
      const pct = Math.round((revenue / Number(latest.revenue_target)) * 100)
      if (pct >= 100) insights.push({ type: 'good', title: 'Goal hit!', body: `Hit ${pct}% of the revenue target. Consider raising your target next period.` })
      else insights.push({ type: 'info', title: `${pct}% of goal reached`, body: `$${(Number(latest.revenue_target) - revenue).toLocaleString()} short of target. Identify the highest-leverage action to close the gap.` })
    }

    if (insights.length === 0) {
      insights.push({ type: 'info', title: 'Log more periods to unlock trend insights', body: 'Add data for 2+ periods to see growth rate, momentum, and risk alerts.' })
    }
  }

  // Funnel data
  const funnelStages = [
    { label: 'Leads', value: leads, color: 'var(--accent)' },
    { label: 'Proposals', value: Number(latest?.proposals_sent) || Number(latest?.proposals) || 0, color: '#f97316' },
    { label: 'Customers', value: customers, color: '#10b981' },
  ]
  const funnelMax = Math.max(...funnelStages.map(s => s.value), 1)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Insights" workspaceName={workspace?.name || 'My Workspace'} hasData={hasData || false} showGreeting />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Insights</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Calculated patterns, risks, and opportunities from your data.
          </p>
        </div>

        {!hasData ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center max-w-sm">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <Star className="h-7 w-7" style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Insights unlock with data</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Log a period entry and Strata generates risk alerts, growth signals, and conversion analysis automatically.
              </p>
              <Link href="/dashboard/period-entry" className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ background: 'var(--accent)', color: 'white' }}>
                + Log first entry
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Insights column */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                AI-generated insights — {entries!.length} period{entries!.length !== 1 ? 's' : ''} of data
              </p>
              {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Key metrics */}
              <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Latest period</p>
                <div className="space-y-3">
                  {[
                    { label: 'Revenue', value: `$${revenue.toLocaleString()}` },
                    { label: 'Expenses', value: `$${expenses.toLocaleString()}` },
                    { label: 'Profit', value: `$${profit.toLocaleString()}`, color: profit >= 0 ? '#10b981' : 'var(--accent)' },
                    { label: 'Margin', value: `${margin}%` },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                      <span className="text-xs font-bold" style={{ color: m.color || 'var(--text-primary)' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion funnel */}
              {leads > 0 && (
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Conversion funnel</p>
                  <div className="space-y-3">
                    {funnelStages.map(stage => (
                      <div key={stage.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stage.label}</span>
                          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{stage.value}</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.round((stage.value / funnelMax) * 100)}%`, background: stage.color }} />
                        </div>
                      </div>
                    ))}
                    {convRate > 0 && (
                      <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                        {convRate}% lead-to-customer rate
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
