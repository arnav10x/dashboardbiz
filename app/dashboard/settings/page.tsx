"use client"
import * as React from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAccent } from '@/components/providers/AccentProvider';
import { LogOut, Loader2, Upload, Check } from 'lucide-react';

// ── Accent color presets ──────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  '#10b981', // emerald (default)
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#84cc16', // lime
];

// ── Sub-components ────────────────────────────────────────────────────────────
function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm border outline-none focus:ring-1 transition-all";
const inputStyle = { background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} style={inputStyle} {...props} />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={inputCls} style={{ ...inputStyle, appearance: 'none' }} {...props}>
      {children}
    </select>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: checked ? 'var(--accent)' : 'var(--border)' }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
      style={{ background: 'var(--accent)' }}
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
      {saving ? 'Saving…' : saved ? 'Saved!' : 'Save'}
    </button>
  );
}

// ── Tab content components ────────────────────────────────────────────────────
function BusinessProfileTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    business_name: '', your_name: '', business_type: 'Agency', industry: 'Lead Tracker Business',
    stage: 'Pre-revenue', tracking_frequency: 'Monthly', ai_context: '',
  });
  const [userEmail, setUserEmail] = React.useState('');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email || '');
    });
    supabase.from('user_settings').select('*').eq('user_id', userId).single().then(({ data }) => {
      if (data) setForm({
        business_name: data.business_name || '',
        your_name: data.your_name || '',
        business_type: data.business_type || 'Agency',
        industry: data.industry || 'Lead Tracker Business',
        stage: data.stage || 'Pre-revenue',
        tracking_frequency: data.tracking_frequency || 'Monthly',
        ai_context: data.ai_context || '',
      });
    });
  }, [userId]);

  const initials = (form.your_name || userEmail || 'U').slice(0, 1).toUpperCase();

  async function save() {
    setSaving(true);
    await supabase.from('user_settings').upsert({ user_id: userId, ...form, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <Panel title="Profile picture">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-black text-white" style={{ background: 'var(--accent)' }}>
            {initials}
          </div>
          <div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <Upload className="h-3.5 w-3.5" /> Upload photo
            </button>
            <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>JPG, PNG or GIF · Max 5MB · Preview only (Supabase Storage not configured)</p>
          </div>
        </div>
      </Panel>

      <Panel title="Business profile" description="Personalises your dashboard and AI context.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Name">
            <Input value={form.business_name} onChange={set('business_name')} placeholder="Your business name" />
          </Field>
          <Field label="Your Name">
            <Input value={form.your_name} onChange={set('your_name')} placeholder="Your full name" />
          </Field>
          <Field label="Business Type">
            <Select value={form.business_type} onChange={set('business_type')}>
              {['Agency', 'Freelance', 'Consulting', 'SaaS', 'E-commerce', 'Other'].map(v => <option key={v}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Industry">
            <Select value={form.industry} onChange={set('industry')}>
              {['Lead Tracker Business', 'Marketing', 'Sales', 'Tech', 'Finance', 'Real Estate', 'Health', 'Education', 'Other'].map(v => <option key={v}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Stage">
            <Select value={form.stage} onChange={set('stage')}>
              {['Pre-revenue', 'Early revenue', 'Growing', 'Scaling', 'Established'].map(v => <option key={v}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Tracking Frequency">
            <Select value={form.tracking_frequency} onChange={set('tracking_frequency')}>
              {['Daily', 'Weekly', 'Monthly'].map(v => <option key={v}>{v}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="AI Business Context">
          <p className="text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Describe your business in detail — what you do, who your clients are, how you make money, and your current focus. The AI coach uses this to personalise every recommendation.</p>
          <textarea
            className={inputCls + ' resize-none'}
            style={inputStyle}
            rows={5}
            maxLength={500}
            value={form.ai_context}
            onChange={set('ai_context')}
            placeholder="e.g. We build AI-powered systems for local businesses…"
          />
          <p className="text-[10px] text-right mt-1" style={{ color: 'var(--text-muted)' }}>{form.ai_context.length}/500 characters</p>
        </Field>
        <SaveButton onClick={save} saving={saving} saved={saved} />
      </Panel>
    </div>
  );
}

function PreferencesTab() {
  const PREFS_KEY = 'user-preferences';
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [prefs, setPrefs] = React.useState({
    weekly_summary: true, risk_alerts: true, goal_reminders: false, auto_insights: true,
  });

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
  }, []);

  function toggle(k: keyof typeof prefs) {
    setPrefs(prev => ({ ...prev, [k]: !prev[k] }));
  }

  function save() {
    setSaving(true);
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 400);
  }

  const rows: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: 'weekly_summary', label: 'Weekly AI summary', desc: 'AI-generated digest every Monday' },
    { key: 'risk_alerts', label: 'Risk alerts', desc: 'Notify when key metrics drop significantly' },
    { key: 'goal_reminders', label: 'Goal reminders', desc: 'Friday reminder if weekly goal is unmet' },
    { key: 'auto_insights', label: 'Auto-generate insights', desc: 'Refresh insights when you open dashboard' },
  ];

  return (
    <Panel title="Notifications" description="Control how Founder OS keeps you informed.">
      <div className="space-y-4">
        {rows.map(row => (
          <div key={row.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{row.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{row.desc}</p>
            </div>
            <Toggle checked={prefs[row.key]} onChange={() => toggle(row.key)} />
          </div>
        ))}
      </div>
      <div className="pt-2">
        <SaveButton onClick={save} saving={saving} saved={saved} />
      </div>
    </Panel>
  );
}

function GoalsTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [form, setForm] = React.useState({
    primary_goal: 'Hit $10k/month',
    revenue_target: '4500',
    profit_margin_target: '60',
    monthly_client_target: '5',
    max_hours_month: '80',
  });

  React.useEffect(() => {
    supabase.from('user_settings').select('*').eq('user_id', userId).single().then(({ data }) => {
      if (data) setForm({
        primary_goal: data.primary_goal || 'Hit $10k/month',
        revenue_target: data.revenue_target?.toString() || '4500',
        profit_margin_target: data.profit_margin_target?.toString() || '60',
        monthly_client_target: data.monthly_client_target?.toString() || '5',
        max_hours_month: data.max_hours_month?.toString() || '80',
      });
    });
  }, [userId]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await supabase.from('user_settings').upsert({
      user_id: userId,
      primary_goal: form.primary_goal,
      revenue_target: Number(form.revenue_target),
      profit_margin_target: Number(form.profit_margin_target),
      monthly_client_target: Number(form.monthly_client_target),
      max_hours_month: Number(form.max_hours_month),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Panel title="Goals & targets" description="Set targets for the dashboard to track against.">
      <Field label="Primary Goal">
        <Select value={form.primary_goal} onChange={set('primary_goal')}>
          {['Hit $1k/month', 'Hit $5k/month', 'Hit $10k/month', 'Hit $25k/month', 'Hit $50k/month', 'Hit $100k/month', 'Custom'].map(v => <option key={v}>{v}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Revenue Target ($)">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
            <input className={inputCls} style={{ ...inputStyle, paddingLeft: '1.5rem' }} type="number" value={form.revenue_target} onChange={set('revenue_target')} />
          </div>
        </Field>
        <Field label="Target Profit Margin (%)">
          <div className="relative">
            <input className={inputCls} style={{ ...inputStyle, paddingRight: '2rem' }} type="number" value={form.profit_margin_target} onChange={set('profit_margin_target')} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
          </div>
        </Field>
        <Field label="Monthly Client Target">
          <Input type="number" value={form.monthly_client_target} onChange={set('monthly_client_target')} />
        </Field>
        <Field label="Max Hours / Month">
          <Input type="number" value={form.max_hours_month} onChange={set('max_hours_month')} />
        </Field>
      </div>
      <SaveButton onClick={save} saving={saving} saved={saved} />
    </Panel>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const [mounted, setMounted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [customColor, setCustomColor] = React.useState(accent);

  React.useEffect(() => { setMounted(true); setCustomColor(accent); }, [accent]);

  function save() {
    setSaving(true);
    setAccent(customColor);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 300);
  }

  if (!mounted) return <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--card-bg)' }} />;

  return (
    <div className="space-y-5">
      <Panel title="Theme" description="Choose your base theme. Color scheme applies on top.">
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'dark', label: 'Dark (default)', desc: 'Calm, focused, premium.', preview: '#111111' },
            { value: 'light', label: 'Light', desc: 'Clean, airy, and bright.', preview: '#f4f4f5' },
          ] as const).map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="relative rounded-xl border-2 p-4 text-left transition-all"
              style={{
                background: t.preview,
                borderColor: theme === t.value ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {theme === t.value && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <p className="text-sm font-bold mt-6" style={{ color: t.value === 'dark' ? '#fafafa' : '#09090b' }}>{t.label}</p>
              <p className="text-[10px]" style={{ color: t.value === 'dark' ? '#71717a' : '#a1a1aa' }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Accent Color" description="Pick your primary color. Applies to buttons, active states, and highlights.">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Presets</p>
          <div className="grid grid-cols-6 gap-2">
            {ACCENT_PRESETS.map(color => (
              <button
                key={color}
                onClick={() => setCustomColor(color)}
                className="h-10 w-full rounded-xl border-2 transition-all hover:scale-110"
                style={{
                  background: color,
                  borderColor: customColor === color ? 'white' : 'transparent',
                  boxShadow: customColor === color ? `0 0 0 1px ${color}` : 'none',
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <div className="h-8 w-8 rounded-lg border" style={{ background: customColor, borderColor: 'var(--border)' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Custom primary</p>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{customColor}</p>
          </div>
          <input
            type="color"
            value={customColor}
            onChange={e => setCustomColor(e.target.value)}
            className="ml-auto h-8 w-16 rounded cursor-pointer border-0 bg-transparent"
          />
          <button
            onClick={() => setCustomColor('#10b981')}
            className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Reset
          </button>
        </div>
        <SaveButton onClick={save} saving={saving} saved={saved} />
      </Panel>
    </div>
  );
}

function AccountTab({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [stats, setStats] = React.useState({ entries: 0, lastSaved: null as string | null });

  React.useEffect(() => {
    supabase.from('metrics_snapshots').select('snapshot_date').eq('user_id', userId).order('snapshot_date', { ascending: false }).then(({ data }) => {
      setStats({ entries: data?.length || 0, lastSaved: data?.[0]?.snapshot_date || null });
    });
  }, [userId]);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleExport() {
    setExporting(true);
    const [snaps, leads, settings] = await Promise.all([
      supabase.from('metrics_snapshots').select('*').eq('user_id', userId),
      supabase.from('leads').select('*').eq('user_id', userId),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
    ]);
    const blob = new Blob([JSON.stringify({ snapshots: snaps.data, leads: leads.data, settings: settings.data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `founder-os-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function handleClearData() {
    if (!confirmClear) { setConfirmClear(true); return; }
    setClearing(true);
    await supabase.from('metrics_snapshots').delete().eq('user_id', userId);
    setStats({ entries: 0, lastSaved: null });
    setClearing(false);
    setConfirmClear(false);
  }

  return (
    <div className="space-y-5">
      <Panel title="Account" description="Your plan and account details.">
        <div className="space-y-3">
          {[
            { label: 'Plan', value: <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>Founder OS — Free</span> },
            { label: 'Data entries', value: <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.entries} entries</span> },
            { label: 'Last saved', value: <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stats.lastSaved ? new Date(stats.lastSaved).toLocaleString() : '—'}</span> },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              {row.value}
            </div>
          ))}
        </div>
      </Panel>

      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'var(--card-bg)' }}>
        <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <p className="text-base font-bold text-red-500">Danger zone</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Permanent actions — cannot be undone.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Export all data (JSON)</p>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {exporting ? 'Exporting…' : 'Export'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Clear all metric data</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Permanently deletes all entries</p>
            </div>
            <button
              onClick={handleClearData}
              disabled={clearing}
              className="text-xs font-semibold transition-all hover:opacity-80"
              style={{ color: confirmClear ? '#ef4444' : 'var(--accent)' }}
            >
              {clearing ? 'Clearing…' : confirmClear ? 'Confirm — this cannot be undone' : 'Clear All Data'}
            </button>
          </div>
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sign out</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>End your current session</p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
              >
                {loggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'business', label: 'Business profile' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'goals', label: 'Goals & targets' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'account', label: 'Account & data' },
] as const;
type Tab = typeof TABS[number]['key'];

export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>('business');
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id); });
  }, []);

  return (
    <div className="p-8 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your business profile, preferences, and account.</p>
      </div>

      <div className="flex gap-8">
        {/* Left nav */}
        <aside className="w-48 flex-shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: tab === t.key ? 'var(--accent-muted)' : 'transparent',
                  color: tab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {!userId ? (
            <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'var(--card-bg)' }} />
          ) : (
            <>
              {tab === 'business'     && <BusinessProfileTab userId={userId} />}
              {tab === 'preferences'  && <PreferencesTab />}
              {tab === 'goals'        && <GoalsTab userId={userId} />}
              {tab === 'appearance'   && <AppearanceTab />}
              {tab === 'account'      && <AccountTab userId={userId} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
