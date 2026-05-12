"use client"
import * as React from 'react';
import { COLUMNS } from './LeadKanban';

export function LeadTable({ leads, onStatusChange }: { leads: any[], onStatusChange: (id: string, status: string) => void }) {
  return (
    <div className="w-full overflow-x-auto border border-zinc-800 rounded-lg bg-[#18181b]">
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] uppercase tracking-wider text-zinc-500 bg-[#09090b] border-b border-zinc-800">
          <tr>
            <th className="px-6 py-3 font-bold">Contact</th>
            <th className="px-6 py-3 font-bold">Company</th>
            <th className="px-6 py-3 font-bold">Platform/Info</th>
            <th className="px-6 py-3 font-bold">Pipeline Stage</th>
            <th className="px-6 py-3 font-bold text-right">Age (Days)</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const diffDays = Math.floor(Math.abs(new Date().getTime() - new Date(lead.updated_at || lead.created_at).getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-4 font-medium text-zinc-100">{lead.name}</td>
                <td className="px-6 py-4 text-zinc-400">{lead.company || '-'}</td>
                <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{lead.contact_info}</td>
                <td className="px-6 py-4">
                  <select 
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-right text-zinc-500 font-mono">{diffDays}d</td>
              </tr>
            )
          })}
          {leads.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                Pipeline absolute zero. Go send some DMs.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
