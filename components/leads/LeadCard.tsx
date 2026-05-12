"use client"
import * as React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export function LeadCard({ lead, isDragging, onClick }: any) {
  const updatedDate = new Date(lead.updated_at || lead.created_at);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Stale check logic: 3+ days in Prospect/Contacted/Replied phases
  const isStale = diffDays >= 3 && !['Closed Won', 'Closed Lost'].includes(lead.status);

  return (
    <div 
      onClick={onClick}
      className={`
        p-4 rounded-lg flex flex-col transition-all duration-200 cursor-pointer text-left
        ${isDragging 
           ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 bg-zinc-800 rotate-2 scale-105' 
           : isStale 
              ? 'border border-orange-500/30 bg-orange-950/20 hover:border-orange-500/60' 
              : 'border border-zinc-800 bg-[#18181b] hover:border-indigo-500/40'
        }
      `}
    >
      <h4 className="font-bold text-sm text-zinc-100 break-words">{lead.name}</h4>
      {lead.company && <p className="text-xs font-medium text-zinc-500 mt-1">{lead.company}</p>}
      
      <div className="flex items-center justify-between mt-4">
         <div className="flex items-center gap-1.5 text-zinc-500">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] uppercase font-bold tracking-widest">{diffDays}d</span>
         </div>
         {isStale && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-orange-400">
               <AlertCircle className="h-3 w-3" />
               <span className="text-[10px] font-bold">STALE</span>
            </div>
         )}
      </div>
    </div>
  )
}
