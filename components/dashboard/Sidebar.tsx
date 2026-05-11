"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  Home, CheckSquare, Users, TrendingUp, Award,
  Zap, CalendarDays, Settings, BrainCircuit,
} from 'lucide-react';

const sections = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, exact: true },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { name: "Today's Tasks", href: '/dashboard/tasks', icon: CheckSquare },
      { name: 'Lead Tracker', href: '/dashboard/leads', icon: Users },
      { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
    ],
  },
  {
    label: 'Growth',
    items: [
      { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
      { name: 'Achievements', href: '/dashboard/achievements', icon: Award },
    ],
  },
  {
    label: 'AI',
    items: [
      { name: 'Business Advisor', href: '/dashboard/copilot', icon: BrainCircuit },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  return (
    <div
      className="hidden md:flex w-56 flex-col h-screen sticky top-0 flex-shrink-0 border-r transition-colors duration-200"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
            <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>Founder OS</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>30-day sprint</p>
          </div>
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, (item as any).exact);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                    style={active
                      ? { background: 'var(--accent-muted)', color: 'var(--accent)' }
                      : { color: 'var(--text-secondary)' }
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                    {active && <div className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Settings link */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
          style={isActive('/dashboard/settings')
            ? { background: 'var(--accent-muted)', color: 'var(--accent)' }
            : { color: 'var(--text-secondary)' }
          }
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Settings</span>
          {isActive('/dashboard/settings') && <div className="ml-auto h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />}
        </Link>
      </div>
    </div>
  );
}
