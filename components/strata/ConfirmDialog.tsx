'use client'
import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * App-wide destructive-action guard. Cancel is auto-focused so a stray
 * Enter never deletes; Escape always cancels.
 */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onCancel() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 80, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', animation: 'cmdkOverlay 0.15s ease both' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: 'var(--modal-bg)', border: '1px solid var(--border-strong)', boxShadow: '0 24px 80px rgba(0,0,0,0.55)', animation: 'cmdkPanel 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="flex items-start gap-3.5">
          <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl" style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.25)' }}>
            <Trash2 className="h-4.5 w-4.5" style={{ width: 17, height: 17, color: '#f43f5e' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{title}</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {message || 'This action cannot be undone.'}
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="flex-1 rounded-lg py-2 text-xs font-bold"
            style={{ background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg py-2 text-xs font-black"
            style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
