'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, TrendingUp, CalendarDays,
  BarChart2, Trophy, Sparkles, Users, Plug, Settings, Zap,
} from 'lucide-react'

type NavItem = { href: string; icon: any; label: string; exact?: boolean }
type NavSection = { label?: string; items: NavItem[] }

const TOP_NAV: NavSection[] = [
  {
    items: [
      { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview',    exact: true },
      { href: '/dashboard/tasks',       icon: CheckSquare,     label: 'Tasks' },
      { href: '/dashboard/pipeline',    icon: TrendingUp,      label: 'Pipeline' },
      { href: '/dashboard/pl-calendar', icon: CalendarDays,    label: 'Calendar' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/dashboard/ai-copilot',   icon: Sparkles, label: 'AI Copilot' },
      { href: '/dashboard/team',         icon: Users,    label: 'Team' },
      { href: '/dashboard/integrations', icon: Plug,     label: 'Integrations' },
    ],
  },
]

const BOTTOM_NAV: NavSection[] = [
  {
    label: 'Insights',
    items: [
      { href: '/dashboard/reports',      icon: BarChart2, label: 'Reports' },
      { href: '/dashboard/achievements', icon: Trophy,    label: 'Achievements' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 7,
        background: active ? 'rgba(39,211,110,0.10)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        textDecoration: 'none',
        transition: 'background 0.1s, color 0.1s',
        fontSize: 13,
        fontWeight: active ? 650 : 500,
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'
        }
      }}
    >
      <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
      <span style={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>{item.label}</span>
      {active && (
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', marginLeft: 'auto', flexShrink: 0 }} />
      )}
    </Link>
  )
}

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

  return (
    <div
      className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
      style={{
        width: 172,
        background: 'linear-gradient(180deg, var(--sidebar-bg-start) 0%, var(--sidebar-bg-end) 100%)',
        borderRight: '1px solid var(--border)',
        zIndex: 30,
        padding: '0 0 16px',
      }}
    >
      {/* Logo */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-faint)', border: '1px solid var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Zap style={{ width: 15, height: 15, color: 'var(--accent)' }} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Strata
        </span>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 0', display: 'flex', flexDirection: 'column' }}>
        {/* Top sections */}
        {TOP_NAV.map((section, si) => (
          <div key={si}>
            {si === 1 && (
              <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px 10px' }} />
            )}
            {section.label && (
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 10px 5px', opacity: 0.55 }}>
                {section.label}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: section.label ? 10 : 0 }}>
              {section.items.map(item => <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />)}
            </div>
          </div>
        ))}

        {/* Spacer pushes bottom sections down */}
        <div style={{ flex: 1 }} />

        {/* Bottom sections — Insights + Account */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 6 }}>
          {BOTTOM_NAV.map((section, si) => (
            <div key={si} style={{ marginBottom: si < BOTTOM_NAV.length - 1 ? 10 : 0 }}>
              {section.label && (
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 10px 5px', opacity: 0.55 }}>
                  {section.label}
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.items.map(item => <NavLink key={item.href} item={item} active={isActive(item.href, item.exact)} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
