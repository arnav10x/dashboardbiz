import { MessageSquare, Calendar, Target, Percent } from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  icon: any;
}

export function StatsStrip({ metrics }: { metrics: any }) {
  const stats: Metric[] = [
    { label: "DMs Sent", value: metrics?.dmsSent || 0, icon: MessageSquare },
    { label: "Calls Booked", value: metrics?.callsBooked || 0, icon: Calendar },
    { label: "Clients Closed", value: metrics?.clientsClosed || 0, icon: Target },
    { label: "Conv. Rate", value: `${metrics?.conversionRate || 0}%`, icon: Percent },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#18181b] border border-zinc-800 rounded-lg p-5 flex flex-col justify-between h-32">
          <div className="flex items-center gap-2 text-zinc-400">
            <stat.icon className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
          </div>
          <span className="text-3xl font-bold text-white font-mono">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
