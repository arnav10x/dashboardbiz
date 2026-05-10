"use client"
import * as React from 'react';
import { COLUMNS } from './LeadKanban';
import { AlertCircle } from 'lucide-react';

export function LeadTable({ leads, onStatusChange }: { leads: any[]; onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--card-bg)' }}>
      <table className="w-full text-sm text-left">
        <thead
          className="text-[10px] uppercase tracking-wider border-b"
          style={{ background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          <tr>
            <th className="px-5 py-3 font-bold">Contact</th>
            <th className="px-5 py-3 font-bold">Company</th>
            <th className="px-5 py-3 font-bold">Platform / Info</th>
            <th className="px-5 py-3 font-bold">Stage</th>
            <th className="px-5 py-3 font-bold text-right">Age</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const diffDays = Math.floor(Math.abs(new Date().getTime() - new Date(lead.updated_at || lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
            const isStale = diffDays >= 3 && !['Closed Won', 'Closed Lost'].includes(lead.status);
            return (
              <tr key={lead.id} className="border-b transition-colors" style={{ borderColor: 'var(--border)' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{lead.name}</span>
                    {isStale && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border border-orange-500/30 text-orange-400 bg-orange-500/10">
                        <AlertCircle className="h-2.5 w-2.5" /> STALE
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{lead.company || '—'}</td>
                <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{lead.contact_info}</td>
                <td className="px-5 py-4">
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-xs border outline-none transition-all"
                    style={{ background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4 text-right text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{diffDays}d</td>
              </tr>
            );
          })}
          {leads.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Pipeline empty — go send some DMs.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
