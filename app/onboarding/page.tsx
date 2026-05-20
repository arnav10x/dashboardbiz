'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, ChevronRight, Zap, Target, Brain, Rocket, ArrowRight } from 'lucide-react'

const BUSINESS_TYPES = ['Agency', 'SaaS', 'Ecommerce', 'Consulting', 'Freelance', 'Creator', 'Other']
const STAGES = ['Pre-revenue', 'Early Stage ($0–$5k/mo)', 'Growing ($5k–$20k/mo)', 'Established ($20k+/mo)']
const GOALS = ['Hit $5k/month', 'Hit $10k/month', 'Hit $25k/month', 'Reach profitability', 'Scale team', 'Exit / build to sell']

const PLACEHOLDERS: Record<string, string> = {
  Agency: 'I run a social media marketing agency targeting DTC brands. My core offer is a $3k/month content package — short-form videos and copy. I\'m currently at $6k MRR and my main focus is cold outreach to Shopify stores doing over $500k in revenue.',
  SaaS: 'I build a B2B SaaS tool that helps sales teams track outreach. We\'re at $2k MRR with 40 trial users and focused on converting trials to paid. Our ICP is SDRs at Series A startups.',
  Ecommerce: 'I sell premium skincare products on Shopify targeting women 25–45. We do $15k/month and my focus is improving ROAS on Meta Ads and building our email list for retention.',
  Consulting: 'I offer operations consulting to 7-figure e-commerce brands. My engagements are $5k–$15k per project. I get most clients through LinkedIn and referrals and want to productize one of my frameworks.',
  Freelance: 'I\'m a freelance brand designer working with early-stage startups. I charge $3k–$8k per project and get clients through inbound referrals. I want to move toward retainer-based work.',
  Creator: 'I create personal finance content on YouTube and Instagram. I monetize through sponsorships and a digital course. I\'m at 12k followers and focused on growing to 50k this year.',
  Other: 'Describe your business model, who you serve, how you make money, and what you\'re focused on right now...',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)

  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState('Agency')
  const [stage, setStage] = useState('Early Stage ($0–$5k/mo)')
  const [summary, setSummary] = useState('')
  const [goal, setGoal] = useState('Hit $10k/month')
  const [revenueTarget, setRevenueTarget] = useState('')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: settings }, { data: ws }] = await Promise.all([
        supabase.from('user_settings').select('onboarding_completed').eq('user_id', user.id).maybeSingle(),
        supabase.from('workspaces').select('name, business_type, stage').eq('owner_id', user.id).maybeSingle(),
      ])

      if (settings?.onboarding_completed) {
        router.push('/dashboard')
        return
      }

      if (ws) {
        setBusinessName(ws.name || '')
        setBusinessType(ws.business_type || 'Agency')
        setStage(ws.stage || 'Early Stage ($0–$5k/mo)')
      }

      setChecking(false)
    }
    check()
  }, [router])

  const handleFinish = async () => {
    setSaving(true)
    setSaveError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSaveError('Session expired. Please refresh and try again.')
      setSaving(false)
      return
    }

    // Upsert workspace — insert for new users, update for returning users
    const { data: existingWs } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (existingWs) {
      const { error: wsErr } = await supabase.from('workspaces').update({
        name: businessName || 'My Workspace',
        business_type: businessType,
        stage,
        business_summary: summary.trim(),
      }).eq('id', existingWs.id)
      if (wsErr) {
        setSaveError('Failed to save workspace info. Please try again.')
        setSaving(false)
        return
      }
    } else {
      const { error: wsErr } = await supabase.from('workspaces').insert({
        owner_id: user.id,
        name: businessName || 'My Workspace',
        business_type: businessType,
        stage,
        business_summary: summary.trim(),
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      })
      if (wsErr) {
        setSaveError('Failed to create workspace. Please try again.')
        setSaving(false)
        return
      }
    }

    const { error: settingsError } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      primary_goal: goal,
      revenue_target: Number(revenueTarget) || null,
      onboarding_completed: true,
    }, { onConflict: 'user_id' })

    if (settingsError) {
      setSaveError('Something went wrong saving your settings. Please try again.')
      setSaving(false)
      return
    }

    // Hard navigation ensures the dashboard server component re-runs with fresh data
    window.location.href = '/dashboard'
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex gap-1.5">
          {[0,1,2].map(i => (
            <div key={i} className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)', animation: `dotPulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
          ))}
        </div>
      </div>
    )
  }

  const STEPS = [
    { n: 1, label: 'Your business', icon: Rocket },
    { n: 2, label: 'Business context', icon: Brain },
    { n: 3, label: 'Your goals', icon: Target },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      {/* Radial glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.07) 0%, transparent 60%)' }} />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>FounderOS</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all"
                  style={{
                    background: step > s.n ? 'var(--accent)' : step === s.n ? 'var(--accent)' : 'var(--bg-card)',
                    color: step >= s.n ? 'white' : 'var(--text-muted)',
                    border: step < s.n ? '1px solid var(--border-strong)' : 'none',
                    boxShadow: step === s.n ? '0 0 16px rgba(34,197,94,0.4)' : 'none',
                  }}
                >
                  {step > s.n ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s.n}
                </div>
                <span className="text-[11px] font-semibold hidden sm:block" style={{ color: step === s.n ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 h-px mx-1" style={{ background: step > s.n ? 'var(--accent)' : 'var(--border-strong)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 animate-in" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

          {/* Step 1 — Business basics */}
          {step === 1 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Step 1 of 3</p>
              <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Tell us about your business</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
                This sets up your dashboard and personalizes every recommendation.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Business Name</label>
                  <input
                    className="input-base"
                    placeholder="e.g. Apex Marketing Co."
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Business Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BUSINESS_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setBusinessType(t)}
                        className="py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all"
                        style={{
                          background: businessType === t ? 'var(--accent-muted)' : 'var(--bg-raised)',
                          color: businessType === t ? 'var(--accent)' : 'var(--text-muted)',
                          border: `1px solid ${businessType === t ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                          boxShadow: businessType === t ? '0 0 12px rgba(34,197,94,0.15)' : 'none',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Current Stage</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STAGES.map(s => (
                      <button
                        key={s}
                        onClick={() => setStage(s)}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all"
                        style={{
                          background: stage === s ? 'var(--accent-muted)' : 'var(--bg-raised)',
                          color: stage === s ? 'var(--accent)' : 'var(--text-muted)',
                          border: `1px solid ${stage === s ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2 — Business context / AI summary */}
          {step === 2 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Step 2 of 3</p>
              <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Describe your business</h2>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
                Write 2–4 sentences covering what you do, who your clients are, how you make money, and what you're focused on. The AI uses this for every recommendation.
              </p>

              {/* AI context hint */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl mb-5" style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <Brain className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--accent)' }}>
                  This context powers your AI coach, suggested tasks, dashboard insights, and strategic recommendations. The more specific you are, the better your experience.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Business Context</label>
                <textarea
                  className="input-base resize-none"
                  rows={6}
                  placeholder={PLACEHOLDERS[businessType] || PLACEHOLDERS.Other}
                  value={summary}
                  onChange={e => setSummary(e.target.value.slice(0, 600))}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {summary.length < 80 ? 'Write at least 80 characters for best AI personalization' : '✓ Good detail level'}
                  </p>
                  <p className="text-[10px]" style={{ color: summary.length > 500 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {summary.length}/600
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={() => setStep(1)}
                  className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: summary.trim().length < 20 ? 'var(--bg-raised)' : 'var(--accent)', color: summary.trim().length < 20 ? 'var(--text-muted)' : 'white', boxShadow: summary.trim().length >= 20 ? '0 8px 24px rgba(34,197,94,0.3)' : 'none' }}
                >
                  {summary.trim().length < 20 ? 'Skip for now →' : 'Continue'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Goals */}
          {step === 3 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Step 3 of 3</p>
              <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Set your targets</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Your dashboard tracks performance against these. Change them anytime in Settings.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-muted)' }}>Primary Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map(g => (
                      <button
                        key={g}
                        onClick={() => setGoal(g)}
                        className="py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all"
                        style={{
                          background: goal === g ? 'var(--accent-muted)' : 'var(--bg-raised)',
                          color: goal === g ? 'var(--accent)' : 'var(--text-muted)',
                          border: `1px solid ${goal === g ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: 'var(--text-muted)' }}>Monthly Revenue Target</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>$</span>
                    <input
                      type="number"
                      className="input-base"
                      style={{ paddingLeft: '1.75rem' }}
                      placeholder="e.g. 10000"
                      value={revenueTarget}
                      onChange={e => setRevenueTarget(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    This shows a live pacing indicator on your dashboard.
                  </p>
                </div>
              </div>

              {saveError && (
                <p className="mt-4 text-xs text-center" style={{ color: '#f87171' }}>{saveError}</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-shrink-0 px-5 py-3 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold disabled:opacity-60 transition-all hover:opacity-90"
                  style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}
                >
                  {saving ? (
                    <>Setting up your OS...</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Launch my dashboard</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          You can update everything in Settings at any time.
        </p>
      </div>
    </div>
  )
}
