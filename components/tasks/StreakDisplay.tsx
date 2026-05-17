import { Flame } from 'lucide-react';

export function StreakDisplay({ streak }: { streak: number }) {
  // ADHD Design Strategy: Removing harsh red "zero" states if missed, softening to gray pauses.
  const isZero = streak === 0;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-md ${isZero ? 'bg-zinc-900/50 text-zinc-500' : 'bg-orange-500/10 border border-orange-500/20 text-orange-400'}`}>
      <Flame className={`h-5 w-5 ${isZero ? 'text-zinc-600' : 'text-orange-500'} ${!isZero && 'fill-orange-500/20'}`} />
      <div className="flex flex-col">
        <span className="text-sm font-bold leading-none">{streak} Days Active</span>
        {isZero && <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Streak Paused</span>}
      </div>
    </div>
  )
}
