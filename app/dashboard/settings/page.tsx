"use client"
import * as React from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sun, Moon, LogOut, User, Palette, Shield, Loader2 } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="app-card rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold text-[var(--text-primary)]">{title}</p>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-6">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [user, setUser] = React.useState<{ email?: string; full_name?: string } | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
        });
      }
    });
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="p-8 md:p-10 max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-1">Configuration</p>
        <h1 className="text-2xl font-black text-[var(--text-primary)]">Settings</h1>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row label="Email" description="Your login email">
          <p className="text-sm text-[var(--text-secondary)] font-mono">{user?.email || '—'}</p>
        </Row>
        <Row label="Name" description="From your Google account">
          <p className="text-sm text-[var(--text-secondary)]">{user?.full_name || '—'}</p>
        </Row>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Theme" description="Choose how Founder OS looks">
          {mounted ? (
            <div className="flex items-center gap-2 p-1 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--app-bg)' }}>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-white dark:bg-white/10 text-emerald-600 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                Dark
              </button>
            </div>
          ) : (
            <div className="h-9 w-36 rounded-xl animate-pulse" style={{ background: 'var(--app-bg)' }} />
          )}
        </Row>
      </Section>

      {/* Danger zone */}
      <Section title="Session">
        <Row label="Sign out" description="End your current session">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5" />
            )}
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </Row>
      </Section>
    </div>
  );
}
