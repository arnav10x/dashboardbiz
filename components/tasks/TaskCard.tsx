"use client"
import * as React from 'react';
import { Check, Sparkles } from 'lucide-react';

export function TaskCard({ 
  id, 
  title, 
  isCompleted, 
  isPersonalized,
  onToggle 
}: { 
  id: string, 
  title: string, 
  isCompleted: boolean, 
  isPersonalized: boolean,
  onToggle: (id: string, state: boolean) => void 
}) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    await onToggle(id, !isCompleted);
    setLoading(false);
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        w-full p-5 rounded-xl border flex gap-4 transition-all duration-300 cursor-pointer group relative overflow-hidden
        ${isCompleted 
          ? 'bg-zinc-900/40 border-zinc-800/80' 
          : 'bg-[#18181b] border-zinc-700 hover:border-indigo-500/50 hover:bg-[#18181b]/80'
        }
      `}
    >
      {/* Checkbox Ring */}
      <div className="flex-shrink-0 mt-0.5">
        <div className={`
          flex h-6 w-6 items-center justify-center rounded border-2 transition-colors duration-300
          ${isCompleted 
             ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
             : 'bg-transparent border-zinc-600 group-hover:border-indigo-400'
          }
        `}>
          {isCompleted && <Check className="h-4 w-4 text-[#09090b] font-bold" strokeWidth={3} />}
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-8">
        {isPersonalized && !isCompleted && (
           <div className="mb-2 flex items-center gap-1.5 opacity-80">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">AI Tailored</span>
           </div>
        )}
        <p className={`
          text-[15px] leading-relaxed transition-all duration-300 font-medium
          ${isCompleted ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-100'}
        `}>
          {title}
        </p>
      </div>

      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-zinc-900/20 backdrop-blur-[1px] flex items-center justify-center">
           <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
        </div>
      )}
    </div>
  )
}
