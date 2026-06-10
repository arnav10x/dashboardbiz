'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FeedbackModal } from '@/components/strata/FeedbackModal'

function SidebarLogo() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 15, fontFamily: 'system-ui', lineHeight: 1 }}>P</span>
      </div>
    )
  }
  return <img src="/logo.png" alt="prspectve" width={28} height={28} style={{ borderRadius: 6, flexShrink: 0, display: 'block' }} onError={() => setErr(true)} />
}
import {
  LayoutDashboard, CheckSquare, TrendingUp, CalendarDays,
  BarChart2, Trophy, Sparkles, Users, Plug, Settings, Link2, Plus, X, DollarSign, MessageSquare,
} from 'lucide-react'

type NavItem = { href: string; icon: any; label: string; exact?: boolean }
type NavSection = { label?: string; items: NavItem[] }

const TOP_NAV: NavSection[] = [
  {
    items: [
      { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview',    exact: true },
      { href: '/dashboard/tasks',       icon: CheckSquare,     label: 'Tasks' },
      { href: '/dashboard/pipeline',    icon: TrendingUp,      label: 'Pipeline' },
      { href: '/dashboard/finance',     icon: DollarSign,      label: 'Finance' },
      { href: '/dashboard/pl-calendar', icon: CalendarDays,    label: 'Calendar' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/dashboard/ai-copilot', icon: Sparkles, label: 'AI Coach' },
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

type QuickLink = { id: string; title: string; url: string }

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
        background: active ? 'var(--accent-muted)' : 'transparent',
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

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('prspectve-quick-links')
        setQuickLinks(saved ? JSON.parse(saved) : [])
      } catch {}
    }
    load()
    window.addEventListener('prspectve-links-changed', load)
    return () => window.removeEventListener('prspectve-links-changed', load)
  }, [])

  const saveLinks = (links: QuickLink[]) => {
    setQuickLinks(links)
    localStorage.setItem('prspectve-quick-links', JSON.stringify(links))
    window.dispatchEvent(new Event('prspectve-links-changed'))
  }

  const addLink = () => {
    const title = newTitle.trim()
    const raw = newUrl.trim()
    if (!title || !raw) return
    const url = raw.startsWith('http') ? raw : `https://${raw}`
    saveLinks([...quickLinks, { id: Date.now().toString(), title, url }])
    setNewTitle('')
    setNewUrl('')
    setAddOpen(false)
  }

  const linkHoverStyle = (e: React.MouseEvent, enter: boolean) => {
    const el = e.currentTarget as HTMLElement
    el.style.background = enter ? 'var(--bg-hover)' : 'transparent'
    el.style.color = enter ? 'var(--text-secondary)' : 'var(--text-muted)'
  }

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
        <SidebarLogo />
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          prspectve
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

        {/* Coming Soon items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { icon: Users, label: 'Team' },
            { icon: Plug,  label: 'Integrations' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              title="Coming soon"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, color: 'var(--text-muted)', opacity: 0.45, cursor: 'default', fontSize: 13, fontWeight: 500 }}
            >
              <Icon style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>{label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 5px', borderRadius: 4, background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', flexShrink: 0 }}>Soon</span>
            </div>
          ))}
        </div>

        {/* Quick Links section */}
        <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px 8px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 5px' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', opacity: 0.55, margin: 0 }}>
            Quick Links
          </p>
          <button
            onClick={() => setAddOpen(o => !o)}
            title="Add link"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 4, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.65, flexShrink: 0 }}
          >
            {addOpen ? <X style={{ width: 12, height: 12 }} /> : <Plus style={{ width: 12, height: 12 }} />}
          </button>
        </div>

        {addOpen && (
          <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Label"
              style={{ fontSize: 11, padding: '5px 8px', borderRadius: 5, background: 'var(--bg-card)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
            />
            <input
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="URL"
              onKeyDown={e => e.key === 'Enter' && addLink()}
              style={{ fontSize: 11, padding: '5px 8px', borderRadius: 5, background: 'var(--bg-card)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', width: '100%', outline: 'none' }}
            />
            <button
              onClick={addLink}
              style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 5, background: 'var(--accent)', color: '#031008', border: 'none', cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 8 }}>
          {quickLinks.map(link => (
            <div key={link.id} style={{ position: 'relative' }}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.url}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'background 0.1s, color 0.1s' }}
                onMouseEnter={e => linkHoverStyle(e, true)}
                onMouseLeave={e => linkHoverStyle(e, false)}
              >
                <Link2 style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{link.title}</span>
              </a>
            </div>
          ))}

          {/* Manage links → settings */}
          <Link
            href="/dashboard/settings?tab=links"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 12, fontWeight: 500, opacity: 0.65, transition: 'background 0.1s, color 0.1s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.opacity = '1' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.opacity = '0.65' }}
          >
            <Settings style={{ width: 13, height: 13, flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>Manage links</span>
          </Link>
        </div>

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

          {/* Feedback button */}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 4px 8px' }} />
          <button
            onClick={() => setFeedbackOpen(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 7, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, textAlign: 'left' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
          >
            <MessageSquare style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>Feedback</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 5px', borderRadius: 4, background: 'var(--accent-faint)', color: 'var(--accent)', border: '1px solid var(--accent-ring)', flexShrink: 0 }}>Beta</span>
          </button>
        </div>

        {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      </div>
    </div>
  )
}
