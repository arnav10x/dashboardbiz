'use client'
import { useState, useEffect, useRef } from 'react'
import { Bell, Target, CheckSquare, Flame, Users, X, TrendingUp, Clock, UserPlus, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'warning' | 'info' | 'success' | 'urgent'
  title: string
  body: string
  icon: React.ReactNode
  time: string
  metadata?: any
  dbId?: string
}

function computeNotifications(data: {
  revenue: number
  revenueTarget: number
  hasRevenueData: boolean
  tasks: { is_completed: boolean; created_at: string }[]
  leads: { created_at: string; stage: string }[]
  taskStreak: number
}): Notification[] {
  const notes: Notification[] = []
  const now = new Date()

  // Goal pacing
  if (data.hasRevenueData && data.revenueTarget > 0 && data.revenue < data.revenueTarget) {
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const paceNeeded = (data.revenueTarget / daysInMonth) * dayOfMonth
    const gap = Math.round(paceNeeded - data.revenue)
    const pct = Math.round((data.revenue / data.revenueTarget) * 100)
    if (gap > 0) {
      notes.push({
        id: 'goal-pacing',
        type: pct < 50 ? 'urgent' : 'warning',
        title: 'Behind revenue pace',
        body: `You're ${pct}% to goal. Need $${gap.toLocaleString()} more to stay on pace for $${data.revenueTarget.toLocaleString()}.`,
        icon: <Target className="h-3.5 w-3.5" />,
        time: 'Live',
      })
    } else if (pct >= 100) {
      notes.push({
        id: 'goal-hit',
        type: 'success',
        title: 'Monthly goal achieved!',
        body: `Revenue at $${data.revenue.toLocaleString()} — you've hit your $${data.revenueTarget.toLocaleString()} target.`,
        icon: <TrendingUp className="h-3.5 w-3.5" />,
        time: 'Live',
      })
    }
  }

  // Overdue tasks (not completed, created >1 day ago)
  const overdue = data.tasks.filter(t => {
    if (t.is_completed) return false
    const age = (now.getTime() - new Date(t.created_at).getTime()) / 86400000
    return age > 1
  })
  if (overdue.length > 0) {
    notes.push({
      id: 'overdue-tasks',
      type: 'warning',
      title: `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
      body: `You have ${overdue.length} task${overdue.length > 1 ? 's' : ''} that ${overdue.length > 1 ? 'were' : 'was'} due yesterday. Check your task list.`,
      icon: <CheckSquare className="h-3.5 w-3.5" />,
      time: 'Overdue',
    })
  }

  // Pending tasks today
  const pendingToday = data.tasks.filter(t => !t.is_completed)
  const doneToday = data.tasks.filter(t => t.is_completed)
  if (pendingToday.length > 0 && doneToday.length === 0) {
    notes.push({
      id: 'tasks-pending',
      type: 'info',
      title: `${pendingToday.length} tasks waiting`,
      body: `You haven't completed any tasks yet today. Get moving on your non-negotiables.`,
      icon: <Clock className="h-3.5 w-3.5" />,
      time: 'Today',
    })
  }

  // Streak tracking
  if (data.taskStreak >= 7) {
    notes.push({
      id: 'streak',
      type: 'success',
      title: `${data.taskStreak}-day execution streak! 🔥`,
      body: `You've completed tasks ${data.taskStreak} days in a row. Keep the momentum going.`,
      icon: <Flame className="h-3.5 w-3.5" />,
      time: `${data.taskStreak}d`,
    })
  } else if (data.taskStreak > 0) {
    notes.push({
      id: 'streak-small',
      type: 'info',
      title: `${data.taskStreak}-day streak`,
      body: `${7 - data.taskStreak} more days to hit your 7-day streak badge.`,
      icon: <Flame className="h-3.5 w-3.5" />,
      time: `${data.taskStreak}d`,
    })
  }

  // Pipeline quiet
  const recentLeads = data.leads.filter(l => {
    const age = (now.getTime() - new Date(l.created_at).getTime()) / 86400000
    return age <= 7
  })
  if (data.leads.length > 0 && recentLeads.length === 0) {
    notes.push({
      id: 'pipeline-quiet',
      type: 'warning',
      title: 'Pipeline activity dropped',
      body: 'No new leads added in the last 7 days. Your pipeline needs fresh outreach.',
      icon: <Users className="h-3.5 w-3.5" />,
      time: '7d quiet',
    })
  }

  return notes
}

const TYPE_STYLES = {
  urgent: { bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', icon: '#f43f5e', dot: '#f43f5e' },
  warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '#f59e0b', dot: '#f59e0b' },
  info: { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', icon: '#60a5fa', dot: '#60a5fa' },
  success: { bg: 'var(--accent-faint)', border: 'var(--accent-ring)', icon: 'var(--accent)', dot: 'var(--accent)' },
}

const PATCH_ANNOUNCEMENTS = [
  {
    id: 'patch-2026-05-team-dopamine',
    title: 'Patch update: team invites + polish',
    body: 'Team invites now join the correct workspace, profile avatars sync better, and the app has smoother hover and reward polish.',
    href: '/dashboard/settings',
  },
]

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: ws }, { data: settings }, { data: tasks }, { data: leads }, { data: completedTasks }] = await Promise.all([
        supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle(),
        supabase.from('user_settings').select('revenue_target,patch_announcements').eq('user_id', user.id).maybeSingle(),
        supabase.from('tasks').select('is_completed, created_at').eq('user_id', user.id).limit(20),
        supabase.from('pipeline_leads').select('created_at, stage').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('tasks').select('completed_at').eq('user_id', user.id).eq('is_completed', true).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(60),
      ])

      const { data: entries } = await supabase
        .from('period_entries').select('revenue').eq('user_id', user.id)
        .order('period_date', { ascending: false }).limit(1)

      // Compute streak
      let streak = 0
      if (completedTasks?.length) {
        const days = new Set(completedTasks.map((t: any) => t.completed_at?.split('T')[0]))
        const today = new Date()
        for (let i = 0; i < 60; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          if (days.has(d.toISOString().split('T')[0])) streak++
          else if (i > 0) break
        }
      }

      const computed = computeNotifications({
        revenue: Number(entries?.[0]?.revenue) || 0,
        revenueTarget: Number(settings?.revenue_target) || 0,
        hasRevenueData: !!entries?.length,
        tasks: (tasks || []) as any,
        leads: (leads || []) as any,
        taskStreak: streak,
      })

      const { data: persisted } = await supabase
        .from('notifications')
        .select('id,title,body,type,href,read,created_at,metadata')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(25)

      const dbNotes: Notification[] = (persisted || []).map((n: any) => ({
        id: `db-${n.id}`,
        dbId: n.id,
        type: n.type === 'team_invite' ? 'info' : (['warning','info','success','urgent'].includes(n.type) ? n.type : 'info'),
        title: n.title,
        body: n.body,
        icon: n.type === 'team_invite' ? <UserPlus className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />,
        time: n.type === 'team_invite' ? 'Invite' : 'Live',
        metadata: { ...(n.metadata || {}), notification_type: n.type },
      }))

      const patchNotes: Notification[] = settings?.patch_announcements === false ? [] : PATCH_ANNOUNCEMENTS.map(p => ({
        id: p.id,
        type: 'success',
        title: p.title,
        body: p.body,
        icon: <Sparkles className="h-3.5 w-3.5" />,
        time: 'Patch',
        metadata: { notification_type: 'patch_announcement', href: p.href },
      }))

      // Load dismissed from localStorage
      const savedDismissed = JSON.parse(localStorage.getItem('dismissed-notifications') || '[]')
      setDismissed(new Set(savedDismissed))
      setNotes([...patchNotes, ...dbNotes, ...computed])
      setLoading(false)
    }
    load()
    const refresh = () => load()
    window.addEventListener('founderos:notifications-refresh', refresh)
    window.addEventListener('founderos:automations-ran', refresh)
    window.addEventListener('founderos:team-live-update', refresh)
    return () => {
      window.removeEventListener('founderos:notifications-refresh', refresh)
      window.removeEventListener('founderos:automations-ran', refresh)
      window.removeEventListener('founderos:team-live-update', refresh)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dismiss = (id: string) => {
    const next = new Set([...dismissed, id])
    setDismissed(next)
    localStorage.setItem('dismissed-notifications', JSON.stringify([...next]))
  }

  const respondToInvite = async (note: Notification, accepted: boolean) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !note.dbId) return
    if (accepted && note.metadata?.workspace_id) {
      const { data: profile } = await supabase.from('user_profiles').select('full_name,username,email,avatar_url').eq('user_id', user.id).maybeSingle()
      const { data: existingMember } = await supabase.from('workspace_members').select('id').eq('workspace_id', note.metadata.workspace_id).eq('user_id', user.id).maybeSingle()
      const { error: memberError } = existingMember
        ? { error: null as any }
        : await supabase.from('workspace_members').insert({ workspace_id: note.metadata.workspace_id, user_id: user.id, role: 'Member', status: 'active' })
      if (!memberError) {
        try { await supabase.from('team_members').upsert({ workspace_id: note.metadata.workspace_id, user_id: user.id, name: profile?.full_name || profile?.username || user.email?.split('@')[0] || 'Member', email: profile?.email || user.email || '', role: 'Member', status: 'accepted' }, { onConflict: 'workspace_id,user_id' }) } catch {}
        if (note.metadata?.inviter_id) {
          await supabase.from('notifications').insert({
            user_id: note.metadata.inviter_id,
            type: 'success',
            title: 'Workspace invite accepted',
            body: `${profile?.full_name || profile?.username || user.email?.split('@')[0] || 'A member'} joined ${note.metadata.workspace_name || 'your workspace'}.`,
            href: '/dashboard/team',
            metadata: { workspace_id: note.metadata.workspace_id, notification_type: 'team_joined' },
          })
        }
        window.dispatchEvent(new Event('founderos-workspace-updated'))
      }
    }
    await supabase.from('notifications').update({ read: true }).eq('id', note.dbId)
    dismiss(note.id)
  }

  const visible = notes.filter(n => !dismissed.has(n.id))
  const unread = visible.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center justify-center h-8 w-8 rounded-xl transition-all hover:bg-white/[0.06]"
        style={{ color: unread > 0 ? '#f59e0b' : 'var(--text-muted)', border: `1px solid ${open ? 'var(--border-strong)' : 'transparent'}` }}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-black"
            style={{ background: '#f43f5e', color: 'white', boxShadow: '0 0 6px rgba(244,63,94,0.6)' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-2xl z-50 overflow-hidden animate-in"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', top: '100%' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Notifications</p>
              {unread > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>
                  {unread} new
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={() => {
                  const allIds = notes.map(n => n.id)
                  const next = new Set(allIds)
                  setDismissed(next)
                  localStorage.setItem('dismissed-notifications', JSON.stringify(allIds))
                }}
                className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Clear all
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex gap-1.5 items-center justify-center py-8">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)', animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-raised)' }}>
                  <Bell className="h-5 w-5" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>You're all caught up</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>No alerts right now. Keep executing.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {visible.map(note => {
                  const s = TYPE_STYLES[note.type]
                  return (
                    <div key={note.id} className={`relative flex items-start gap-3 p-3 rounded-xl ${note.metadata?.notification_type === 'patch_announcement' ? 'notification-patch-glow' : ''}`}
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                      <div className="flex-shrink-0 mt-0.5" style={{ color: s.icon }}>{note.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{note.title}</p>
                          <span className="text-[9px] font-semibold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{note.time}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{note.body}</p>{note.metadata?.notification_type === 'team_invite' && (<div className="mt-2 flex gap-2"><button onClick={() => respondToInvite(note, true)} className="rounded-md px-2 py-1 text-[10px] font-bold" style={{background:'var(--accent)',color:'#031008'}}>Accept</button><button onClick={() => respondToInvite(note, false)} className="rounded-md px-2 py-1 text-[10px] font-bold" style={{border:'1px solid var(--border)',color:'var(--text-muted)'}}>Decline</button></div>)}
                      </div>
                      <button onClick={() => dismiss(note.id)}
                        className="flex-shrink-0 h-4 w-4 flex items-center justify-center rounded hover:bg-white/[0.1]"
                        style={{ color: 'var(--text-muted)' }}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
