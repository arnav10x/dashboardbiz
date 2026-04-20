"use client"
import * as React from 'react';

export function LeadStatsBar({ leads }: { leads: any[] }) {
  const total = leads.length;
  // Simplistic local metrics computation based on current snapshot
  const contacted = leads.filter(l => l.status !== 'Prospect').length;
  const replied = leads.filter(l => ['Replied', 'Call Booked', 'Closed Won'].includes(l.status)).length;
  const booked = leads.filter(l => ['Call Booked', 'Closed Won'].includes(l.status)).length;
  const closed = leads.filter(l => l.status === 'Closed Won').length;

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar">
      {[
        { label: 'Total Leads', val: total },
        { label: 'Touched', val: contacted },
        { label: 'Replies', val: replied },
        { label: 'Calls', val: booked },
        { label: 'Wins', val: closed },
      ].map(metric => (
         <div key={metric.label} className="flex-shrink-0 flex items-center gap-3 bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-2">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{metric.label}</span>
            <span className="text-lg font-bold text-white font-mono">{metric.val}</span>
         </div>
      ))}
    </div>
  )
}
