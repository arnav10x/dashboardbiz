import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strata — Business intelligence for serious founders',
  description: 'Track your P&L, pipeline, and performance in one place.',
}

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--accent)' }}
        >
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Strata</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-strong)' }}
        >
          beta
        </span>
      </div>

      {/* Hero */}
      <div className="text-center max-w-lg mb-10">
        <h1 className="text-4xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Business intelligence<br />for serious founders.
        </h1>
        <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
          Track your P&amp;L, pipeline, insights, and performance — all in one place. Built for solo founders and small teams.
        </p>
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/signup"
          className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          Get started free →
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
        >
          Sign in
        </Link>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-10 max-w-md">
        {['P&L Tracking', 'Pipeline Kanban', 'AI Copilot', 'Reports', 'Integrations', 'Team'].map(f => (
          <span
            key={f}
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}
