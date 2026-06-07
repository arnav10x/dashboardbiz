import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: 24, textAlign: 'center',
        background: '#050505', fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p style={{ fontSize: 72, fontWeight: 900, color: '#22c55e', margin: 0, lineHeight: 1 }}>
        404
      </p>

      <div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fafafa', margin: '0 0 8px' }}>
          Page not found
        </h1>
        <p style={{ fontSize: 14, color: '#71717a', maxWidth: 340, lineHeight: 1.6, margin: 0 }}>
          This page doesn&apos;t exist or may have been moved.
        </p>
      </div>

      <Link
        href="/dashboard"
        style={{
          fontSize: 13, fontWeight: 700,
          padding: '11px 22px', borderRadius: 10,
          background: '#22c55e', color: '#031008',
          textDecoration: 'none',
        }}
      >
        Back to dashboard
      </Link>
    </div>
  )
}
