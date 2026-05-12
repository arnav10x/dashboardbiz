'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/strata/TopBar'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STEPS = ['Financials', 'Pipeline', 'Goals', 'Marketing']

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const CHANNELS = ['Instagram DMs', 'LinkedIn', 'Email outreach', 'Referrals', 'Paid ads', 'Cold calling', 'Other']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={label} className="flex items-center flex-1 last:flex-initial">
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: active ? 'var(--accent)' : done ? 'var(--accent-muted)' : 'var(--bg-card)',
                color: active ? 'white' : done ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${active || done ? 'transparent' : 'var(--border)'}`,
              }}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : (
                <span
                  className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: active ? 'rgba(255,255,255,0.25)' : 'var(--bg-raised)',
                  }}
                >
                  {i + 1}
                </span>
              )}
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          {label}
        </label>
        {required && <span className="text-[10px]" style={{ color: 'var(--accent)' }}>required</span>}
        {hint && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const BLANK_FINANCIALS = { revenue: '', expenses: '', cashOnHand: '', period: 'last', customMonth: '', notes: '' }
const BLANK_PIPELINE = { newLeads: '', newCustomers: '', proposalsSent: '', hoursWorked: '', channel: '' }
const BLANK_GOALS = { revenueTarget: '', periodGoal: '', bottleneck: '', businessNotes: '' }
const BLANK_MARKETING = { metaAds: '', googleAds: '', instagramOrganic: '', otherChannels: '', impressions: '', newFollowers: '', bestCampaign: '', isCurrentMonth: true }

export default function PeriodEntryPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [workspaceName, setWorkspaceName] = useState('My Workspace')

  const now = new Date()
  const currentMonth = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const prevMonth = now.getMonth() === 0
    ? `${MONTHS[11]} ${now.getFullYear() - 1}`
    : `${MONTHS[now.getMonth() - 1]} ${now.getFullYear()}`

  const [financials, setFinancials] = useState(() => ({ ...BLANK_FINANCIALS, customMonth: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}` }))
  const [pipeline, setPipeline] = useState(BLANK_PIPELINE)
  const [goals, setGoals] = useState(BLANK_GOALS)
  const [marketing, setMarketing] = useState(BLANK_MARKETING)

  useEffect(() => {
    const fetchWs = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ws } = await supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle()
      if (ws?.name) setWorkspaceName(ws.name)
    }
    fetchWs()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaveError('Not logged in.'); return }

      const { data: workspace } = await supabase
        .from('workspaces').select('id').eq('owner_id', user.id).maybeSingle()

      const periodDate = financials.period === 'custom' && financials.customMonth
        ? `${financials.customMonth}-01`
        : financials.period === 'last'
          ? new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
          : new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

      const payload = {
        workspace_id: workspace?.id?.toString() ?? null,
        user_id: user.id,
        period_date: periodDate,
        period: financials.period,
        revenue: Number(financials.revenue) || 0,
        expenses: Number(financials.expenses) || 0,
        cash: Number(financials.cashOnHand) || 0,
        cash_on_hand: Number(financials.cashOnHand) || 0,
        notes: financials.notes,
        new_leads: Number(pipeline.newLeads) || 0,
        leads: Number(pipeline.newLeads) || 0,
        new_customers: Number(pipeline.newCustomers) || 0,
        customers: Number(pipeline.newCustomers) || 0,
        proposals_sent: Number(pipeline.proposalsSent) || 0,
        proposals: Number(pipeline.proposalsSent) || 0,
        hours_worked: Number(pipeline.hoursWorked) || 0,
        primary_channel: pipeline.channel,
        channel: pipeline.channel,
        revenue_target: Number(goals.revenueTarget) || 0,
        period_goal: goals.periodGoal,
        goal: goals.periodGoal,
        biggest_bottleneck: goals.bottleneck,
        business_notes: goals.businessNotes,
        meta_ads_spend: Number(marketing.metaAds) || 0,
        spend_meta: Number(marketing.metaAds) || 0,
        google_ads_spend: Number(marketing.googleAds) || 0,
        spend_google: Number(marketing.googleAds) || 0,
        instagram_organic: Number(marketing.instagramOrganic) || 0,
        other_channels_spend: Number(marketing.otherChannels) || 0,
        spend_other: Number(marketing.otherChannels) || 0,
        impressions: Number(marketing.impressions) || 0,
        new_followers: Number(marketing.newFollowers) || 0,
        best_campaign: marketing.bestCampaign,
      }

      const { error } = await supabase
        .from('period_entries')
        .upsert(payload, { onConflict: 'user_id,period_date' })

      if (error) {
        setSaveError(error.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Data Entry" workspaceName={workspaceName} hasData={true} showGreeting />

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 max-w-3xl mx-auto w-full animate-in">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Period Data Entry
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Log completed period data — typically{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{prevMonth}</strong>.
            {' '}Powers your entire dashboard.
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Step 0: Financials */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                Last completed month financials
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Enter data for a completed month. Do <strong>not</strong> enter current-month numbers here — use the P&amp;L Calendar for live daily tracking.
              </p>
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg mb-5"
                style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid rgba(244,63,94,0.2)' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                Logging: {prevMonth}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Revenue ($)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={financials.revenue}
                    onChange={e => setFinancials(p => ({ ...p, revenue: e.target.value }))} />
                </div>
              </Field>
              <Field label="Expenses ($)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={financials.expenses}
                    onChange={e => setFinancials(p => ({ ...p, expenses: e.target.value }))} />
                </div>
              </Field>
              <Field label="Cash on Hand ($)">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={financials.cashOnHand}
                    onChange={e => setFinancials(p => ({ ...p, cashOnHand: e.target.value }))} />
                </div>
              </Field>
              <Field label="Period">
                <select className="input-base" value={financials.period}
                  onChange={e => setFinancials(p => ({ ...p, period: e.target.value }))}>
                  <option value="last">Last month ({prevMonth})</option>
                  <option value="current">Current month ({currentMonth})</option>
                  <option value="custom">Choose another month</option>
                </select>
              </Field>
              {financials.period === 'custom' && (
                <Field label="Choose month" required>
                  <input
                    type="month"
                    className="input-base"
                    value={financials.customMonth}
                    onChange={e => setFinancials(p => ({ ...p, customMonth: e.target.value }))}
                  />
                </Field>
              )}
            </div>
            <Field label="Notes" hint="optional">
              <textarea className="input-base" rows={3}
                placeholder="Notable events — lost a client, won a big deal, raised prices..."
                value={financials.notes}
                onChange={e => setFinancials(p => ({ ...p, notes: e.target.value }))}
              />
            </Field>
          </div>
        )}

        {/* Step 1: Pipeline */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                Current month pipeline
              </h3>
              <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>
                Leads, customers, and conversion for the current month. This data feeds Today&apos;s Focus, AI Copilot, and Reports.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="New Leads" hint="this period">
                <input type="number" className="input-base" placeholder="0" value={pipeline.newLeads}
                  onChange={e => setPipeline(p => ({ ...p, newLeads: e.target.value }))} />
              </Field>
              <Field label="New Customers" hint="converted">
                <input type="number" className="input-base" placeholder="0" value={pipeline.newCustomers}
                  onChange={e => setPipeline(p => ({ ...p, newCustomers: e.target.value }))} />
              </Field>
              <Field label="Proposals Sent">
                <input type="number" className="input-base" placeholder="0" value={pipeline.proposalsSent}
                  onChange={e => setPipeline(p => ({ ...p, proposalsSent: e.target.value }))} />
              </Field>
              <Field label="Hours Worked">
                <input type="number" className="input-base" placeholder="0" value={pipeline.hoursWorked}
                  onChange={e => setPipeline(p => ({ ...p, hoursWorked: e.target.value }))} />
              </Field>
            </div>
            <Field label="Primary Marketing Channel">
              <select className="input-base" value={pipeline.channel}
                onChange={e => setPipeline(p => ({ ...p, channel: e.target.value }))}>
                <option value="">— Select —</option>
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                Goals for this month
              </h3>
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                Set targets for {currentMonth}. Your AI Copilot uses these to track pace and surface urgent actions.
              </p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                {30 - now.getDate()} days remaining in {MONTHS[now.getMonth()]} {now.getFullYear()}.
              </p>
            </div>
            <Field label="Revenue Target ($)" hint="for this period">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={goals.revenueTarget}
                  onChange={e => setGoals(p => ({ ...p, revenueTarget: e.target.value }))} />
              </div>
            </Field>
            <Field label="Period Goal" hint="140 chars">
              <input type="text" className="input-base" maxLength={140}
                placeholder="e.g. Close 3 new contracts, break $20k revenue"
                value={goals.periodGoal}
                onChange={e => setGoals(p => ({ ...p, periodGoal: e.target.value }))} />
            </Field>
            <Field label="Biggest Bottleneck">
              <input type="text" className="input-base"
                placeholder="e.g. Follow-up speed, pricing objections, not enough leads"
                value={goals.bottleneck}
                onChange={e => setGoals(p => ({ ...p, bottleneck: e.target.value }))} />
            </Field>
            <Field label="Business Notes" hint="optional">
              <textarea className="input-base" rows={4}
                placeholder="What happened this period? Key decisions, changes, wins, problems..."
                value={goals.businessNotes}
                onChange={e => setGoals(p => ({ ...p, businessNotes: e.target.value }))} />
            </Field>
          </div>
        )}

        {/* Step 3: Marketing */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                Marketing spend
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Optional. Calculates CAC, cost-per-lead, and ROI automatically.
              </p>
              <div className="flex rounded-lg overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
                {['Current month so far', 'Last completed month'].map((label, i) => (
                  <button
                    key={label}
                    onClick={() => setMarketing(p => ({ ...p, isCurrentMonth: i === 0 }))}
                    className="flex-1 py-2 text-xs font-semibold transition-colors"
                    style={{
                      background: (i === 0) === marketing.isCurrentMonth ? 'var(--bg-card)' : 'transparent',
                      color: (i === 0) === marketing.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold mb-4" style={{ color: 'var(--accent)' }}>
                Logging spend for: {marketing.isCurrentMonth ? `current month (${currentMonth})` : `last completed month (${prevMonth})`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Meta Ads — Paid" hint="Facebook + Instagram">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={marketing.metaAds}
                    onChange={e => setMarketing(p => ({ ...p, metaAds: e.target.value }))} />
                </div>
              </Field>
              <Field label="Google Ads / SEO">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={marketing.googleAds}
                    onChange={e => setMarketing(p => ({ ...p, googleAds: e.target.value }))} />
                </div>
              </Field>
              <Field label="Instagram Organic" hint="unpaid content">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={marketing.instagramOrganic}
                    onChange={e => setMarketing(p => ({ ...p, instagramOrganic: e.target.value }))} />
                </div>
              </Field>
              <Field label="Other Channels">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input type="number" className="input-base" style={{ paddingLeft: '1.75rem' }} placeholder="0" value={marketing.otherChannels}
                    onChange={e => setMarketing(p => ({ ...p, otherChannels: e.target.value }))} />
                </div>
              </Field>
              <Field label="Impressions / Reach">
                <input type="number" className="input-base" placeholder="0" value={marketing.impressions}
                  onChange={e => setMarketing(p => ({ ...p, impressions: e.target.value }))} />
              </Field>
              <Field label="New Followers / Subscribers">
                <input type="number" className="input-base" placeholder="0" value={marketing.newFollowers}
                  onChange={e => setMarketing(p => ({ ...p, newFollowers: e.target.value }))} />
              </Field>
            </div>
            <Field label="Best Campaign or Content Piece">
              <input type="text" className="input-base"
                placeholder="e.g. Meta reel on pricing — 45k reach"
                value={marketing.bestCampaign}
                onChange={e => setMarketing(p => ({ ...p, bestCampaign: e.target.value }))} />
            </Field>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          {saveError && (
            <div className="mb-4 px-4 py-3 rounded-lg text-xs" style={{ background: 'rgba(244,63,94,0.1)', color: 'var(--accent)', border: '1px solid rgba(244,63,94,0.2)' }}>
              Save failed: {saveError}
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setStep(0); setFinancials(BLANK_FINANCIALS); setPipeline(BLANK_PIPELINE); setGoals(BLANK_GOALS); setMarketing(BLANK_MARKETING); setSaveError('') }}
              className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Clear all
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
                >
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="text-xs font-bold px-5 py-2 rounded-lg transition-colors"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  Next: {STEPS[step + 1]} →
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs font-bold px-5 py-2 rounded-lg transition-colors disabled:opacity-60"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  {saving ? 'Saving…' : '✓ Save & go to dashboard'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
