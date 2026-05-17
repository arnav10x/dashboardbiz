"use client"
import * as React from 'react';
import { Crosshair, Plus, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';

export function OutreachCounter({ initialCount = 0 }: { initialCount?: number }) {
  const [target, setTarget] = React.useState(20);
  const [count, setCount] = React.useState(initialCount);
  const [late, setLate] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('daily_dms_target');
    if (saved) setTarget(Number(saved));
    const currentHour = new Date().getHours();
    if (currentHour >= 16 && count === 0) setLate(true);
  }, [count]);

  const percentage = Math.min((count / target) * 100, 100);
  const isComplete = count >= target;

  const handleIncrement = async () => {
    const newCount = count + 1;
    setCount(newCount);

    if (newCount === target) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }

    try {
      await fetch('/api/metrics/outreach', { method: 'POST' });
    } catch {
      setCount(count);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] hover:border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden transition-colors">
      {late && (
        <div className="absolute top-0 left-0 w-full bg-red-500/80 text-white text-[9px] uppercase font-bold tracking-[0.15em] text-center py-1">
          Zero volume. Get moving.
        </div>
      )}

      <div className={`flex justify-between items-start ${late ? 'mt-5' : ''}`}>
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crosshair className="h-3.5 w-3.5 text-zinc-600" />
            <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Outreach Quota</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white font-mono tracking-tighter">{count}</span>
            <span className="text-xl font-bold text-zinc-700 font-mono">/ {target}</span>
          </div>
        </div>

        <button
          onClick={handleIncrement}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg ${
            isComplete
              ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-glow-sm'
              : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-glow-sm'
          } text-black`}
        >
          {isComplete ? <Rocket className="h-5 w-5" /> : <Plus className="h-5 w-5" strokeWidth={3} />}
        </button>
      </div>

      <div className="w-full h-1 bg-white/[0.04] rounded-full mt-6 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isComplete ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
