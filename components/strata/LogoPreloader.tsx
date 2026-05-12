'use client'
import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

export function LogoPreloader() {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'gone'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'), 1400)
    const t3 = setTimeout(() => setPhase('gone'), 1900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 9999,
        background: 'var(--bg-base)',
        transition: 'opacity 0.5s ease',
        opacity: phase === 'out' ? 0 : 1,
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo */}
        <div
          style={{
            animation: 'logoReveal 0.6s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <div
            className="h-20 w-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'var(--accent)',
              boxShadow: '0 0 60px rgba(34,197,94,0.45), 0 0 120px rgba(34,197,94,0.2)',
            }}
          >
            <Zap className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Word mark */}
        <div
          className="text-xl font-black tracking-tight"
          style={{
            color: 'var(--text-primary)',
            animation: 'logoReveal 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          Founder<span style={{ color: 'var(--accent)' }}>OS</span>
        </div>

        {/* Pulse dots */}
        <div
          className="flex items-center gap-1.5"
          style={{ animation: 'logoReveal 0.4s 0.3s ease both' }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: 'var(--accent)',
                animation: `dotPulse 0.9s ${i * 0.18}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
