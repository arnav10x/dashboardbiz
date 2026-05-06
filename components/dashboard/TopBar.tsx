import { Flame, User } from 'lucide-react';
import { LogoutButton } from '../auth/LogoutButton';

export function TopBar({ dayNumber, streak }: { dayNumber: number; streak: number }) {
  const week = Math.min(Math.ceil(dayNumber / 7), 4);

  return (
    <div className="h-14 border-b border-white/[0.06] bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="text-white font-bold tracking-tight md:hidden">
          Founder<span className="text-emerald-400">OS</span>
        </span>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">
          <span className="text-xs font-semibold text-zinc-400">Week {week}</span>
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500">Day {dayNumber} of 30</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {streak > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-bold">{streak}</span>
            <span className="hidden sm:inline text-xs text-emerald-500/70 font-medium">day streak</span>
          </div>
        )}

        <div className="flex items-center gap-3 border-l border-white/[0.06] pl-5">
          <LogoutButton />
          <div className="h-7 w-7 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center rounded-full">
            <User className="h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
