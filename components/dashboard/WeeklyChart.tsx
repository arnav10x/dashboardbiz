"use client"
import * as React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function WeeklyChart({ snapshots }: { snapshots: any[] }) {
  const [data, setData] = React.useState<{ day: string; count: number }[]>([]);

  React.useEffect(() => {
    if (!Array.isArray(snapshots)) return;
    const rawMap = new Map(snapshots.map((s) => [s.snapshot_date, s.dms_sent]));

    const structured = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
      structured.push({ day: shortDay, count: rawMap.get(iso) || 0 });
    }

    setData(structured);
  }, [snapshots]);

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
      <div className="mb-6">
        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-1">7-Day Activity</p>
        <p className="text-2xl font-bold text-white font-mono">
          {total}
          <span className="text-sm text-zinc-600 font-sans font-normal ml-2">DMs sent</span>
        </p>
      </div>

      <div className="h-40 w-full -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={20}>
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                backgroundColor: '#0d0d0d',
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#10b981', fontWeight: 700 }}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#52525b', fontSize: 11 }}
              dy={8}
            />
            <Bar dataKey="count" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.count > 0 ? '#10b981' : 'rgba(255,255,255,0.04)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
