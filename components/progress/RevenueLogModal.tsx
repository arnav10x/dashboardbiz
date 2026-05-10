"use client"
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BadgeDollarSign, X, Loader2 } from 'lucide-react';

export function RevenueLogModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [amount, setAmount] = React.useState('');
  const [clientName, setClientName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/metrics/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), clientName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to log deal.'); setLoading(false); return; }
      setAmount('');
      setClientName('');
      router.refresh();
      onClose();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-xl py-3 px-4 text-sm border outline-none focus:ring-1 transition-all";
  const inputStyle = { background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="rounded-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200 border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full flex items-center justify-center border" style={{ background: 'var(--accent-muted)', borderColor: 'var(--accent-border)', color: 'var(--accent)' }}>
            <BadgeDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Log Closed Cash</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Record revenue hitting the bank.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Deal Size ($)</label>
            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 2500" className={inputCls + ' font-mono'} style={inputStyle} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Client Name (Optional)</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Acme Corp" className={inputCls} style={inputStyle} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 text-white disabled:opacity-50 hover:opacity-80"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
}
