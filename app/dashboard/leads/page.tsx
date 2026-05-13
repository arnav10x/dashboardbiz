"use client"
import * as React from 'react';
import { LeadKanban } from '@/components/leads/LeadKanban';
import { LeadTable } from '@/components/leads/LeadTable';
import { AddLeadForm } from '@/components/leads/AddLeadForm';
import { LeadStatsBar } from '@/components/leads/LeadStatsBar';
import { LayoutGrid, List } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<any[]>([]);
  const [view, setView] = React.useState<'kanban' | 'list'>('kanban');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        if (data.leads) setLeads(data.leads);
        setLoading(false);
      });
  }, []);

  const handleAddLead = async (data: any) => {
    // Generate optimistic ID bridging fast UX
    const optimisticLead = {
       id: `temp-${Date.now()}`,
       ...data,
       status: 'Prospect',
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString()
    };
    
    setLeads(prev => [optimisticLead, ...prev]);

    const res = await fetch('/api/leads', {
       method: 'POST',
       body: JSON.stringify(data)
    });
    const parsed = await res.json();
    
    if (parsed.lead) {
       // Replace optimistic ID with DB ID natively
       setLeads(prev => prev.map(l => l.id === optimisticLead.id ? parsed.lead : l));
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const originalLeads = [...leads];
    
    // Optimistic Update
    setLeads(prev => prev.map(l => 
       l.id === leadId 
         ? { ...l, status: newStatus, updated_at: new Date().toISOString() } 
         : l
    ));

    try {
       await fetch(`/api/leads/${leadId}/activity`, {
         method: 'POST',
         body: JSON.stringify({ newStatus })
       });
    } catch {
       setLeads(originalLeads); // Rollback entirely on network failure
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Sticky Header Layer */}
      <div className="px-6 py-6 sticky top-0 z-30" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pipeline</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>If they aren't on the board, they don't exist.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md p-1" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setView('kanban')}
                className="p-1.5 rounded"
                style={{ background: view === 'kanban' ? 'var(--bg-hover)' : 'transparent', color: view === 'kanban' ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className="p-1.5 rounded"
                style={{ background: view === 'list' ? 'var(--bg-hover)' : 'transparent', color: view === 'list' ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <LeadStatsBar leads={leads} />

        <div className="mt-6 mb-2">
          <AddLeadForm onAdd={handleAddLead} />
        </div>
      </div>

      {/* Scrollable Content Layer */}
      <div className="flex-1 overflow-auto p-6 md:px-6">
         {loading ? (
           <div className="flex items-center justify-center pt-20">
             <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
         ) : view === 'kanban' ? (
           <LeadKanban leads={leads} onStatusChange={handleStatusChange} />
         ) : (
           <LeadTable leads={leads} onStatusChange={handleStatusChange} />
         )}
      </div>
    </div>
  )
}
