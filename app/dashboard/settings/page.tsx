'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/strata/TopBar'
import { Upload, Check, AlertTriangle, X, Trash2, UserRound, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'profile' | 'preferences' | 'goals' | 'appearance' | 'account'

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Business profile' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'goals', label: 'Goals & targets' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'account', label: 'Account & data' },
]

const ACCENT_COLORS = [
  '#4F8EF7', '#7B61FF', '#A855F7', '#EC4899', '#f43f5e',
  '#F97316', '#EAB308', '#22C55E', '#10b981', '#06B6D4',
  '#3B82F6', '#8B5CF6', '#DB2777', '#E11D48', '#1E293B',
]

const SECONDARY_COLORS = [
  '#22C55E', '#10b981', '#06B6D4', '#0EA5E9', '#3B82F6',
  '#6366F1', '#A855F7', '#EC4899',
]

const PRIMARY_GOALS = ['Hit $10k/month', 'Get to $5k/month', 'Grow 20% MoM', 'Reach profitability', 'Scale team', 'Custom']
const BUSINESS_TYPES = ['Service Business', 'Agency', 'E-commerce', 'SaaS', 'Consulting', 'Freelance']
const INDUSTRIES = ['Lead Tracker Business', 'Marketing', 'Design', 'Development', 'Finance', 'Other']
const STAGES = ['Pre-revenue', 'Early Stage', 'Growing', 'Established', 'Scaling']
const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly']

export default function SettingsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [avatarLetter, setAvatarLetter] = useState('A')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [usernameChanges, setUsernameChanges] = useState(0)
  const [usernameMonth, setUsernameMonth] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [deleteAccountInput, setDeleteAccountInput] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [workspaceName, setWorkspaceName] = useState('My Workspace')

  const [profile, setProfile] = useState({
    businessName: '', yourName: '', businessType: 'Agency', industry: 'Lead Tracker Business',
    stage: 'Early Stage', trackingFrequency: 'Weekly', businessSummary: '',
  })
  const [prefs, setPrefs] = useState({
    weeklySummary: true, riskAlerts: true, goalReminders: false, autoInsights: true,
  })
  const [goals, setGoals] = useState({
    primaryGoal: 'Hit $10k/month', revenueTarget: '', profitMargin: '60',
    monthlyClients: '5', maxHours: '80',
  })
  const [appearance, setAppearance] = useState({ theme: 'dark', accentColor: '#f43f5e', secondaryColor: '#10b981' })
  const [entryCount, setEntryCount] = useState(0)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [clearInput, setClearInput] = useState('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: ws } = await supabase.from('workspaces').select('*').eq('owner_id', user.id).maybeSingle()
      if (ws) {
        setWorkspaceName(ws.name || 'My Workspace')
        setProfile(p => ({
          ...p,
          businessName: ws.name || '',
          businessType: ws.business_type || 'Agency',
          industry: ws.industry || 'Lead Tracker Business',
          stage: ws.stage || 'Early Stage',
          trackingFrequency: ws.tracking_frequency || 'Weekly',
          businessSummary: ws.business_summary || '',
        }))
      }

      const { data: userProfile } = await supabase.from('user_profiles').select('username, full_name, avatar_url, username_changes_month, username_changes_count').eq('user_id', user.id).maybeSingle()
      if (userProfile) {
        setUsername(userProfile.username || '')
        setAvatarUrl(userProfile.avatar_url || null)
        if (userProfile.full_name) setProfile(p => ({ ...p, yourName: userProfile.full_name || p.yourName }))
        setUsernameMonth(userProfile.username_changes_month || new Date().toISOString().slice(0,7))
        setUsernameChanges(Number(userProfile.username_changes_count) || 0)
      }

      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
      if (settings) {
        setProfile(p => ({ ...p, yourName: settings.full_name || '' }))
        setPrefs({
          weeklySummary: settings.weekly_ai_summary ?? true,
          riskAlerts: settings.risk_alerts ?? true,
          goalReminders: settings.goal_reminders ?? false,
          autoInsights: settings.auto_generate_insights ?? true,
        })
        setGoals(g => ({
          ...g,
          primaryGoal: settings.primary_goal || 'Hit $10k/month',
          revenueTarget: settings.revenue_target?.toString() || '',
          profitMargin: settings.target_profit_margin?.toString() || '60',
          monthlyClients: settings.monthly_client_target?.toString() || '5',
          maxHours: settings.max_hours_per_month?.toString() || '80',
        }))
        setAppearance({
          theme: settings.theme || 'dark',
          accentColor: settings.accent_color || '#f43f5e',
          secondaryColor: settings.secondary_color || '#10b981',
        })
      }

      const { count } = await supabase.from('period_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setEntryCount(count || 0)

      const { data: authUser } = await supabase.auth.getUser()
      const name = (authUser.user?.user_metadata?.full_name as string) || authUser.user?.email?.split('@')[0] || 'A'
      setAvatarLetter(name.charAt(0).toUpperCase())
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let err: any = null

      if (tab === 'profile') {
        const { error: e1 } = await supabase.from('workspaces').update({
          name: profile.businessName,
          business_type: profile.businessType,
          industry: profile.industry,
          stage: profile.stage,
          tracking_frequency: profile.trackingFrequency,
          business_summary: profile.businessSummary,
        }).eq('owner_id', user.id)
        err = e1

        const { error: e2 } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          full_name: profile.yourName,
        }, { onConflict: 'user_id' })
        if (!err) err = e2
        const { error: e3 } = await supabase.from('user_profiles').upsert({
          user_id: user.id,
          full_name: profile.yourName,
          email: user.email || '',
          username: username || (user.user_metadata?.username as string) || user.email?.split('@')[0] || 'founder',
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (!err) err = e3
        if (!err) {
          localStorage.setItem('founderos-avatar-url', avatarUrl || '')
          localStorage.setItem('founderos-profile-name', profile.yourName || '')
        }

        if (!err && profile.businessName) setWorkspaceName(profile.businessName)
      } else if (tab === 'preferences') {
        const { error: e } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          weekly_ai_summary: prefs.weeklySummary,
          risk_alerts: prefs.riskAlerts,
          goal_reminders: prefs.goalReminders,
          auto_generate_insights: prefs.autoInsights,
        }, { onConflict: 'user_id' })
        err = e
      } else if (tab === 'goals') {
        const { error: e } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          primary_goal: goals.primaryGoal,
          revenue_target: Number(goals.revenueTarget) || null,
          target_profit_margin: Number(goals.profitMargin) || 60,
          monthly_client_target: Number(goals.monthlyClients) || 5,
          max_hours_per_month: Number(goals.maxHours) || 80,
        }, { onConflict: 'user_id' })
        err = e
      } else if (tab === 'appearance') {
        const { error: e } = await supabase.from('user_settings').upsert({
          user_id: user.id,
          theme: appearance.theme,
          accent_color: appearance.accentColor,
          secondary_color: appearance.secondaryColor,
        }, { onConflict: 'user_id' })
        err = e
        if (!err) {
          applyAccent(appearance.accentColor)
          applyTheme(appearance.theme)
        }
      }

      if (err) {
        setSaveError(err.message || 'Save failed. Try again.')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }


  const saveUsername = async () => {
    setUsernameError('')
    const next = username.trim().toLowerCase().replace(/^@/, '')
    if (!/^[a-z0-9_]{3,24}$/.test(next)) return setUsernameError('Use 3-24 letters, numbers, or underscores.')
    const month = new Date().toISOString().slice(0, 7)
    const currentMonthChanges = usernameMonth === month ? usernameChanges : 0
    if (currentMonthChanges >= 3) return setUsernameError('You can only change your username 3 times per month.')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('user_profiles').select('user_id').eq('username', next).neq('user_id', user.id).maybeSingle()
    if (existing) return setUsernameError('That username is already taken.')
    const { error } = await supabase.from('user_profiles').upsert({
      user_id: user.id,
      username: next,
      full_name: profile.yourName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Founder',
      email: user.email || '',
      avatar_url: avatarUrl,
      username_changes_month: month,
      username_changes_count: currentMonthChanges + 1,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    if (error) return setUsernameError(error.message)
    setUsername(next)
    setUsernameMonth(month)
    setUsernameChanges(currentMonthChanges + 1)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const deleteAccount = async () => {
    if (deleteAccountInput !== 'DELETE ACCOUNT') return
    setDeletingAccount(true)
    const supabase = createClient()
    await fetch('/api/founderos/delete-account', { method: 'POST' }).catch(() => null)
    await supabase.auth.signOut()
    localStorage.clear()
    window.location.href = '/signup'
  }

  const clearAllData = async () => {
    setClearing(true)
    await fetch('/api/founderos/reset', { method: 'POST' }).catch(() => null)
    localStorage.removeItem('dismissed-notifications')
    localStorage.removeItem('integration-requests')
    localStorage.removeItem('founderos-team-members')
    localStorage.removeItem('founderos-team-messages')
    localStorage.removeItem('founderos-team-files')
    setClearing(false)
    setClearConfirmOpen(false)
    setClearInput('')
    window.location.reload()
  }

  const applyAccent = (color: string) => {
    document.documentElement.style.setProperty('--accent', color)
    document.documentElement.style.setProperty('--accent-hover', color)
    document.documentElement.style.setProperty('--accent-muted', color + '20')
    document.documentElement.style.setProperty('--accent-ring', color + '38')
    document.documentElement.style.setProperty('--accent-faint', color + '14')
    document.documentElement.style.setProperty('--accent-glow', color + '6B')
    document.documentElement.style.setProperty('--accent-subtle', color + '09')
  }

  const applyTheme = (theme: string) => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light')
      localStorage.setItem('strata-theme', 'light')
    } else {
      document.documentElement.classList.remove('theme-light')
      localStorage.setItem('strata-theme', 'dark')
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setSaveError('Image must be under 5MB.')
    const reader = new FileReader()
    reader.onload = async () => {
      const nextUrl = String(reader.result || '')
      setAvatarUrl(nextUrl)
      localStorage.setItem('founderos-avatar-url', nextUrl)
      localStorage.setItem('founderos-profile-name', profile.yourName || '')
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('user_profiles').upsert({
            user_id: user.id,
            full_name: profile.yourName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Founder',
            email: user.email || '',
            username: username || user.user_metadata?.username || user.email?.split('@')[0] || 'founder',
            avatar_url: nextUrl,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
      } catch {}
    }
    reader.readAsDataURL(file)
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? 'var(--accent)' : 'var(--bg-hover)', border: '1px solid var(--border-strong)' }}
    >
      <div
        className="absolute top-0.5 h-5 w-5 rounded-full transition-transform"
        style={{ background: 'white', transform: checked ? 'translateX(1.25rem)' : 'translateX(0.125rem)' }}
      />
    </button>
  )

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)' }}>
      <TopBar title="Settings" workspaceName={workspaceName} hasData={true} showGreeting />

      {/* ── Clear data confirmation modal ─────────────────────────────── */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={e => { if (e.target === e.currentTarget) { setClearConfirmOpen(false); setClearInput('') } }}>
          <div className="w-full max-w-md overflow-hidden animate-in" style={{borderRadius: 10, background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.35)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)'}}>
            <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-9 w-9 flex items-center justify-center flex-shrink-0" style={{borderRadius: 7, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)'}}>
                  <AlertTriangle className="h-5 w-5" style={{ color: '#f43f5e' }} />
                </div>
                <p className="text-base font-black" style={{ color: '#f43f5e' }}>Clear All Data</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                This will <strong style={{ color: 'var(--text-primary)' }}>permanently delete</strong> all of the following data from your account:
              </p>
              <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                {[
                  'All period entries (revenue & expenses)',
                  'All tasks',
                  'All pipeline leads',
                  'All calendar P&L entries',
                  'All calendar events',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <X className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#f43f5e' }} />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Your account, settings, and gamification progress will not be affected. This action cannot be undone.
              </p>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Type DELETE to confirm
                </label>
                <input
                  className="input-base"
                  placeholder="DELETE"
                  value={clearInput}
                  onChange={e => setClearInput(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => { setClearConfirmOpen(false); setClearInput('') }}
                className="flex-1 py-2 text-sm font-semibold"
                style={{ borderRadius: 7, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}>
                Cancel
              </button>
              <button
                onClick={clearAllData}
                disabled={clearInput !== 'DELETE' || clearing}
                className="flex-1 py-2 text-sm font-bold disabled:opacity-40 transition-opacity"
                style={{ borderRadius: 7, background: 'rgba(244,63,94,0.15)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}>
                {clearing ? 'Deleting…' : 'Delete everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={e => { if (e.target === e.currentTarget) setDeleteAccountOpen(false) }}>
          <div className="w-full max-w-md overflow-hidden animate-in" style={{borderRadius: 10, background: 'var(--bg-card)', border: '1px solid rgba(244,63,94,0.35)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)'}}>
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-base font-black" style={{ color: '#f43f5e' }}>Delete account</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This deletes your FounderOS app data and signs you out. Supabase auth deletion requires the server-side service role key.</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>Type DELETE ACCOUNT</label>
              <input className="input-base" value={deleteAccountInput} onChange={e=>setDeleteAccountInput(e.target.value)} placeholder="DELETE ACCOUNT" />
            </div>
            <div className="flex gap-3 px-6 pb-6"><button onClick={()=>setDeleteAccountOpen(false)} className="flex-1 py-2 text-sm font-semibold rounded-lg" style={{border:'1px solid var(--border)'}}>Cancel</button><button disabled={deleteAccountInput !== 'DELETE ACCOUNT' || deletingAccount} onClick={deleteAccount} className="flex-1 py-2 text-sm font-bold rounded-lg disabled:opacity-40" style={{ background:'rgba(244,63,94,.12)', color:'#f43f5e', border:'1px solid rgba(244,63,94,.3)' }}>{deletingAccount?'Deleting…':'Delete account'}</button></div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 animate-in">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Manage your business profile, preferences, and account.
          </p>
        </div>

        <div className="flex gap-6 flex-col md:flex-row">
          {/* Sub-nav */}
          <div className="md:w-44 flex-shrink-0">
            <nav className="space-y-0.5">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: tab === t.key ? 'var(--accent-muted)' : 'transparent',
                    color: tab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-xl">
            {/* Profile */}
            {tab === 'profile' && (
              <div className="space-y-5">
                {/* Avatar */}
                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Profile picture</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Your avatar appears in Team Chat, Activity Feed, and workspace members.
                  </p>
                  <div className="flex items-center gap-4">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div
                        className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                        style={{ background: 'var(--accent)', color: 'white' }}
                      >
                        {profile.yourName.charAt(0).toUpperCase() || avatarLetter}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                        style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload photo
                      </button>
                      {avatarUrl && (
                        <button onClick={() => { setAvatarUrl(null); localStorage.removeItem('founderos-avatar-url') }} className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ color: 'var(--accent)' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>JPG, PNG or GIF · Max 5MB · Saved to your profile and used in Team + Top Bar</p>
                </div>

                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-3"><div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{background:'var(--accent-faint)',border:'1px solid var(--accent-ring)'}}><UserRound className="h-4 w-4" style={{color:'var(--accent)'}} /></div><div className="flex-1"><p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Unique username</p><p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Teammates can invite you by this username. You can change it 3 times per month.</p><div className="flex gap-2"><input className="input-base" value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} placeholder="akhil_founder" /><button onClick={saveUsername} className="px-4 rounded-lg text-xs font-bold" style={{background:'var(--accent)', color:'#041008'}}>Save</button></div><p className="text-[10px] mt-2" style={{ color: usernameError ? '#f43f5e' : 'var(--text-muted)' }}>{usernameError || `${usernameMonth === new Date().toISOString().slice(0,7) ? usernameChanges : 0}/3 changes used this month`}</p></div></div>
                </div>

                {/* Business profile form */}
                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Business profile</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Personalises your dashboard and AI context.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Business Name', key: 'businessName' as const, placeholder: 'Your business name' },
                      { label: 'Your Name', key: 'yourName' as const, placeholder: 'Your full name' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                        <input
                          className="input-base"
                          placeholder={f.placeholder}
                          value={profile[f.key]}
                          onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    {[
                      { label: 'Business Type', key: 'businessType' as const, opts: BUSINESS_TYPES },
                      { label: 'Industry', key: 'industry' as const, opts: INDUSTRIES },
                      { label: 'Stage', key: 'stage' as const, opts: STAGES },
                      { label: 'Tracking Frequency', key: 'trackingFrequency' as const, opts: FREQUENCIES },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                        <select className="input-base" value={profile[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}>
                          {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  {/* Business Summary — feeds directly into AI */}
                  <div className="col-span-2 mt-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      AI Business Context
                    </label>
                    <p className="text-[10px] mb-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Describe your business in detail — what you do, who your clients are, how you make money, and your current focus. The AI coach uses this to personalise every recommendation.
                    </p>
                    <textarea
                      className="input-base resize-none"
                      rows={4}
                      placeholder="e.g. I run a video editing agency targeting e-commerce brands. My offer is a $2,500/month retainer for 12 edited videos. I'm currently at $4k MRR and focused on outreach to Shopify stores doing $500k+ annually."
                      value={profile.businessSummary}
                      onChange={e => setProfile(p => ({ ...p, businessSummary: e.target.value }))}
                    />
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {profile.businessSummary.length}/500 characters
                    </p>
                  </div>
                  {saveError && <p className="text-xs mt-2" style={{ color: 'var(--accent)' }}>{saveError}</p>}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-4 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                    style={{ background: 'var(--accent)', color: 'white' }}
                  >
                    {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : saving ? 'Saving...' : 'Save profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Preferences */}
            {tab === 'preferences' && (
              <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Notifications</p>
                <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Control how Strata keeps you informed.</p>
                <div className="space-y-4">
                  {[
                    { key: 'weeklySummary' as const, label: 'Weekly AI summary', desc: 'AI-generated digest every Monday' },
                    { key: 'riskAlerts' as const, label: 'Risk alerts', desc: 'Notify when key metrics drop significantly' },
                    { key: 'goalReminders' as const, label: 'Goal reminders', desc: 'Friday reminder if weekly goal is unmet' },
                    { key: 'autoInsights' as const, label: 'Auto-generate insights', desc: 'Refresh insights when you open dashboard' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                      <Toggle checked={prefs[item.key]} onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : saving ? 'Saving...' : 'Save preferences'}
                </button>
              </div>
            )}

            {/* Goals */}
            {tab === 'goals' && (
              <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Goals &amp; targets</p>
                <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>Set targets for the dashboard to track against.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Primary Goal</label>
                    <select className="input-base" value={goals.primaryGoal} onChange={e => setGoals(g => ({ ...g, primaryGoal: e.target.value }))}>
                      {PRIMARY_GOALS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Revenue Target ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                        <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={goals.revenueTarget} onChange={e => setGoals(g => ({ ...g, revenueTarget: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Target Profit Margin (%)</label>
                      <div className="relative">
                        <input type="number" className="input-base pr-7" placeholder="60" value={goals.profitMargin} onChange={e => setGoals(g => ({ ...g, profitMargin: e.target.value }))} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Monthly Client Target</label>
                      <input type="number" className="input-base" placeholder="5" value={goals.monthlyClients} onChange={e => setGoals(g => ({ ...g, monthlyClients: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Max Hours / Month</label>
                      <input type="number" className="input-base" placeholder="80" value={goals.maxHours} onChange={e => setGoals(g => ({ ...g, maxHours: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : saving ? 'Saving...' : 'Save goals'}
                </button>
              </div>
            )}

            {/* Appearance */}
            {tab === 'appearance' && (
              <div className="space-y-4">
                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Theme</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Choose your base theme. Color scheme applies on top.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setAppearance(a => ({ ...a, theme: 'dark' })); applyTheme('dark') }}
                      className="p-3 text-left transition-all"
                      style={{ borderRadius: 7, border: `2px solid ${appearance.theme === 'dark' ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--bg-raised)' }}
                    >
                      <div className="h-10 rounded-lg mb-2" style={{ background: '#0b0d12', border: '1px solid var(--border)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Dark (default)</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Calm, focused, premium.</p>
                    </button>
                    <button
                      onClick={() => { setAppearance(a => ({ ...a, theme: 'light' })); applyTheme('light') }}
                      className="p-3 text-left transition-all"
                      style={{ borderRadius: 7, border: `2px solid ${appearance.theme === 'light' ? 'var(--accent)' : 'var(--border)'}`, background: 'var(--bg-raised)' }}
                    >
                      <div className="h-10 rounded-lg mb-2" style={{ background: '#f0f2f5', border: '1px solid rgba(0,0,0,0.08)' }} />
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Light</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Clean, airy, and bright.</p>
                    </button>
                  </div>
                </div>

                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Accent Color</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Pick your primary color. Applies to buttons, active states, charts, and highlights.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>PRESETS</p>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    {ACCENT_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setAppearance(a => ({ ...a, accentColor: c })); applyAccent(c) }}
                        className="h-10 rounded-lg transition-transform hover:scale-110"
                        style={{
                          background: c,
                          border: appearance.accentColor === c ? '2px solid white' : '2px solid transparent',
                          outline: appearance.accentColor === c ? `2px solid ${c}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md" style={{ background: appearance.accentColor }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Custom primary</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{appearance.accentColor}</span>
                    </div>
                    <button
                      onClick={() => setAppearance(a => ({ ...a, accentColor: '#f43f5e' }))}
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Secondary / Success Color</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Used for positive metrics, growth indicators, and success states.</p>
                  <div className="grid grid-cols-8 gap-2">
                    {SECONDARY_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setAppearance(a => ({ ...a, secondaryColor: c }))}
                        className="h-10 rounded-lg transition-transform hover:scale-110"
                        style={{
                          background: c,
                          border: appearance.secondaryColor === c ? '2px solid white' : '2px solid transparent',
                          outline: appearance.secondaryColor === c ? `2px solid ${c}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : saving ? 'Saving...' : 'Save appearance'}
                </button>
              </div>
            )}

            {/* Account & data */}
            {tab === 'account' && (
              <div className="space-y-4">
                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Your plan and account details.</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Plan', value: 'Strata Beta — Free', valueStyle: { background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: 6 } },
                      { label: 'Data entries', value: `${entryCount} entries`, valueStyle: {} },
                      { label: 'Last saved', value: new Date().toLocaleString(), valueStyle: {} },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)', ...item.valueStyle }}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sign out</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Sign out of your Strata account on this device.</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>

                <div className="p-5" style={{ borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>Danger zone</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Permanent actions — cannot be undone.</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Export all data (JSON)</span>
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}>
                        Export
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Clear all metric data</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Permanently deletes entries but keeps account/workspaces</p>
                      </div>
                      <button
                        onClick={() => setClearConfirmOpen(true)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                        style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.18)' }}>
                        Clear All Data
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm" style={{ color: '#f43f5e' }}>Delete account</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Remove your FounderOS profile and sign out</p>
                      </div>
                      <button onClick={() => setDeleteAccountOpen(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(244,63,94,0.10)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.25)' }}><Trash2 className="inline h-3.5 w-3.5 mr-1" />Delete Account</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
