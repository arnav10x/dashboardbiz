'use client'
import { useEffect, useState, useCallback } from 'react'
import { Zap, Target, ArrowRight, Flame, Star, TrendingUp, Snowflake } from 'lucide-react'

interface FocusItem { label: string; href: string }
interface FocusData { priority: string; why: string; tasks: FocusItem[] }
interface Gamification {
  streak: number; longestStreak: number; level: number; totalXp: number
  xpInLevel: number; xpForNext: number; pct: number; streakFreezes: number
}

interface Props {
  userName: string; businessType: string; hasData: boolean
  revenue: number; expenses: number; leads: number
  conversionRate: number; margin: number; profit: number
  completedTasks: number; totalTasks: number; revenueTarget: number
}

function generateFocus(
  businessType: string, hasData: boolean, revenue: number, expenses: number,
  leads: number, conversionRate: number, margin: number, profit: number, revenueTarget: number,
): FocusData {
  if (!hasData) return {
    priority: 'Log your first business period to unlock your dashboard',
    why: 'Without real numbers, you\'re flying blind. 2 minutes now saves weeks of guesswork.',
    tasks: [
      { label: 'Log revenue and expenses for this month', href: '/dashboard/period-entry' },
      { label: 'Add your first lead to the pipeline', href: '/dashboard/pipeline' },
      { label: 'Set a monthly revenue goal in Settings', href: '/dashboard/settings' },
    ],
  }
  if (profit < 0) return {
    priority: 'Stop the bleeding — your business is running at a loss',
    why: `You spent $${Math.abs(profit).toLocaleString()} more than you earned. Every day this continues compounds.`,
    tasks: [
      { label: 'Review every expense — find 1 to cut now', href: '/dashboard/period-entry' },
      { label: 'Ask AI coach for a margin recovery plan', href: '/dashboard/ai-copilot' },
      { label: 'Add leads to build revenue back up', href: '/dashboard/pipeline' },
    ],
  }
  if (leads === 0) return {
    priority: 'Build your pipeline — no leads means no future revenue',
    why: 'An empty pipeline is a revenue cliff 30–90 days away. Start outreach today.',
    tasks: [
      { label: 'Add 5 new prospects to your pipeline', href: '/dashboard/pipeline' },
      { label: 'Create a daily outreach task', href: '/dashboard/tasks' },
      { label: 'Ask AI for lead generation strategies', href: '/dashboard/ai-copilot' },
    ],
  }
  if (margin < 20 && revenue > 0) return {
    priority: `Fix your ${margin}% margin — below 20% kills your ability to scale`,
    why: 'Thin margins mean one slow month wipes your savings. Target 40%+ for resilience.',
    tasks: [
      { label: 'Audit expenses — find 1 category to cut', href: '/dashboard/period-entry' },
      { label: 'Review pricing for your core offer', href: '/dashboard/ai-copilot' },
      { label: 'Log updated numbers to track improvement', href: '/dashboard/period-entry' },
    ],
  }
  if (conversionRate < 20 && leads > 0) return {
    priority: `Improve your ${conversionRate}% conversion — you're losing deals in the follow-up`,
    why: '80% of deals close within 48 hours of first contact. Speed and persistence win.',
    tasks: [
      { label: 'Follow up with all open pipeline leads today', href: '/dashboard/pipeline' },
      { label: 'Move 3 stuck leads forward in the pipeline', href: '/dashboard/pipeline' },
      { label: 'Ask AI for a conversion improvement script', href: '/dashboard/ai-copilot' },
    ],
  }
  if (revenueTarget > 0 && revenue < revenueTarget * 0.6) return {
    priority: `Accelerate — you're behind your $${revenueTarget.toLocaleString()} monthly target`,
    why: `You need $${(revenueTarget - revenue).toLocaleString()} more this month. Every closed deal matters.`,
    tasks: [
      { label: 'Close or advance your hottest pipeline lead', href: '/dashboard/pipeline' },
      { label: 'Do 10 cold outreach messages today', href: '/dashboard/tasks' },
      { label: 'Ask AI for a revenue acceleration plan', href: '/dashboard/ai-copilot' },
    ],
  }
  const defaults: Record<string, FocusData> = {
    Agency: { priority: 'Send 10 targeted outreach messages to ideal prospects', why: 'Consistent outreach is the most direct revenue lever for agencies. Volume compounds.', tasks: [{ label: 'Add 5 new prospects to pipeline', href: '/dashboard/pipeline' }, { label: 'Follow up on 3 warm leads', href: '/dashboard/pipeline' }, { label: 'Log today\'s activity in Period Entry', href: '/dashboard/period-entry' }] },
    SaaS: { priority: 'Talk to 2 users today — bugs and churn start with lost conversations', why: 'Direct user feedback prevents churn and surfaces your next high-value feature.', tasks: [{ label: 'Schedule 1 user interview or call this week', href: '/dashboard/tasks' }, { label: 'Ship one small UX improvement or fix', href: '/dashboard/tasks' }, { label: 'Check pipeline for unconverted trial users', href: '/dashboard/pipeline' }] },
    Freelance: { priority: 'Send 5 cold pitches to potential clients today', why: 'Freelance revenue tracks outreach volume directly. More pitches, more options.', tasks: [{ label: 'Pitch 5 new prospects today', href: '/dashboard/pipeline' }, { label: 'Follow up on 2 pending proposals', href: '/dashboard/pipeline' }, { label: 'Log your hours and revenue', href: '/dashboard/period-entry' }] },
    Consulting: { priority: 'Reach out to 5 past clients for referrals or upsells', why: 'Past clients close 5x faster than cold prospects. Your best pipeline is already paid.', tasks: [{ label: 'Message 5 past clients about new work', href: '/dashboard/pipeline' }, { label: 'Prepare a productized offer or case study', href: '/dashboard/tasks' }, { label: 'Log all active proposals in pipeline', href: '/dashboard/pipeline' }] },
    Ecommerce: { priority: 'Check your ROAS and pause underperforming ad sets', why: 'Stopping losers frees budget for winners. A 20-min audit can double your ROAS.', tasks: [{ label: 'Audit ads and pause underperformers', href: '/dashboard/tasks' }, { label: 'Post a product showcase on social today', href: '/dashboard/tasks' }, { label: 'Log revenue and ad spend in Period Entry', href: '/dashboard/period-entry' }] },
    Creator: { priority: 'Publish 1 piece of content and engage with 20 followers', why: 'Consistent publishing is the compound interest of creator businesses. Show up daily.', tasks: [{ label: 'Post 1 piece of content today', href: '/dashboard/tasks' }, { label: 'Engage with 20 followers or comments', href: '/dashboard/tasks' }, { label: 'Log revenue and audience metrics', href: '/dashboard/period-entry' }] },
  }
  const key = Object.keys(defaults).find(k => businessType?.toLowerCase().includes(k.toLowerCase())) || 'Agency'
  return defaults[key]
}

export function TodaysFocus({ userName, businessType, hasData, revenue, expenses, leads, conversionRate, margin, profit, completedTasks, totalTasks, revenueTarget }: Props) {
  const [gam, setGam] = useState<Gamification | null>(null)
  const [xpFlash, setXpFlash] = useState<number | null>(null)

  const checkin = useCallback(async () => {
    try {
      const res = await fetch('/api/gamification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'daily_checkin' }) })
      const data = await res.json()
      setGam(data)
      if (data.xpGained > 0) { setXpFlash(data.xpGained); setTimeout(() => setXpFlash(null), 2500) }
    } catch {}
  }, [])

  useEffect(() => { checkin() }, [checkin])

  const focus = generateFocus(businessType, hasData, revenue, expenses, leads, conversionRate, margin, profit, revenueTarget)
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const circ = 2 * Math.PI * 16
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const streakColor = (gam?.streak ?? 0) >= 30 ? '#f43f5e' : (gam?.streak ?? 0) >= 7 ? '#f59e0b' : 'var(--text-muted)'

  const S = {
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 } as React.CSSProperties,
    miniCard: { background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8 } as React.CSSProperties,
    label: { fontSize: 9, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.09em', color: 'var(--text-muted)' },
  }

  return (
    <div style={{ ...S.card, padding: 16 }}>
      <div style={{ display: 'flex', gap: 16, height: '100%' }}>

        {/* Left: Focus mission */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Zap style={{ width: 12, height: 12, color: 'var(--accent)', flexShrink: 0 }} />
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
              Today&apos;s Focus · {today}
            </p>
          </div>

          {/* Priority block */}
          <div style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 10, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.14)' }}>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4, opacity: 0.8 }}>#1 Priority</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>
              {focus.priority}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{focus.why}</p>
          </div>

          {/* Action items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
            {focus.tasks.map((task, i) => (
              <a key={i} href={task.href}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--accent)' }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 11, flex: 1, color: 'var(--text-secondary)' }}>{task.label}</p>
                <ArrowRight style={{ width: 11, height: 11, color: 'var(--text-muted)', flexShrink: 0 }} />
              </a>
            ))}
          </div>
        </div>

        {/* Right: Stats strip */}
        <div style={{ width: 128, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Streak */}
          <div style={{ ...S.miniCard, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <Flame style={{ width: 11, height: 11, color: streakColor }} />
              <span style={S.label}>Streak</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: streakColor, lineHeight: 1, marginBottom: 2 }}>
              {gam?.streak ?? '—'}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>days in a row</p>
            {(gam?.streakFreezes ?? 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Snowflake style={{ width: 9, height: 9, color: '#60a5fa' }} />
                <span style={{ fontSize: 9, color: '#60a5fa' }}>{gam!.streakFreezes} freeze{gam!.streakFreezes !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Today */}
          <div style={{ ...S.miniCard, padding: '10px 12px' }}>
            <span style={{ ...S.label, display: 'block', marginBottom: 7 }}>Today</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg width={36} height={36} viewBox="0 0 36 36" style={{ display: 'block' }}>
                  <circle cx={18} cy={18} r={16} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3.5} />
                  <circle cx={18} cy={18} r={16} fill="none"
                    stroke={completionPct === 100 ? '#10b981' : 'var(--accent)'}
                    strokeWidth={3.5} strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - completionPct / 100)}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: completionPct === 100 ? '#10b981' : 'var(--accent)' }}>{completionPct}%</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 2 }}>{completedTasks}/{totalTasks}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>tasks</p>
              </div>
            </div>
          </div>

          {/* XP / Level */}
          <div style={{ ...S.miniCard, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star style={{ width: 10, height: 10, color: '#c084fc' }} />
                <span style={S.label}>Lv {gam?.level ?? 1}</span>
              </div>
              {xpFlash && <span style={{ fontSize: 9, fontWeight: 800, color: '#10b981' }}>+{xpFlash} XP</span>}
            </div>
            <p style={{ fontSize: 13, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: '#c084fc', marginBottom: 5 }}>
              {(gam?.totalXp ?? 0).toLocaleString()} XP
            </p>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden', marginBottom: 3 }}>
              <div style={{ height: '100%', width: `${gam?.pct ?? 0}%`, background: 'linear-gradient(90deg,#c084fc,#818cf8)', borderRadius: 1, transition: 'width 1s ease' }} />
            </div>
            <p style={{ fontSize: 9, fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>
              {gam ? `${gam.xpForNext - gam.xpInLevel} to Lv ${gam.level + 1}` : '…'}
            </p>
          </div>

          {/* Weekly report */}
          <a href="/dashboard/reports"
            style={{ ...S.miniCard, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <TrendingUp style={{ width: 11, height: 11, color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <p style={S.label}>Weekly</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>CEO Report →</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
