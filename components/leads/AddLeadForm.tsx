"use client"
import * as React from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  company: z.string().optional(),
  contact_info: z.string().min(3, 'Where to reach them?'),
});
type FormData = z.infer<typeof schema>;

const inputCls = "w-full rounded-lg px-3 py-2 text-sm border outline-none focus:ring-1 transition-all";

export function AddLeadForm({ onAdd }: { onAdd: (l: any) => Promise<void> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await onAdd(data);
    reset();
    setIsOpen(false);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-80"
        style={{ background: 'var(--accent)' }}
      >
        <Plus className="h-4 w-4" />
        New Lead
      </button>
    );
  }

  return (
    <div className="rounded-xl border p-4 animate-in fade-in zoom-in-95 duration-200" style={{ background: 'var(--card-bg)', borderColor: 'var(--accent-border)' }}>
      <div className="flex items-center justify-between mb-4 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Fast Capture</h3>
        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)' }} className="hover:opacity-80 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-3 items-start">
        <div className="w-full md:w-48">
          <input
            autoFocus
            type="text"
            placeholder="Founder's name"
            className={inputCls}
            style={{ background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            {...register('name')}
          />
          {errors.name && <span className="text-[10px] text-red-500 mt-0.5 block">{errors.name.message}</span>}
        </div>
        <div className="w-full md:w-44">
          <input
            type="text"
            placeholder="Company (optional)"
            className={inputCls}
            style={{ background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            {...register('company')}
          />
        </div>
        <div className="w-full md:w-56">
          <input
            type="text"
            placeholder="Twitter / Email / Phone"
            className={inputCls}
            style={{ background: 'var(--app-bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            {...register('contact_info')}
          />
          {errors.contact_info && <span className="text-[10px] text-red-500 mt-0.5 block">{errors.contact_info.message}</span>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all flex items-center justify-center min-w-[90px] hover:opacity-80 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
        </button>
      </form>
    </div>
  );
}
