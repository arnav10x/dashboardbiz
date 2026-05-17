'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

const BUSINESS_TYPES = [
  'Service Business',
  'Agency',
  'E-commerce',
  'SaaS',
  'Consulting',
  'Freelance',
  'Other',
]

const STAGES = [
  'Idea Stage',
  'Early Stage',
  'Growing',
  'Scaling',
  'Established',
]

export function CreateWorkspaceModal() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [stage, setStage] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('Workspace name is required.'); return }
    if (!businessType) { setError('Please select a business type.'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const { error: err } = await supabase.from('workspaces').insert({
      owner_id: user.id,
      name: name.trim(),
      business_type: businessType,
      stage: stage || 'Early Stage',
      invite_code: inviteCode,
    })

    if (err) {
      setError('Failed to create workspace. Please try again.')
      setSaving(false)
      return
    }

    setSaving(false)
    router.refresh()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 animate-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Strata</span>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          Create your workspace
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Set up your business profile to get started.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Business / Workspace Name
            </label>
            <input
              className="input-base w-full"
              placeholder="e.g. Acme Agency"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Business Type
            </label>
            <select
              className="input-base w-full"
              value={businessType}
              onChange={e => setBusinessType(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select type...</option>
              {BUSINESS_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Stage
            </label>
            <select
              className="input-base w-full"
              value={stage}
              onChange={e => setStage(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select stage...</option>
              {STAGES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-xs mt-3" style={{ color: 'var(--accent)' }}>{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={saving}
          className="w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {saving ? 'Creating…' : 'Create workspace →'}
        </button>
      </div>
    </div>
  )
}
