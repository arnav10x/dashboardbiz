import { SignupForm } from '@/components/auth/SignupForm'
import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign Up | prspectve',
  description: 'Start your 30-day journey to your first paying clients.',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-[400px] animate-in stagger">
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
            Create your account
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Commit to the 30-day performance sprint.
          </p>

          <SignupForm />

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold underline underline-offset-2" style={{ color: 'var(--text-secondary)' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
