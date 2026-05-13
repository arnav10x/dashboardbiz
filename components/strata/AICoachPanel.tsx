'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Insight {
  type: 'up' | 'down' | 'neutral' | 'focus' | 'fix'
  label?: string
  text: string
  num?: number
}

function generateInsights(data: {
  revenue: number; prevRevenue: number; expenses: number
  leads: number; won: number; totalEntries: number; margin: number
}): { main: string; focus: string; fixes: { label: string; text: string }[] } {
  const { revenue, prevRevenue, expenses, leads, won, totalEntries, margin } = data
  const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null
  const convRate = leads > 0 ? Math.round((won / leads) * 100) : null

  if (totalEntries === 0) {
    return {
      main: 'No data yet — log your first period entry to unlock AI insights and performance tracking.',
      focus: 'Log your first revenue entry to activate coaching.',
      fixes: [
        { label: 'First Step', text: 'Head to Period Entry and log last month\'s revenue and expenses.' },
        { label: 'Pipeline', text: 'Add your first leads to start tracking deal progress.' },
        { label: 'Daily Habit', text: 'Use P&L Calendar to log daily revenue entries.' },
      ],
    }
  }

  let main = ''
  if (growth !== null && growth < -10) {
    main = `Revenue dropped ${Math.abs(growth)}% this period — identify what stalled the pipeline and reactivate top leads.`
  } else if (growth !== null && growth < 0) {
    main = `Revenue dipped ${Math.abs(growth)}% MoM. Review your pipeline and follow up on open proposals.`
  } else if (growth !== null && growth >= 20) {
    main = `Revenue jumped +${growth}% — strong momentum. Focus on maintaining this conversion rate while scaling outreach.`
  } else if (growth !== null && growth > 0) {
    main = `Revenue up +${growth}% MoM. You\'re trending in the right direction — press for more.`
  } else {
    main = `Revenue holding steady at $${revenue.toLocaleString()}. Flat is fine, but growth requires new pipeline activity.`
  }

  let focus = ''
  if (margin < 0) {
    focus = 'Expenses exceed revenue this period — cut costs immediately.'
  } else if (margin < 20) {
    focus = `Only ${margin}% margin — review your biggest expense and find 20% to cut.`
  } else if (leads === 0) {
    focus = 'Pipeline is empty — outreach is the highest-leverage activity right now.'
  } else if (convRate !== null && convRate < 15) {
    focus = `${convRate}% close rate is below target — your follow-up process needs work.`
  } else {
    focus = `${margin}% margin with ${leads} pipeline leads — prioritize closing open deals.`
  }

  const fixes: { label: string; text: string }[] = []
  if (margin < 30) {
    fixes.push({ label: 'Margin Fix', text: 'Identify your top 3 expenses and eliminate or renegotiate the lowest-value one this week.' })
  } else {
    fixes.push({ label: 'Revenue Fix', text: `You\'re at $${revenue.toLocaleString()}. Identify 2 warm leads to close this period.` })
  }
  if (convRate !== null && convRate < 20) {
    fixes.push({ label: 'Close Fix', text: 'Follow up on all open proposals within 24 hours. Speed of response drives conversion.' })
  } else {
    fixes.push({ label: 'Pipeline Fix', text: 'Add 5 new prospects to your pipeline. Volume creates deal flow.' })
  }
  fixes.push({ label: 'Consistency', text: 'Log P&L data every day this week to build your activity streak.' })

  return { main, focus, fixes }
}

interface ChatMessage { role: 'user' | 'assistant'; content: string }

interface AICoachPanelProps {
  userName: string
}

export function AICoachPanel({ userName }: AICoachPanelProps) {
  const [insights, setInsights] = useState<ReturnType<typeof generateInsights> | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [{ data: entries }, { count: leadCount }, { count: wonCount }] = await Promise.all([
        supabase.from('period_entries').select('revenue, expenses, period_date').eq('user_id', user.id)
          .order('period_date', { ascending: true }).limit(13),
        supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stage', 'won'),
      ])

      const latest = entries && entries.length > 0 ? entries[entries.length - 1] : null
      const prev = entries && entries.length > 1 ? entries[entries.length - 2] : null
      const revenue = Number(latest?.revenue) || 0
      const prevRevenue = Number(prev?.revenue) || 0
      const expenses = Number(latest?.expenses) || 0
      const profit = revenue - expenses
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

      setInsights(generateInsights({
        revenue, prevRevenue, expenses, margin,
        leads: leadCount || 0,
        won: wonCount || 0,
        totalEntries: entries?.length || 0,
      }))
      setLoading(false)
    }
    load()
  }, [refreshKey])

  const sendMessage = async () => {
    if (!input.trim() || sending) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setSending(true)

    try {
      const history = messages.slice(-4).map(m => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: userMsg })
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'No response.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error reaching AI. Try the full copilot.' }])
    }
    setSending(false)
  }

  return (
    <div
      className="hidden lg:flex flex-col h-screen flex-shrink-0 overflow-hidden"
      style={{ width: 272, borderLeft: '1px solid var(--border)', background: 'var(--bg-base)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 flex-shrink-0" style={{ height: 56, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: 'var(--accent-muted)', border: '1px solid var(--accent-ring)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp style={{ width: 10, height: 10, color: 'var(--accent)' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>AI Coach</p>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>How may I help?</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setRefreshKey(k => k + 1)}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/[0.05]"
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <RefreshCw className="h-3 w-3" />
          </button>
          <Link href="/dashboard/ai-copilot"
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-white/[0.05]"
            style={{ color: 'var(--text-muted)' }}>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Insights body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-4 w-4 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          </div>
        ) : insights ? (
          <>
            {/* Main insight */}
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--text-secondary)' }}>{insights.main}</p>
            </div>

            {/* Primary focus */}
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)' }}>
              <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24', marginBottom: 4 }}>Primary Focus</p>
              <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.5, color: '#fbbf24' }}>{insights.focus}</p>
            </div>

            {/* Numbered fixes */}
            {insights.fixes.map((fix, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-hover)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)' }}>{i + 1}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 3 }}>{fix.label}</p>
                    <p style={{ fontSize: 11, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{fix.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : null}

        {messages.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Chat</p>
            {messages.slice(-4).map((m, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: 7, marginLeft: m.role === 'user' ? 16 : 0, marginRight: m.role === 'assistant' ? 16 : 0, background: m.role === 'user' ? 'var(--accent-muted)' : 'var(--bg-card)', border: `1px solid ${m.role === 'user' ? 'var(--accent-ring)' : 'var(--border)'}` }}>
                <p style={{ fontSize: 11, lineHeight: 1.5, color: m.role === 'user' ? 'var(--accent)' : 'var(--text-secondary)' }}>{m.content}</p>
              </div>
            ))}
            {sending && (
              <div style={{ padding: '8px 10px', borderRadius: 7, marginRight: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="animate-bounce" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-muted)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat input */}
      <div style={{ flexShrink: 0, padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            style={{ flex: 1, fontSize: 11, borderRadius: 7, padding: '7px 10px', outline: 'none', background: 'var(--bg-card)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }}
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer', opacity: (!input.trim() || sending) ? 0.4 : 1, flexShrink: 0 }}>
            <Send style={{ width: 12, height: 12 }} />
          </button>
        </div>
        <p style={{ fontSize: 9, marginTop: 6, textAlign: 'center', color: 'var(--text-muted)' }}>Type to send · Powered by Groq</p>
      </div>
    </div>
  )
}
