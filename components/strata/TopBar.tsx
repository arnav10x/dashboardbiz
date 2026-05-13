'use client'
import { useState, useEffect } from 'react'
import { Plus, User, Briefcase, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { NotificationBell } from '@/components/strata/NotificationBell'

function getGreeting(name: string): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return `Good morning, ${name}`
  if (h >= 12 && h < 17) return `Good afternoon, ${name}`
  if (h >= 17 && h < 21) return `Good evening, ${name}`
  return `Working late, ${name}`
}


function WorkspaceSwitcher({ currentName }: { currentName: string }) {
  const [open, setOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [active, setActive] = useState(currentName)
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: owned } = await supabase.from('workspaces').select('id,name,business_type').eq('owner_id', user.id)
      const { data: memberships } = await supabase.from('workspace_members').select('workspace_id,role,status').eq('user_id', user.id).eq('status','active')
      const joinedIds = (memberships || []).map((m:any)=>m.workspace_id)
      let joined:any[] = []
      if (joinedIds.length) {
        const { data } = await supabase.from('workspaces').select('id,name,business_type').in('id', joinedIds)
        joined = data || []
      }
      const all = [...(owned || []), ...joined].filter((w, i, arr) => arr.findIndex(x => x.id === w.id) === i)
      setWorkspaces(all)
      const activeId = localStorage.getItem('active-workspace-id')
      const found = all.find((w:any)=>w.id===activeId)
      if (found) setActive(found.name)
    }
    load()
  }, [currentName])
  const createWorkspace = async () => {
    const name = prompt('New workspace name')
    if (!name?.trim()) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from('workspaces').insert({ owner_id: user.id, name: name.trim(), business_type: 'Business', stage: 'Early Stage', invite_code: Math.random().toString(36).slice(2,8).toUpperCase() }).select('id,name,business_type').single()
    if (!error && data) { localStorage.setItem('active-workspace-id', data.id); setActive(data.name); setWorkspaces(prev=>[...prev,data]); location.reload() }
  }
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-2" style={{background:'var(--bg-card)',border:'1px solid var(--border)',color:'var(--text-secondary)'}}><Briefcase className="h-3.5 w-3.5" />{active}</button>
      {open && <div className="absolute left-0 top-full mt-2 w-56 rounded-xl p-2 z-50" style={{background:'var(--bg-card)',border:'1px solid var(--border-strong)',boxShadow:'0 20px 50px rgba(0,0,0,.4)'}}>
        {workspaces.map(w=><div key={w.id} className="group flex items-center gap-1 rounded-lg hover:bg-white/[.06]"><button onClick={()=>{localStorage.setItem('active-workspace-id',w.id);setActive(w.name);setOpen(false);location.reload()}} className="flex-1 text-left px-3 py-2 text-xs" style={{color:w.name===active?'var(--accent)':'var(--text-secondary)'}}>{w.name}<span className="block text-[10px]" style={{color:'var(--text-muted)'}}>{w.business_type||'Workspace'}</span></button><button title="Delete workspace" onClick={async(e)=>{e.stopPropagation(); if(!confirm(`Delete workspace ${w.name}?`)) return; const res=await fetch('/api/founderos/workspaces',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId:w.id})}); if(res.ok){const left=workspaces.filter(x=>x.id!==w.id); setWorkspaces(left); if(localStorage.getItem('active-workspace-id')===w.id){localStorage.removeItem('active-workspace-id'); location.reload()}} else {alert('Only workspace owners can delete workspaces.')}}} className="mr-1 hidden h-7 w-7 place-items-center rounded-md text-red-400 hover:bg-red-500/10 group-hover:grid"><Trash2 className="h-3.5 w-3.5" /></button></div>)}
        <button onClick={createWorkspace} className="mt-1 w-full rounded-lg px-3 py-2 text-xs font-bold" style={{border:'1px solid var(--accent-ring)',color:'var(--accent)',background:'var(--accent-faint)'}}>+ Create workspace</button>
      </div>}
    </div>
  )
}

function ClockPills() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[dateStr, time, weekday].map(t => (
        <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {t}
        </span>
      ))}
    </div>
  )
}

interface TopBarProps {
  title: string
  workspaceName: string
  hasData?: boolean
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  userName?: string
  showGreeting?: boolean
}

export function TopBar({ title, workspaceName, hasData = false, actionLabel, actionHref, onAction, userName, showGreeting = false }: TopBarProps) {
  const router = useRouter()
  const [fetchedName, setFetchedName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!showGreeting && !userName) return
    if (userName) { setFetchedName(userName); return }
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('user_profiles').select('full_name, username, avatar_url').eq('user_id', user.id).maybeSingle()
        const name = profile?.full_name || (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Founder'
        setFetchedName(name)
        setUsername(profile?.username || (user.user_metadata?.username as string) || '')
        setAvatarUrl(profile?.avatar_url || localStorage.getItem('founderos-avatar-url') || null)
      }
    }
    load()
  }, [showGreeting, userName])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = fetchedName || userName || ''
  const showGreetingText = (showGreeting || !!userName) && displayName

  return (
    <div
      className="flex-shrink-0 flex items-center gap-4 px-6"
      style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'linear-gradient(180deg, rgba(3,4,5,0.98), rgba(3,4,5,0.94))' }}
    >
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {showGreetingText ? (
          <>
            <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>
              {getGreeting(displayName)}
            </span>
            <ClockPills />
            <WorkspaceSwitcher currentName={workspaceName} />
          </>
        ) : (
          <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <NotificationBell />

        {(actionLabel || actionHref) && (
          actionHref ? (
            <Link
              href={actionHref}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008', textDecoration: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 10px 24px var(--accent-muted)' }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: '#031008', border: 'none', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 10px 24px var(--accent-muted)' }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              {actionLabel}
            </button>
          )
        )}

        <div className="relative" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
          <button onClick={() => setProfileOpen(o => !o)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {avatarUrl ? <img src={avatarUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />}
          </button>
          {profileOpen && <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 22px 60px rgba(0,0,0,.5)' }}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden grid place-items-center" style={{ background: 'var(--accent)', color: '#041008' }}>{avatarUrl ? <img src={avatarUrl} alt="profile" className="h-full w-full object-cover" /> : <span className="font-black">{(displayName || 'F').slice(0,1).toUpperCase()}</span>}</div>
              <div className="min-w-0"><p className="font-black truncate">{displayName || 'Founder'}</p><p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{username ? `@${username}` : 'No username set'}</p></div>
            </div>
            <Link href="/dashboard/settings" className="mt-3 block rounded-lg px-3 py-2 text-xs font-bold hover:bg-white/[.05]" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Open profile settings</Link>
          </div>}
        </div>
      </div>
    </div>
  )
}
