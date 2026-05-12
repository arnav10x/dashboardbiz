import { LogoutButton } from '../auth/LogoutButton';
import { ClockPills, GreetingWord } from './ClockPills';
import { User, Plus } from 'lucide-react';
import Link from 'next/link';

export function TopBar({ userName, dayNumber }: { userName: string; dayNumber: number }) {
  const firstName = userName?.split(' ')[0] || 'Founder';

  return (
    <div className="h-14 border-b border-white/[0.06] bg-[#050505] flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Greeting + time pills */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <h1 className="text-sm font-bold text-white leading-none truncate">
          <GreetingWord />, {firstName}
        </h1>
        <ClockPills />
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/dashboard/leads"
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] text-zinc-300 hover:text-white rounded-lg text-xs font-semibold transition-all"
        >
          <Plus className="h-3 w-3" />
          New Lead
        </Link>
        <Link
          href="/dashboard/tasks"
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-bold transition-all"
        >
          <Plus className="h-3 w-3" />
          Log Action
        </Link>

        <div className="flex items-center gap-2 border-l border-white/[0.06] pl-3">
          <LogoutButton />
          <div className="h-7 w-7 bg-white/[0.04] border border-white/[0.07] flex items-center justify-center rounded-full">
            <User className="h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
