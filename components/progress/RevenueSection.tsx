"use client"
import * as React from 'react';
import { Plus } from 'lucide-react';
import { RevenueLogModal } from './RevenueLogModal';

export function RevenueSection({ revenue, goal }: { revenue: any, goal: number }) {
  const [modalOpen, setModalOpen] = React.useState(false);

  const percentage = Math.min((revenue.earned / goal) * 100, 100);

  return (
    <>
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5">
           {/* Abstract pattern element */}
           <div className="w-32 h-32 rounded-full border-[20px] border-emerald-500" />
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Cash Collected</h3>
            <div className="flex items-baseline gap-2">
               <span className="text-5xl font-black text-white font-mono tracking-tighter">${revenue.earned.toLocaleString()}</span>
               <span className="text-xl font-bold text-emerald-500/80 font-sans">USD</span>
            </div>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-white px-3 py-1.5 rounded text-sm font-bold transition-all"
          >
            <Plus className="h-4 w-4 text-emerald-500" strokeWidth={3} />
            Log Deal
          </button>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-zinc-300">Goal Progress</span>
              <span className="text-zinc-500">${revenue.earned.toLocaleString()} / ${goal.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full bg-[#09090b] rounded-full overflow-hidden border border-zinc-800">
               <div 
                 className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                 style={{ width: `${Math.max(percentage, 2)}%` }}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6">
             <div>
               <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Clients Won</span>
               <span className="text-xl font-bold text-zinc-200">{revenue.clientsClosed}</span>
             </div>
             <div>
               <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">Avg Deal Size</span>
               <span className="text-xl font-bold text-emerald-400 font-mono">${Math.round(revenue.avgDealSize).toLocaleString()}</span>
             </div>
          </div>
        </div>

        {/* Mobile Log Button */}
        <button 
            onClick={() => setModalOpen(true)}
            className="w-full sm:hidden mt-6 flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-500 px-3 py-3 rounded text-sm font-bold transition-all border border-emerald-500/20"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Log Closed Deal
        </button>
      </div>

      <RevenueLogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
