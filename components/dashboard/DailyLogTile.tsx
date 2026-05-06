"use client"
import * as React from 'react';
import { Plus } from 'lucide-react';

interface DailyLogTileProps {
  label: string;
  initialValue: number;
  goal: number;
  prefix?: string;
  endpoint?: string;
}

export function DailyLogTile({ label, initialValue, goal, prefix = '', endpoint }: DailyLogTileProps) {
  const [count, setCount] = React.useState(initialValue);
  const [saving, setSaving] = React.useState(false);

  const percentage = Math.min((count / goal) * 100, 100);
  const isGood = count >= goal;
  const isBehind = count === 0;

  const handleIncrement = async () => {
    if (!endpoint) return;
    setSaving(true);
    setCount((c) => c + 1);
    try {
      await fetch(endpoint, { method: 'POST' });
    } catch {
      setCount((c) => c - 1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600">{label}</p>
        {endpoint && (
          <button
            onClick={handleIncrement}
            disabled={saving}
            className="h-6 w-6 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        {prefix && <span className="text-lg font-bold text-zinc-500">{prefix}</span>}
        <span className={`text-3xl font-black font-mono tracking-tight ${isGood ? 'text-emerald-400' : isBehind ? 'text-red-400' : 'text-white'}`}>
          {count.toLocaleString()}
        </span>
        <span className="text-sm text-zinc-700 font-mono">
          / {prefix}{goal.toLocaleString()}
        </span>
      </div>

      <div className="h-0.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-500' : isBehind ? 'bg-red-500/40' : 'bg-emerald-500/60'}`}
          style={{ width: `${Math.max(percentage, count > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
