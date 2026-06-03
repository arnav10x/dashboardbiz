'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Loader2 } from 'lucide-react'

const FREE_FEATURES = [
  { label: '3 period entries', included: true },
  { label: 'Basic overview & insights', included: true },
  { label: 'P&L Calendar (current month)', included: true },
  { label: 'AI Copilot (limited)', included: false },
  { label: 'Advanced reports', included: false },
  { label: 'All integrations', included: false },
]

const PRO_FEATURES = [
  'Unlimited period entries',
  'Full AI Copilot',
  'All reports & PDF export',
  'All integrations (Stripe, Shopify...)',
  'P&L Calendar — all months',
  'Weekly email performance report',
  'Priority support',
]

export default function BillingPage() {
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [hasCustomer, setHasCustomer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ws } = await supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle()
      if (ws?.name) setWorkspaceName(ws.name)

      const params = new URLSearchParams(window.location.search)
      const res = await fetch('/api/stripe/status')
      if (res.ok) {
        const data = await res.json()
        setPlan(data.isPro ? 'pro' : 'free')
        setPeriodEnd(data.currentPeriodEnd)
        setHasCustomer(data.hasCustomer)
      }

      if (params.get('upgraded') === 'true') {
        window.history.replaceState({}, '', '/dashboard/billing')
      }
      setLoading(false)
    }
    load()
  }, [])

  const startCheckout = async () => {
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to start checkout')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const openPortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to open billing portal')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  const isPro = plan === 'pro'

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Billing & Plan" workspaceName={workspaceName} hasData={true} showGreeting />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Billing &amp; Plan</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your subscription and unlock advanced features.</p>
          </div>
          {!loading && (
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{
                background: isPro ? 'rgba(244,63,94,0.12)' : 'rgba(139,92,246,0.12)',
                color: isPro ? '#f43f5e' : 'var(--accent)',
                border: `1px solid ${isPro ? 'rgba(244,63,94,0.25)' : 'rgba(139,92,246,0.2)'}`,
              }}
            >
              {isPro ? '★ prspectve Premium' : '✓ prspectve Free'}
            </span>
          )}
        </div>

        {isPro && periodEnd && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm flex items-center justify-between max-w-3xl" style={{ background: 'var(--accent-faint)', border: '1px solid var(--accent-ring)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              Next billing date: <strong style={{ color: 'var(--text-primary)' }}>{new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
            </span>
            <button onClick={openPortal} disabled={portalLoading} className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
              {portalLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              Manage subscription →
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          {/* Free tier */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: `2px solid ${!isPro ? 'var(--accent)' : 'var(--border)'}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>FREE</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>$0</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mo</span>
            </div>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>For solo founders getting started.</p>
            <div className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-2.5">
                  {f.included
                    ? <Check className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    : <X className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
                  <span className="text-sm" style={{ color: f.included ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{f.label}</span>
                </div>
              ))}
            </div>
            {!isPro && (
              <div className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold text-center" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Current plan
              </div>
            )}
          </div>

          {/* Premium tier */}
          <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #e11d48 100%)', border: `2px solid ${isPro ? 'white' : 'rgba(255,255,255,0.15)'}` }}>
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-rose-200">PREMIUM</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black text-white">$29</span>
              <span className="text-sm text-rose-200">/mo</span>
            </div>
            <p className="text-xs mb-5 text-rose-200">For serious founders &amp; teams.</p>
            <div className="space-y-2.5 mb-6">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 flex-shrink-0 text-white" />
                  <span className="text-sm text-white">{f}</span>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="w-full py-3 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              </div>
            ) : isPro ? (
              <div className="space-y-2">
                <div className="w-full py-3 rounded-xl text-sm font-bold text-center" style={{ background: 'white', color: '#16a34a' }}>
                  ✓ You're on Premium
                </div>
                <button onClick={openPortal} disabled={portalLoading} className="w-full py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white transition-colors">
                  {portalLoading ? 'Opening portal…' : 'Manage or cancel subscription →'}
                </button>
              </div>
            ) : (
              <button onClick={startCheckout} disabled={checkoutLoading} className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: 'white', color: 'var(--accent)' }}>
                {checkoutLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : 'Upgrade to Premium →'}
              </button>
            )}
            <p className="text-center text-xs mt-3 text-rose-200">Secured by Stripe · Cancel anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
}
