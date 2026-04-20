"use client"
import * as React from 'react';
import { Crosshair, Plus, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti'; // We'll add this lightweight particle package for the UI requirement

export function OutreachCounter({ 
  initialCount = 0 
}: { 
  initialCount?: number 
}) {
  const [target, setTarget] = React.useState(20);
  const [count, setCount] = React.useState(initialCount);
  const [pending, setPending] = React.useState(false);
  const [late, setLate] = React.useState(false);

  React.useEffect(() => {
    // Check localStorage for preferred target
    const saved = localStorage.getItem('daily_dms_target');
    if (saved) setTarget(Number(saved));

    // Time Check (4 PM red banner requirement)
    const currentHour = new Date().getHours();
    if (currentHour >= 16 && count === 0) {
       setLate(true);
    }
  }, [count]);

  const percentage = Math.min((count / target) * 100, 100);
  const isComplete = count >= target;

  const handleIncrement = async () => {
    // UI Optimistic Update
    const newCount = count + 1;
    setCount(newCount);
    
    // Animation triggers
    if (newCount === target) {
       confetti({
         particleCount: 100,
         spread: 70,
         origin: { y: 0.6 },
         colors: ['#6366f1', '#4ade80', '#09090b']
       });
    }

    try {
       await fetch('/api/metrics/outreach', { method: 'POST' });
    } catch (e) {
       // Rollback in case of absolute failure
       setCount(count);
    }
  };

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
       
       {late && (
         <div className="absolute top-0 left-0 w-full bg-red-500 text-white text-[10px] uppercase font-bold tracking-widest text-center py-0.5">
           Get Moving. Zero Volume.
         </div>
       )}

       <div className={`flex justify-between items-start ${late ? 'mt-4' : ''}`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Crosshair className="h-4 w-4 text-zinc-500" />
               <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Outreach Quota</h3>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-black text-white font-mono tracking-tighter">{count}</span>
              <span className="text-xl font-bold text-zinc-600 font-mono">/ {target}</span>
            </div>
          </div>

          <button 
             onClick={handleIncrement}
             className="h-16 w-16 bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
             {isComplete ? <Rocket className="h-6 w-6" /> : <Plus className="h-6 w-6" strokeWidth={3} />}
          </button>
       </div>

       {/* Progress Ring / Bar */}
       <div className="w-full h-1.5 bg-zinc-900 rounded-full mt-6 overflow-hidden">
          <div 
             className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-indigo-500'}`}
             style={{ width: `${percentage}%` }}
          />
       </div>
    </div>
  );
}
