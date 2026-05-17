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

export function AddLeadForm({ onAdd }: { onAdd: (l: any) => Promise<void> }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
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
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm shadow-indigo-900/50"
      >
        <Plus className="h-4 w-4" />
        New Lead
      </button>
    )
  }

  return (
    <div className="bg-[#18181b] border border-indigo-500/50 rounded-lg p-4 animate-in fade-in zoom-in-95 duration-200 w-full md:w-auto">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
         <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fast Capture</h3>
         <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
           <X className="h-4 w-4" />
         </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-3 items-start">
        <div className="w-full md:w-48">
          <input 
            autoFocus
            type="text" placeholder="Founders Name"
            className="w-full bg-[#09090b] border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            {...register('name')}
          />
          {errors.name && <span className="text-[10px] text-red-500 absolute">{errors.name.message}</span>}
        </div>
        
        <div className="w-full md:w-48">
          <input 
            type="text" placeholder="Company (Opt)"
            className="w-full bg-[#09090b] border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            {...register('company')}
          />
        </div>

        <div className="w-full md:w-64">
          <input 
            type="text" placeholder="Twitter/Email/Phone"
            className="w-full bg-[#09090b] border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            {...register('contact_info')}
          />
          {errors.contact_info && <span className="text-[10px] text-red-500 absolute">{errors.contact_info.message}</span>}
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 text-white px-5 py-1.5 rounded-md font-medium text-sm transition-colors flex items-center justify-center min-w-[100px]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Insert"}
        </button>
      </form>
    </div>
  )
}
