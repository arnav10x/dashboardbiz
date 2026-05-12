'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, CheckSquare, GitMerge, TrendingUp, Sparkles } from 'lucide-react'

const mobileLinks = [
  { label: 'Overview', href: '/dashboard', icon: LayoutGrid, exact: true },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Pipeline', href: '/dashboard/pipeline', icon: GitMerge },
  { label: 'Report', href: '/dashboard/reports', icon: TrendingUp },
  { label: 'AI', href: '/dashboard/ai-copilot', icon: Sparkles },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-2 pb-safe"
      style={{
        background: 'var(--bg-raised)',
        borderTop: '1px solid var(--border)',
        paddingTop: '0.5rem',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {mobileLinks.map((item) => {
        const active = isActive(item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <item.icon
              className="h-5 w-5"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
