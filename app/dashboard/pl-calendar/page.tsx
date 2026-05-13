'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download, MoreVertical, Plus, RefreshCw, Settings, X } from 'lucide-react'

type DayEntry = { date: string; revenue: number; expenses: number; notes?: string | null }
type CalEvent = { id: string; title: string; description?: string | null; event_date: string; start_time?: string | null; end_time?: string | null; all_day: boolean; color: string; source?: string | null }
type PLModal = { date: string; revenue: string; expenses: string; notes: string }
type EventModal = { id?: string; date: string; title: string; description: string; start_time: string; end_time: string; all_day: boolean; color: string }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['MON','TUE','WED','THU','FRI','SAT','SUN']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)
const EVENT_COLORS = ['#7c3aed','#1688ff','#23c767','#ff7a1a','#f4c430','#14b8a6','#a855f7']

function panel(extra: React.CSSProperties = {}): React.CSSProperties { return { background: 'linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.013))', border: '1px solid rgba(255,255,255,.075)', borderRadius: 14, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.025)', ...extra } }
function money(n: number) { const abs = Math.abs(n); return `${n < 0 ? '-' : ''}$${abs.toLocaleString()}` }
function signed(n: number) { return `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString()}` }
function dateKey(d: Date) { return d.toISOString().split('T')[0] }
function weekDates(offset: number) { const d = new Date(); const mon = d.getDay() === 0 ? 6 : d.getDay() - 1; d.setDate(d.getDate() - mon + offset * 7); d.setHours(0,0,0,0); return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return x }) }
function hourLabel(h: number) { return `${h > 12 ? h - 12 : h} ${h >= 12 ? 'PM' : 'AM'}` }

export default function CalendarPage() {
  const now = new Date()
  const [activeTab, setActiveTab] = useState<'schedule' | 'pl'>('pl')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [weekOffset, setWeekOffset] = useState(0)
  const [entries, setEntries] = useState<Record<string, DayEntry>>({})
  const [events, setEvents] = useState<CalEvent[]>([])
  const [scheduleEvents, setScheduleEvents] = useState<CalEvent[]>([])
  const [workspaceName, setWorkspaceName] = useState('Founder OS')
  const [googleConnected, setGoogleConnected] = useState(false)
  const [plModal, setPLModal] = useState<PLModal | null>(null)
  const [eventModal, setEventModal] = useState<EventModal | null>(null)
  const [saving, setSaving] = useState(false)
  const [scheduleView, setScheduleView] = useState<'Week' | 'Month' | 'Agenda'>('Week')
  const [eventFilter, setEventFilter] = useState<string>('All')

  const loadPL = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const end = dateKey(new Date(year, month + 1, 0))
    const [{ data: ws }, { data: cal }, { data: evts }, { data: settings }] = await Promise.all([
      supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
      supabase.from('cal_entries').select('entry_date,revenue,expenses,notes').eq('user_id', user.id).gte('entry_date', start).lte('entry_date', end),
      supabase.from('calendar_events').select('*').eq('user_id', user.id).gte('event_date', start).lte('event_date', end),
      supabase.from('user_settings').select('google_cal_connected').eq('user_id', user.id).maybeSingle(),
    ])
    if (ws?.name) setWorkspaceName(ws.name)
    const next: Record<string, DayEntry> = {}
    ;(cal || []).forEach((r: any) => { next[r.entry_date] = { date: r.entry_date, revenue: Number(r.revenue) || 0, expenses: Number(r.expenses) || 0, notes: r.notes } })
    setEntries(next)
    setEvents((evts || []) as CalEvent[])
    setGoogleConnected(!!settings?.google_cal_connected)
  }, [year, month])

  const loadSchedule = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const w = weekDates(weekOffset)
    const start = scheduleView === 'Month' ? `${year}-${String(month + 1).padStart(2, '0')}-01` : dateKey(w[0])
    const end = scheduleView === 'Month' ? dateKey(new Date(year, month + 1, 0)) : dateKey(w[6])
    const [{ data: evts }, { data: settings }] = await Promise.all([
      supabase.from('calendar_events').select('*').eq('user_id', user.id).gte('event_date', start).lte('event_date', end),
      supabase.from('user_settings').select('google_cal_connected').eq('user_id', user.id).maybeSingle(),
    ])
    setScheduleEvents((evts || []) as CalEvent[])
    setGoogleConnected(!!settings?.google_cal_connected)
  }, [weekOffset, scheduleView, year, month])

  useEffect(() => { loadPL() }, [loadPL])
  useEffect(() => { if (activeTab === 'schedule') loadSchedule() }, [activeTab, loadSchedule])

  const wDates = useMemo(() => weekDates(weekOffset), [weekOffset])
  const displayEvents = eventFilter === 'All' ? scheduleEvents : scheduleEvents.filter(e => (e.color || '').toLowerCase() === eventFilter.toLowerCase() || e.title.toLowerCase().includes(eventFilter.toLowerCase()))
  const todayKey = dateKey(new Date())
  const currentHour = new Date().getHours()
  const currentMinute = new Date().getMinutes()
  const currentLineTop = Math.max(0, Math.min(56, Math.round((currentMinute / 60) * 56)))

  const entryList = Object.values(entries)
  const totalRevenue = entryList.reduce((s, e) => s + e.revenue, 0)
  const totalExpenses = entryList.reduce((s, e) => s + e.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const profitDays = entryList.filter(e => e.revenue - e.expenses > 0).length
  const lossDays = entryList.filter(e => e.revenue - e.expenses < 0).length
  const sorted = [...entryList].sort((a, b) => (b.revenue - b.expenses) - (a.revenue - a.expenses))
  const high = sorted[0]
  const low = [...entryList].sort((a, b) => (a.revenue - a.expenses) - (b.revenue - b.expenses))[0]
  const trend = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    const e = entries[key]
    return { day: i + 1, profit: e ? e.revenue - e.expenses : 0 }
  })

  const firstDayMon = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayMon; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length < 35) cells.push(null)
  const keyFor = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const openPL = (d: number) => { const k = keyFor(d); const e = entries[k]; setPLModal({ date: k, revenue: e ? String(e.revenue) : '', expenses: e ? String(e.expenses) : '', notes: e?.notes || '' }) }
  const openEvent = (date: string, ev?: CalEvent) => setEventModal({ id: ev?.id, date, title: ev?.title || '', description: ev?.description || '', start_time: ev?.start_time?.slice(0,5) || '', end_time: ev?.end_time?.slice(0,5) || '', all_day: ev?.all_day ?? false, color: ev?.color || '#23c767' })
  const connectGoogle = () => { window.location.href = '/api/auth/google-calendar' }

  const savePL = async () => {
    if (!plModal) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: ws } = await supabase.from('workspaces').select('id').eq('owner_id', user.id).maybeSingle()
      await supabase.from('cal_entries').upsert({ user_id: user.id, workspace_id: ws?.id || null, entry_date: plModal.date, revenue: Number(plModal.revenue) || 0, expenses: Number(plModal.expenses) || 0, notes: plModal.notes }, { onConflict: 'user_id,entry_date' })
      await loadPL()
    }
    setSaving(false); setPLModal(null)
  }

  const saveEvent = async () => {
    if (!eventModal || !eventModal.title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const payload = { title: eventModal.title, description: eventModal.description, event_date: eventModal.date, start_time: eventModal.start_time || null, end_time: eventModal.end_time || null, all_day: eventModal.all_day, color: eventModal.color }
      if (eventModal.id) await supabase.from('calendar_events').update(payload).eq('id', eventModal.id)
      else await supabase.from('calendar_events').insert({ user_id: user.id, ...payload, source: 'manual' })
      if (activeTab === 'schedule') await loadSchedule(); else await loadPL()
    }
    setSaving(false); setEventModal(null)
  }

  const deleteEvent = async () => {
    if (!eventModal?.id) return
    const supabase = createClient()
    await supabase.from('calendar_events').delete().eq('id', eventModal.id)
    setEventModal(null)
    await loadSchedule(); await loadPL()
  }

  const exportCSV = () => {
    const rows = ['date,revenue,expenses,net_profit,notes', ...entryList.map(e => `${e.date},${e.revenue},${e.expenses},${e.revenue - e.expenses},"${e.notes || ''}"`)]
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    a.download = `pnl-${MONTHS[month]}-${year}.csv`
    a.click()
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Calendar" workspaceName={workspaceName} showGreeting actionLabel={activeTab === 'schedule' ? 'Add Event' : 'Add entry'} onAction={() => activeTab === 'schedule' ? openEvent(dateKey(new Date())) : openPL(new Date().getDate())} />
      <div className="flex-1 overflow-y-auto px-7 py-7 animate-in">
        <div className="mb-5">
          <h1 className="text-[27px] font-black tracking-tight">Calendar</h1>
          <p className="mt-1 text-base" style={{ color: 'var(--text-secondary)' }}>{activeTab === 'schedule' ? 'Stay on top of your schedule and never miss an important activity.' : 'Stay on top of your schedule and financial performance.'}</p>
        </div>

        <div className="mb-5 flex gap-8 border-b" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
          <button onClick={() => setActiveTab('schedule')} className="pb-3 text-sm font-bold" style={{ color: activeTab === 'schedule' ? 'var(--accent)' : 'var(--text-secondary)', borderBottom: activeTab === 'schedule' ? '2px solid var(--accent)' : '2px solid transparent' }}>Schedule Calendar</button>
          <button onClick={() => setActiveTab('pl')} className="pb-3 text-sm font-bold" style={{ color: activeTab === 'pl' ? 'var(--accent)' : 'var(--text-secondary)', borderBottom: activeTab === 'pl' ? '2px solid var(--accent)' : '2px solid transparent' }}>Profit / Loss Calendar</button>
        </div>

        {activeTab === 'schedule' ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex rounded-lg" style={panel({ overflow: 'hidden' })}>{(['Week','Month','Agenda'] as const).map(v => <button key={v} onClick={() => setScheduleView(v)} className="px-5 py-2 text-xs font-bold" style={{ color: scheduleView === v ? 'var(--accent)' : 'var(--text-secondary)', background: scheduleView === v ? 'var(--accent-faint)' : 'transparent' }}>{v}</button>)}</div>
              <div className="flex items-center gap-3">
                <button className="rounded-lg px-4 py-2 text-sm font-bold" style={panel()} onClick={() => setWeekOffset(0)}>Today</button>
                <button className="grid h-10 w-10 place-items-center rounded-lg" style={panel()} onClick={() => setWeekOffset(v => v - 1)}><ChevronLeft className="h-4 w-4" /></button>
                <button className="grid h-10 w-10 place-items-center rounded-lg" style={panel()} onClick={() => setWeekOffset(v => v + 1)}><ChevronRight className="h-4 w-4" /></button>
                <select value={eventFilter} onChange={e=>setEventFilter(e.target.value)} className="rounded-lg px-4 py-2 text-sm font-bold bg-transparent" style={panel()}><option value="All">All events</option><option value="#7c3aed">Meetings</option><option value="#1688ff">Calls</option><option value="#23c767">Focus/Sales</option><option value="#ff7a1a">Personal</option></select><button className="rounded-lg px-4 py-2 text-sm font-bold" style={panel()}>{MONTHS[wDates[0].getMonth()]} {wDates[0].getDate()} – {MONTHS[wDates[6].getMonth()]} {wDates[6].getDate()}, {wDates[6].getFullYear()} <ChevronDown className="ml-2 inline h-3 w-3" /></button>
                <button onClick={() => openEvent(dateKey(new Date()))} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black" style={{ background: 'linear-gradient(180deg,#2fd976,#14b457)', color: '#031008' }}><Plus className="h-4 w-4" /> Add Event</button>
              </div>
            </div>
            {scheduleView === 'Agenda' ? (<div className="p-5" style={panel()}>{displayEvents.length ? displayEvents.map(e => <button key={e.id} onClick={()=>openEvent(e.event_date,e)} className="mb-3 flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/[.035]" style={{border:'1px solid var(--border)'}}><CalendarDays className="h-4 w-4" style={{color:e.color}}/><div className="flex-1"><p className="font-bold">{e.title}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{e.event_date} {e.all_day ? 'All day' : `${e.start_time?.slice(0,5) || ''} - ${e.end_time?.slice(0,5) || ''}`}</p></div></button>) : <p style={{color:'var(--text-muted)'}}>No events match this filter.</p>}</div>) : scheduleView === 'Month' ? (<div className="p-5" style={panel()}><div className="grid grid-cols-7 gap-2">{Array.from({length: Math.ceil(((new Date(year, month, 1).getDay()+6)%7 + new Date(year, month+1, 0).getDate())/7)*7}, (_,idx)=>{ const first=(new Date(year,month,1).getDay()+6)%7; const day=idx-first+1; return day>0 && day<=new Date(year,month+1,0).getDate() ? new Date(year,month,day) : null }).map((d,idx)=> d ? <button key={dateKey(d)} onDoubleClick={()=>openEvent(dateKey(d))} className="min-h-[90px] rounded-lg p-2 text-left hover:bg-white/[.035]" style={{border:'1px solid var(--border)'}}><p className="text-xs" style={{color:'var(--text-muted)'}}>{d.getDate()}</p>{displayEvents.filter(e=>e.event_date===dateKey(d)).slice(0,2).map(e=><p key={e.id} className="mt-1 truncate rounded px-2 py-1 text-[10px]" style={{background:`${e.color}22`,color:e.color}}>{e.title}</p>)}</button> : <div key={idx} className="min-h-[90px] rounded-lg p-2 opacity-30" style={{border:'1px solid var(--border)'}} />)}</div></div>) : <div className="overflow-hidden" style={panel()}>
              <div className="grid" style={{ gridTemplateColumns: '68px repeat(7,1fr)' }}>
                <div />
                {wDates.map((d, i) => <div key={i} className="border-l py-3 text-center" style={{ borderColor: 'rgba(255,255,255,.07)' }}><p className="text-[11px] font-black">{DAYS[i]}<br/><span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{MONTHS[d.getMonth()].slice(0,3)} {d.getDate()}</span></p></div>)}
                <div className="border-t pr-2 pt-3 text-right text-xs" style={{ borderColor: 'rgba(255,255,255,.07)' }}>all-day</div>
                {wDates.map((d, i) => <div key={i} onDoubleClick={() => openEvent(dateKey(d), { id: '', title: '', event_date: dateKey(d), all_day: true, color: '#23c767' } as CalEvent)} className="border-l border-t p-1" style={{ borderColor: 'rgba(255,255,255,.07)', minHeight: 34 }}>{displayEvents.filter(e => e.all_day && e.event_date === dateKey(d)).map(e => <button key={e.id} onClick={() => openEvent(e.event_date, e)} className="mb-1 w-full truncate rounded px-2 py-1 text-[10px] font-bold" style={{ background: `${e.color}26`, border: `1px solid ${e.color}45`, color: e.color }}>{e.title}</button>)}</div>)}
                {HOURS.map(h => <div key={`r-${h}`} className="contents"><div className="border-t pr-2 pt-2 text-right text-xs" style={{ borderColor: 'rgba(255,255,255,.07)', color: 'var(--text-secondary)', minHeight: 56 }}>{hourLabel(h)}</div>{wDates.map((d, i) => {
                  const cellDate = dateKey(d)
                  const showNowLine = cellDate === todayKey && h === currentHour
                  return (
                    <div key={`${h}-${i}`} onDoubleClick={() => setEventModal({ date: cellDate, title: '', description: '', start_time: `${String(h).padStart(2, '0')}:00`, end_time: `${String(h + 1).padStart(2, '0')}:00`, all_day: false, color: '#23c767' })} className="relative border-l border-t p-1" style={{ borderColor: 'rgba(255,255,255,.07)', minHeight: 56 }}>
                      {showNowLine && (
                        <div className="pointer-events-none absolute left-0 right-0 z-20" style={{ top: currentLineTop }}>
                          <div style={{ height: 1.5, background: '#ff335f', boxShadow: '0 0 10px rgba(255,51,95,.75)' }} />
                          <div style={{ position: 'absolute', left: -4, top: -3, width: 7, height: 7, borderRadius: 999, background: '#ff335f', boxShadow: '0 0 10px rgba(255,51,95,.9)' }} />
                        </div>
                      )}
                      {displayEvents.filter(e => !e.all_day && e.event_date === cellDate && Number(e.start_time?.slice(0,2)) === h).map(e => <button key={e.id} onClick={() => openEvent(e.event_date, e)} className="relative z-10 w-full rounded px-2 py-1 text-left text-[10px] font-bold" style={{ background: `${e.color}26`, borderLeft: `3px solid ${e.color}`, color: 'white' }}><span style={{ color: e.color }}>{e.start_time?.slice(0,5)}</span><br />{e.title}</button>)}
                    </div>
                  )
                })}</div>)}
              </div>
            </div>}
            <div className="mt-3 flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{['Meeting','Call','Focus Time','Sales','Personal','Learning','Marketing'].map((l, i) => <span key={l} className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: EVENT_COLORS[i] }} />{l}</span>)}</div>
            <div className="mt-5 grid gap-4 xl:grid-cols-[.9fr_1.6fr]">
              <div className="p-5" style={panel()}><div className="mb-4 flex justify-between"><h3 className="font-black">Connected Calendars</h3><Settings className="h-4 w-4" /></div><div className="mb-3 flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-black font-black">G</div><div className="flex-1"><p className="font-bold">Google Calendar</p><p className="text-xs" style={{ color: 'var(--text-muted)' }}>{googleConnected ? 'Connected to your account' : 'Connect to sync real events'}</p></div><button onClick={connectGoogle} className="rounded-lg px-3 py-1 text-xs font-bold" style={{ background: googleConnected ? 'var(--accent-muted)' : 'rgba(255,255,255,.04)', color: googleConnected ? 'var(--accent)' : 'white', border: '1px solid rgba(255,255,255,.08)' }}>{googleConnected ? 'Connected' : 'Connect'}</button><MoreVertical className="h-4 w-4" /></div><button onClick={connectGoogle} className="mt-1 flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--accent)' }}><Plus className="h-4 w-4" /> Connect calendar</button></div>
              <div className="p-5" style={panel()}><div className="mb-4 flex justify-between"><h3 className="font-black">Upcoming Events</h3><button onClick={()=>setScheduleView('Agenda')} className="text-sm font-bold" style={{ color: 'var(--accent)' }}>View full agenda →</button></div>{displayEvents.filter(e=>!e.all_day).slice(0,5).length ? displayEvents.filter(e=>!e.all_day).slice(0,5).map(e=><button key={e.id} onClick={()=>openEvent(e.event_date,e)} className="mb-3 flex w-full items-center gap-3 text-left"><div className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${e.color}20`, color: e.color }}><CalendarDays className="h-4 w-4" /></div><p className="flex-1 font-bold">{e.title}</p><span className="text-sm" style={{ color: 'var(--text-muted)' }}>{e.start_time?.slice(0,5)} – {e.end_time?.slice(0,5)}</span><span className="rounded-md px-2 py-1 text-xs" style={{ color: e.color, background: `${e.color}18` }}>Event</span></button>) : <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No upcoming events yet. Click Add Event or double-click a calendar slot to create one.</p>}</div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-5 gap-3">{[
              ['Total Net Profit', money(totalProfit), 'This month', totalProfit >= 0 ? 'var(--accent)' : '#ff4d4d'], ['Highest Day', high ? money(high.revenue - high.expenses) : '$0', high ? new Date(high.date+'T12:00:00').toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' }) : '', 'var(--accent)'], ['Lowest Day', low ? money(low.revenue - low.expenses) : '$0', low ? new Date(low.date+'T12:00:00').toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' }) : '', '#ff4d4d'], ['Profit Days', String(profitDays), `${entryList.length ? Math.round(profitDays / entryList.length * 100) : 0}% of days`, 'var(--accent)'], ['Loss Days', String(lossDays), `${entryList.length ? Math.round(lossDays / entryList.length * 100) : 0}% of days`, '#ff4d4d']
            ].map(c => <div key={c[0]} className="app-card" style={{ minHeight: 100 }}><div className="app-card-inner" style={{ padding: '16px 18px 14px' }}><p className="fo-kicker mb-3">{c[0]}</p><p className="text-2xl font-black fo-num" style={{ color: c[3] }}>{c[1]}</p><p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{c[2]}</p></div><div className="app-card-glow" /></div>)}</div>
            <div className="mb-3 flex items-center gap-3" style={panel({ padding: 10 })}><button onClick={() => setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1)} className="grid h-9 w-9 place-items-center rounded-lg" style={panel()}><ChevronLeft className="h-4 w-4" /></button><button onClick={() => setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1)} className="grid h-9 w-9 place-items-center rounded-lg" style={panel()}><ChevronRight className="h-4 w-4" /></button><div className="px-4 font-bold">{MONTHS[month]} {year} <ChevronDown className="inline h-4 w-4" /></div><div className="flex-1" /><button className="rounded-lg px-4 py-2 text-sm font-bold" style={panel()}>Month <ChevronDown className="inline h-3 w-3" /></button><button onClick={exportCSV} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold" style={panel()}><Download className="h-4 w-4" /> Export</button></div>
            <div className="overflow-hidden" style={panel()}><div className="grid grid-cols-7 border-b" style={{ borderColor:'rgba(255,255,255,.075)' }}>{DAYS.map(d => <div key={d} className="py-3 text-center text-xs font-black">{d}</div>)}</div><div className="grid grid-cols-7">{cells.slice(0,35).map((d,i)=>{ const k=d?keyFor(d):''; const e=d?entries[k]:null; const p=e?e.revenue-e.expenses:0; return <button key={i} disabled={!d} onClick={()=>d&&openPL(d)} className="h-[84px] border-r border-b p-3 text-left transition hover:bg-white/[.03]" style={{ borderColor:'rgba(255,255,255,.075)', background: d ? (p>0?'var(--accent-faint)':p<0?'rgba(255,77,77,.08)':'rgba(255,255,255,.01)') : 'transparent', outline: d===7?'1px solid var(--accent)':'none' }}><p className="text-sm">{d || ''}</p>{d && <><p className="mt-2 text-base font-black" style={{ color:p>0?'var(--accent)':p<0?'#ff4d4d':'white' }}>{p===0?'$0':signed(p)}</p><p className="text-xs" style={{ color:'var(--text-secondary)' }}>{events.filter(ev=>ev.event_date===k).length} deals</p></>}</button>})}</div></div>
            <div className="mt-4 flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[var(--accent)]"/> Profit (&gt;$0)</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#ff4d4d]"/> Loss (&lt;$0)</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-gray-500"/> Break-even ($0)</span></div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[.75fr_1.25fr]"><div className="p-5" style={panel()}><h3 className="mb-5 font-black">Profit / Loss Insights</h3>{[`Your highest profit day was ${high ? new Date(high.date+'T12:00:00').toLocaleDateString('en-US',{ month:'short', day:'numeric' }) : 'not logged'} with ${high ? money(high.revenue-high.expenses) : '$0'}.`, `You had ${lossDays} loss days this month.`, `Net profit is ${totalProfit >= 0 ? 'up' : 'down'} this month.`].map((t,i)=><p key={i} className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>{t}</p>)}</div><div className="p-5" style={panel()}><h3 className="mb-3 font-black">Daily Net Profit Trend</h3><div className="h-48"><ResponsiveContainer><AreaChart data={trend}><CartesianGrid stroke="rgba(255,255,255,.07)" vertical={false}/><XAxis dataKey="day" tick={{ fill:'#7d837f', fontSize: 10 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill:'#7d837f', fontSize: 10 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ background:'#0d0f12', border:'1px solid rgba(255,255,255,.08)', borderRadius:8 }}/><Area dataKey="profit" stroke="var(--accent)" fill="var(--accent-muted)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></div></div>
          </>
        )}
      </div>

      {plModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,.8)' }}><div className="w-full max-w-sm p-5" style={panel({ background:'#0c0e11' })}><div className="mb-4 flex justify-between"><h3 className="font-black">Daily P&L Entry</h3><button onClick={()=>setPLModal(null)}><X className="h-4 w-4"/></button></div><input className="input-base mb-3" placeholder="Revenue" type="number" value={plModal.revenue} onChange={e=>setPLModal(m=>m?{...m,revenue:e.target.value}:m)}/><input className="input-base mb-3" placeholder="Expenses" type="number" value={plModal.expenses} onChange={e=>setPLModal(m=>m?{...m,expenses:e.target.value}:m)}/><input className="input-base mb-4" placeholder="Notes" value={plModal.notes} onChange={e=>setPLModal(m=>m?{...m,notes:e.target.value}:m)}/><div className="flex gap-2"><button onClick={()=>setPLModal(null)} className="flex-1 rounded-lg py-2" style={panel()}>Cancel</button><button onClick={savePL} disabled={saving} className="flex-1 rounded-lg py-2 font-bold" style={{ background:'var(--accent)', color:'#031008' }}>{saving?'Saving…':'Save'}</button></div></div></div>}
      {eventModal && <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,.8)' }}><div className="w-full max-w-sm p-5" style={panel({ background:'#0c0e11' })}><div className="mb-4 flex justify-between"><h3 className="font-black">{eventModal.id?'Edit Event':'Add Event'}</h3><button onClick={()=>setEventModal(null)}><X className="h-4 w-4"/></button></div><label className="mb-2 block text-xs font-bold" style={{color:'var(--text-secondary)'}}>Date</label><input className="input-base mb-3" type="date" value={eventModal.date} onChange={e=>setEventModal(m=>m?{...m,date:e.target.value}:m)}/><input className="input-base mb-3" placeholder="Event title" value={eventModal.title} onChange={e=>setEventModal(m=>m?{...m,title:e.target.value}:m)}/><input className="input-base mb-3" placeholder="Description" value={eventModal.description} onChange={e=>setEventModal(m=>m?{...m,description:e.target.value}:m)}/><label className="mb-3 flex gap-2 text-sm"><input type="checkbox" checked={eventModal.all_day} onChange={e=>setEventModal(m=>m?{...m,all_day:e.target.checked}:m)}/> All day</label>{!eventModal.all_day&&<div className="mb-3 grid grid-cols-2 gap-2"><input className="input-base" type="time" value={eventModal.start_time} onChange={e=>setEventModal(m=>m?{...m,start_time:e.target.value}:m)}/><input className="input-base" type="time" value={eventModal.end_time} onChange={e=>setEventModal(m=>m?{...m,end_time:e.target.value}:m)}/></div>}<div className="mb-4 flex gap-2">{EVENT_COLORS.map(c=><button key={c} onClick={()=>setEventModal(m=>m?{...m,color:c}:m)} className="h-7 w-7 rounded-full" style={{ background:c, outline:eventModal.color===c?'2px solid white':'none' }}/>)}</div><div className="flex gap-2">{eventModal.id&&<button onClick={deleteEvent} className="rounded-lg px-3 py-2" style={{ color:'#ff4d4d', background:'rgba(255,77,77,.1)' }}>Delete</button>}<button onClick={()=>setEventModal(null)} className="flex-1 rounded-lg py-2" style={panel()}>Cancel</button><button onClick={saveEvent} disabled={saving || !eventModal.title.trim()} className="flex-1 rounded-lg py-2 font-bold" style={{ background:'var(--accent)', color:'#031008' }}>{saving?'Saving…':'Save'}</button></div></div></div>}
    </div>
  )
}
