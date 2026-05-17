import { MessageSquare, Calendar, Target, Percent } from 'lucide-react';

export function StatsStrip({ metrics }: { metrics: any }) {
  const stats = [
    { label: 'DMs Sent', value: metrics?.dmsSent || 0, icon: MessageSquare },
    { label: 'Calls Booked', value: metrics?.callsBooked || 0, icon: Calendar },
    { label: 'Clients Closed', value: metrics?.clientsClosed || 0, icon: Target },
    { label: 'Conv. Rate', value: `${metrics?.conversionRate || 0}%`, icon: Percent },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/[0.02] border border-white/[0.07] hover:border-emerald-500/20 rounded-2xl p-5 flex flex-col justify-between h-32 transition-colors group"
        >
          <div className="flex items-center gap-2 text-zinc-600">
            <stat.icon className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]">{stat.label}</span>
          </div>
          <span className="text-3xl font-bold text-white font-mono tracking-tight">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
