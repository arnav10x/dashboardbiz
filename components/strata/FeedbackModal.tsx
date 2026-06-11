'use client'
import { useState } from 'react'
import { X, Send, MessageSquare, Bug, Lightbulb, CheckCircle2 } from 'lucide-react'

const TYPES = [
  { id: 'feedback', label: 'Feedback',    icon: MessageSquare },
  { id: 'bug',      label: 'Bug Report',  icon: Bug           },
  { id: 'feature',  label: 'Feature Idea', icon: Lightbulb    },
]

const LOCATIONS = [
  'Dashboard Overview', 'Tasks', 'Pipeline', 'Finance', 'Calendar',
  'AI Coach', 'Settings', 'Sidebar / Navigation', 'Onboarding', 'Other',
]

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [type, setType]       = useState('feedback')
  const [location, setLocation] = useState('Dashboard Overview')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, location: type === 'bug' ? location : undefined, message }),
      })
      if (res.ok) {
        setSent(true)
        setTimeout(onClose, 2200)
      } else {
        setError('Failed to send. Please try again.')
      }
    } catch {
      setError('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 80px rgba(0,0,0,0.55)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>Send Feedback</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Beta users shape the product — we read every message.</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-hover)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>

        {sent ? (
          <div style={{ padding: '44px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 style={{ width: 36, height: 36, color: 'var(--accent)' }} />
            <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Feedback sent!</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thank you — we'll review it shortly.</p>
          </div>
        ) : (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Type selector */}
            <div style={{ display: 'flex', gap: 6 }}>
              {TYPES.map(t => {
                const Icon = t.icon
                return (
                  <button key={t.id} onClick={() => setType(t.id)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: type === t.id ? 'var(--accent-muted)' : 'var(--bg-raised)',
                      color: type === t.id ? 'var(--accent)' : 'var(--text-muted)',
                      border: `1px solid ${type === t.id ? 'var(--accent-ring)' : 'var(--border)'}`,
                    }}>
                    <Icon style={{ width: 11, height: 11 }} />
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Bug location */}
            {type === 'bug' && (
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Where is the bug?
                </label>
                <select value={location} onChange={e => setLocation(e.target.value)} className="input-base" style={{ width: '100%' }}>
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            )}

            {/* Message */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                {type === 'bug' ? 'Describe the issue' : type === 'feature' ? 'Describe your idea' : 'Your message'}
              </label>
              <textarea
                className="input-base resize-none"
                rows={4}
                placeholder={
                  type === 'bug'     ? 'What happened? What did you expect instead?' :
                  type === 'feature' ? 'What would you like to see added or improved?' :
                  'Share your thoughts, ideas, or experience...'
                }
                value={message}
                onChange={e => setMessage(e.target.value)}
                autoFocus
              />
            </div>

            {error && <p style={{ fontSize: 11, color: '#f43f5e', marginTop: -6 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose}
                style={{ padding: '9px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!message.trim() || sending}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: 'linear-gradient(180deg, var(--accent-hover), var(--accent))', color: 'var(--accent-fg)', border: 'none', cursor: !message.trim() || sending ? 'not-allowed' : 'pointer', opacity: !message.trim() ? 0.5 : 1 }}>
                <Send style={{ width: 12, height: 12 }} />
                {sending ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
