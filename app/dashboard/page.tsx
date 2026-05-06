import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TodayFocus } from '@/components/dashboard/TodayFocus';
import { StatsStrip } from '@/components/dashboard/StatsStrip';
import { RevenueProgress } from '@/components/dashboard/RevenueProgress';
import { OutreachCounter } from '@/components/dashboard/OutreachCounter';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { AICoachPanel } from '@/components/dashboard/AICoachPanel';
import { getTodaySnapshot, getWeeklySnapshots } from '@/lib/metrics';
import { CheckCircle2, Circle } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const { data: progress } = await supabase
    .from('user_progress')
    .select(`
      current_roadmap_day_id,
      roadmap_days (
        id,
        day_number,
        title,
        description
      )
    `)
    .eq('user_id', user.id)
    .single();

  const todayStats = await getTodaySnapshot(user.id);
  const weeklyStats = await getWeeklySnapshots(user.id);

  const rawDayData = progress?.roadmap_days;
  const dayData = Array.isArray(rawDayData) ? rawDayData[0] : rawDayData || {
    day_number: 1,
    title: 'Day 1 — Lock your Niche & Service',
    description: 'Eliminate distraction by committing to one specific audience and one core mechanism.',
  };

  const weekNumber = Math.min(Math.ceil((dayData.day_number || 1) / 7), 4);
  const phases = ['Week 1: Clarity', 'Week 2: Outreach Launch', 'Week 3: Sales Optimization', 'Week 4: Performance Refinement'];
  const currentPhase = phases[weekNumber - 1] || phases[0];

  const currentTasks = [
    { id: '1', title: 'Select ONE target niche', is_completed: true },
    { id: '2', title: 'Select ONE service mechanism you will deliver', is_completed: false },
    { id: '3', title: 'Write your commitment down in the Founder OS profile', is_completed: false },
  ];

  const metricsSnapshot = {
    dmsSent: todayStats?.dms_sent || 0,
    callsBooked: todayStats?.calls_booked || 0,
    clientsClosed: todayStats?.clients_closed || 0,
    conversionRate: todayStats?.dms_sent
      ? Math.round(((todayStats.clients_closed || 0) / todayStats.dms_sent) * 100)
      : 0,
    revenue: Number(todayStats?.revenue) || 0,
  };

  const monthlyGoal = Number(profile?.monthly_goal) || 5000;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Execution Pulse</h1>
        <p className="text-zinc-600 mt-0.5 text-sm">Zero emotion. Just reps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayFocus dayTitle={dayData.title} phase={currentPhase} objective={dayData.description || ''} />
        <OutreachCounter initialCount={metricsSnapshot.dmsSent} />
      </div>

      <div>
        <AICoachPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Non-Negotiable Tasks</h2>
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] border border-white/[0.06] px-2.5 py-1 rounded-lg">
              Required
            </span>
          </div>

          <div className="space-y-2">
            {currentTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                  task.is_completed
                    ? 'bg-white/[0.01] border-white/[0.04] opacity-60'
                    : 'bg-white/[0.02] border-white/[0.07] hover:border-emerald-500/20'
                }`}
              >
                <span className="text-zinc-500 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                  {task.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </span>
                <p className={`font-medium text-sm ${task.is_completed ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover:text-white transition-colors'}`}>
                  {task.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Economics */}
        <div className="space-y-5">
          <h2 className="text-base font-bold text-white tracking-tight">Economics</h2>
          <RevenueProgress currentRevenue={metricsSnapshot.revenue} goalRevenue={monthlyGoal} />
          <WeeklyChart snapshots={weeklyStats} />
        </div>
      </div>

      <div className="pt-6 border-t border-white/[0.05]">
        <h2 className="text-base font-bold text-white tracking-tight mb-5">Metrics Dashboard</h2>
        <StatsStrip metrics={metricsSnapshot} />
      </div>

    </div>
  );
}
