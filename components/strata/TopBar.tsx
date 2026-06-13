'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, User, LogOut, Settings, Search } from 'lucide-react'
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
  // Default to Ctrl K (most users); swap to ⌘K on Apple devices after mount
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl K')
  useEffect(() => {
    const ua = `${navigator.platform || ''} ${navigator.userAgent || ''}`
    if (/Mac|iPhone|iPad|iPod/i.test(ua)) setShortcutLabel('⌘K')
  }, [])
  const [fetchedName, setFetchedName] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [username, setUsername] = useState('')
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    router.push('/')
  }

  const handleProfileEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setProfileOpen(true)
  }

  const handleProfileLeave = () => {
    closeTimerRef.current = setTimeout(() => setProfileOpen(false), 200)
  }

  const displayName = fetchedName || userName || ''
  const showGreetingText = (showGreeting || !!userName) && displayName

  return (
    <div
      className="flex-shrink-0 flex items-center gap-2 md:gap-4 px-3 md:px-6"
      style={{ height: 64, borderBottom: '1px solid var(--topbar-border-color)', background: 'var(--topbar-bg)' }}
    >
      {/* Left */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, overflow: 'hidden' }}>
        {showGreetingText ? (
          <>
            <span className="topbar-greeting">
              {getGreeting(displayName)}
            </span>
            <div className="hidden md:flex items-center">
              <ClockPills />
            </div>
          </>
        ) : (
          <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => window.dispatchEvent(new Event('prspectve-open-palette'))}
          title={`Search & commands (${shortcutLabel})`}
          className="hidden md:flex"
          style={{ alignItems: 'center', gap: 8, height: 34, padding: '0 10px 0 12px', borderRadius: 9, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}
        >
          <Search style={{ width: 13, height: 13, flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>Search</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5, background: 'var(--overlay-faint)', border: '1px solid var(--border)', lineHeight: 1.2 }}>{shortcutLabel}</span>
        </button>

        <NotificationBell />

        {(actionLabel || actionHref) && (
          actionHref ? (
            <Link
              href={actionHref}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: 'var(--accent-fg)', textDecoration: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 10px 24px var(--accent-muted)', whiteSpace: 'nowrap' }}
            >
              <Plus style={{ width: 13, height: 13, flexShrink: 0 }} />
              <span className="hidden sm:inline">{actionLabel}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 800, padding: '10px 14px', borderRadius: 10, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: 'var(--accent-fg)', border: 'none', cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25), 0 10px 24px var(--accent-muted)', whiteSpace: 'nowrap' }}
            >
              <Plus style={{ width: 13, height: 13, flexShrink: 0 }} />
              <span className="hidden sm:inline">{actionLabel}</span>
            </button>
          )
        )}

        <div className="relative" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave} style={{ flexShrink: 0 }}>
          <button onClick={() => setProfileOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {avatarUrl ? <img src={avatarUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />}
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 top-full z-50 w-64 rounded-2xl"
              style={{ paddingTop: 8 }}
              onMouseEnter={handleProfileEnter}
              onMouseLeave={handleProfileLeave}
            >
              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 22px 60px rgba(0,0,0,.5)' }}>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden grid place-items-center flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
                    {avatarUrl ? <img src={avatarUrl} alt="profile" className="h-full w-full object-cover" /> : <span className="font-black">{(displayName || 'F').slice(0,1).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black truncate" style={{ color: 'var(--text-primary)' }}>{displayName || 'Founder'}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{username ? `@${username}` : 'No username set'}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/[.05]"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    <Settings className="h-3.5 w-3.5 flex-shrink-0" />
                    Profile settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors hover:bg-red-500/10"
                    style={{ color: '#f43f5e', border: '1px solid rgba(244,63,94,.2)' }}
                  >
                    <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
