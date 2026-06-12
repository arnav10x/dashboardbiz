import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign in | prspectve',
  description: 'Sign in to your prspectve dashboard.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm animate-in stagger">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="prspectve" width={32} height={32} style={{ borderRadius: 8, display: 'block' }} />
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>prspectve</span>
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}
        >
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your workspace.
          </p>

          <LoginForm />

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link href="/signup" className="font-semibold underline underline-offset-2" style={{ color: 'var(--text-secondary)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
