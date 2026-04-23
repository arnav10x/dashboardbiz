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

  if (!user) {
    redirect('/login');
  }

  // Fetch Business Profile
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch Current Progress deeply resolving roadmap_days relations
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

  // Fetch real metrics data defensively
  const todayStats = await getTodaySnapshot(user.id);
  const weeklyStats = await getWeeklySnapshots(user.id);

  // Handle Supabase potentially returning roadmap_days as an array or object
  const rawDayData = progress?.roadmap_days;
  const dayData = Array.isArray(rawDayData) ? rawDayData[0] : rawDayData || {
    day_number: 1,
    title: "Day 1 — Lock your Niche & Service",
    description: "Eliminate distraction by committing to one specific audience and one core mechanism.",
  };

  // Determine Phase natively from the day_number 
  const weekNumber = Math.min(Math.ceil((dayData.day_number || 1) / 7), 4);
  const phases = ["Week 1: Clarity", "Week 2: Outreach Launch", "Week 3: Sales Optimization", "Week 4: Performance Refinement"];
  const currentPhase = phases[weekNumber - 1] || phases[0];

  const currentTasks = [
    { id: '1', title: "Select ONE target niche", is_completed: true },
    { id: '2', title: "Select ONE service mechanism you will deliver", is_completed: false },
    { id: '3', title: "Write your commitment down in the Founder OS profile", is_completed: false }
  ];

  const metricsSnapshot = {
    dmsSent: todayStats?.dms_sent || 0,
    callsBooked: todayStats?.calls_booked || 0,
    clientsClosed: todayStats?.clients_closed || 0,
    conversionRate: todayStats?.dms_sent ? Math.round(((todayStats.clients_closed || 0) / todayStats.dms_sent) * 100) : 0,
    revenue: Number(todayStats?.revenue) || 0,
  };

  const monthlyGoal = Number(profile?.monthly_goal) || 5000;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Execution Pulse</h1>
          <p className="text-zinc-400 mt-1 font-medium">Zero emotion. Just reps.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TodayFocus
          dayTitle={dayData.title}
          phase={currentPhase}
          objective={dayData.description || ''}
        />
        <OutreachCounter initialCount={metricsSnapshot.dmsSent} />
      </div>

      <div className="pt-4">
        <AICoachPanel />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Non-Negotiable Tasks</h2>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded">Required</span>
          </div>

          <div className="space-y-3">
            {currentTasks.map((task) => (
              <div key={task.id} className={`flex items-start gap-4 p-4 rounded-lg border ${task.is_completed ? 'bg-zinc-900/30 border-zinc-800/50' : 'bg-[#18181b] border-zinc-700'} hover:border-indigo-500/50 transition-all cursor-pointer group`}>
                <button className="mt-0.5 text-zinc-400 group-hover:text-indigo-400 transition-colors">
                  {task.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div>
                  <h3 className={`font-medium text-sm transition-colors ${task.is_completed ? 'text-zinc-600 line-through' : 'text-zinc-200 group-hover:text-white'}`}>
                    {task.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Economics */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Economics</h2>
          <RevenueProgress currentRevenue={metricsSnapshot.revenue} goalRevenue={monthlyGoal} />
          <WeeklyChart snapshots={weeklyStats} />
        </div>

      </div>

      <div className="pt-8 mt-8 border-t border-zinc-900">
        <h2 className="text-xl font-bold text-white tracking-tight mb-6">Metrics Dashboard</h2>
        <StatsStrip metrics={metricsSnapshot} />
      </div>

    </div>
  );
}
