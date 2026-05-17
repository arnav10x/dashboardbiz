"use client"
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { BadgeDollarSign, X, Loader2 } from 'lucide-react';

export function RevenueLogModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = React.useState('');
  const [clientName, setClientName] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);
    try {
      const res = await fetch('/api/metrics/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), clientName })
      });
      
      if (res.ok) {
         setAmount('');
         setClientName('');
         router.refresh(); // Trigger server data rebuild
         onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-500">
            <BadgeDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Log Closed Cash</h2>
            <p className="text-sm font-medium text-zinc-400">Record revenue hitting the bank.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Deal Size ($)</label>
            <input 
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full bg-[#18181b] border border-zinc-800 rounded-md py-3 px-4 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Client Name (Optional)</label>
            <input 
              type="text"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-[#18181b] border border-zinc-800 rounded-md py-3 px-4 text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:bg-emerald-600 text-white font-bold py-3 rounded-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Deposit'}
          </button>
        </form>
      </div>
    </div>
  );
}
