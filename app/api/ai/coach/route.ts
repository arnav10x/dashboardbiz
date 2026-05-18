import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyGamificationAction, buildAiContext, getFounderSnapshot } from '@/lib/founderos/engine'
import { buildExecutiveAssistantContext } from '@/lib/founderos/executive-assistant'

const COACH_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task or to-do item on the user\'s dashboard task list',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'The task title' },
          notes: { type: 'string', description: 'Optional additional notes or context for the task' },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'complete_task',
      description: 'Mark an existing open task as completed by matching its title',
      parameters: {
        type: 'object',
        properties: {
          task_title_keyword: { type: 'string', description: 'A word or phrase from the task title to find and complete' },
        },
        required: ['task_title_keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_pipeline_lead',
      description: 'Add a new lead or prospect to the sales pipeline',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Lead\'s full name' },
          company: { type: 'string', description: 'Company name (optional)' },
          value: { type: 'number', description: 'Estimated deal value in dollars (optional)' },
          stage: {
            type: 'string',
            enum: ['prospect', 'contacted', 'proposal', 'negotiation', 'won', 'lost'],
            description: 'Pipeline stage — defaults to prospect',
          },
          notes: { type: 'string', description: 'Notes about the lead (optional)' },
        },
        required: ['name'],
      },
    },
  },
]

async function executeToolCall(
  name: string,
  args: Record<string, any>,
  supabase: any,
  userId: string,
  workspaceId: string | null,
  existingTasks: Array<{ id: any; title: string; is_completed: boolean }>
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    if (name === 'create_task') {
      const title = String(args.title || '').trim()
      if (!title) return { success: false, message: 'Task title is required' }

      const { data, error } = await supabase
        .from('tasks')
        .insert({ user_id: userId, workspace_id: workspaceId || null, title, notes: args.notes || null, is_completed: false })
        .select('id, title')
        .single()

      if (error) return { success: false, message: `Failed to create task: ${error.message}` }
      return { success: true, message: `Task added: "${title}"`, data }
    }

    if (name === 'complete_task') {
      const keyword = String(args.task_title_keyword || '').toLowerCase().trim()
      if (!keyword) return { success: false, message: 'Task keyword is required' }

      const match = existingTasks.find(t => !t.is_completed && t.title.toLowerCase().includes(keyword))
      if (!match) return { success: false, message: `No open task found matching "${args.task_title_keyword}"` }

      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', match.id)

      if (error) return { success: false, message: `Failed to complete task: ${error.message}` }
      return { success: true, message: `Task completed: "${match.title}"`, data: match }
    }

    if (name === 'add_pipeline_lead') {
      const leadName = String(args.name || '').trim()
      if (!leadName) return { success: false, message: 'Lead name is required' }

      const stage = args.stage || 'prospect'
      const { data, error } = await supabase
        .from('pipeline_leads')
        .insert({
          user_id: userId,
          workspace_id: workspaceId || null,
          name: leadName,
          company: args.company || null,
          value: args.value || null,
          stage,
          status: stage,
          notes: args.notes || null,
        })
        .select('id, name')
        .single()

      if (error) return { success: false, message: `Failed to add lead: ${error.message}` }
      return { success: true, message: `Lead added to pipeline: "${leadName}"`, data }
    }

    return { success: false, message: `Unknown action: ${name}` }
  } catch (err: any) {
    return { success: false, message: `Action failed: ${err?.message || 'Unknown error'}` }
  }
}

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
    supabase.from('workspaces').select('id, name, business_type, stage, business_summary').eq('owner_id', user.id).maybeSingle(),
    supabase.from('period_entries').select('revenue, expenses, new_leads, new_customers, period_date').eq('user_id', user.id).order('period_date', { ascending: false }).limit(3),
    supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('pipeline_leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('stage', 'won'),
    supabase.from('tasks').select('id,title,is_completed,created_at,completed_at,notes').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('user_gamification').select('total_xp, level, current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    supabase.from('cal_entries').select('entry_date,revenue,expenses,notes').eq('user_id', user.id).order('entry_date', { ascending: false }).limit(10),
    supabase.from('calendar_events').select('event_date,title,start_time,end_time').eq('user_id', user.id).order('event_date', { ascending: false }).limit(10),
  ])

  const workspaceId = (workspace as any)?.id || null

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
  const completedTasks = (tasks || []).filter((t: any) => t.is_completed).length
  const taskRate = tasks?.length ? Math.round((completedTasks / tasks.length) * 100) : 0
  const dailyProfit = (calEntries || []).reduce((sum: any, e: any) => sum + (Number(e.revenue) || 0) - (Number(e.expenses) || 0), 0)
  const openTasks = (tasks || []).filter((t: any) => !t.is_completed).map((t: any) => t.title)

  const dataContext = hasData
    ? `Business: ${(workspace as any)?.name || 'Unknown'} (${(workspace as any)?.business_type || 'unknown type'}, ${(workspace as any)?.stage || 'unknown stage'})
${(workspace as any)?.business_summary ? `Business context: ${(workspace as any).business_summary}` : ''}
Latest period revenue: $${revenue.toLocaleString()}
Expenses: $${expenses.toLocaleString()}
Profit: $${profit.toLocaleString()} (${margin}% margin)
${growth !== null ? `Revenue growth vs prior period: ${growth > 0 ? '+' : ''}${growth}%` : 'Only 1 period logged — no growth data yet'}
New leads: ${leads} | New customers: ${customers} | Conversion rate: ${convRate}%
Total pipeline leads: ${leadCount || 0} | Won deals: ${wonCount || 0}
Tasks loaded: ${tasks?.length || 0} | Completed: ${completedTasks} | Completion rate: ${taskRate}%
Open tasks: ${openTasks.slice(0, 10).join(', ') || 'none'}
Gamification: Level ${gamification?.level || 1}, XP ${gamification?.total_xp || 0}, login streak ${gamification?.current_streak || 0}, longest streak ${gamification?.longest_streak || 0}
Recent daily P&L net total: $${dailyProfit.toLocaleString()} across ${calEntries?.length || 0} daily logs
Upcoming/recent calendar events: ${(events || []).map((e: any) => `${e.event_date} ${e.start_time || ''} ${e.title}`).join('; ') || 'none'}`
    : 'The user has not logged any data yet.'

  const buildCoachReply = () => {
    const userMessage = messages[messages.length - 1]?.content || ''
    const lowerMsg = userMessage.toLowerCase()

    if (!hasData) {
      const hasSummary = !!(workspace as any)?.business_summary
      return `${hasSummary ? `I can see you're running ${(workspace as any)!.business_summary.substring(0, 120)}... ` : ''}I don't have your financial data yet — so I can only give limited analysis right now.\n\n→ Log revenue, expenses, leads, and customers in Period Entry.\n→ ${!hasSummary ? 'Add Business Context in Settings so I can give niche-specific advice.' : 'Once you have 2+ periods logged, I can calculate growth and risks.'}`
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
      const sendAction = (action: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action })}\n\n`))
      }
      const finish = () => {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }

      try {
        const systemPrompt = `You are a sharp, direct business strategist embedded inside the founder's operating system. You have full context on their business and real metrics. Give specific, numbers-driven advice tailored to their niche, business model, and stage — never generic. Reference their actual numbers. Be concise — 3-5 sentences unless more detail is asked for. Use → bullets for action items.

TOOLS AVAILABLE — use them immediately when the user asks you to take an action:
- create_task: Use when the user asks to "add a task", "create a to-do", "remind me to [X]", or "add [X] to my tasks". Do not ask for confirmation — just call the tool.
- complete_task: Use when the user asks to "mark [X] as done", "complete [X]", or "check off [X]".
- add_pipeline_lead: Use when the user asks to "add a lead", "add [name] to my pipeline", or "create a prospect".

After using a tool, briefly confirm what was done in 1 sentence, then add relevant advice if applicable.${(workspace as any)?.business_summary ? `\n\nBusiness context from the founder:\n"${(workspace as any).business_summary}"` : ''}

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
              ...messages.slice(-12),
            ],
            temperature: 0.4,
            max_tokens: 600,
            tools: COACH_TOOLS,
            tool_choice: 'auto',
            stream: true,
          }),
        })

        if (!groqRes.ok) throw new Error(`Groq API error: ${groqRes.status}`)

        const reader = groqRes.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        const accToolCalls = new Map<number, { id: string; name: string; arguments: string }>()
        let finishReason = ''

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
              const choice = parsed.choices?.[0]
              if (!choice) continue
              if (choice.finish_reason) finishReason = choice.finish_reason

              const delta = choice.delta || {}

              if (delta.content) send(delta.content)

              if (delta.tool_calls) {
                for (const tc of delta.tool_calls) {
                  const idx = tc.index ?? 0
                  if (!accToolCalls.has(idx)) {
                    accToolCalls.set(idx, { id: '', name: '', arguments: '' })
                  }
                  const acc = accToolCalls.get(idx)!
                  if (tc.id) acc.id = tc.id
                  if (tc.function?.name) acc.name = tc.function.name
                  if (tc.function?.arguments) acc.arguments += tc.function.arguments
                }
              }
            } catch {}
          }
        }

        if (finishReason === 'tool_calls' && accToolCalls.size > 0) {
          const assistantToolMsg: any = {
            role: 'assistant',
            tool_calls: Array.from(accToolCalls.values()).map(tc => ({
              id: tc.id,
              type: 'function',
              function: { name: tc.name, arguments: tc.arguments },
            })),
          }

          const toolResultMsgs: any[] = []

          for (const tc of accToolCalls.values()) {
            let args: Record<string, any> = {}
            try { args = JSON.parse(tc.arguments) } catch {}

            const result = await executeToolCall(tc.name, args, supabase, user.id, workspaceId, tasks || [])
            sendAction({ type: tc.name, ...result })

            toolResultMsgs.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify({ success: result.success, message: result.message }),
            })
          }

          const followUpRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-12),
                assistantToolMsg,
                ...toolResultMsgs,
              ],
              temperature: 0.4,
              max_tokens: 200,
              stream: true,
            }),
          })

          if (followUpRes.ok) {
            const followReader = followUpRes.body!.getReader()
            const followDecoder = new TextDecoder()
            let followBuffer = ''

            while (true) {
              const { done, value } = await followReader.read()
              if (done) break

              followBuffer += followDecoder.decode(value, { stream: true })
              const lines = followBuffer.split('\n')
              followBuffer = lines.pop() || ''

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
