'use client'
import { useState } from 'react'
import {
  Lock, DollarSign, BarChart2, TrendingUp, CheckCircle, Crown,
  Target, GitMerge, Award, Trophy, CalendarDays, Star,
  Sparkles, Flame, Zap, type LucideIcon,
} from 'lucide-react'

interface Badge {
  id: string
  title: string
  desc: string
  icon: string
  category: string
  condition: string
  isEarned: boolean
}

type RarityConfig = {
  label: string
  color: string
  glow: string
  border: string
  gradient: string
  xp: number
  shimmer: boolean
}

const RARITY: Record<string, RarityConfig> = {
  first_dollar:      { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)', gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50,   shimmer: false },
  profitable:        { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)', gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50,   shimmer: false },
  first_lead:        { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)', gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50,   shimmer: false },
  workspace_created: { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)', gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50,   shimmer: false },
  calendar_entry:    { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)', gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50,   shimmer: false },
  ai_copilot:        { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)', gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50,   shimmer: false },
  three_periods:     { label: 'Uncommon',  color: '#34d399', glow: 'rgba(52,211,153,0.28)',  border: 'rgba(52,211,153,0.32)', gradient: 'linear-gradient(145deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.03) 100%)',  xp: 150,  shimmer: false },
  ten_leads:         { label: 'Uncommon',  color: '#34d399', glow: 'rgba(52,211,153,0.28)',  border: 'rgba(52,211,153,0.32)', gradient: 'linear-gradient(145deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.03) 100%)',  xp: 150,  shimmer: false },
  first_win:         { label: 'Uncommon',  color: '#34d399', glow: 'rgba(52,211,153,0.28)',  border: 'rgba(52,211,153,0.32)', gradient: 'linear-gradient(145deg, rgba(52,211,153,0.12) 0%, rgba(52,211,153,0.03) 100%)',  xp: 150,  shimmer: false },
  five_k:            { label: 'Rare',      color: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  border: 'rgba(96,165,250,0.38)', gradient: 'linear-gradient(145deg, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0.03) 100%)',  xp: 350,  shimmer: false },
  six_periods:       { label: 'Rare',      color: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  border: 'rgba(96,165,250,0.38)', gradient: 'linear-gradient(145deg, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0.03) 100%)',  xp: 350,  shimmer: false },
  five_wins:         { label: 'Rare',      color: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  border: 'rgba(96,165,250,0.38)', gradient: 'linear-gradient(145deg, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0.03) 100%)',  xp: 350,  shimmer: false },
  task_streak_7:     { label: 'Rare',      color: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  border: 'rgba(96,165,250,0.38)', gradient: 'linear-gradient(145deg, rgba(96,165,250,0.14) 0%, rgba(96,165,250,0.03) 100%)',  xp: 350,  shimmer: false },
  ten_k:             { label: 'Epic',      color: '#c084fc', glow: 'rgba(192,132,252,0.42)', border: 'rgba(192,132,252,0.44)', gradient: 'linear-gradient(145deg, rgba(192,132,252,0.16) 0%, rgba(192,132,252,0.04) 100%)', xp: 750, shimmer: true },
  twelve_periods:    { label: 'Epic',      color: '#c084fc', glow: 'rgba(192,132,252,0.42)', border: 'rgba(192,132,252,0.44)', gradient: 'linear-gradient(145deg, rgba(192,132,252,0.16) 0%, rgba(192,132,252,0.04) 100%)', xp: 750, shimmer: true },
  fifty_k:           { label: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.52)',  border: 'rgba(251,191,36,0.48)', gradient: 'linear-gradient(145deg, rgba(251,191,36,0.19) 0%, rgba(251,191,36,0.05) 100%)',  xp: 2000, shimmer: true },
}

const DEFAULT_RARITY: RarityConfig = {
  label: 'Common', color: '#94a3b8', glow: 'rgba(148,163,184,0.22)', border: 'rgba(148,163,184,0.28)',
  gradient: 'linear-gradient(145deg, rgba(148,163,184,0.09) 0%, rgba(148,163,184,0.02) 100%)', xp: 50, shimmer: false,
}

// Premium Lucide icons keyed by badge ID
const BADGE_ICONS: Record<string, LucideIcon> = {
  first_dollar:      DollarSign,
  five_k:            BarChart2,
  ten_k:             TrendingUp,
  profitable:        CheckCircle,
  fifty_k:           Crown,
  first_lead:        Target,
  ten_leads:         GitMerge,
  first_win:         Award,
  five_wins:         Trophy,
  three_periods:     Flame,
  six_periods:       Star,
  twelve_periods:    Sparkles,
  task_streak_7:     Zap,
  workspace_created: Zap,
  calendar_entry:    CalendarDays,
  ai_copilot:        Sparkles,
}

function BadgeIconDisplay({ id, color, glow, size = 48, dimmed = false, isHov = false }: {
  id: string; color: string; glow: string; size?: number; dimmed?: boolean; isHov?: boolean
}) {
  const Icon: LucideIcon = BADGE_ICONS[id] || Star
  const s = size

  if (dimmed) {
    return (
      <div className="flex items-center justify-center rounded-2xl"
        style={{ width: s, height: s, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.06)' }}>
        <Icon className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.12)' }} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: s + 12, height: s + 12 }}>
      {/* Glow blob */}
      <div className="absolute rounded-full blur-xl pointer-events-none"
        style={{ width: s, height: s, background: glow, opacity: isHov ? 0.85 : 0.45, transition: 'opacity 0.2s ease' }} />
      {/* Icon badge */}
      <div className="relative flex items-center justify-center rounded-2xl"
        style={{
          width: s, height: s,
          background: `linear-gradient(145deg, ${color}22 0%, ${color}0c 100%)`,
          border: `1.5px solid ${color}38`,
          boxShadow: `inset 0 1px 0 ${color}25, 0 4px 16px ${glow}`,
        }}>
        <Icon className="h-6 w-6" style={{ color }} strokeWidth={1.75} />
      </div>
    </div>
  )
}

export function AchievementsCardDeck({ badges }: { badges: Badge[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const earned = badges.filter(b => b.isEarned)
  const locked = badges.filter(b => !b.isEarned)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {earned.map(badge => {
        const r = RARITY[badge.id] || DEFAULT_RARITY
        const isHov = hovered === badge.id

        return (
          <div
            key={badge.id}
            className="relative rounded-2xl overflow-hidden cursor-default"
            style={{
              background: r.gradient,
              border: `1px solid ${r.border}`,
              boxShadow: isHov
                ? `0 20px 48px ${r.glow}, 0 0 0 1px ${r.border}, inset 0 1px 0 ${r.color}20`
                : `0 3px 14px ${r.glow}45, inset 0 1px 0 ${r.color}10`,
              transform: isHov ? 'translateY(-5px) scale(1.025)' : 'none',
              transition: 'all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={() => setHovered(badge.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Shimmer sweep for Epic / Legendary */}
            {r.shimmer && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" style={{ zIndex: 1 }}>
                <div style={{
                  position: 'absolute', top: '-50%', left: '-60%',
                  width: '35%', height: '200%',
                  background: `linear-gradient(105deg, transparent 25%, ${r.color}28 50%, transparent 75%)`,
                  animation: 'shimmerPass 4s ease-in-out infinite',
                }} />
              </div>
            )}

            {/* Top row: rarity + XP */}
            <div className="flex items-center justify-between px-3 pt-3 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ background: `${r.color}16`, color: r.color, border: `1px solid ${r.color}2a` }}>
                {r.label}
              </span>
              <span className="text-[9px] font-black tabular-nums" style={{ color: r.color, opacity: 0.6 }}>
                +{r.xp} XP
              </span>
            </div>

            {/* Icon */}
            <div className="flex items-center justify-center py-3 relative z-10">
              <BadgeIconDisplay id={badge.id} color={r.color} glow={r.glow} isHov={isHov} />
            </div>

            {/* Text */}
            <div className="px-3 pb-4 text-center relative z-10">
              <p className="text-[11px] font-black leading-tight mb-1" style={{ color: r.color }}>
                {badge.title}
              </p>
              <p className="text-[10px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                {badge.desc}
              </p>
            </div>

            {/* Bottom accent bar */}
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${r.color}55, transparent)` }} />
          </div>
        )
      })}

      {locked.map(badge => {
        const r = RARITY[badge.id] || DEFAULT_RARITY
        const isHov = hovered === badge.id

        return (
          <div
            key={badge.id}
            className="relative rounded-2xl overflow-hidden cursor-default"
            style={{
              background: isHov ? 'rgba(255,255,255,0.022)' : 'rgba(255,255,255,0.012)',
              border: isHov ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.05)',
              transform: isHov ? 'translateY(-2px)' : 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={() => setHovered(badge.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Rarity hint + lock */}
            <div className="flex items-center justify-between px-3 pt-3">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {r.label}
              </span>
              <div className="h-5 w-5 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Lock className="h-2.5 w-2.5" style={{ color: 'rgba(255,255,255,0.18)' }} />
              </div>
            </div>

            {/* Ghost icon */}
            <div className="flex items-center justify-center py-3">
              <BadgeIconDisplay id={badge.id} color={r.color} glow={r.glow} dimmed />
            </div>

            {/* Text */}
            <div className="px-3 pb-4 text-center">
              <p className="text-[11px] font-bold leading-tight mb-1" style={{ color: 'rgba(255,255,255,0.18)' }}>
                {badge.title}
              </p>
              <p className="text-[10px] leading-snug" style={{ color: 'rgba(255,255,255,0.1)' }}>
                {badge.condition}
              </p>
            </div>

            <div style={{ height: 2, background: 'rgba(255,255,255,0.03)' }} />
          </div>
        )
      })}
    </div>
  )
}
