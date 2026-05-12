import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign in | Strata',
  description: 'Sign in to your Strata dashboard.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Strata</span>
        </div>

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
