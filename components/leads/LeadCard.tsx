"use client"
import * as React from 'react';
import { AlertCircle, Clock } from 'lucide-react';

export function LeadCard({ lead, isDragging, onClick }: any) {
  const updatedDate = new Date(lead.updated_at || lead.created_at);
  const diffDays = Math.floor(Math.abs(new Date().getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  const isStale = diffDays >= 3 && !['Closed Won', 'Closed Lost'].includes(lead.status);

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl border flex flex-col transition-all duration-200 cursor-pointer"
      style={{
        background: isDragging ? 'var(--accent-muted)' : 'var(--app-bg)',
        borderColor: isDragging ? 'var(--accent-border)' : isStale ? 'rgba(249,115,22,0.3)' : 'var(--border)',
        transform: isDragging ? 'rotate(1.5deg) scale(1.03)' : undefined,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : undefined,
      }}
    >
      <h4 className="font-bold text-sm break-words" style={{ color: 'var(--text-primary)' }}>{lead.name}</h4>
      {lead.company && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{lead.company}</p>}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{diffDays}d</span>
        </div>
        {isStale && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <AlertCircle className="h-3 w-3" />
            <span className="text-[9px] font-bold">STALE</span>
          </div>
        )}
      </div>
    </div>
  );
}
