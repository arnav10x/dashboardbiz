"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';
import {
  Home, CheckSquare, Users, TrendingUp, Award,
  Zap, CalendarDays, Settings, Sun, Moon, LogOut,
  X, User, Palette, ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
];

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="absolute left-full ml-2 top-0 z-50 w-64 rounded-2xl shadow-2xl border overflow-hidden"
        style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Settings</p>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-1">
          {/* Appearance section */}
          <p className="text-[9px] font-bold uppercase tracking-widest px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
            Appearance
          </p>
          <button
            onClick={() => setTheme('light')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
              theme === 'light'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
            }`}
            style={{ color: theme === 'light' ? undefined : 'var(--text-secondary)' }}
          >
            <Sun className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Light mode</p>
            </div>
            {theme === 'light' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
              theme === 'dark'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
            }`}
            style={{ color: theme === 'dark' ? undefined : 'var(--text-secondary)' }}
          >
            <Moon className="h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold">Dark mode</p>
            </div>
            {theme === 'dark' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
          </button>

          <div className="h-px mx-2 my-1" style={{ background: 'var(--border)' }} />

          {/* Account section */}
          <p className="text-[9px] font-bold uppercase tracking-widest px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>
            Account
          </p>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:bg-red-500/[0.06] disabled:opacity-50"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-red-400" />
            <p className="text-xs font-semibold text-red-400">{loggingOut ? 'Signing out...' : 'Sign out'}</p>
          </button>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

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
          <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
            <Zap className="h-4 w-4 text-emerald-500" />
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                    }`}
                    style={active ? undefined : { color: 'var(--text-secondary)' }}
                  >
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-emerald-500' : ''}`} />
                    <span className="truncate">{item.name}</span>
                    {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: Settings */}
      <div className="px-3 py-4 border-t relative" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setSettingsOpen(s => !s)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            settingsOpen
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
          }`}
          style={settingsOpen ? undefined : { color: 'var(--text-secondary)' }}
        >
          <Settings className={`h-4 w-4 flex-shrink-0 ${settingsOpen ? 'text-emerald-500' : ''}`} />
          <span>Settings</span>
          <ChevronRight className={`h-3 w-3 ml-auto flex-shrink-0 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
        </button>

        {settingsOpen && (
          <SettingsPanel onClose={() => setSettingsOpen(false)} />
        )}
      </div>
    </div>
  );
}
