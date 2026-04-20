import { Flame, User } from 'lucide-react';
import { LogoutButton } from '../auth/LogoutButton';

export function TopBar({ dayNumber, streak }: { dayNumber: number, streak: number }) {
  return (
    <div className="h-16 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Logo */}
        <span className="text-white font-bold tracking-tight md:hidden">Founder OS</span>
        
        {/* Day Indicator */}
        <div className="hidden md:flex items-center px-3 py-1.5 bg-zinc-800/40 rounded-md border border-zinc-700/50">
          <span className="text-sm font-bold text-zinc-300">Phase: Week {Math.min(Math.ceil(dayNumber / 7), 4)}</span>
          <span className="mx-2 text-zinc-600">|</span>
          <span className="text-sm font-medium text-zinc-400">Day {dayNumber} of 30</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-indigo-400">
          <Flame className="h-5 w-5" />
          <span className="text-sm font-bold">{streak} <span className="hidden sm:inline">Day Streak</span></span>
        </div>
        
        <div className="flex items-center gap-4 border-l border-zinc-800 pl-6">
          <LogoutButton />
          <div className="h-8 w-8 bg-zinc-800 flex items-center justify-center rounded-full border border-zinc-700">
            <User className="h-4 w-4 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
