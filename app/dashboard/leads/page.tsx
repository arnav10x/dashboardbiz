"use client"
import * as React from 'react';
import { LeadKanban } from '@/components/leads/LeadKanban';
import { LeadTable } from '@/components/leads/LeadTable';
import { AddLeadForm } from '@/components/leads/AddLeadForm';
import { LeadStatsBar } from '@/components/leads/LeadStatsBar';
import { LayoutGrid, List } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [view, setView] = React.useState<'kanban' | 'list'>('list');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => { if (data.leads) setLeads(data.leads); setLoading(false); });
  }, []);

  const handleAddLead = async (data: any) => {
    const optimisticLead = { id: `temp-${Date.now()}`, ...data, status: 'Prospect', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setLeads(prev => [optimisticLead, ...prev]);
    const res = await fetch('/api/leads', { method: 'POST', body: JSON.stringify(data) });
    const parsed = await res.json();
    if (parsed.lead) setLeads(prev => prev.map(l => l.id === optimisticLead.id ? parsed.lead : l));
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const original = [...leads];
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus, updated_at: new Date().toISOString() } : l));
    try {
      await fetch(`/api/leads/${leadId}/activity`, { method: 'POST', body: JSON.stringify({ newStatus }) });
    } catch {
      setLeads(original);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--app-bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="px-6 py-6 border-b sticky top-0 z-30 transition-colors" style={{ background: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pipeline</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>If they aren't on the board, they don't exist.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border p-1" style={{ background: 'var(--app-bg)', borderColor: 'var(--border)' }}>
              <button
                onClick={() => setView('kanban')}
                className="p-1.5 rounded transition-all"
                style={view === 'kanban' ? { background: 'var(--card-bg)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className="p-1.5 rounded transition-all"
                style={view === 'list' ? { background: 'var(--card-bg)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <LeadStatsBar leads={leads} />

        <div className="mt-5">
          <AddLeadForm onAdd={handleAddLead} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <div className="h-6 w-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        ) : view === 'kanban' ? (
          <LeadKanban leads={leads} onStatusChange={handleStatusChange} />
        ) : (
          <LeadTable leads={leads} onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
}
