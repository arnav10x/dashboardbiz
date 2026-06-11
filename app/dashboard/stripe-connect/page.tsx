'use client'

import { useCallback, useEffect, useState } from 'react'
import { TopBar } from '@/components/strata/TopBar'
import {
  Store, ExternalLink, Plus, RefreshCw, CreditCard, CheckCircle2,
  AlertCircle, Clock, Package, DollarSign, ArrowRight, Loader2,
  ShoppingBag, Users, Zap,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────── */
type ConnectedAccount = {
  accountId: string
  displayName: string
  createdAt: string
}

type AccountStatus = {
  id: string
  display_name: string
  readyToProcessPayments: boolean
  onboardingComplete: boolean
  requirements?: any
}

type Product = {
  id: string
  name: string
  description: string | null
  active: boolean
  default_price: {
    id: string
    unit_amount: number | null
    currency: string
    type: string
    recurring: { interval: string } | null
  } | null
}

/* ─── Helpers ────────────────────────────────────────────── */
const money = (amount: number | null, currency = 'usd') => {
  if (amount == null) return 'Custom'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

/* ─── Styled card helper (matches finance page) ──────────── */
const card = (): React.CSSProperties => ({
  background: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 16,
})

const S = {
  label: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.16em', color: 'var(--text-muted)' },
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function StripeConnectPage() {
  const [wsName, setWsName]               = useState('prspectve')
  const [loading, setLoading]             = useState(true)
  const [account, setAccount]             = useState<ConnectedAccount | null>(null)
  const [status, setStatus]               = useState<AccountStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [products, setProducts]           = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  // Create account form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading]   = useState(false)
  const [displayName, setDisplayName]       = useState('')
  const [contactEmail, setContactEmail]     = useState('')
  const [createError, setCreateError]       = useState<string | null>(null)

  // Create product form
  const [showProductForm, setShowProductForm] = useState(false)
  const [productLoading, setProductLoading]   = useState(false)
  const [productName, setProductName]         = useState('')
  const [productDesc, setProductDesc]         = useState('')
  const [productPrice, setProductPrice]       = useState('')
  const [productError, setProductError]       = useState<string | null>(null)

  // Subscribe / portal
  const [subLoading, setSubLoading]     = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [onboardLoading, setOnboardLoading] = useState(false)

  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  /* ─── Load ─── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wsRes, acctRes] = await Promise.all([
        fetch('/api/workspace').catch(() => null),
        fetch('/api/stripe/accounts'),
      ])
      const acctData = await acctRes.json()
      if (acctData.account) {
        setAccount({
          accountId: acctData.account.stripe_account_id,
          displayName: acctData.account.display_name,
          createdAt: acctData.account.created_at,
        })
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  /* ─── Load account status + products when account is set ─── */
  const loadStatus = useCallback(async (accountId: string) => {
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/stripe/accounts/${accountId}/status`)
      const data = await res.json()
      if (res.ok) setStatus(data)
    } finally {
      setStatusLoading(false)
    }
  }, [])

  const loadProducts = useCallback(async (accountId: string) => {
    setProductsLoading(true)
    try {
      const res = await fetch(`/api/stripe/accounts/${accountId}/products`)
      const data = await res.json()
      if (res.ok) setProducts(data.products ?? [])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (account?.accountId) {
      loadStatus(account.accountId)
      loadProducts(account.accountId)
    }
  }, [account, loadStatus, loadProducts])

  // URL param handling (after redirect back from onboarding/subscribe)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('onboarded')) showToast('Onboarding step complete — checking status…')
    if (params.get('subscribed')) showToast('Subscription activated!')
    if (params.get('refresh')) showToast('Refreshing onboarding link…')
    if (params.toString()) window.history.replaceState({}, '', window.location.pathname)
  }, [])

  /* ─── Handlers ─── */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError(null)
    setCreateLoading(true)
    try {
      const res = await fetch('/api/stripe/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, contactEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? 'Failed to create account'); return }
      setShowCreateForm(false)
      setDisplayName('')
      setContactEmail('')
      await load()
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleOnboard() {
    if (!account) return
    setOnboardLoading(true)
    try {
      const res = await fetch(`/api/stripe/accounts/${account.accountId}/onboard`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) window.location.href = data.url
      else showToast(data.error ?? 'Failed to start onboarding')
    } finally {
      setOnboardLoading(false)
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!account) return
    setProductError(null)
    setProductLoading(true)
    try {
      const res = await fetch(`/api/stripe/accounts/${account.accountId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName,
          description: productDesc || undefined,
          unitAmount: productPrice ? Math.round(parseFloat(productPrice) * 100) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setProductError(data.error ?? 'Failed to create product'); return }
      setShowProductForm(false)
      setProductName('')
      setProductDesc('')
      setProductPrice('')
      await loadProducts(account.accountId)
    } finally {
      setProductLoading(false)
    }
  }

  async function handleSubscribe() {
    if (!account) return
    setSubLoading(true)
    try {
      const res = await fetch(`/api/stripe/accounts/${account.accountId}/subscribe`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) window.location.href = data.url
      else showToast(data.error ?? 'Subscription not available. Set STRIPE_PRICE_ID.')
    } finally {
      setSubLoading(false)
    }
  }

  async function handlePortal() {
    if (!account) return
    setPortalLoading(true)
    try {
      const res = await fetch(`/api/stripe/accounts/${account.accountId}/portal`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.url) window.open(data.url, '_blank')
      else showToast(data.error ?? 'Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  /* ─── Render ─── */
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Stripe Connect" workspaceName={wsName} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin" size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TopBar title="Stripe Connect" workspaceName={wsName} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-xl"
          style={{ background: 'var(--accent)', color: '#fff', fontSize: 13 }}>
          {toast}
        </div>
      )}

      <div className="px-4 md:px-6 py-4 md:py-6 space-y-6">

        {/* ── No account yet ── */}
        {!account && (
          <div className="p-6 rounded-2xl text-center" style={card()}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--accent-muted)' }}>
              <Store size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Set up your Stripe account
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 24px' }}>
              Create a connected Stripe account to accept payments from customers, manage products, and get paid directly to your bank.
            </p>

            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Plus size={16} /> Get started
              </button>
            ) : (
              <form onSubmit={handleCreate} className="text-left max-w-sm mx-auto space-y-3">
                <div>
                  <label style={S.label} className="block mb-1">Business name</label>
                  <input
                    required value={displayName} onChange={e => setDisplayName(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={S.label} className="block mb-1">Contact email</label>
                  <input
                    required type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  />
                </div>
                {createError && (
                  <p className="text-xs" style={{ color: 'var(--red)' }}>{createError}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={createLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--accent)', color: '#fff', opacity: createLoading ? 0.7 : 1 }}>
                    {createLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                    {createLoading ? 'Creating…' : 'Create account'}
                  </button>
                  <button type="button" onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── Account exists ── */}
        {account && (
          <>
            {/* Status card */}
            <div className="p-5" style={card()}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p style={S.label}>Connected account</p>
                  <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                    {account.displayName}
                  </h2>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                    {account.accountId}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* View store */}
                  <a href={`/store/${account.accountId}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', textDecoration: 'none' }}>
                    <ShoppingBag size={13} /> View store <ExternalLink size={11} />
                  </a>

                  {/* Subscribe / Billing portal */}
                  <button onClick={handleSubscribe} disabled={subLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--accent-muted)', color: 'var(--accent)', opacity: subLoading ? 0.7 : 1 }}>
                    {subLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                    Subscribe to Pro
                  </button>

                  <button onClick={handlePortal} disabled={portalLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', opacity: portalLoading ? 0.7 : 1 }}>
                    {portalLoading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
                    Billing portal
                  </button>

                  <button onClick={() => account && loadStatus(account.accountId)} disabled={statusLoading}
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                    <RefreshCw size={13} className={statusLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Status indicators */}
              {status && !statusLoading && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <StatusBadge
                    ok={status.readyToProcessPayments}
                    label="Card payments"
                    okText="Active"
                    pendingText="Pending activation"
                  />
                  <StatusBadge
                    ok={status.onboardingComplete}
                    label="Onboarding"
                    okText="Complete"
                    pendingText="Action required"
                  />
                  {!status.onboardingComplete && (
                    <button onClick={handleOnboard} disabled={onboardLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--accent)', color: '#fff', opacity: onboardLoading ? 0.7 : 1 }}>
                      {onboardLoading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                      Complete onboarding
                    </button>
                  )}
                </div>
              )}
              {statusLoading && (
                <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 size={12} className="animate-spin" /> Checking account status…
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Products</h3>
                <button onClick={() => setShowProductForm(v => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                  <Plus size={13} /> Add product
                </button>
              </div>

              {/* Add product form */}
              {showProductForm && (
                <form onSubmit={handleCreateProduct} className="p-4 mb-3 rounded-2xl space-y-3" style={card()}>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>New product</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={S.label} className="block mb-1">Name</label>
                      <input required value={productName} onChange={e => setProductName(e.target.value)}
                        placeholder="e.g. Website Audit"
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label style={S.label} className="block mb-1">Price (USD)</label>
                      <input value={productPrice} onChange={e => setProductPrice(e.target.value)}
                        type="number" min="0" step="0.01" placeholder="99.00"
                        className="w-full px-3 py-2 rounded-xl text-sm"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={S.label} className="block mb-1">Description (optional)</label>
                    <input value={productDesc} onChange={e => setProductDesc(e.target.value)}
                      placeholder="Short description for your customers"
                      className="w-full px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
                  </div>
                  {productError && <p className="text-xs" style={{ color: 'var(--red)' }}>{productError}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={productLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--accent)', color: '#fff', opacity: productLoading ? 0.7 : 1 }}>
                      {productLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                      {productLoading ? 'Creating…' : 'Create product'}
                    </button>
                    <button type="button" onClick={() => setShowProductForm(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Products list */}
              {productsLoading ? (
                <div className="p-4 rounded-2xl flex items-center gap-2 text-sm" style={{ ...card(), color: 'var(--text-muted)' }}>
                  <Loader2 size={14} className="animate-spin" /> Loading products…
                </div>
              ) : products.length === 0 ? (
                <div className="p-6 rounded-2xl text-center text-sm" style={{ ...card(), color: 'var(--text-muted)' }}>
                  <Package size={28} className="mx-auto mb-2 opacity-40" />
                  No products yet. Add your first product above.
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map(p => (
                    <ProductRow key={p.id} product={p} accountId={account.accountId} />
                  ))}
                </div>
              )}
            </div>

            {/* Webhook setup reminder */}
            <div className="p-4 rounded-2xl flex gap-3" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border, var(--border-subtle))', borderRadius: 16 }}>
              <Zap size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Webhook setup required</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  To receive real-time events, add these endpoints in your{' '}
                  <span className="font-mono font-semibold">Stripe Dashboard → Developers → Webhooks</span>:<br />
                  <code className="font-mono text-xs mt-1 inline-block">/api/stripe/webhooks/v2</code> (thin events, connected accounts) and{' '}
                  <code className="font-mono text-xs">/api/stripe/webhooks/subscriptions</code> (V1 standard events).
                  Set <code className="font-mono text-xs">STRIPE_WEBHOOK_SECRET_V2</code> and <code className="font-mono text-xs">STRIPE_WEBHOOK_SECRET_SUBS</code> in your env vars.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────── */

function StatusBadge({ ok, label, okText, pendingText }: { ok: boolean; label: string; okText: string; pendingText: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{
        background: ok ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
        color: ok ? '#16a34a' : '#b45309',
      }}>
      {ok ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {label}: {ok ? okText : pendingText}
    </div>
  )
}

function ProductRow({ product, accountId }: { product: Product; accountId: string }) {
  const price = product.default_price
  const isRecurring = price?.recurring != null
  return (
    <div className="p-4 rounded-2xl flex items-center justify-between gap-4" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 14,
    }}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-muted)' }}>
          <Package size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
          {product.description && (
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{product.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {money(price?.unit_amount ?? null, price?.currency)}
          </p>
          {isRecurring && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              / {price?.recurring?.interval}
            </p>
          )}
        </div>
        <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
          style={{
            background: product.active ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.15)',
            color: product.active ? '#16a34a' : 'var(--text-muted)',
          }}>
          {product.active ? 'Active' : 'Inactive'}
        </span>
      </div>
    </div>
  )
}
