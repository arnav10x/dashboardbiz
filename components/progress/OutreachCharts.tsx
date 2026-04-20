"use client"
import * as React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

export function OutreachCharts({ timelineData }: { timelineData: any[] }) {
  if (!timelineData || timelineData.length === 0) return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 h-64 flex items-center justify-center">
      <p className="text-zinc-500 font-medium">No outreach data available yet.</p>
    </div>
  );

  const formattedData = timelineData.map(d => {
    const rawDate = new Date(d.snapshot_date);
    // Explicitly add time to ensure local boundary parsing is accurate
    const local = new Date(rawDate.getTime() + rawDate.getTimezoneOffset() * 60000);
    return {
      day: local.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dms: d.dms_sent,
    }
  });

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 h-[300px]">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">30-Day Outreach Volume</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formattedData}>
          <Tooltip 
            cursor={{fill: '#27272a'}}
            contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
          />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
          <Bar dataKey="dms" radius={[4, 4, 4, 4]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.dms > 0 ? '#4f46e5' : '#27272a'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
