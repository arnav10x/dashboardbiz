'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global error]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#050505', fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 20, padding: 24, textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'rgba(244,63,94,0.12)',
              border: '1px solid rgba(244,63,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <AlertTriangle style={{ width: 24, height: 24, color: '#f43f5e' }} />
          </div>

          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fafafa', margin: '0 0 8px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#71717a', maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
              An unexpected error occurred. Please try again — if the problem persists, refresh the page.
            </p>
          </div>

          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, fontWeight: 700,
              padding: '11px 22px', borderRadius: 10,
              background: '#111', border: '1px solid #333',
              color: '#a1a1aa', cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: 13, height: 13 }} />
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
