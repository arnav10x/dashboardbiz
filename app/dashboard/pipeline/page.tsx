'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import {
  Plus, X, ArrowRight, DollarSign, TrendingUp, Target, ChevronRight, BarChart2, Filter, Grid2X2, Rows3, Search, MessageSquare, Pencil, MoreHorizontal, Trophy, Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Stage = 'new_lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'

const STAGE_CFG: Record<Stage, { label: string; color: string; accent: string; bg: string; actionLabel: string }> = {
  new_lead:  { label: 'New Lead',      color: '#60a5fa', accent: 'rgba(96,165,250,0.22)',  bg: 'rgba(96,165,250,0.07)',  actionLabel: 'Added'     },
  contacted: { label: 'Contacted',     color: '#a78bfa', accent: 'rgba(167,139,250,0.22)', bg: 'rgba(167,139,250,0.07)', actionLabel: 'Contacted' },
  qualified: { label: 'Qualified',     color: '#06b6d4', accent: 'rgba(6,182,212,0.22)',   bg: 'rgba(6,182,212,0.07)',   actionLabel: 'Qualified' },
  proposal:  { label: 'Proposal Sent', color: '#f59e0b', accent: 'rgba(245,158,11,0.22)',  bg: 'rgba(245,158,11,0.07)',  actionLabel: 'Sent'      },
  won:       { label: 'Won',           color: '#22c55e', accent: 'rgba(34,197,94,0.22)',   bg: 'rgba(34,197,94,0.07)',   actionLabel: 'Won'       },
  lost:      { label: 'Lost',          color: '#f43f5e', accent: 'rgba(244,63,94,0.22)',   bg: 'rgba(244,63,94,0.07)',   actionLabel: 'Lost'      },
}
const STAGES: Stage[]        = ['new_lead', 'contacted', 'qualified', 'proposal', 'won', 'lost']
const KANBAN_STAGES: Stage[] = ['new_lead', 'contacted', 'qualified', 'proposal', 'won']

const AVATAR_COLORS = [
  { bg: 'rgba(96,165,250,0.18)',  text: '#60a5fa', border: 'rgba(96,165,250,0.35)'  },
  { bg: 'rgba(167,139,250,0.18)', text: '#a78bfa', border: 'rgba(167,139,250,0.35)' },
  { bg: 'rgba(245,158,11,0.18)',  text: '#f59e0b', border: 'rgba(245,158,11,0.35)'  },
  { bg: 'rgba(34,197,94,0.18)',   text: '#22c55e', border: 'rgba(34,197,94,0.35)'   },
  { bg: 'rgba(244,63,94,0.18)',   text: '#f43f5e', border: 'rgba(244,63,94,0.35)'   },
  { bg: 'rgba(6,182,212,0.18)',   text: '#06b6d4', border: 'rgba(6,182,212,0.35)'   },
  { bg: 'rgba(234,179,8,0.18)',   text: '#eab308', border: 'rgba(234,179,8,0.35)'   },
  { bg: 'rgba(249,115,22,0.18)',  text: '#f97316', border: 'rgba(249,115,22,0.35)'  },
]

function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${n}`
}

function fmtDate(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ageDays(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

interface Lead {
  id: string
  name: string
  company?: string
  value?: number
  stage: Stage
  notes?: string
  contact_email?: string
  contact_phone?: string
  follow_up_date?: string
  created_at: string
}

// ── Avatar chip ────────────────────────────────────────────────────────────────
function Avatar({ id, name, size = 36 }: { id: string; name: string; size?: number }) {
  const ac = avatarColor(id)
  return (
    <div className="flex items-center justify-center rounded-full flex-shrink-0 text-xs font-black"
      style={{
        width: size, height: size,
        background: ac.bg, color: ac.text,
        border: `1.5px solid ${ac.border}`,
        fontSize: size * 0.33,
      }}>
      {initials(name)}
    </div>
  )
}

// ── Kanban lead card ───────────────────────────────────────────────────────────
function LeadCard({ lead, selected, onSelect }: {
  lead: Lead; selected: boolean; onSelect: () => void
}) {
  const cfg = STAGE_CFG[lead.stage]
  return (
    <div
      onClick={onSelect}
      className="cursor-pointer mb-2 transition-all"
      style={{
        borderRadius: 7,
        background: selected ? cfg.bg : 'var(--bg-raised)',
        border: `1px solid ${selected ? cfg.color : 'var(--border)'}`,
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = cfg.color + '60' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div className="p-3 flex flex-col gap-2">
        {/* Top: avatar + name + value */}
        <div className="flex items-center gap-2.5">
          <Avatar id={lead.id} name={lead.name} size={34} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{lead.name}</p>
            {lead.company && (
              <p className="text-[11px] truncate leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{lead.company}</p>
            )}
          </div>
          {lead.value ? (
            <span className="text-xs font-black flex-shrink-0 tabular-nums" style={{ color: 'var(--accent)' }}>
              {fmt(lead.value)}
            </span>
          ) : null}
        </div>
        {/* Bottom: action date */}
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {cfg.actionLabel} {fmtDate(lead.created_at)}
        </p>
      </div>
    </div>
  )
}

// ── Lead detail panel ─────────────────────────────────────────────────────────
function LeadPanel({ lead, onClose, onMove, onDelete, onSave }: {
  lead: Lead
  onClose: () => void
  onMove: (id: string, stage: Stage) => void
  onDelete: (id: string) => void
  onSave: (id: string, patch: Partial<Lead>) => Promise<void>
}) {
  const [notes, setNotes]       = useState(lead.notes || '')
  const [email, setEmail]       = useState(lead.contact_email || '')
  const [phone, setPhone]       = useState(lead.contact_phone || '')
  const [followUp, setFollowUp] = useState(lead.follow_up_date?.split('T')[0] || '')
  const [status, setStatus]     = useState<'idle' | 'saving' | 'saved'>('idle')

  const cfg   = STAGE_CFG[lead.stage]
  const dirty = notes !== (lead.notes || '') || email !== (lead.contact_email || '') ||
    phone !== (lead.contact_phone || '') || followUp !== (lead.follow_up_date?.split('T')[0] || '')

  const save = async () => {
    setStatus('saving')
    await onSave(lead.id, { notes, contact_email: email, contact_phone: phone, follow_up_date: followUp || undefined })
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 1800)
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-[360px] h-full flex flex-col"
        style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-strong)', boxShadow: '-24px 0 60px rgba(0,0,0,0.45)' }}>

        <div className="flex items-start justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar id={lead.id} name={lead.name} size={42} />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
              <h3 className="text-lg font-black leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{lead.name}</h3>
              {lead.company && <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{lead.company}</p>}
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center hover:bg-white/[0.06] transition-colors flex-shrink-0" style={{ borderRadius: 7, color: 'var(--text-muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5" style={{ borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Deal Value</p>
              <p className="text-2xl font-black tabular-nums" style={{ color: lead.value ? 'var(--accent)' : 'var(--text-muted)' }}>
                {lead.value ? fmt(lead.value) : '—'}
              </p>
            </div>
            <div className="p-3.5" style={{ borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Age</p>
              <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>{ageDays(lead.created_at)}d</p>
            </div>
          </div>

          {/* Move stage */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Move Stage</p>
            <div className="space-y-1.5">
              {STAGES.filter(s => s !== lead.stage).map(s => {
                const sc = STAGE_CFG[s]
                return (
                  <button key={s} onClick={() => onMove(lead.id, s)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-all hover:opacity-90"
                    style={{ borderRadius: 7, background: sc.bg, border: `1px solid ${sc.accent}` }}>
                    <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: sc.color }} />
                    <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
                    <ArrowRight className="h-3 w-3 ml-auto flex-shrink-0 opacity-50" style={{ color: sc.color }} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Contact</p>
            <div className="space-y-2">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address"
                className="w-full text-sm px-3.5 py-2.5 outline-none" style={{borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-primary)'}} />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number"
                className="w-full text-sm px-3.5 py-2.5 outline-none" style={{borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-primary)'}} />
            </div>
          </div>

          {/* Follow-up */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Follow-up Date</p>
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 outline-none" style={{borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark'}} />
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'var(--text-muted)' }}>Notes</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="Meeting context, objections, next steps..."
              className="w-full text-sm resize-none outline-none p-3.5" style={{borderRadius: 7, background: 'var(--bg-raised)', border: '1px solid var(--border)', color: 'var(--text-primary)', lineHeight: 1.6}} />
          </div>

          {dirty && (
            <button onClick={save}
              className="w-full py-2 text-xs font-bold transition-all"
              style={{ borderRadius: 7, background: status === 'saved' ? 'rgba(34,197,94,0.15)' : 'var(--accent)', color: status === 'saved' ? 'var(--accent)' : 'white' }}>
              {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save changes'}
            </button>
          )}
        </div>

        <div className="p-5" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { onDelete(lead.id); onClose() }}
            className="w-full py-2 text-xs font-bold transition-all hover:opacity-90"
            style={{ borderRadius: 7, background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.18)' }}>
            Remove from pipeline
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Add lead modal ─────────────────────────────────────────────────────────────
function AddLeadModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: Partial<Lead>) => void }) {
  const [name, setName]       = useState('')
  const [company, setCompany] = useState('')
  const [value, setValue]     = useState('')
  const [stage, setStage]     = useState<Stage>('new_lead')
  const [email, setEmail]     = useState('')
  const [notes, setNotes]     = useState('')

  const submit = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), company: company.trim() || undefined, value: Number(value) || undefined,
      stage, contact_email: email.trim() || undefined, notes: notes.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md overflow-hidden"
        style={{ borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Add Lead</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>If it's not tracked, it doesn't exist</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center hover:bg-white/[0.06]" style={{ borderRadius: 7, color: 'var(--text-muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Contact Name <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input className="input-base" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Company</label>
              <input className="input-base" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Deal Value ($)</label>
              <input type="number" className="input-base" placeholder="0" value={value} onChange={e => setValue(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" className="input-base" placeholder="email@co.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Stage</label>
              <select className="input-base" value={stage} onChange={e => setStage(e.target.value as Stage)}>
                {STAGES.map(s => <option key={s} value={s}>{STAGE_CFG[s].label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes</label>
            <textarea className="input-base" rows={2} placeholder="Source, context, referral..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2 text-sm font-semibold"
            style={{ borderRadius: 7, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}>
            Cancel
          </button>
          <button onClick={submit} disabled={!name.trim()} className="flex-1 py-2 text-sm font-bold disabled:opacity-40 transition-opacity"
            style={{ borderRadius: 7, background: 'var(--accent)', color: 'white' }}>
            Add lead
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [leads, setLeads]             = useState<Lead[]>([])
  const [loading, setLoading]         = useState(true)
  const [showAdd, setShowAdd]         = useState(false)
  const [selected, setSelected]       = useState<Lead | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [tableTab, setTableTab]       = useState<'all' | 'my' | 'archived'>('all')
  const [viewMode, setViewMode]       = useState<'board' | 'table'>('board')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all')
  const [visibleColumns, setVisibleColumns] = useState({ value: true, activity: true, nextAction: true, owner: true })
  const [showColumns, setShowColumns] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ws } = await supabase.from('workspaces').select('id, name').eq('owner_id', user.id).maybeSingle()
      if (ws?.id) setWorkspaceId(ws.id)
      if (ws?.name) setWorkspaceName(ws.name)
      const { data } = await supabase.from('pipeline_leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setLeads((data || []).map((l: any) => ({ ...l, stage: (l.stage || l.status || 'new_lead') as Stage })))
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (selected) {
      const fresh = leads.find(l => l.id === selected.id)
      if (fresh) setSelected(fresh)
      else setSelected(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads])

  const handleAdd = async (data: Partial<Lead>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: lead } = await supabase.from('pipeline_leads').insert({
      name: data.name, company: data.company, value: data.value || null,
      stage: data.stage, status: data.stage,
      notes: data.notes || null, contact_email: data.contact_email || null,
      user_id: user.id, workspace_id: workspaceId,
    }).select().single()
    if (lead) setLeads(prev => [{ ...lead, stage: (lead.stage || 'new_lead') as Stage }, ...prev])
    setShowAdd(false)
  }

  const syncFollowUpEvent = async (lead: Lead, followUpDate: string | null | undefined) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('calendar_events').select('id').eq('lead_id', lead.id).maybeSingle()
    if (!followUpDate) {
      if (existing) await supabase.from('calendar_events').delete().eq('lead_id', lead.id)
      return
    }
    const cfg = STAGE_CFG[lead.stage]
    const title = `Follow up: ${lead.name}${lead.company ? ` (${lead.company})` : ''}`
    const description = `Stage: ${cfg.label}${lead.notes ? `\n\n${lead.notes}` : ''}`
    if (existing) {
      await supabase.from('calendar_events').update({ title, description, event_date: followUpDate, color: cfg.color }).eq('id', existing.id)
    } else {
      await supabase.from('calendar_events').insert({ user_id: user.id, lead_id: lead.id, title, description, event_date: followUpDate, all_day: true, color: cfg.color, source: 'pipeline' })
    }
  }

  const handleMove = async (id: string, stage: Stage) => {
    const supabase = createClient()
    await supabase.from('pipeline_leads').update({ stage, status: stage }).eq('id', id)
    const updated = leads.map(l => l.id === id ? { ...l, stage } : l)
    setLeads(updated)
    const lead = updated.find(l => l.id === id)
    if (lead?.follow_up_date) await syncFollowUpEvent(lead, lead.follow_up_date)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('pipeline_leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const handleSave = async (id: string, patch: Partial<Lead>) => {
    const supabase = createClient()
    await supabase.from('pipeline_leads').update(patch).eq('id', id)
    const updated = leads.map(l => l.id === id ? { ...l, ...patch } : l)
    setLeads(updated)
    if ('follow_up_date' in patch) {
      const lead = updated.find(l => l.id === id)
      if (lead) await syncFollowUpEvent(lead, patch.follow_up_date || null)
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const active  = leads.filter(l => l.stage !== 'lost')
  const won     = leads.filter(l => l.stage === 'won')
  const lost    = leads.filter(l => l.stage === 'lost')
  const archived = leads.filter(l => l.stage === 'lost')

  const totalPipelineVal = active.reduce((s, l) => s + (l.value || 0), 0)
  const totalWonVal      = won.reduce((s, l) => s + (l.value || 0), 0)
  const winRate          = won.length + lost.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : null
  const leadsWithVal     = active.filter(l => l.value)
  const avgDealVal       = leadsWithVal.length > 0 ? Math.round(totalPipelineVal / leadsWithVal.length) : null

  // Pipeline growth: ratio of leads added in last 30d vs prior 30d
  const now = Date.now()
  const last30 = leads.filter(l => now - new Date(l.created_at).getTime() < 30 * 86400000).length
  const prev30 = leads.filter(l => {
    const age = now - new Date(l.created_at).getTime()
    return age >= 30 * 86400000 && age < 60 * 86400000
  }).length
  const growthPct = prev30 > 0 ? Math.round(((last30 - prev30) / prev30) * 100) : last30 > 0 ? 100 : 0

  const stats = [
    { label: 'Total Pipeline Value', value: totalPipelineVal > 0 ? fmt(totalPipelineVal) : '$0',     sub: `${active.length} active deals`,          color: '#60a5fa', icon: DollarSign  },
    { label: 'Pipeline Growth',      value: `${growthPct > 0 ? '+' : ''}${growthPct}%`,              sub: 'vs previous 30 days',                    color: '#22c55e', icon: TrendingUp  },
    { label: 'Win Rate',             value: winRate !== null ? `${winRate}%` : '—',                   sub: `${won.length} won · ${lost.length} lost`, color: '#a78bfa', icon: Target      },
    { label: 'Avg Deal Value',       value: avgDealVal ? fmt(avgDealVal) : '—',                      sub: `from ${leadsWithVal.length} deals`,       color: '#f59e0b', icon: BarChart2   },
    { label: 'Total Won Value',      value: totalWonVal > 0 ? fmt(totalWonVal) : '$0',               sub: `${won.length} closed deals`,              color: '#22c55e', icon: TrendingUp  },
  ]

  // Display rows: search, filter, and tabs now drive both board and table.
  const searchLower = searchQuery.trim().toLowerCase()
  const filteredLeads = leads.filter(l => {
    const matchesSearch = !searchLower || l.name.toLowerCase().includes(searchLower) || (l.company || '').toLowerCase().includes(searchLower)
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter
    const matchesTab = tableTab === 'archived' ? l.stage === 'lost' : l.stage !== 'lost'
    return matchesSearch && matchesStage && matchesTab
  })
  const boardLeads = filteredLeads.filter(l => l.stage !== 'lost')
  const tableLeads = filteredLeads

  // Sidebar stats
  const advancedLeads = leads.filter(l => ['contacted','qualified','proposal','won'].includes(l.stage))
  const healthPct   = leads.length > 0 ? Math.round((advancedLeads.length / leads.length) * 100) : 0
  const healthColor = healthPct >= 60 ? '#22c55e' : healthPct >= 30 ? '#f59e0b' : '#f43f5e'
  const healthLabel = healthPct >= 60 ? 'Healthy' : healthPct >= 30 ? 'Moderate' : 'Needs Work'
  const r = 36, circ = 2 * Math.PI * r
  const offset = circ * (1 - healthPct / 100)

  const staleLeads = active.filter(l => ageDays(l.created_at) >= 7).length
  const actions: { icon: string; text: string; color: string }[] = []
  if (staleLeads > 0) actions.push({ icon: '⚡', text: `Follow up with ${staleLeads} stale lead${staleLeads > 1 ? 's' : ''}`, color: '#f43f5e' })
  const newLeadCount = leads.filter(l => l.stage === 'new_lead').length
  if (newLeadCount > 0) actions.push({ icon: '📞', text: `Reach out to ${newLeadCount} new lead${newLeadCount > 1 ? 's' : ''}`, color: '#60a5fa' })
  const proposalCount = leads.filter(l => l.stage === 'proposal').length
  if (proposalCount > 0) actions.push({ icon: '💼', text: `${proposalCount} proposal${proposalCount > 1 ? 's' : ''} awaiting response`, color: '#f59e0b' })
  if (actions.length === 0) actions.push({ icon: '✅', text: 'Pipeline looks healthy — keep it moving!', color: '#22c55e' })
  while (actions.length < 3) actions.push({ icon: '📈', text: `${won.length} deal${won.length !== 1 ? 's' : ''} won · ${winRate ?? 0}% win rate`, color: 'var(--accent)' })

  return (
    <div className="flex flex-col h-full fo-page">
      <TopBar title="Pipeline" workspaceName={workspaceName} hasData={leads.length > 0} showGreeting />

      <div className="flex-1 overflow-y-auto px-6 py-5 animate-in">
        <div className="relative flex items-end justify-between mb-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Pipeline</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track leads, follow up, and close more deals.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." className="h-9 w-52 pl-9 pr-3 text-xs outline-none fo-card-2" style={{ color: 'var(--text-primary)' }} />
            </div>
            <button onClick={() => setShowFilters(v => !v)} className="h-9 px-4 flex items-center gap-2 text-xs font-bold fo-card-2" style={{ color: showFilters || stageFilter !== 'all' ? 'var(--accent)' : 'var(--text-secondary)' }}>
              <Filter className="h-4 w-4" /> Filters
            </button>
            <div className="flex overflow-hidden fo-card-2">
              <button onClick={() => setViewMode('table')} className="h-9 w-9 flex items-center justify-center" style={{ background: viewMode === 'table' ? 'var(--accent)' : 'rgba(34,197,94,.08)', color: viewMode === 'table' ? '#06140b' : 'var(--accent)' }}><Rows3 className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('board')} className="h-9 w-9 flex items-center justify-center" style={{ background: viewMode === 'board' ? 'var(--accent)' : 'rgba(34,197,94,.08)', color: viewMode === 'board' ? '#06140b' : 'var(--accent)' }}><Grid2X2 className="h-4 w-4" /></button>
            </div>
            <button onClick={() => setShowAdd(true)} className="h-9 px-5 flex items-center gap-2 rounded-lg text-xs font-black fo-green-btn">
              <Plus className="h-4 w-4" /> Add Lead
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="absolute right-24 top-[74px] z-30 w-56 rounded-xl p-3 fo-card" style={{ boxShadow: '0 20px 60px rgba(0,0,0,.45)' }}>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Filter stage</p>
            <button onClick={() => { setStageFilter('all'); setShowFilters(false) }} className="mb-1 w-full rounded-md px-3 py-2 text-left text-xs font-bold" style={{ color: stageFilter === 'all' ? 'var(--accent)' : 'var(--text-secondary)', background: stageFilter === 'all' ? 'rgba(34,197,94,.10)' : 'transparent' }}>All active stages</button>
            {STAGES.map(s => <button key={s} onClick={() => { setStageFilter(s); if (s === 'lost') setTableTab('archived'); else if (tableTab === 'archived') setTableTab('all'); setShowFilters(false) }} className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-bold" style={{ color: stageFilter === s ? STAGE_CFG[s].color : 'var(--text-secondary)', background: stageFilter === s ? STAGE_CFG[s].bg : 'transparent' }}><span className="h-2 w-2 rounded-full" style={{ background: STAGE_CFG[s].color }} />{STAGE_CFG[s].label}</button>)}
          </div>
        )}

        {(stageFilter !== 'all' || searchQuery.trim()) && (
          <div className="mb-4 flex items-center justify-between rounded-lg px-4 py-2 text-xs font-bold" style={{ background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.18)', color: 'var(--text-secondary)' }}>
            <span>Showing {filteredLeads.length} lead{filteredLeads.length === 1 ? '' : 's'}{stageFilter !== 'all' ? ` in ${STAGE_CFG[stageFilter].label}` : ''}{searchQuery.trim() ? ` matching \"${searchQuery.trim()}\"` : ''}</span>
            <button onClick={() => { setStageFilter('all'); setSearchQuery('') }} style={{ color: 'var(--accent)' }}>Clear filters</button>
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 mb-5">
          {stats.map((s, idx) => (
            <div key={s.label} className="fo-card p-4 min-h-[108px]">
              <div className="flex items-start justify-between mb-3">
                <p className="fo-kicker">{idx === 0 ? 'Total Pipeline Value' : s.label}</p>
                {idx === 1 ? <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent)' }} /> : idx === 4 ? null : <s.icon className="h-4 w-4" style={{ color: s.color }} />}
              </div>
              <p className="text-2xl font-black fo-num" style={{ color: idx === 1 ? 'var(--accent)' : 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
              {idx === 0 && <div className="mt-3 fo-soft-line"><span style={{ width: '55%' }} /></div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-5" style={{ display: viewMode === 'board' ? 'grid' : 'none' }}>
          {KANBAN_STAGES.map(stage => {
            const cfg = STAGE_CFG[stage]
            const stageLeads = boardLeads.filter(l => l.stage === stage)
            const sv = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0)
            return (
              <div key={stage} className="fo-card overflow-hidden min-h-[310px] flex flex-col">
                <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                    <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{cfg.label}</p>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{stageLeads.length} Leads</span><span>{fmt(sv)}</span>
                  </div>
                </div>
                <div className="p-2 flex-1 space-y-2 overflow-y-auto">
                  {stageLeads.length === 0 && stage === 'won' ? (
                    <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center px-4">
                      <Trophy className="h-9 w-9 mb-3" style={{ color: 'var(--text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>No won deals yet.</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Keep going!</p>
                    </div>
                  ) : stageLeads.map(lead => (
                    <div key={lead.id} onClick={() => setSelected(selected?.id === lead.id ? null : lead)} className="cursor-pointer p-3 fo-card-2 hover:opacity-90 transition-opacity">
                      <div className="flex items-center gap-2">
                        <Avatar id={lead.id} name={lead.name} size={26} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black truncate" style={{ color: 'var(--text-primary)' }}>{lead.name}</p>
                          <p className="text-xs fo-num" style={{ color: 'var(--text-secondary)' }}>{lead.value ? fmt(lead.value) : '$0'}</p>
                        </div>
                      </div>
                      <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{cfg.actionLabel} {fmtDate(lead.created_at)}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAdd(true)} className="m-2 py-2 flex items-center justify-center gap-1 text-xs font-medium hover:bg-white/[.04] rounded-md" style={{ color: 'var(--text-muted)' }}>
                  <Plus className="h-3.5 w-3.5" /> Add Lead
                </button>
              </div>
            )
          })}
        </div>

        <div className="fo-card overflow-hidden" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
          <div className="flex items-center gap-6 px-4 h-12 border-b" style={{ borderColor: 'var(--border)' }}>
            {(['all','my','archived'] as const).map(t => (
              <button key={t} onClick={() => setTableTab(t)} className="h-full text-sm font-bold relative" style={{ color: tableTab === t ? 'var(--accent)' : 'var(--text-muted)' }}>
                {t === 'all' ? 'All Leads' : t === 'my' ? 'My Leads' : 'Archived'}
                {tableTab === t && <span className="absolute left-0 right-0 bottom-0 h-0.5 rounded-full" style={{ background: 'var(--accent)' }} />}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search leads..." className="h-9 w-56 pl-9 pr-3 text-xs outline-none fo-card-2" style={{ color: 'var(--text-primary)' }} />
              </div>
              <div className="relative">
                <button onClick={() => setShowColumns(v => !v)} className="h-9 px-3 fo-card-2 text-xs font-bold" style={{ color: showColumns ? 'var(--accent)' : 'var(--text-secondary)' }}>Columns</button>
                {showColumns && <div className="absolute right-0 top-10 z-30 w-44 rounded-xl p-3 fo-card" style={{ boxShadow: '0 20px 60px rgba(0,0,0,.45)' }}>{Object.entries(visibleColumns).map(([key, val]) => <label key={key} className="mb-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><input type="checkbox" checked={val} onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))} />{key.replace(/([A-Z])/g, ' $1')}</label>)}</div>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-[1.4fr_.7fr_.7fr_1fr_1fr_.8fr_.7fr] px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
            <span>Lead</span><span>Stage</span><span>{visibleColumns.value ? 'Value' : ''}</span><span>{visibleColumns.activity ? 'Last Activity' : ''}</span><span>{visibleColumns.nextAction ? 'Next Action' : ''}</span><span>{visibleColumns.owner ? 'Owner' : ''}</span><span>Actions</span>
          </div>
          {tableLeads.slice(0, 7).map(lead => {
            const cfg = STAGE_CFG[lead.stage]
            return (
              <div key={lead.id} onClick={() => setSelected(selected?.id === lead.id ? null : lead)} className="grid grid-cols-[1.4fr_.7fr_.7fr_1fr_1fr_.8fr_.7fr] items-center px-4 py-3 text-xs cursor-pointer hover:bg-white/[.025]" style={{ borderBottom: '1px solid var(--border)' }}>
                <div><p className="font-bold" style={{ color: 'var(--text-primary)' }}>{lead.name}</p><p style={{ color: 'var(--text-muted)' }}>{lead.company || 'Prospect'}</p></div>
                <span className="w-fit px-2 py-1 rounded-md font-bold" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.accent}` }}>{cfg.label}</span>
                <span className="fo-num" style={{ color: 'var(--text-primary)' }}>{visibleColumns.value ? (lead.value ? fmt(lead.value) : '$0') : ''}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{visibleColumns.activity ? <>{fmtDate(lead.created_at)}<br/><span style={{ color: 'var(--text-muted)' }}>{cfg.actionLabel}</span></> : null}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{visibleColumns.nextAction ? <>{lead.follow_up_date ? 'Follow up' : 'No follow up'}<br/><span style={{ color: 'var(--accent)' }}>{lead.follow_up_date ? fmtDate(lead.follow_up_date) : 'Set date'}</span></> : null}</span>
                {visibleColumns.owner ? <Avatar id={lead.id} name={lead.name} size={28} /> : <span />}
                <span className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}><MessageSquare className="h-4 w-4"/><Pencil className="h-4 w-4"/><MoreHorizontal className="h-4 w-4"/></span>
              </div>
            )
          })}
          <div className="flex items-center justify-between px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Showing 1 to {Math.min(tableLeads.length, 7)} of {tableLeads.length} leads</span>
            <div className="flex items-center gap-3"><ChevronRight className="h-4 w-4 rotate-180"/><span className="px-2 py-1 rounded-md" style={{ background: 'rgba(34,197,94,.12)', color: 'var(--accent)' }}>1</span><span>2</span><ChevronRight className="h-4 w-4"/></div>
          </div>
        </div>
      </div>

      {selected && (
        <LeadPanel lead={selected} onClose={() => setSelected(null)}
          onMove={handleMove} onDelete={handleDelete} onSave={handleSave} />
      )}
      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  )
}
