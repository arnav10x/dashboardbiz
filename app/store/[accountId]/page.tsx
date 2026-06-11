'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Package, Loader2, AlertCircle, ExternalLink } from 'lucide-react'

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

const money = (amount: number | null, currency = 'usd') => {
  if (amount == null) return 'Contact us'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

export default function StorePage({ params }: { params: { accountId: string } }) {
  const { accountId } = params
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [buying, setBuying]       = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/stripe/accounts/${accountId}/products`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setProducts((data.products ?? []).filter((p: Product) => p.active))
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [accountId])

  async function handleBuy(product: Product) {
    const price = product.default_price
    if (!price) return
    setBuying(product.id)
    try {
      const res = await fetch(`/api/stripe/accounts/${accountId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: price.id,
          productName: product.name,
          unitAmount: price.unit_amount,
          currency: price.currency,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setBuying(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base, #0f0f12)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-subtle, rgba(255,255,255,0.07))' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
            <ShoppingBag size={18} color="#fff" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              Store
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted, #64748b)' }}>
              Powered by prspectve
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex items-center justify-center py-20 gap-2" style={{ color: 'var(--text-muted, #64748b)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading products…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 p-4 rounded-2xl text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <Package size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--text-muted, #64748b)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted, #64748b)' }}>No products available yet.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
              Products
            </h2>
            {products.map(p => (
              <div key={p.id} className="p-5 rounded-2xl flex items-center justify-between gap-4"
                style={{
                  background: 'var(--bg-card, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
                }}>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <Package size={20} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold" style={{ color: 'var(--text-primary, #f1f5f9)' }}>{p.name}</p>
                    {p.description && (
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted, #64748b)' }}>{p.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: 'var(--text-primary, #f1f5f9)', fontVariantNumeric: 'tabular-nums' }}>
                      {money(p.default_price?.unit_amount ?? null, p.default_price?.currency)}
                    </p>
                    {p.default_price?.recurring && (
                      <p className="text-xs" style={{ color: 'var(--text-muted, #64748b)' }}>
                        / {p.default_price.recurring.interval}
                      </p>
                    )}
                  </div>

                  {p.default_price && (
                    <button
                      onClick={() => handleBuy(p)}
                      disabled={buying === p.id}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
                        color: '#fff',
                        opacity: buying === p.id ? 0.7 : 1,
                        cursor: buying === p.id ? 'not-allowed' : 'pointer',
                        border: 'none',
                      }}
                    >
                      {buying === p.id ? <Loader2 size={14} className="animate-spin" /> : null}
                      {buying === p.id ? 'Redirecting…' : 'Buy now'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
