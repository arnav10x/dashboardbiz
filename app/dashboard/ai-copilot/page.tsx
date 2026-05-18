'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import {
  Send, Plus, Zap, RefreshCw, Sparkles, TrendingUp, DollarSign,
  Users, BarChart2, Copy, Check, CheckSquare, GitMerge, FileText,
  CheckCircle, XCircle,
  type LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ActionResult {
  type: string
  success: boolean
  message: string
  data?: any
}

interface Message {
  role: 'assistant' | 'user'
  content: string
  followUps?: string[]
  id: string
  isStreaming?: boolean
  actions?: ActionResult[]
}

interface UserData {
  workspaceName: string
  hasData: boolean
  revenue: number
  expenses: number
  profit: number
  margin: number
  leads: number
  convRate: number
  tasks: number
  completedTasks: number
  level: number
  xp: number
  streak: number
}

const FOLLOW_UP_POOLS: Record<string, string[]> = {
  revenue:  ['How do I grow revenue faster?', 'Which revenue stream should I double down on?', 'When should I raise my prices?'],
  pipeline: ['How can I improve my close rate?', 'Where are leads dropping off?', 'What outreach channels work best?'],
  expense:  ['Which expenses can I cut first?', "What's my break-even point?", 'How do I improve my margins?'],
  growth:   ["What's my most realistic growth path?", 'When can I afford to hire?', 'How do I scale without burning cash?'],
  default:  ['What should I focus on this week?', "What's my biggest untapped opportunity?", 'Where am I leaving money on the table?'],
}

function getFollowUps(content: string): string[] {
  const lower = content.toLowerCase()
  if (lower.includes('revenue') || lower.includes('sales') || lower.includes('income')) return FOLLOW_UP_POOLS.revenue.slice(0, 2)
  if (lower.includes('pipeline') || lower.includes('lead') || lower.includes('close')) return FOLLOW_UP_POOLS.pipeline.slice(0, 2)
  if (lower.includes('expense') || lower.includes('cost') || lower.includes('margin')) return FOLLOW_UP_POOLS.expense.slice(0, 2)
  if (lower.includes('grow') || lower.includes('scale') || lower.includes('hire')) return FOLLOW_UP_POOLS.growth.slice(0, 2)
  return FOLLOW_UP_POOLS.default.slice(0, 2)
}

const ACTION_BUTTONS: { keywords: string[]; label: string; href: string; Icon: LucideIcon }[] = [
  { keywords: ['task', 'todo', 'action item', 'priority', 'checklist'], label: 'Open Tasks', href: '/dashboard/tasks', Icon: CheckSquare },
  { keywords: ['pipeline', 'lead', 'prospect', 'deal', 'outreach', 'close rate'], label: 'View Pipeline', href: '/dashboard/pipeline', Icon: GitMerge },
  { keywords: ['log', 'entry', 'period', 'expense', 'track your'], label: 'Log Entry', href: '/dashboard/period-entry', Icon: Plus },
  { keywords: ['report', 'history', 'trend', 'chart', 'over time'], label: 'View Reports', href: '/dashboard/reports', Icon: FileText },
]

function getActionButtons(content: string) {
  const lower = content.toLowerCase()
  return ACTION_BUTTONS.filter(btn => btn.keywords.some(kw => lower.includes(kw))).slice(0, 3)
}

function makeInitialMessage(d?: UserData): Message {
  if (!d?.hasData) {
    return {
      id: 'init',
      role: 'assistant',
      content: `I'm your FounderOS AI Copilot — a business analyst built into your dashboard.\n\nRight now I don't have any of your data to work with. To give you specific analysis instead of generic advice, I need your actual numbers.\n\n**Start by logging:**\n→ Revenue & expenses (profit and margin)\n→ Leads & customers (conversion rate)\n→ Hours worked (revenue per hour)\n\nOnce you save your first entry, come back and ask me anything.`,
    }
  }
  return {
    id: 'init',
    role: 'assistant',
    content: `I'm your FounderOS AI Copilot. I have your latest data loaded.\n\n**${d.workspaceName} — Latest period:**\n→ Revenue: $${d.revenue.toLocaleString()} · Expenses: $${d.expenses.toLocaleString()}\n→ Profit: $${d.profit.toLocaleString()} (${d.margin}% margin)\n${d.leads > 0 ? `→ Leads: ${d.leads} · Conversion: ${d.convRate}%` : '→ No lead data logged yet'}\n\nAsk me anything — what to prioritize, where you're leaking money, or how to grow faster. I can also add tasks or leads directly: just ask.`,
    followUps: ['What should I focus on this week?', 'Where am I leaving money on the table?'],
  }
}

const QUICK_QUESTIONS = [
  { label: 'Top priority this week?', icon: Zap },
  { label: 'Where am I losing money?', icon: DollarSign },
  { label: 'How to improve conversion?', icon: TrendingUp },
  { label: 'Biggest risk right now?', icon: BarChart2 },
  { label: 'How to get more leads?', icon: Users },
  { label: 'Should I raise prices?', icon: Sparkles },
]

function renderContent(content: string) {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1.5" />

    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      return (
        <p key={i} className={`text-[10px] font-black uppercase tracking-widest ${i > 0 ? 'mt-3' : ''} mb-1`}
          style={{ color: 'var(--text-muted)' }}>
          {line.replace(/\*\*/g, '')}
        </p>
      )
    }

    if (line.startsWith('→')) {
      return (
        <div key={i} className="flex items-start gap-2 text-xs mt-1.5">
          <span className="font-black flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>→</span>
          <span style={{ color: 'var(--text-secondary)' }}>{renderInline(line.slice(1).trim())}</span>
        </div>
      )
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} className="flex items-start gap-2 text-xs mt-1">
          <span className="flex-shrink-0 mt-[5px] h-1 w-1 rounded-full" style={{ background: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{renderInline(line.slice(2))}</span>
        </div>
      )
    }

    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1]
      return (
        <div key={i} className="flex items-start gap-2 text-xs mt-1.5">
          <span className="font-black flex-shrink-0 tabular-nums" style={{ color: 'var(--accent)', minWidth: 14 }}>{num}.</span>
          <span style={{ color: 'var(--text-secondary)' }}>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    }

    return <p key={i} className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{renderInline(line)}</p>
  })
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.replace(/\*\*/g, '')}</strong>
      : <span key={i}>{part}</span>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg mt-2"
      style={{ color: 'var(--text-muted)', background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      {copied ? <><Check className="h-2.5 w-2.5" /> Copied</> : <><Copy className="h-2.5 w-2.5" /> Copy</>}
    </button>
  )
}

function StreamingCursor() {
  return (
    <span className="inline-block h-3.5 w-0.5 ml-0.5 translate-y-0.5 rounded-sm"
      style={{ background: 'var(--accent)', animation: 'blink 0.7s step-end infinite' }} />
  )
}

function ActionBadge({ action }: { action: ActionResult }) {
  const label: Record<string, string> = {
    create_task: 'Task created',
    complete_task: 'Task completed',
    add_pipeline_lead: 'Lead added',
  }
  return (
    <div className="flex items-center gap-2 text-xs px-3 py-2 mt-2"
      style={{
        borderRadius: 7,
        background: action.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${action.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        color: action.success ? '#10b981' : '#ef4444',
      }}>
      {action.success
        ? <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
        : <XCircle className="h-3.5 w-3.5 flex-shrink-0" />}
      <span className="font-semibold">{label[action.type] || 'Action'}: </span>
      <span>{action.message.replace(/^(Task added:|Task completed:|Lead added to pipeline:)\s*/i, '')}</span>
    </div>
  )
}

function MessageBubble({ message, isLatest, onFollowUp }: {
  message: Message
  isLatest: boolean
  onFollowUp: (q: string) => void
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-lg px-4 py-3 text-sm leading-relaxed"
          style={{ borderRadius: '10px 10px 4px 10px', background: 'var(--accent)', color: 'white' }}>
          {message.content}
        </div>
      </div>
    )
  }

  const actionBtns = isLatest && !message.isStreaming ? getActionButtons(message.content) : []

  return (
    <div className="mb-5" style={isLatest ? { animation: 'fadeSlideIn 0.35s ease both' } : {}}>
      <div className="flex gap-3 group">
        <div className="h-9 w-9 flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ borderRadius: 8, background: 'var(--accent-muted)', border: '1px solid var(--accent-ring)' }}>
          <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 px-5 py-4"
          style={{borderRadius: '4px 10px 10px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)'}}>
          {message.content
            ? <>{renderContent(message.content)}{message.isStreaming && <StreamingCursor />}</>
            : <StreamingCursor />
          }
          {message.actions && message.actions.map((a, i) => <ActionBadge key={i} action={a} />)}
          {!message.isStreaming && <CopyButton text={message.content} />}
        </div>
      </div>

      {actionBtns.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5 ml-12">
          {actionBtns.map(btn => (
            <a key={btn.href} href={btn.href}
              className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 transition-all hover:opacity-80" style={{borderRadius: 6, background: 'var(--accent-faint)', color: 'var(--accent)', border: '1px solid var(--accent-ring)'}}>
              <btn.Icon className="h-3 w-3" />
              {btn.label}
            </a>
          ))}
        </div>
      )}

      {isLatest && !message.isStreaming && message.followUps && message.followUps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2 ml-12">
          {message.followUps.map(q => (
            <button key={q} onClick={() => onFollowUp(q)}
              className="text-[11px] font-semibold px-3 py-1.5 transition-all hover:opacity-80" style={{borderRadius: 20, background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)'}}>
              {q} →
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="h-9 w-9 flex items-center justify-center flex-shrink-0"
        style={{ borderRadius: 8, background: 'var(--accent-muted)', border: '1px solid var(--accent-ring)' }}>
        <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
      <div className="px-5 py-4"
        style={{borderRadius: '4px 10px 10px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)'}}>
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--accent)', animation: `dotPulse 0.9s ${i * 0.18}s ease-in-out infinite` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

async function saveHistory(userId: string, msgs: Message[]) {
  const supabase = createClient()
  const toSave = msgs
    .filter(m => !m.isStreaming && m.content)
    .slice(-30)
    .map(m => ({ role: m.role, content: m.content }))
  await supabase.from('ai_memory').upsert(
    { user_id: userId, memory_key: 'chat_history', memory_value: { messages: toSave, saved_at: new Date().toISOString() } },
    { onConflict: 'user_id,memory_key' }
  )
}

export default function AICopilotPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMessages([makeInitialMessage()]); setDataLoaded(true); return }

      setUserId(user.id)

      const { data: ws } = await supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle()
      const [{ data: entries }, { data: tasks }, { data: gamification }, { data: historyData }] = await Promise.all([
        supabase.from('period_entries').select('revenue, expenses, new_leads, leads, new_customers, customers').eq('user_id', user.id).order('period_date', { ascending: false }).limit(1),
        supabase.from('tasks').select('is_completed').eq('user_id', user.id).limit(100),
        supabase.from('user_gamification').select('level,total_xp,current_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('ai_memory').select('memory_value').eq('user_id', user.id).eq('memory_key', 'chat_history').maybeSingle(),
      ])

      const latest = entries?.[0]
      let d: UserData
      if (latest) {
        const rev = Number(latest.revenue) || 0
        const exp = Number(latest.expenses) || 0
        const pft = rev - exp
        const mgn = rev > 0 ? Math.round((pft / rev) * 100) : 0
        const lds = Number(latest.new_leads) || Number(latest.leads) || 0
        const cust = Number(latest.new_customers) || Number(latest.customers) || 0
        d = { workspaceName: ws?.name || 'My Workspace', hasData: true, revenue: rev, expenses: exp, profit: pft, margin: mgn, leads: lds, convRate: lds > 0 ? Math.round((cust / lds) * 100) : 0, tasks: tasks?.length || 0, completedTasks: tasks?.filter((t:any)=>t.is_completed).length || 0, level: Number(gamification?.level)||1, xp: Number(gamification?.total_xp)||0, streak: Number(gamification?.current_streak)||0 }
      } else {
        d = { workspaceName: ws?.name || 'My Workspace', hasData: false, revenue: 0, expenses: 0, profit: 0, margin: 0, leads: 0, convRate: 0, tasks: tasks?.length || 0, completedTasks: tasks?.filter((t:any)=>t.is_completed).length || 0, level: Number(gamification?.level)||1, xp: Number(gamification?.total_xp)||0, streak: Number(gamification?.current_streak)||0 }
      }
      setUserData(d)

      const savedMsgs = (historyData as any)?.memory_value?.messages
      if (savedMsgs && Array.isArray(savedMsgs) && savedMsgs.length > 0) {
        setMessages(savedMsgs.map((m: any, i: number) => ({ id: `h-${i}`, role: m.role, content: m.content })))
      } else {
        setMessages([makeInitialMessage(d)])
      }

      setDataLoaded(true)
    }
    load()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    const streamId = `stream-${Date.now()}`
    const streamMsg: Message = { id: streamId, role: 'assistant', content: '', isStreaming: true }

    const apiMessages = [...messages, userMsg]
    setMessages(prev => [...prev, userMsg, streamMsg])
    setLoading(true)

    let fullContent = ''
    let collectedActions: ActionResult[] = []

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages.map(m => ({ role: m.role, content: m.content })) }),
      })

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload)
            if (parsed.action) {
              collectedActions = [...collectedActions, parsed.action]
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, actions: collectedActions } : m
              ))
            } else if (parsed.chunk) {
              fullContent += parsed.chunk
              setMessages(prev => prev.map(m =>
                m.id === streamId ? { ...m, content: fullContent } : m
              ))
            }
          } catch {}
        }
      }

      const finalMsg: Message = {
        id: streamId,
        role: 'assistant',
        content: fullContent || (collectedActions.length > 0 ? 'Done.' : "I couldn't process that. Try again."),
        isStreaming: false,
        followUps: fullContent ? getFollowUps(fullContent) : undefined,
        actions: collectedActions.length > 0 ? collectedActions : undefined,
      }

      const finalMessages = [...apiMessages, finalMsg]
      setMessages(finalMessages)

      if (userId) {
        saveHistory(userId, finalMessages).catch(() => null)
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === streamId
          ? { ...m, content: 'Something went wrong. Try again.', isStreaming: false }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, userId])

  const resetChat = async () => {
    const initialMsg = makeInitialMessage(userData ?? undefined)
    setMessages([initialMsg])
    if (userId) {
      const supabase = createClient()
      await supabase.from('ai_memory').delete().eq('user_id', userId).eq('memory_key', 'chat_history')
    }
  }

  const lastAiIdx = messages.reduce((acc, m, i) => m.role === 'assistant' ? i : acc, -1)
  const hasStreamingMsg = messages.some(m => m.isStreaming)

  return (
    <div className="flex flex-col h-full">
      <TopBar title="AI Copilot" workspaceName={userData?.workspaceName || 'My Workspace'} hasData={userData?.hasData ?? false} showGreeting />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 flex items-center justify-center"
                style={{ borderRadius: 8, background: 'var(--accent-muted)', border: '1px solid var(--accent-ring)' }}>
                <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>FounderOS Copilot</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: hasStreamingMsg ? 'var(--accent)' : dataLoaded ? 'var(--accent)' : '#f59e0b',
                      animation: hasStreamingMsg ? 'dotPulse 0.9s ease-in-out infinite' : undefined,
                    }} />
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {!dataLoaded ? 'Loading…' : hasStreamingMsg ? 'Generating…' : userData?.hasData ? 'Data loaded · Ready' : 'Ready · Log data for deeper insights'}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={resetChat}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 transition-all hover:opacity-80" style={{borderRadius: 7, color: 'var(--text-secondary)', border: '1px solid var(--border)', background: 'var(--bg-card)'}}>
              <RefreshCw className="h-3.5 w-3.5" /> New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLatest={i === lastAiIdx && msg.role === 'assistant'}
                onFollowUp={handleSend}
              />
            ))}
            {loading && !hasStreamingMsg && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="px-5 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
              {QUICK_QUESTIONS.slice(0, 4).map(q => (
                <button key={q.label} onClick={() => handleSend(q.label)}
                  className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold px-2.5 py-1.5 flex-shrink-0 transition-all hover:opacity-80" style={{borderRadius: 20, background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)'}}>
                  <q.icon className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                  {q.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm px-4 py-2.5 outline-none" style={{borderRadius: 7, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)'}}
                placeholder="Ask anything, or say 'add a task to follow up with John'…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                disabled={loading}
              />
              <button onClick={() => handleSend()} disabled={loading || !input.trim()}
                className="h-10 w-10 flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
                style={{ borderRadius: 7, background: 'var(--accent)', color: 'white' }}>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden xl:flex w-64 flex-col flex-shrink-0"
          style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Business Snapshot
            </p>
            {userData?.hasData ? (
              <div className="space-y-1.5">
                {[
                  { label: 'Revenue', value: `$${userData.revenue.toLocaleString()}`, color: 'var(--accent)', Icon: DollarSign },
                  { label: 'Profit', value: `$${userData.profit.toLocaleString()}`, color: userData.profit >= 0 ? 'var(--accent)' : '#f43f5e', Icon: TrendingUp },
                  { label: 'Margin', value: `${userData.margin}%`, color: 'var(--text-primary)', Icon: BarChart2 },
                  { label: 'Conv. Rate', value: userData.leads > 0 ? `${userData.convRate}%` : '—', color: 'var(--text-primary)', Icon: Users },
                  { label: 'Tasks', value: `${userData.completedTasks}/${userData.tasks}`, color: 'var(--accent)', Icon: CheckSquare },
                  { label: 'Level', value: `${userData.level}`, color: '#c084fc', Icon: Sparkles },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between p-2.5"
                    style={{borderRadius: 7, background: 'var(--bg-card)', border: '1px solid var(--border)'}}>
                    <div className="flex items-center gap-2">
                      <m.Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                    </div>
                    <span className="text-xs font-black tabular-nums" style={{ color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 text-xs leading-relaxed" style={{borderRadius: 7, background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)'}}>
                  No data yet. Log a period entry to unlock AI insights specific to your numbers.
                </div>
                <a href="/dashboard/period-entry"
                  className="flex items-center justify-center gap-1.5 w-full text-xs font-bold py-2" style={{borderRadius: 7, background: 'var(--accent)', color: 'white'}}>
                  <Plus className="h-3.5 w-3.5" /> Log first entry
                </a>
              </div>
            )}
          </div>

          <div className="p-4 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
              Quick Questions
            </p>
            <div className="space-y-1">
              {QUICK_QUESTIONS.map(q => (
                <button key={q.label} onClick={() => handleSend(q.label)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all hover:opacity-80" style={{borderRadius: 7, background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)'}}>
                  <q.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>Powered by Groq · llama-3.3-70b</p>
          </div>
        </div>
      </div>
    </div>
  )
}
