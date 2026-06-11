'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ArrowLeft, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function PurchaseSuccessPage({ params }: { params: { accountId: string } }) {
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setSessionId(p.get('session_id'))
  }, [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base, #0f0f12)' }}>
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(34,197,94,0.15)' }}>
          <CheckCircle2 size={40} style={{ color: '#22c55e' }} />
        </div>

        <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary, #f1f5f9)' }}>
          Payment successful!
        </h2>
        <p className="text-base mb-2" style={{ color: 'var(--text-muted, #64748b)', maxWidth: 380 }}>
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        {sessionId && (
          <p className="text-xs font-mono mt-1" style={{ color: 'var(--text-muted, #64748b)' }}>
            Order: {sessionId}
          </p>
        )}

        <Link href={`/store/${params.accountId}`}
          className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-xl font-semibold text-sm"
          style={{
            background: 'var(--bg-card, rgba(255,255,255,0.04))',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.07))',
            color: 'var(--text-primary, #f1f5f9)',
            textDecoration: 'none',
          }}>
          <ArrowLeft size={15} /> Back to store
        </Link>
      </div>
    </div>
  )
}
