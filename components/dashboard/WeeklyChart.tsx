"use client"
import * as React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function WeeklyChart({ snapshots }: { snapshots: any[] }) {
  const [data, setData] = React.useState<{ day: string, count: number }[]>([]);

  // Structure trailing 7 days exactly for Recharts consumption
  React.useEffect(() => {
    if (!Array.isArray(snapshots)) return;
    const rawMap = new Map(snapshots.map(s => [s.snapshot_date, s.dms_sent]));
    
    const structured = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      structured.push({
        day: shortDay,
        count: rawMap.get(iso) || 0
      });
    }
    
    setData(structured);
  }, [snapshots]);

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-end mb-8">
         <div>
           <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Trailing Action</h3>
           <p className="text-3xl font-black text-white font-mono">{total} <span className="text-base text-zinc-500 font-sans font-medium">DMs sent</span></p>
         </div>
      </div>

      <div className="h-48 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip 
              cursor={{fill: '#27272a'}}
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
            />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={10} />
            <Bar dataKey="count" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#4f46e5' : '#27272a'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
