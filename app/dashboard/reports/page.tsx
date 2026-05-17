import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/strata/TopBar'
import { BarChart3, CheckCircle2, Flame, LineChart, ShieldCheck, Target, Users, ArrowRight, Briefcase, Activity } from 'lucide-react'

function money(n: number) { return `$${Math.round(n).toLocaleString()}` }
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`fo-card ${className}`}>{children}</div> }
function clamp(n: number) { return Math.max(0, Math.min(100, Math.round(n))) }
function pct(n: number, d: number) { return d > 0 ? clamp((n / d) * 100) : 0 }
function Pill({ href, children, active=false }: { href:string; children: React.ReactNode; active?: boolean }) {
  return <Link href={href} className="px-4 py-2 text-[11px] font-bold rounded-md transition-all hover:scale-[1.03] hover:border-green-500/50" style={{ background: active ? 'linear-gradient(180deg, var(--accent-hover), var(--accent))' : 'var(--bg-raised)', color: active ? '#031008' : 'var(--text-secondary)', border: active ? '1px solid var(--accent-glow)' : '1px solid var(--border)', textDecoration:'none' }}>{children}</Link>
}
function Metric({ label, value, sub, Icon, progress=0, healthy=true }: any) { return <div className="app-card" style={{ minHeight: 150 }}><div className="app-card-inner" style={{ padding: '20px 20px 18px' }}><div className="flex items-start justify-between"><div><p className="fo-kicker mb-5">{label}</p><p className="text-3xl font-black fo-num text-white">{value}</p><p className="text-xs mt-3" style={{ color:'var(--text-muted)' }}>{sub}</p></div><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: healthy ? 'var(--accent-faint)' : 'rgba(255,71,71,.08)', border: healthy ? '1px solid var(--accent-muted)' : '1px solid rgba(255,71,71,.18)' }}><Icon className="w-4 h-4" style={{ color: healthy ? 'var(--accent)' : '#ff4747' }} /></div></div><div className="fo-soft-line mt-5"><span style={{ width:`${progress}%`, background: healthy ? 'linear-gradient(90deg, var(--accent), var(--accent-hover))' : '#ff4747' }} /></div></div><div className="app-card-glow" /></div> }
function ProgressRow({ label, pct, healthy }: { label:string; pct:number; healthy:boolean }) { return <div className="grid grid-cols-[90px_1fr_46px] items-center gap-4"><span className="text-sm" style={{ color:'var(--text-secondary)' }}>{label}</span><div className="h-1.5 rounded-full overflow-hidden" style={{ background:'var(--fo-soft-line-bg)' }}><div className="h-full rounded-full" style={{ width:`${pct}%`, background: healthy ? 'linear-gradient(90deg, var(--accent), var(--accent-hover))' : '#ff4747' }} /></div><span className="text-sm text-right" style={{ color: healthy ? 'var(--text-secondary)' : '#ff5454' }}>{pct}%</span></div> }

function rangeStart(range: string) {
  const d = new Date()
  if (range === '7d') d.setDate(d.getDate() - 7)
  else if (range === '90d') d.setDate(d.getDate() - 90)
  else if (range === 'ytd') { d.setMonth(0); d.setDate(1) }
  else d.setDate(d.getDate() - 30)
  d.setHours(0,0,0,0)
  return d
}
function chartPoints(points: { label:string; value:number }[]) {
  if (!points.length) return { polyline:'', area:'', circles: [] as {x:number;y:number}[], max: 0 }
  const w = 520, h = 150, padX = 10, padY = 14
  const vals = points.map(p => p.value)
  const max = Math.max(1, ...vals)
  const min = Math.min(0, ...vals)
  const span = Math.max(1, max - min)
  const coords = points.map((p, i) => {
    const x = points.length === 1 ? w - padX : padX + (i * (w - padX * 2)) / (points.length - 1)
    const y = h - padY - ((p.value - min) / span) * (h - padY * 2)
    return { x, y }
  })
  const polyline = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${polyline} ${coords[coords.length-1].x.toFixed(1)},${h} ${coords[0].x.toFixed(1)},${h}`
  return { polyline, area, circles: coords, max }
}

export default async function ReportsPage({ searchParams }: { searchParams?: { range?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const range = ['7d','30d','90d','ytd'].includes(searchParams?.range || '') ? String(searchParams?.range) : '30d'
  const start = rangeStart(range)
  const [{ data: workspace }, { data: settings }, { data: entries }, { data: tasks }, { data: leads }, { data: daily }] = await Promise.all([
    supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
    supabase.from('user_settings').select('revenue_target').eq('user_id', user.id).maybeSingle(),
    supabase.from('period_entries').select('revenue, expenses, new_leads, leads, new_customers, customers, period_date, revenue_target').eq('user_id', user.id).order('period_date', { ascending: true }).limit(365),
    supabase.from('tasks').select('is_completed, completed_at, created_at').eq('user_id', user.id).limit(500),
    supabase.from('pipeline_leads').select('stage, value, created_at').eq('user_id', user.id),
    supabase.from('cal_entries').select('revenue, expenses, entry_date').eq('user_id', user.id).order('entry_date', { ascending: true }).limit(365),
  ])

  const allEntries = entries || []
  const allDaily = daily || []
  const periodSeries = allDaily.length
    ? allDaily.filter((e:any)=> new Date(e.entry_date) >= start).map((e:any)=>({ label: new Date(e.entry_date+'T12:00:00').toLocaleDateString('en-US',{ month:'short', day:'numeric' }), value: Number(e.revenue)||0, expenses:Number(e.expenses)||0 }))
    : allEntries.filter((e:any)=> new Date(e.period_date+'T12:00:00') >= start).map((e:any)=>({ label: new Date(e.period_date+'T12:00:00').toLocaleDateString('en-US',{ month:'short', day:'numeric' }), value: Number(e.revenue)||0, expenses:Number(e.expenses)||0 }))

  const latest = allEntries[allEntries.length - 1]
  const revenue = periodSeries.reduce((s:any,e:any)=>s+Number(e.value||0),0) || Number(latest?.revenue) || 0
  const expenses = periodSeries.reduce((s:any,e:any)=>s+Number(e.expenses||0),0) || Number(latest?.expenses) || 0
  const profit = revenue - expenses
  const target = Number(settings?.revenue_target) || Number(latest?.revenue_target) || 0
  const targetPct = pct(revenue, target)
  const pipelineLeads = leads?.length || Number(latest?.new_leads) || Number(latest?.leads) || 0
  const won = leads?.filter((l:any) => l.stage === 'won' || l.stage === 'closed').length || 0
  const completed = tasks?.filter((t:any) => t.is_completed).length || 0
  const taskRate = tasks?.length ? pct(completed, tasks.length) : 0
  const conversion = pipelineLeads ? pct(won, pipelineLeads) : 0
  const workspaceName = workspace?.name || 'My Workspace'
  const graph = chartPoints(periodSeries.length ? periodSeries : [])
  const prevRevenue = 0
  const revenueTrendText = periodSeries.length > 1 ? `${periodSeries.length} logged points in this range` : revenue > 0 ? 'Latest logged revenue' : 'No revenue logged in this range'

  return <div className="flex flex-col h-full fo-page"><TopBar title="Reports" workspaceName={workspaceName} hasData={revenue > 0 || completed > 0 || pipelineLeads > 0} showGreeting />
    <div className="flex-1 overflow-y-auto p-7 md:p-8 animate-in"><div className="max-w-[1180px] space-y-6">
      <div className="flex items-end justify-between gap-4"><div><h1 className="text-3xl font-black tracking-tight">Reports</h1><p className="text-base mt-2" style={{ color:'var(--text-muted)' }}>Track real performance from your logged revenue, tasks, and pipeline.</p></div><div className="flex gap-1"><Pill href="/dashboard/reports?range=7d" active={range==='7d'}>7D</Pill><Pill href="/dashboard/reports?range=30d" active={range==='30d'}>30D</Pill><Pill href="/dashboard/reports?range=90d" active={range==='90d'}>90D</Pill><Pill href="/dashboard/reports?range=ytd" active={range==='ytd'}>YTD</Pill><Pill href="/dashboard/period-entry">LOG DATA</Pill></div></div>
      <div className="grid grid-cols-6 gap-4"><Metric label="Revenue" value={money(revenue)} sub={target ? `${targetPct}% of ${money(target)} goal` : 'No target set'} Icon={BarChart3} progress={targetPct} healthy={target ? targetPct >= 60 : revenue > 0}/><Metric label="Net Profit" value={money(profit)} sub={`${revenue > 0 ? Math.round((profit / revenue) * 100) : 0}% margin`} Icon={LineChart} progress={revenue > 0 ? pct(profit, revenue) : 0} healthy={profit >= 0}/><Metric label="Pipeline Leads" value={pipelineLeads} sub={`${conversion}% conversion rate`} Icon={Users} progress={conversion} healthy={pipelineLeads > 0}/><Metric label="Deals Closed" value={won} sub={`${conversion}% of leads`} Icon={CheckCircle2} progress={conversion} healthy={won > 0}/><Metric label="Tasks Done" value={completed} sub={`${taskRate}% completion rate`} Icon={Target} progress={taskRate} healthy={taskRate >= 60}/><Metric label="Active Days" value={new Set((tasks || []).filter((t:any)=>t.completed_at).map((t:any)=>String(t.completed_at).slice(0,10))).size} sub="Active task days" Icon={Flame} progress={Math.min(100, completed * 8)} healthy={completed > 0}/></div>
      <div className="grid grid-cols-[1.05fr_1fr] gap-4">
        <Card className="p-6 min-h-[285px]"><div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-bold">Revenue Over Time <span className="text-xs opacity-50">ⓘ</span></h2><p className="text-3xl font-black fo-num mt-2">{money(revenue)}</p><p className="text-sm mt-2" style={{ color: revenue > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>{revenueTrendText}</p></div><Link href="/dashboard/period-entry" className="px-3 py-2 text-xs rounded-lg hover:border-green-500/40" style={{ background:'var(--overlay-faint)', border:'1px solid var(--border)', textDecoration:'none', color:'inherit' }}>Add data</Link></div><div className="h-36 relative mt-3">{graph.polyline ? <svg viewBox="0 0 520 150" className="w-full h-full"><defs><linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".35"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>{[25,60,95,130].map(y=><line key={y} x1="0" x2="520" y1={y} y2={y} stroke="var(--chart-grid)"/>)}<polygon points={graph.area} fill="url(#reportRevenue)"/><polyline points={graph.polyline} fill="none" stroke="var(--accent)" strokeWidth="3"/>{graph.circles.map((c,i)=><circle key={i} cx={c.x} cy={c.y} r="4" fill="var(--accent)" />)}</svg> : <div className="h-full flex items-center justify-center text-sm" style={{ color:'var(--text-muted)' }}>Log entries to unlock an accurate chart.</div>}</div></Card>
        <Card className="p-6"><div className="flex justify-between mb-8"><h2 className="text-lg font-bold">Performance Overview</h2><span className="px-3 py-2 text-xs rounded-lg" style={{ background:'var(--overlay-faint)', border:'1px solid var(--border)' }}>{range.toUpperCase()}</span></div><div className="space-y-8"><ProgressRow label="Revenue" pct={targetPct} healthy={target ? targetPct >= 60 : revenue > 0}/><ProgressRow label="Outreach" pct={Math.min(100, pipelineLeads * 10)} healthy={pipelineLeads > 0}/><ProgressRow label="Pipeline" pct={conversion} healthy={conversion >= 20}/><ProgressRow label="Execution" pct={taskRate} healthy={taskRate >= 60}/></div></Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6"><h2 className="text-lg font-bold mb-6">Reports Breakdown</h2>{[{href:'/dashboard/period-entry',i:Briefcase,t:'Financial Summary',d:'Revenue, profit, and margin trends.'},{href:'/dashboard/pipeline',i:ShieldCheck,t:'Pipeline Report',d:'Lead flow, conversion, and win rate.'},{href:'/dashboard/tasks',i:CheckCircle2,t:'Task Performance',d:'Completion rate and productivity.'},{href:'/dashboard/achievements',i:Activity,t:'Activity Report',d:'Daily activity and consistency.'}].map(x=> <div key={x.t} className="flex items-center gap-4 mb-4 rounded-lg p-2 -mx-2 transition-all hover:bg-white/[.035]"><div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background:'var(--accent-faint)', border:'1px solid var(--accent-muted)' }}><x.i className="w-4 h-4 text-accent"/></div><div className="flex-1"><p className="font-bold text-sm">{x.t}</p><p className="text-xs" style={{ color:'var(--text-muted)' }}>{x.d}</p></div><Link href={x.href} className="px-5 py-2 rounded-lg text-sm" style={{ background:'var(--bg-raised)', border:'1px solid var(--border)', textDecoration:'none', color:'inherit' }}>View</Link></div>)}<Link href="/dashboard/ai-copilot" className="block text-center text-accent font-bold text-sm mt-8">Ask AI for a report <ArrowRight className="inline w-4 h-4" /></Link></Card>
        <Card className="p-6"><h2 className="text-lg font-bold mb-8">Insights</h2>{[`${revenue > 0 ? `Revenue in this range is ${money(revenue)}.` : 'No revenue logged in this range. Add data to unlock revenue insights.'}`,`${pipelineLeads > 0 ? `You have ${pipelineLeads} pipeline leads and ${won} won deals.` : 'No pipeline leads logged yet.'}`,`${won === 0 ? 'No deals closed yet — focus on follow-up.' : `${won} deals closed. Keep moving leads forward.`}`,`${tasks?.length ? `Task completion rate is ${taskRate}%.` : 'Add tasks to track execution.'}`].map(t=><div key={t} className="flex items-center gap-4 mb-7"><CheckCircle2 className="w-5 h-5 text-accent"/><p className="text-sm" style={{ color:'var(--text-secondary)' }}>{t}</p></div>)}<Link href="/dashboard/ai-copilot" className="block text-center text-accent font-bold text-sm mt-10">View full insights <ArrowRight className="inline w-4 h-4" /></Link></Card>
      </div>
    </div></div></div>
}
