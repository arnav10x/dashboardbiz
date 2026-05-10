import { ClockPills, GreetingWord } from './ClockPills';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function TopBar({ userName, dayNumber }: { userName: string; dayNumber: number }) {
  const firstName = userName?.split(' ')[0] || 'Founder';

  return (
    <div
      className="h-14 border-b flex items-center justify-between px-6 flex-shrink-0 transition-colors duration-200"
      style={{ background: 'var(--topbar-bg)', borderColor: 'var(--border)' }}
    >
      {/* Left: Greeting only */}
      <h1 className="text-sm font-bold leading-none truncate" style={{ color: 'var(--text-primary)' }}>
        <GreetingWord />, {firstName}
      </h1>

      {/* Right: clock pills + action buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <ClockPills />
        <div className="w-px h-4" style={{ background: 'var(--border)' }} />
        <Link
          href="/dashboard/leads"
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all border hover:opacity-80"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <Plus className="h-3 w-3" />
          New Lead
        </Link>
        <Link
          href="/dashboard/tasks"
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all text-white"
          style={{ background: 'var(--accent)' }}
        >
          <Plus className="h-3 w-3" />
          Log Action
        </Link>
      </div>
    </div>
  );
}
