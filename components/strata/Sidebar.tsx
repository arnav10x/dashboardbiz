'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid, CheckSquare, GitMerge, CalendarDays,
  Trophy, Sparkles, Users, Settings, Zap, Plug, FileText,
} from 'lucide-react'

const topNav = [
  { href: '/dashboard',              icon: LayoutGrid,  label: 'Overview',      exact: true },
  { href: '/dashboard/tasks',        icon: CheckSquare, label: 'Tasks' },
  { href: '/dashboard/pipeline',     icon: GitMerge,    label: 'Pipeline' },
  { href: '/dashboard/pl-calendar',  icon: CalendarDays,label: 'Calendar' },
  { href: '/dashboard/reports',      icon: FileText,    label: 'Reports' },
  { href: '/dashboard/achievements', icon: Trophy,      label: 'Achievements' },
]

const bottomNav = [
  { href: '/dashboard/ai-copilot',   icon: Sparkles,    label: 'AI Copilot' },
  { href: '/dashboard/team',         icon: Users,       label: 'Team' },
  { href: '/dashboard/integrations', icon: Plug,        label: 'Integrations' },
  { href: '/dashboard/settings',     icon: Settings,    label: 'Settings' },
]

interface SidebarProps {
  userName: string
  userEmail: string
  workspaceName: string
  workspaceType: string
  workspaceStage: string
}

export function Sidebar({ workspaceName }: SidebarProps) {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const NavLink = ({ href, icon: Icon, label, exact }: { href: string; icon: any; label: string; exact?: boolean }) => {
    const active = isActive(href, exact)
    const isAchievements = label === 'Achievements'
    const navColor = active ? 'var(--accent)' : isAchievements ? '#ff5c5c' : 'var(--text-muted)'
    const navBg = active ? 'rgba(46,204,113,0.12)' : 'transparent'
    return (
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '9px 10px',
          borderRadius: 8,
          background: navBg,
          color: navColor,
          textDecoration: 'none',
          transition: 'background 0.12s, color 0.12s',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.color = isAchievements ? '#ff7a7a' : 'var(--text-secondary)'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = navColor
          }
        }}
      >
        <Icon style={{ width: 17, height: 17, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: active ? 700 : 500, lineHeight: 1, whiteSpace: 'nowrap' }}>{label}</span>
        {(active || isAchievements) && (
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: active ? 'var(--accent)' : '#ff5c5c', marginLeft: 'auto', flexShrink: 0 }} />
        )}
      </Link>
    )
  }

  return (
    <div
      className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
      style={{
        width: 168,
        background: 'linear-gradient(180deg, #050607 0%, #08090b 100%)',
        borderRight: '1px solid var(--border)',
        zIndex: 30,
        padding: '0 0 12px',
      }}
    >
      {/* Logo — same height as topbar */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 29, height: 29, borderRadius: 99, background: 'rgba(34,197,94,.10)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap style={{ width: 16, height: 16, color: 'var(--accent)' }} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Founder OS
        </span>
      </div>

      {/* Top nav */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, padding: '10px 8px 0' }}>
        {topNav.map(item => <NavLink key={item.href} {...item} />)}
      </div>

      {/* Divider */}
      <div style={{ margin: '8px 12px', height: 1, background: 'var(--border)' }} />

      {/* Bottom nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 8px' }}>
        {bottomNav.map(item => <NavLink key={item.href} {...item} />)}
      </div>
    </div>
  )
}
