'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

const ICONS = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: '#10b981', text: '#10b981' },
  error:   { bg: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.25)',  icon: '#f43f5e', text: '#f43f5e' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: '#f59e0b', text: '#f59e0b' },
  info:    { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', icon: '#60a5fa', text: 'var(--text-primary)' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => {
          const s = STYLES[t.type]
          const Icon = ICONS[t.type]
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold pointer-events-auto animate-in"
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${s.border}`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${s.border}`,
                color: s.text,
                minWidth: 240,
                maxWidth: 360,
              }}
            >
              <div className="h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}>
                <Icon className="h-3.5 w-3.5" style={{ color: s.icon }} strokeWidth={2.5} />
              </div>
              <span className="flex-1 text-xs" style={{ color: 'var(--text-primary)' }}>{t.message}</span>
              <button onClick={() => remove(t.id)} className="flex-shrink-0 hover:opacity-60 transition-opacity"
                style={{ color: 'var(--text-muted)' }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
