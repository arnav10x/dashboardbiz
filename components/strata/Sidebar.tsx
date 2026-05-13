'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CheckSquare, TrendingUp, CalendarDays,
  BarChart2, Trophy, Sparkles, Users, Plug, Settings, Zap,
} from 'lucide-react'

type NavItem = { href: string; icon: any; label: string; exact?: boolean }
type NavSection = { label?: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    items: [
      { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview',    exact: true },
      { href: '/dashboard/tasks',       icon: CheckSquare,     label: 'Tasks' },
      { href: '/dashboard/pipeline',    icon: TrendingUp,      label: 'Pipeline' },
      { href: '/dashboard/pl-calendar', icon: CalendarDays,    label: 'Calendar' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/dashboard/reports',      icon: BarChart2, label: 'Reports' },
      { href: '/dashboard/achievements', icon: Trophy,    label: 'Achievements' },
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
  {
    label: 'Account',
    items: [
      { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ],
  },
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

  return (
    <div
      className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0"
      style={{
        width: 172,
        background: 'linear-gradient(180deg, #050607 0%, #08090b 100%)',
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
        {NAV.map((section, si) => (
          <div key={si}>
            {/* Divider before first labeled section */}
            {si === 1 && (
              <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px 10px' }} />
            )}

            {section.label && (
              <p style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                padding: '0 10px 5px',
                opacity: 0.55,
              }}>
                {section.label}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: section.label ? 10 : 0 }}>
              {section.items.map(item => {
                const active = isActive(item.href, item.exact)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
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
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
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
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
