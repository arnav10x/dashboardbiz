import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { RevenueProgress } from '@/components/dashboard/RevenueProgress';
import { DailyLogTile } from '@/components/dashboard/DailyLogTile';
import { TasksWidget } from '@/components/dashboard/TasksWidget';
import { getTodaySnapshot, getWeeklySnapshots } from '@/lib/metrics';
import { TrendingUp, Users, DollarSign, Percent } from 'lucide-react';
import type { ComponentType } from 'react';

function KPICard({
  label, value, sub, accent, icon: Icon,
}: {
  label: string; value: string; sub?: string; accent?: boolean;
  icon: ComponentType<{ className?: string; style?: any }>;
}) {
  return (
    <div className="app-card rounded-2xl p-6 transition-all group shadow-sm dark:shadow-none" style={{ borderColor: 'var(--card-border)' }}>
      <div className="flex items-start justify-between mb-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <div className="h-8 w-8 rounded-xl flex items-center justify-center border" style={{ background: 'var(--app-bg)', borderColor: 'var(--border)' }}>
          <Icon className="h-4 w-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
      <p className="text-3xl font-black font-mono tracking-tight" style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
        {value}
      </p>
      {sub && <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

function FunnelBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 4 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <p className="text-[10px] w-20 shrink-0 capitalize" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--app-bg)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'var(--accent)', opacity: 0.7 }} />
      </div>
      <p className="text-[10px] font-bold font-mono w-5 text-right" style={{ color: 'var(--text-secondary)' }}>{count}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-secondary)' }}>
      {children}
    </p>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: progress }, todayStats, weeklyStats] = await Promise.all([
    supabase.from('business_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('user_progress').select('roadmap_days(id,day_number,title,description)').eq('user_id', user.id).single(),
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

  return (
    <div className="p-8 md:p-10 space-y-10 max-w-6xl mx-auto">

      {/* ── KPI Row ── */}
      <div>
        <SectionLabel>Today at a glance</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <KPICard label="Revenue Earned" value={`$${revenue.toLocaleString()}`} sub={`Goal $${monthlyGoal.toLocaleString()}`} accent={revenue > 0} icon={DollarSign} />
          <KPICard label="Conv. Rate" value={`${convRate}%`} sub="DMs → clients" icon={Percent} />
          <KPICard label="Clients Closed" value={String(clientsClosed)} sub="this month" icon={Users} />
          <KPICard label="DMs Sent" value={String(dmsSent)} sub="today" accent={dmsSent > 0} icon={TrendingUp} />
        </div>
      </div>

      {/* ── Quick Overview ── */}
      <div>
        <SectionLabel>Quick Overview</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <WeeklyChart snapshots={weeklyStats} />
          </div>
          <div className="app-card rounded-2xl p-6 shadow-sm dark:shadow-none">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-5" style={{ color: 'var(--text-secondary)' }}>Lead Pipeline</p>
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
        <SectionLabel>Daily Log</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <DailyLogTile label="DMs Sent" initialValue={dmsSent} goal={20} endpoint="/api/metrics/outreach" />
          <DailyLogTile label="Calls Booked" initialValue={callsBooked} goal={3} />
          <DailyLogTile label="Clients Closed" initialValue={clientsClosed} goal={1} />
          <DailyLogTile label="Revenue" initialValue={revenue} goal={monthlyGoal} prefix="$" />
        </div>
      </div>

      {/* ── Detailed Overview ── */}
      <div>
        <SectionLabel>Detailed Overview</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Tasks — real interactive client component */}
          <div className="lg:col-span-2">
            <TasksWidget dayNumber={dayData.day_number} />
          </div>

          {/* Sprint info + revenue */}
          <div className="space-y-4">
            <div className="app-card rounded-2xl p-6 shadow-sm dark:shadow-none">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--accent)' }}>{phases[weekNumber - 1]}</p>
              <p className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>{dayData.title}</p>
              <p className="text-xs mt-2.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{dayData.description}</p>
            </div>
            <RevenueProgress currentRevenue={revenue} goalRevenue={monthlyGoal} />
          </div>

        </div>
      </div>

    </div>
  );
}
