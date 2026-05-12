'use client'

import { useState } from 'react'
import { CheckCircle2, Lock, Star, X } from 'lucide-react'

type Badge = {
  id: string
  title: string
  desc: string
  category: string
  condition: string
}

function rarityColor(label: string) {
  if (label.includes('Legendary')) return '#f6c343'
  if (label.includes('Epic')) return '#bf5af2'
  if (label.includes('Rare')) return '#3b82f6'
  if (label.includes('Uncommon')) return '#22c55e'
  return '#22c55e'
}

export function BadgeCategoryDialog({
  category,
  items,
  earnedIds,
  badgeSub,
  accent,
}: {
  category: string
  items: Badge[]
  earnedIds: string[]
  badgeSub: Record<string, string>
  accent: string
}) {
  const [open, setOpen] = useState(false)
  const earned = new Set(earnedIds)
  const earnedCount = items.filter(i => earned.has(i.id)).length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-[.08em] transition hover:scale-[1.03]"
        style={{ color: accent, background: `${accent}12`, border: `1px solid ${accent}33` }}
      >
        View all
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,.78)' }} onClick={e => e.currentTarget === e.target && setOpen(false)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl" style={{ background: '#080a0c', border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 30px 80px rgba(0,0,0,.7)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <div>
                <h3 className="text-xl font-black">{category} Badges</h3>
                <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,.55)' }}>{earnedCount} of {items.length} unlocked. Complete real actions to earn these.</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map(item => {
                  const isEarned = earned.has(item.id)
                  const rarity = badgeSub[item.id] || 'Common'
                  const color = rarityColor(rarity)
                  return (
                    <div key={item.id} className="rounded-xl p-4 transition hover:-translate-y-0.5 hover:bg-white/[.045]" style={{ background: isEarned ? `${color}10` : 'rgba(255,255,255,.025)', border: `1px solid ${isEarned ? `${color}44` : 'rgba(255,255,255,.075)'}` }}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="grid h-12 w-12 place-items-center" style={{ filter: isEarned ? `drop-shadow(0 0 14px ${color}77)` : 'none' }}>
                          <svg width="46" height="50" viewBox="0 0 100 110">
                            <defs><linearGradient id={`modal-${item.id}`} x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity=".35"/><stop offset="44%" stopColor={color}/><stop offset="100%" stopColor="#050505"/></linearGradient></defs>
                            <path d="M50 6 L84 21 L77 72 Q68 94 50 106 Q32 94 23 72 L16 21 Z" fill={isEarned ? `url(#modal-${item.id})` : 'rgba(255,255,255,.035)'} stroke={isEarned ? color : 'rgba(255,255,255,.3)'} strokeWidth="5" />
                            <path d="M50 20 L68 29 L64 66 Q60 80 50 88 Q40 80 36 66 L32 29 Z" fill="rgba(0,0,0,.24)" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
                            <path d="M50 32 L57 46 L72 47 L60 58 L64 74 L50 65 L36 74 L40 58 L28 47 L43 46 Z" fill={isEarned ? color : 'rgba(255,255,255,.14)'} stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />
                          </svg>
                        </div>
                        {isEarned ? <CheckCircle2 className="h-5 w-5" style={{ color: '#22c55e' }} /> : <Lock className="h-5 w-5" style={{ color: 'rgba(255,255,255,.45)' }} />}
                      </div>
                      <h4 className="font-black">{item.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,.58)' }}>{item.desc}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[.08em]">
                        <span style={{ color }}>{rarity}</span>
                        <span style={{ color: 'rgba(255,255,255,.45)' }}>{item.condition}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
