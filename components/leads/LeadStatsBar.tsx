"use client"
import * as React from 'react';

export function LeadStatsBar({ leads }: { leads: any[] }) {
  const total = leads.length;
  const contacted = leads.filter(l => l.status !== 'Prospect').length;
  const replied = leads.filter(l => ['Replied', 'Call Booked', 'Closed Won'].includes(l.status)).length;
  const booked = leads.filter(l => ['Call Booked', 'Closed Won'].includes(l.status)).length;
  const closed = leads.filter(l => l.status === 'Closed Won').length;

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 hide-scrollbar">
      {[
        { label: 'Total Leads', val: total },
        { label: 'Touched', val: contacted },
        { label: 'Replies', val: replied },
        { label: 'Calls', val: booked },
        { label: 'Wins', val: closed },
      ].map(metric => (
        <div
          key={metric.label}
          className="flex-shrink-0 flex items-center gap-2.5 rounded-xl px-4 py-2.5 border"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{metric.label}</span>
          <span className="text-base font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{metric.val}</span>
        </div>
      ))}
    </div>
  );
}
