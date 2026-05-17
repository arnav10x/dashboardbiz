"use client"
import * as React from 'react';
import { Lock } from 'lucide-react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  category: string;
  isEarned: boolean;
  earnedAt?: string | null;
  emoji: string;
}

export function AchievementBadge({ name, description, isEarned, earnedAt, emoji }: AchievementBadgeProps) {
  
  const timeAgoLabel = React.useMemo(() => {
    if (!earnedAt) return null;
    const now = new Date();
    const then = new Date(earnedAt);
    const diffDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Earned today';
    if (diffDays === 1) return 'Earned yesterday';
    return `Earned ${diffDays} days ago`;
  }, [earnedAt]);

  return (
    <div className={`p-4 rounded-xl border transition-all duration-500 relative overflow-hidden group ${
      isEarned 
        ? 'bg-[#18181b] border-indigo-500/30 hover:border-indigo-400' 
        : 'bg-[#09090b] border-zinc-900 opacity-60 hover:opacity-80'
    }`}>
      
      {/* Visual Badge Icon */}
      <div className={`h-16 w-16 mb-4 rounded-full flex items-center justify-center text-3xl border mx-auto transition-transform group-hover:scale-110 duration-300 ${
        isEarned
           ? 'bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
           : 'bg-zinc-900 border-zinc-800 grayscale'
      }`}>
         {emoji}
         {!isEarned && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
               <Lock className="h-5 w-5 text-zinc-500" />
            </div>
         )}
      </div>

      <div className="text-center space-y-1">
        <h3 className={`font-bold tracking-tight text-sm ${isEarned ? 'text-white' : 'text-zinc-500'}`}>
          {name}
        </h3>
        <p className={`text-xs ${isEarned ? 'text-zinc-400' : 'text-zinc-600'} line-clamp-2`}>
          {description}
        </p>
      </div>

      {isEarned && (
        <div className="mt-4 pt-3 border-t border-zinc-800/50 flex justify-center">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            {timeAgoLabel}
          </span>
        </div>
      )}
      
    </div>
  );
}
