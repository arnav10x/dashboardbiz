'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, TrendingDown, Zap, Users, Target, CheckSquare, BarChart2, ChevronDown } from 'lucide-react'

interface Alert {
  type: 'critical' | 'warning' | 'opportunity' | 'nudge'
  icon: React.ReactNode
  title: string
  body: string
  actionLabel: string
  actionHref: string
}

interface Props {
  hasData: boolean
  revenue: number
  prevRevenue: number
  expenses: number
  profit: number
  margin: number
  leads: number
  conversionRate: number
  completedTasks: number
  totalTasks: number
  revenueTarget: number
  healthScore: number
  growth: number | null
}

const TYPE_STYLES = {
  critical:    { bg: 'rgba(244,63,94,0.07)',    border: 'rgba(244,63,94,0.18)',    color: '#f43f5e',   badge: 'rgba(244,63,94,0.12)' },
  warning:     { bg: 'rgba(245,158,11,0.07)',   border: 'rgba(245,158,11,0.18)',   color: '#f59e0b',   badge: 'rgba(245,158,11,0.12)' },
  opportunity: { bg: 'var(--accent-faint)',    border: 'var(--accent-ring)',    color: 'var(--accent)',   badge: 'var(--accent-muted)' },
  nudge:       { bg: 'rgba(96,165,250,0.07)',   border: 'rgba(96,165,250,0.16)',   color: '#60a5fa',   badge: 'rgba(96,165,250,0.12)' },
}

const SEVERITY_ORDER: Alert['type'][] = ['critical', 'warning', 'nudge', 'opportunity']

function generateAlerts(props: Props): Alert[] {
  const {
    hasData, revenue, prevRevenue, expenses, profit, margin, leads,
    conversionRate, completedTasks, totalTasks, revenueTarget, healthScore, growth,
  } = props
  const alerts: Alert[] = []

  if (!hasData) {
    alerts.push({
      type: 'critical',
      icon: <Zap className="h-3.5 w-3.5" />,
      title: 'No business data logged yet',
      body: 'Your dashboard is empty. Log your first period entry to unlock AI analysis, health score, and personalized coaching.',
      actionLabel: 'Log first entry →',
      actionHref: '/dashboard/period-entry',
    })
    alerts.push({
      type: 'nudge',
      icon: <Users className="h-3.5 w-3.5" />,
      title: 'Start building your pipeline',
      body: 'Add your first prospect to the pipeline so you can track leads from outreach to close.',
      actionLabel: 'Add a lead →',
      actionHref: '/dashboard/pipeline',
    })
    return alerts
  }

  if (profit < 0) {
    alerts.push({
      type: 'critical',
      icon: <TrendingDown className="h-3.5 w-3.5" />,
      title: `Operating at a loss — $${Math.abs(profit).toLocaleString()} in the red`,
      body: 'Expenses exceeded revenue this period. Identify your largest expense category and cut or defer it immediately.',
      actionLabel: 'Review expenses →',
      actionHref: '/dashboard/period-entry',
    })
  }

  if (growth !== null && growth <= -25) {
    alerts.push({
      type: 'critical',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      title: `Revenue dropped ${Math.abs(growth)}% this period`,
      body: 'A drop this large needs a root cause analysis. Was it fewer leads, lower close rate, lost clients, or smaller deals?',
      actionLabel: 'Analyze pipeline →',
      actionHref: '/dashboard/pipeline',
    })
  }

  if (margin < 20 && revenue > 0 && profit >= 0) {
    alerts.push({
      type: 'warning',
      icon: <BarChart2 className="h-3.5 w-3.5" />,
      title: `Margin is ${margin}% — below sustainable threshold`,
      body: 'Target 40%+ margin for resilience. Thin margins leave you one slow month from trouble. Review your pricing and cut non-essential costs.',
      actionLabel: 'Ask AI for margin advice →',
      actionHref: '/dashboard/ai-copilot',
    })
  }

  if (leads === 0) {
    alerts.push({
      type: 'warning',
      icon: <Users className="h-3.5 w-3.5" />,
      title: 'Pipeline is empty — zero tracked prospects',
      body: 'An empty pipeline is a revenue cliff in 30–90 days. Consistent outreach today prevents a dry month later.',
      actionLabel: 'Add leads to pipeline →',
      actionHref: '/dashboard/pipeline',
    })
  }

  if (conversionRate < 15 && leads > 2) {
    alerts.push({
      type: 'warning',
      icon: <Target className="h-3.5 w-3.5" />,
      title: `${conversionRate}% conversion rate — leads aren't closing`,
      body: 'Low conversion usually means slow follow-up or poor lead qualification. Most deals close within 48 hours of first contact.',
      actionLabel: 'Review pipeline →',
      actionHref: '/dashboard/pipeline',
    })
  }

  if (revenueTarget > 0 && revenue < revenueTarget * 0.5) {
    const remaining = revenueTarget - revenue
    alerts.push({
      type: 'warning',
      icon: <Target className="h-3.5 w-3.5" />,
      title: `Behind your $${revenueTarget.toLocaleString()} monthly goal`,
      body: `You need $${remaining.toLocaleString()} more to hit your target. Focus on closing open pipeline deals and adding new prospects.`,
      actionLabel: 'View pipeline →',
      actionHref: '/dashboard/pipeline',
    })
  }

  if (totalTasks > 0 && completedTasks === 0) {
    alerts.push({
      type: 'nudge',
      icon: <CheckSquare className="h-3.5 w-3.5" />,
      title: 'No tasks completed today yet',
      body: 'Your execution score is at 0%. Even completing one task keeps your streak alive and builds momentum.',
      actionLabel: 'View tasks →',
      actionHref: '/dashboard/tasks',
    })
  }

  if (growth !== null && growth >= 20) {
    alerts.push({
      type: 'opportunity',
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      title: `Revenue up ${growth}% — strong momentum`,
      body: 'Identify what drove this growth and double down. This is the time to increase outreach volume and pipeline investment.',
      actionLabel: 'Get AI analysis →',
      actionHref: '/dashboard/ai-copilot',
    })
  }

  if (conversionRate >= 40 && leads > 0) {
    alerts.push({
      type: 'opportunity',
      icon: <Zap className="h-3.5 w-3.5" />,
      title: `${conversionRate}% conversion — your sales process is working`,
      body: 'With this close rate, adding more leads directly multiplies revenue. Scale outreach volume now while the process is proven.',
      actionLabel: 'Add more leads →',
      actionHref: '/dashboard/pipeline',
    })
  }

  if (healthScore >= 80) {
    alerts.push({
      type: 'opportunity',
      icon: <TrendingUp className="h-3.5 w-3.5" />,
      title: `Business health score: ${healthScore}/100 — excellent`,
      body: 'All four core metrics are firing. This is the right time to set a more aggressive revenue target or invest in growth.',
      actionLabel: "Ask AI what's next →",
      actionHref: '/dashboard/ai-copilot',
    })
  }

  return alerts.slice(0, 4)
}

export function ProactiveAlerts(props: Props) {
  const alerts = generateAlerts(props)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    try {
      setExpanded(localStorage.getItem('alerts-expanded') === 'true')
    } catch {}
  }, [])

  const toggle = () => {
    setExpanded(prev => {
      const next = !prev
      try { localStorage.setItem('alerts-expanded', String(next)) } catch {}
      return next
    })
  }

  if (alerts.length === 0) return null

  // Sort so most severe shows first in collapsed preview
  const sorted = [...alerts].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.type) - SEVERITY_ORDER.indexOf(b.type)
  )
  const top = sorted[0]
  const topStyle = TYPE_STYLES[top.type]

  const countsByType = alerts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const severityLabel = countsByType.critical
    ? 'critical'
    : countsByType.warning
    ? 'warning'
    : countsByType.nudge
    ? 'info'
    : 'opportunity'

  const severityColor = countsByType.critical
    ? '#f43f5e'
    : countsByType.warning
    ? '#f59e0b'
    : countsByType.nudge
    ? '#60a5fa'
    : 'var(--accent)'

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <button
        onClick={toggle}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 transition-all hover:brightness-110"
        style={{ background: 'var(--bg-raised)', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}
      >
        <Zap className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          AI Alerts
        </p>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: `${severityColor}14`, color: severityColor }}>
          {alerts.length}
        </span>
        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded capitalize"
          style={{ color: severityColor }}>
          {severityLabel}
        </span>
        {!expanded && (
          <p className="flex-1 text-[11px] truncate text-left ml-1" style={{ color: topStyle.color }}>
            {top.title}
          </p>
        )}
        {expanded && <div className="flex-1" />}
        <ChevronDown
          className="h-3 w-3 flex-shrink-0 transition-transform duration-200"
          style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {/* Expanded */}
      <div style={{ overflow: 'hidden', maxHeight: expanded ? `${alerts.length * 110 + 16}px` : '0', transition: 'max-height 0.25s ease' }}>
        <div className="p-3 space-y-2">
          {sorted.map((alert, i) => {
            const s = TYPE_STYLES[alert.type]
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <div className="flex-shrink-0 mt-0.5" style={{ color: s.color }}>{alert.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold leading-snug mb-0.5" style={{ color: s.color }}>{alert.title}</p>
                  <p className="text-[11px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{alert.body}</p>
                  <a href={alert.actionHref}
                    className="inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-md transition-all hover:opacity-80"
                    style={{ background: s.badge, color: s.color }}>
                    {alert.actionLabel}
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
