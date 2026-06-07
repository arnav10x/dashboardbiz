'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Dashboard error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-5 px-6 text-center">
      <div
        style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'rgba(244,63,94,0.12)',
          border: '1px solid rgba(244,63,94,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <AlertTriangle style={{ width: 22, height: 22, color: '#f43f5e' }} />
      </div>

      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.6 }}>
          This page ran into an unexpected error. Your data is safe — try refreshing or come back shortly.
        </p>
      </div>

      <button
        onClick={reset}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 13, fontWeight: 700,
          padding: '10px 20px', borderRadius: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
          color: 'var(--text-secondary)', cursor: 'pointer',
        }}
      >
        <RefreshCw style={{ width: 13, height: 13 }} />
        Try again
      </button>
    </div>
  )
}
