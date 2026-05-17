'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutGrid, CheckSquare, GitMerge, TrendingUp, Sparkles, Menu, CalendarDays, Trophy, Users, Settings, X } from 'lucide-react'

const mobileLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutGrid, exact: true },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Pipeline', href: '/dashboard/pipeline', icon: GitMerge },
  { label: 'Report', href: '/dashboard/reports', icon: TrendingUp },
  { label: 'AI', href: '/dashboard/ai-copilot', icon: Sparkles },
]

const moreLinks = [
  { label: 'Calendar', href: '/dashboard/pl-calendar', icon: CalendarDays },
  { label: 'Team', href: '/dashboard/team', icon: Users },
  { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [startY, setStartY] = useState<number | null>(null)

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href)

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      {open && <div className="md:hidden fixed inset-0 z-[58] bg-black/60" onClick={() => setOpen(false)} />}
      <div
        className={`mobile-more-drawer md:hidden fixed inset-x-0 bottom-0 z-[59] rounded-t-3xl p-4 transition-transform duration-200 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-strong)' }}
        onTouchStart={e => setStartY(e.touches[0].clientY)}
        onTouchMove={e => {
          if (startY === null) return
          if (e.touches[0].clientY - startY > 55) setOpen(false)
        }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full" style={{ background: 'var(--border-strong)' }} />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black">FounderOS</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Quick navigation</p>
          </div>
          <button className="mobile-tap-target grid place-items-center rounded-xl" onClick={() => setOpen(false)} style={{ background: 'var(--bg-raised)' }}><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-2 pb-6">
          {moreLinks.map(item => {
            const active = isActive(item.href)
            return (
              <Link key={item.href} href={item.href} className="mobile-tap-target flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: active ? 'var(--accent-faint)' : 'var(--bg-raised)', border: `1px solid ${active ? 'var(--accent-ring)' : 'var(--border)'}` }}>
                <item.icon className="h-5 w-5" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
                <span className="text-sm font-bold">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-2 pb-safe"
        style={{
          background: 'color-mix(in oklab, var(--bg-raised), transparent 5%)',
          borderTop: '1px solid var(--border)',
          paddingTop: '0.5rem',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
          backdropFilter: 'blur(18px)',
        }}
      >
        {mobileLinks.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href} className="mobile-nav-pill flex flex-col items-center gap-1 px-3 py-1">
              <item.icon className="h-5 w-5" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="text-[10px] font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>{item.label}</span>
            </Link>
          )
        })}
        <button onClick={() => setOpen(true)} className="mobile-nav-pill flex flex-col items-center gap-1 px-3 py-1">
          <Menu className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>More</span>
        </button>
      </div>
    </>
  )
}
