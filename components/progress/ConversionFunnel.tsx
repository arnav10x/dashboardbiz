"use client"
import * as React from 'react';
import { Target, MessageCircle, Send, Phone, CheckCircle2 } from 'lucide-react';

export function ConversionFunnel({ data }: { data: any }) {
  const steps = [
    { id: 'prospects', label: 'Prospects DMed', value: data.prospects || 0, icon: Send, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'replied', label: 'Replies', value: data.replied || 0, icon: MessageCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'called', label: 'Calls Booked', value: data.called || 0, icon: Phone, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'closed', label: 'Clients Closed', value: data.closed || 0, icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  const max = Math.max(steps[0].value, 1); // Avoid div by zero

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
         <Target className="h-5 w-5 text-indigo-500" />
         <h3 className="text-sm font-bold text-white tracking-widest uppercase">Conversion Funnel</h3>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const percentage = Math.max((step.value / max) * 100, 2);
          
          return (
            <div key={step.id} className="relative">
              <div className="flex items-center justify-between mb-1 z-10 relative px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 rounded flex items-center justify-center ${step.bg} ${step.color}`}>
                    <step.icon className="h-3 w-3" />
                  </span>
                  <span className="text-xs font-bold text-zinc-300">{step.label}</span>
                </div>
                <span className="text-sm font-bold text-white font-mono">{step.value}</span>
              </div>
              <div className="w-full bg-[#09090b] rounded-md h-6 overflow-hidden">
                 <div 
                   className={`h-full ${step.bg} transition-all duration-1000 ease-out border-r border-[#18181b]`}
                   style={{ width: `${percentage}%` }}
                 />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
