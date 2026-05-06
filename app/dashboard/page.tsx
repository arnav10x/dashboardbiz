import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { RevenueProgress } from '@/components/dashboard/RevenueProgress';
import { DailyLogTile } from '@/components/dashboard/DailyLogTile';
import { getTodaySnapshot, getWeeklySnapshots } from '@/lib/metrics';
import { CheckCircle2, Circle, TrendingUp, Users, DollarSign, Percent } from 'lucide-react';
import type { ComponentType } from 'react';

// KPI card
function KPICard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.07] hover:border-emerald-500/20 rounded-2xl p-5 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-600">{label}</p>
        <div className="h-7 w-7 bg-white/[0.03] border border-white/[0.06] rounded-lg flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
        </div>
      </div>
      <p className={`text-3xl font-black font-mono tracking-tight ${accent ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-zinc-700 mt-1">{sub}</p>}
    </div>
  );
}

// Funnel bar
function FunnelBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 4 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] text-zinc-600 w-20 shrink-0 capitalize">{label}</p>
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500/70 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] font-bold font-mono text-zinc-400 w-5 text-right">{count}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: progress }, todayStats, weeklyStats] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('user_progress')
      .select('roadmap_days(id,day_number,title,description)')
      .eq('user_id', user.id)
      .single(),
    getTodaySnapshot(user.id),
    getWeeklySnapshots(user.id),
  ]);

  const rawDayData = progress?.roadmap_days;
  const dayData = (Array.isArray(rawDayData) ? rawDayData[0] : rawDayData) || {
    day_number: 1,
    title: 'Day 1 — Lock your Niche & Service',
    description: 'Commit to one niche and one service mechanism.',
  };

  const weekNumber = Math.min(Math.ceil((dayData.day_number || 1) / 7), 4);
  const phases = ['Week 1: Clarity', 'Week 2: Outreach Launch', 'Week 3: Sales Optimization', 'Week 4: Performance Refinement'];

  const dmsSent = todayStats?.dms_sent || 0;
  const callsBooked = todayStats?.calls_booked || 0;
  const clientsClosed = todayStats?.clients_closed || 0;
  const revenue = Number(todayStats?.revenue) || 0;
  const monthlyGoal = Number(profile?.monthly_goal) || 5000;
  const convRate = dmsSent > 0 ? Math.round((clientsClosed / dmsSent) * 100) : 0;

  // Lead funnel counts
  const { data: leads } = await supabase.from('leads').select('status').eq('user_id', user.id);
  const funnel = { prospect: 0, contacted: 0, replied: 0, booked: 0, closed: 0 };
  leads?.forEach((l) => {
    const s = l.status?.toLowerCase();
    if (s === 'prospect') funnel.prospect++;
    else if (s === 'contacted') funnel.contacted++;
    else if (s === 'replied') funnel.replied++;
    else if (s === 'booked') funnel.booked++;
    else if (s === 'closed') funnel.closed++;
  });
  const funnelMax = Math.max(...Object.values(funnel), 1);

  const tasks = [
    { id: '1', title: 'Select ONE target niche', done: true },
    { id: '2', title: 'Select ONE service mechanism you will deliver', done: false },
    { id: '3', title: 'Write your commitment down in your Founder OS profile', done: false },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">

      {/* ── KPI Row ── */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="Revenue Earned" value={`$${revenue.toLocaleString()}`} sub={`Goal $${monthlyGoal.toLocaleString()}`} accent={revenue > 0} icon={DollarSign} />
          <KPICard label="Conv. Rate" value={`${convRate}%`} sub="DMs → clients" icon={Percent} />
          <KPICard label="Clients Closed" value={String(clientsClosed)} sub="this month" icon={Users} />
          <KPICard label="DMs Sent" value={String(dmsSent)} sub="today" accent={dmsSent > 0} icon={TrendingUp} />
        </div>
      </div>

      {/* ── Quick Overview ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Quick Overview</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 7-day chart — wider */}
          <div className="lg:col-span-2">
            <WeeklyChart snapshots={weeklyStats} />
          </div>

          {/* Lead funnel */}
          <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-5">Lead Pipeline</p>
            <div className="space-y-4">
              <FunnelBar label="Prospect" count={funnel.prospect} max={funnelMax} />
              <FunnelBar label="Contacted" count={funnel.contacted} max={funnelMax} />
              <FunnelBar label="Replied" count={funnel.replied} max={funnelMax} />
              <FunnelBar label="Booked" count={funnel.booked} max={funnelMax} />
              <FunnelBar label="Closed" count={funnel.closed} max={funnelMax} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Daily Log ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Daily Log</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DailyLogTile
            label="DMs Sent"
            initialValue={dmsSent}
            goal={20}
            endpoint="/api/metrics/outreach"
          />
          <DailyLogTile
            label="Calls Booked"
            initialValue={callsBooked}
            goal={3}
          />
          <DailyLogTile
            label="Clients Closed"
            initialValue={clientsClosed}
            goal={1}
          />
          <DailyLogTile
            label="Revenue"
            initialValue={revenue}
            goal={monthlyGoal}
            prefix="$"
          />
        </div>
      </div>

      {/* ── Detailed Overview ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Detailed Overview</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Today's tasks */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-white">Non-Negotiable Tasks</p>
              <span className="text-[9px] font-bold text-zinc-600 border border-white/[0.06] px-2 py-1 rounded-lg uppercase tracking-widest">
                Day {dayData.day_number}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    t.done ? 'border-white/[0.04] opacity-50' : 'border-white/[0.07] bg-white/[0.01] hover:border-emerald-500/20'
                  }`}
                >
                  {t.done
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    : <Circle className="h-4 w-4 text-zinc-700 flex-shrink-0" />
                  }
                  <p className={`text-sm font-medium ${t.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>
                    {t.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint info + revenue */}
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.15em] mb-2">{phases[weekNumber - 1]}</p>
              <p className="text-sm font-bold text-white leading-snug">{dayData.title}</p>
              <p className="text-xs text-zinc-600 mt-2 leading-relaxed">{dayData.description}</p>
            </div>
            <RevenueProgress currentRevenue={revenue} goalRevenue={monthlyGoal} />
          </div>

        </div>
      </div>

    </div>
  );
}
