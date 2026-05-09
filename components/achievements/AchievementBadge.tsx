"use client"
import * as React from 'react';
import { Lock } from 'lucide-react';
import type { Rarity } from '@/lib/seed/achievements';

const RARITY_STYLES: Record<Rarity, { tag: string; glow: string; border: string; label: string }> = {
  common:    { tag: 'bg-zinc-700/60 text-zinc-300',                    glow: '',                                        border: 'border-white/[0.08]',      label: 'COMMON'    },
  uncommon:  { tag: 'bg-emerald-500/20 text-emerald-300',              glow: 'shadow-[0_0_18px_rgba(16,185,129,0.15)]', border: 'border-emerald-500/20',    label: 'UNCOMMON'  },
  rare:      { tag: 'bg-blue-500/20 text-blue-300',                    glow: 'shadow-[0_0_18px_rgba(59,130,246,0.15)]', border: 'border-blue-500/20',       label: 'RARE'      },
  epic:      { tag: 'bg-purple-500/20 text-purple-300',                glow: 'shadow-[0_0_18px_rgba(168,85,247,0.2)]',  border: 'border-purple-500/25',     label: 'EPIC'      },
  legendary: { tag: 'bg-amber-500/20 text-amber-300',                  glow: 'shadow-[0_0_22px_rgba(245,158,11,0.25)]', border: 'border-amber-500/30',      label: 'LEGENDARY' },
};

interface AchievementBadgeProps {
  name: string;
  description: string;
  isEarned: boolean;
  earnedAt?: string | null;
  emoji: string;
  rarity: Rarity;
  xp: number;
}

export function AchievementBadge({ name, description, isEarned, earnedAt, emoji, rarity, xp }: AchievementBadgeProps) {
  const styles = RARITY_STYLES[rarity] ?? RARITY_STYLES.common;

  const timeAgo = React.useMemo(() => {
    if (!earnedAt) return null;
    const diff = Math.floor((Date.now() - new Date(earnedAt).getTime()) / 86_400_000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff}d ago`;
  }, [earnedAt]);

  return (
    <div className={`relative rounded-2xl border p-4 flex flex-col transition-all duration-300 group ${
      isEarned
        ? `app-card ${styles.border} ${styles.glow} hover:scale-[1.02]`
        : 'border-white/[0.05] dark:bg-white/[0.01] bg-black/[0.02] opacity-55 hover:opacity-75'
    }`}>

      {/* Top row: rarity tag + XP */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${styles.tag}`}>
          {styles.label}
        </span>
        {isEarned && (
          <span className="text-[9px] font-bold text-emerald-400">+{xp} XP</span>
        )}
        {!isEarned && (
          <Lock className="h-3 w-3 text-[var(--text-muted)]" />
        )}
      </div>

      {/* Emoji icon */}
      <div className={`h-14 w-14 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl border transition-transform duration-300 group-hover:scale-110 ${
        isEarned
          ? `bg-white/[0.05] dark:bg-white/[0.03] ${styles.border}`
          : 'bg-white/[0.02] border-white/[0.05] grayscale'
      }`}>
        {emoji}
      </div>

      {/* Name + description */}
      <div className="text-center space-y-1 flex-1">
        <p className={`text-xs font-bold leading-tight ${isEarned ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
          {name}
        </p>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Earned timestamp */}
      {isEarned && timeAgo && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] text-center">
          <span className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            Earned {timeAgo}
          </span>
        </div>
      )}
    </div>
  );
}
