'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import { createClient } from '@/lib/supabase/client'
import { Check, X } from 'lucide-react'

const FREE_FEATURES = [
  { label: '3 period entries', included: true },
  { label: 'Basic overview & insights', included: true },
  { label: 'P&L Calendar (current month)', included: true },
  { label: 'Cal.com integration', included: true },
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
  const [upgradeClicked, setUpgradeClicked] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: ws } = await supabase.from('workspaces').select('name').eq('owner_id', user.id).maybeSingle()
      if (ws?.name) setWorkspaceName(ws.name)
    }
    load()
  }, [])

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Billing & Plan" workspaceName={workspaceName} hasData={true} showGreeting />

      <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Billing &amp; Plan</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your subscription and unlock advanced features.</p>
          </div>
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            ✓ Strata Free
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
          {/* Free tier */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>FREE</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>$0</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/mo</span>
            </div>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>For solo founders getting started.</p>
            <div className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-2.5">
                  {f.included ? (
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: '#10b981' }} />
                  ) : (
                    <X className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                  )}
                  <span
                    className="text-sm"
                    style={{ color: f.included ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                  >
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium tier */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #e11d48 100%)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <div
              className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20"
              style={{ background: 'white', transform: 'translate(30%, -30%)' }}
            />
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
            {upgradeClicked ? (
              <div className="w-full py-3 rounded-xl text-sm font-semibold text-center" style={{ background: 'white', color: '#16a34a' }}>
                ✓ We'll reach out soon — payments coming soon!
              </div>
            ) : (
              <button
                onClick={() => setUpgradeClicked(true)}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'white', color: 'var(--accent)' }}
              >
                Upgrade to Premium →
              </button>
            )}
            <p className="text-center text-xs mt-3 text-rose-200">
              Stripe payments coming soon · 30-day guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
