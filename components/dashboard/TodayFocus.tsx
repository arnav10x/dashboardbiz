import { AlertCircle } from 'lucide-react';

interface TodayFocusProps {
  dayTitle: string;
  phase: string;
  objective: string;
}

export function TodayFocus({ dayTitle, phase, objective }: TodayFocusProps) {
  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider text-indigo-400 uppercase mb-2">{phase}</p>
          <h2 className="text-2xl font-bold text-white mb-2">{dayTitle}</h2>
          <p className="text-zinc-400 text-sm font-medium">{objective}</p>
        </div>
        <div className="hidden sm:flex h-10 w-10 bg-indigo-500/10 rounded-full items-center justify-center border border-indigo-500/20">
          <AlertCircle className="h-5 w-5 text-indigo-400" />
        </div>
      </div>
    </div>
  );
}
