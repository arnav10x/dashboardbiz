import { AlertCircle } from 'lucide-react';

interface TodayFocusProps {
  dayTitle: string;
  phase: string;
  objective: string;
}

export function TodayFocus({ dayTitle, phase, objective }: TodayFocusProps) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] hover:border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden transition-colors group">
      <div className="absolute top-0 left-0 w-0.5 h-full bg-emerald-500/60" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase mb-2">{phase}</p>
          <h2 className="text-xl font-bold text-white mb-2 leading-tight">{dayTitle}</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{objective}</p>
        </div>
        <div className="flex-shrink-0 h-9 w-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}
