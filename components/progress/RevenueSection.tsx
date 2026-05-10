"use client"
import * as React from 'react';
import { Plus } from 'lucide-react';
import { RevenueLogModal } from './RevenueLogModal';

export function RevenueSection({ revenue, goal }: { revenue: any; goal: number }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const pct = Math.min((revenue.earned / goal) * 100, 100);

  return (
    <>
      <div className="rounded-2xl border p-6 relative overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Cash Collected</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                ${revenue.earned.toLocaleString()}
              </span>
              <span className="text-xl font-bold" style={{ color: 'var(--accent)', opacity: 0.8 }}>USD</span>
            </div>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
            style={{ background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <Plus className="h-4 w-4" style={{ color: 'var(--accent)' }} strokeWidth={3} />
            Log Deal
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span style={{ color: 'var(--text-secondary)' }}>Goal Progress</span>
              <span style={{ color: 'var(--text-muted)' }}>${revenue.earned.toLocaleString()} / ${goal.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden border" style={{ background: 'var(--app-bg)', borderColor: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.max(pct, 2)}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-6" style={{ borderColor: 'var(--border)' }}>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Clients Won</span>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{revenue.clientsClosed}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Avg Deal Size</span>
              <span className="text-xl font-bold font-mono" style={{ color: 'var(--accent)' }}>${Math.round(revenue.avgDealSize).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="w-full sm:hidden mt-6 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
          style={{ background: 'var(--accent-muted)', borderColor: 'var(--accent-border)', color: 'var(--accent)' }}
        >
          <Plus className="h-4 w-4" strokeWidth={3} />
          Log Closed Deal
        </button>
      </div>

      <RevenueLogModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
