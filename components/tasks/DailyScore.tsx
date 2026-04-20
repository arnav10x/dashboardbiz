"use client"
import * as React from 'react';


export function DailyScore({ completed, total }: { completed: number, total: number }) {
  const percentage = total === 0 ? 0 : (completed / total) * 100;
  
  return (
    <div className="w-full flex items-center gap-4">
      <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
         <div 
           className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-in-out" 
           style={{ width: `${percentage}%` }} 
         />
      </div>
      <div className="flex-shrink-0 text-sm font-bold text-zinc-400 font-mono tracking-widest uppercase">
         {completed}/{total}
      </div>
    </div>
  )
}
