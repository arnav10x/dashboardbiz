import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyGamificationAction, buildAiContext, getFounderSnapshot } from '@/lib/founderos/engine'
import { buildExecutiveAssistantContext } from '@/lib/founderos/executive-assistant'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  await applyGamificationAction(supabase as any, user.id, 'use_ai_copilot').catch(() => null)
  const liveSnapshot = await getFounderSnapshot(supabase as any, user.id).catch(() => null)
  const universalContext = liveSnapshot ? `${buildAiContext(liveSnapshot)}\n\n${buildExecutiveAssistantContext(liveSnapshot)}` : ''

  const body = await req.json().catch(() => null)
  if (!body?.messages) return new Response('Bad request', { status: 400 })
  const { messages } = body

  const [
    { data: workspace },
    { data: entries },
    { count: leadCount },
    { count: wonCount },
    { data: tasks },
    { data: gamification },
    { data: calEntries },
    { data: events },
  ] = await Promise.all([
    supabase.from('workspaces').select('name, business_type, stage, business_summary').eq('owner_id', user.id).maybeSingle(),
    supabase.from('period_entries').select('revenue, expenses, new_leads, new_customers, period_date').eq('user_id', user.id).order('period_date', { ascending: false }).limit(3),
    supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stage', 'won'),
    supabase.from('tasks').select('title,is_completed,created_at,completed_at,notes').eq('user_id', user.id).order('created_at', { ascending: false }).limit(25),
    supabase.from('user_gamification').select('total_xp, level, current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    supabase.from('cal_entries').select('entry_date,revenue,expenses,notes').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(10),
    supabase.from('calendar_events').select('event_date,title,start_time,end_time').eq('user_id', user.id).order('event_date', { ascending: false }).limit(10),
  ])

  const latest = entries?.[0]
  const prev = entries?.[1]
  const hasData = !!latest

  const revenue = Number(latest?.revenue) || 0
  const expenses = Number(latest?.expenses) || 0
  const profit = revenue - expenses
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0
  const prevRevenue = Number(prev?.revenue) || 0
  const growth = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null
  const leads = Number(latest?.new_leads) || 0
  const customers = Number(latest?.new_customers) || 0
  const convRate = leads > 0 ? Math.round((customers / leads) * 100) : 0
  const completedTasks = (tasks || []).filter((t:any) => t.is_completed).length
  const taskRate = tasks?.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  const dailyProfit = (calEntries || []).reduce((sum:any, e:any) => sum + (Number(e.revenue) || 0) - (Number(e.expenses) || 0), 0)

  const dataContext = hasData
    ? `Business: ${workspace?.name || 'Unknown'} (${workspace?.business_type || 'unknown type'}, ${workspace?.stage || 'unknown stage'})
${workspace?.business_summary ? `Business context: ${workspace.business_summary}` : ''}
Latest period revenue: $${revenue.toLocaleString()}
Expenses: $${expenses.toLocaleString()}
Profit: $${profit.toLocaleString()} (${margin}% margin)
${growth !== null ? `Revenue growth vs prior period: ${growth > 0 ? '+' : ''}${growth}%` : 'Only 1 period logged — no growth data yet'}
New leads: ${leads} | New customers: ${customers} | Conversion rate: ${convRate}%
Total pipeline leads: ${leadCount || 0} | Won deals: ${wonCount || 0}
Tasks loaded: ${tasks?.length || 0} | Completed: ${completedTasks} | Completion rate: ${taskRate}%
Gamification: Level ${gamification?.level || 1}, XP ${gamification?.total_xp || 0}, login streak ${gamification?.current_streak || 0}, longest streak ${gamification?.longest_streak || 0}
Recent daily P&L net total: $${dailyProfit.toLocaleString()} across ${calEntries?.length || 0} daily logs
Upcoming/recent calendar events: ${(events || []).map((e:any)=>`${e.event_date} ${e.start_time || ''} ${e.title}`).join('; ') || 'none'}`
    : 'The user has not logged any data yet.'

  const buildCoachReply = () => {
    const userMessage = messages[messages.length - 1]?.content || ''
    const lowerMsg = userMessage.toLowerCase()

    if (!hasData) {
      const hasSummary = !!workspace?.business_summary
      return `${hasSummary ? `I can see you're running ${workspace!.business_summary.substring(0, 120)}... ` : ''}I don't have your financial data yet — so I can only give limited analysis right now.\n\n→ Log revenue, expenses, leads, and customers in Period Entry.\n→ ${!hasSummary ? 'Add Business Context in Settings so I can give niche-specific advice.' : 'Once you have 2+ periods logged, I can calculate growth and risks.'}`
    }

    if (lowerMsg.includes('margin') || lowerMsg.includes('profit')) {
      return `Your margin is ${margin}%. ${margin >= 50 ? "That's strong." : margin >= 30 ? "That's decent, but expenses still matter." : margin >= 0 ? "That's thin. Review your largest expenses first." : `You're running at a loss by $${Math.abs(profit).toLocaleString()}. Cut or justify the biggest expense now.`}\n\nRevenue: $${revenue.toLocaleString()}\nExpenses: $${expenses.toLocaleString()}\nProfit: $${profit.toLocaleString()}`
    }

    if (lowerMsg.includes('lead') || lowerMsg.includes('conversion') || lowerMsg.includes('pipeline')) {
      return leads === 0
        ? `You have no logged period leads yet. Add leads in Pipeline and log lead/customer counts in Period Entry so I can calculate conversion.`
        : `Your conversion rate is ${convRate}% (${customers} customers from ${leads} leads). ${convRate >= 40 ? 'Strong conversion. Scale outreach carefully.' : convRate >= 20 ? 'Average conversion. Speed up follow-up and qualify harder.' : 'Low conversion. Improve targeting, offer clarity, and follow-up speed.'}`
    }

    if (lowerMsg.includes('revenue') || lowerMsg.includes('grow') || lowerMsg.includes('growth')) {
      return growth === null
        ? `Current revenue is $${revenue.toLocaleString()}. Log another period so I can compare growth.`
        : `Revenue went ${growth >= 0 ? 'up' : 'down'} ${Math.abs(growth)}%, from $${prevRevenue.toLocaleString()} to $${revenue.toLocaleString()}. ${growth > 20 ? 'Double down on what drove this.' : growth > 0 ? 'Positive momentum. Keep the daily execution loop consistent.' : 'Find the bottleneck: fewer leads, lower close rate, or smaller deals.'}`
    }

    const tips: string[] = []
    if (margin < 30) tips.push(`→ Margin is ${margin}%, so review expenses.`)
    if ((leadCount || 0) === 0) tips.push('→ Add your first pipeline lead.')
    if (leads > 0 && convRate < 25) tips.push(`→ Conversion is ${convRate}%, so improve follow-up and lead quality.`)
    if (taskRate < 70) tips.push(`→ Task completion is ${taskRate}%, so reduce the task list and finish the highest-impact items.`)
    if (tips.length === 0) tips.push('→ Business looks stable. Focus on revenue growth and deal flow.')
    return `Based on your data, focus here:\n\n${tips.join('\n')}`
  }

  const wantsJson = (req.headers.get('accept') || '').toLowerCase().includes('application/json')
  if (wantsJson || !process.env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ message: buildCoachReply() }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (text: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`))
      }
      const finish = () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }

      try {
        if (!process.env.GROQ_API_KEY) {
          const userMessage = messages[messages.length - 1]?.content || ''
          const lowerMsg = userMessage.toLowerCase()
          let reply: string

          if (!hasData) {
            const hasSummary = !!workspace?.business_summary
            reply = `${hasSummary ? `I can see you're running ${workspace!.business_summary.substring(0, 120)}... ` : ''}I don't have your financial data yet — so I can only give you limited analysis right now.\n\n**To unlock personalized analysis:**\n→ Log your revenue, expenses, leads, and customers in Period Entry\n→ ${!hasSummary ? 'Add your Business Context in Settings so I can give niche-specific advice' : 'Once you have 2+ periods logged, I can calculate growth rate and flag risks'}\n\nStart there. Come back with data and I'll give you specific, actionable insights.`
          } else if (lowerMsg.includes('margin') || lowerMsg.includes('profit')) {
            reply = `Your margin is ${margin}%. ${margin >= 50 ? "That's strong — service businesses typically target 40–60%." : margin >= 30 ? "That's decent, but there's room to improve. Look at your largest expense categories first." : margin >= 0 ? "That's thin. For a service business, you want to be above 40%. What's driving your expenses?" : `You're running at a loss. Expenses exceeded revenue by $${Math.abs(profit).toLocaleString()}. This needs immediate attention — identify which expense category is largest and cut it.`}\n\nYour numbers: $${revenue.toLocaleString()} revenue, $${expenses.toLocaleString()} expenses, $${profit.toLocaleString()} profit.`
          } else if (lowerMsg.includes('lead') || lowerMsg.includes('conversion') || lowerMsg.includes('pipeline')) {
            reply = leads === 0
              ? `You haven't logged any leads yet. Add leads to your Pipeline and log them in Period Entry — that's where I track your conversion rate.`
              : `Your conversion rate is ${convRate}% (${customers} customers from ${leads} leads). ${convRate >= 40 ? "That's strong — your sales process is working." : convRate >= 20 ? "That's average. The biggest lever is usually follow-up speed — most deals close within 48 hours of first contact." : "That's low. Focus on lead quality over quantity, and improve your follow-up. Most low converters are either talking to the wrong prospects or waiting too long to follow up."}`
          } else if (lowerMsg.includes('revenue') || lowerMsg.includes('grow') || lowerMsg.includes('growth')) {
            reply = growth === null
              ? `You've only logged one period, so I can't calculate growth yet. Log next month's data and I'll give you the trend.\n\nCurrent revenue: $${revenue.toLocaleString()}`
              : `Revenue went ${growth >= 0 ? 'up' : 'down'} ${Math.abs(growth)}% — from $${prevRevenue.toLocaleString()} to $${revenue.toLocaleString()}. ${growth > 20 ? 'Strong growth. Identify what drove it and double down.' : growth > 0 ? "Positive momentum. What's your target for next period?" : growth > -10 ? 'Slight decline. Seasonal, or is something structural changing?' : 'Significant drop. This needs a root cause analysis — was it fewer leads, lower close rate, or smaller deal sizes?'}`
          } else {
            const tips: string[] = []
            if (margin < 30) tips.push(`→ Margin is ${margin}% — identify and cut your largest expense category`)
            if (leads > 0 && convRate < 25) tips.push(`→ Conversion is ${convRate}% — improve follow-up speed and lead qualification`)
            if (profit < 0) tips.push(`→ You're in a net loss — expenses exceeded revenue by $${Math.abs(profit).toLocaleString()}`)
            if (tips.length === 0) tips.push('→ Business looks healthy. Focus on growing revenue to next milestone.')
            reply = `Based on your data, here's where I'd focus:\n\n${tips.join('\n')}\n\nAsk me anything specific — margin, growth rate, conversion, or what to prioritize.`
          }

          const words = reply.split(' ')
          for (let i = 0; i < words.length; i++) {
            send(words[i] + (i < words.length - 1 ? ' ' : ''))
            await new Promise(r => setTimeout(r, 28))
          }
        } else {
          const systemPrompt = `You are a sharp, direct business strategist embedded inside the founder's operating system. You have full context on their business and real metrics. Give specific, numbers-driven advice that is tailored to their exact niche, business model, and stage — never generic. Reference their actual numbers. Be concise — 3-5 sentences unless more detail is asked for. Use → bullets for action items.${workspace?.business_summary ? `\n\nBusiness context from the founder:\n"${workspace.business_summary}"` : ''}

Founder's live metrics:
${dataContext}

Unified FounderOS context:
${universalContext}`

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-10),
              ],
              temperature: 0.4,
              max_tokens: 500,
              stream: true,
            }),
          })

          if (!groqRes.ok) throw new Error(`Groq API error: ${groqRes.status}`)

          const reader = groqRes.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done: readerDone, value } = await reader.read()
            if (readerDone) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const payload = line.slice(6).trim()
              if (payload === '[DONE]') continue
              try {
                const parsed = JSON.parse(payload)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) send(content)
              } catch {}
            }
          }
        }

        finish()
      } catch (err) {
        console.error('Streaming AI error:', err)
        for (const word of 'Something went wrong. Try again in a moment.'.split(' ')) {
          send(word + ' ')
        }
        finish()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
