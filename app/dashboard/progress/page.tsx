import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RevenueSection } from '@/components/progress/RevenueSection';
import { OutreachCharts } from '@/components/progress/OutreachCharts';
import { ConversionFunnel } from '@/components/progress/ConversionFunnel';
import { ConsistencyCalendar } from '@/components/progress/ConsistencyCalendar';

export default async function ProgressPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch from the mega aggregator we built
  const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${DOMAIN}/api/metrics`, {
     headers: { cookie: `sb-${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://x').hostname.split('.')[0]}-auth-token=${user.id}` } 
  });
  
  // Actually, Server Components calling local API routes in Next.js requires absolute URIs and cookies passing. 
  // It's cleaner to just fetch it safely natively over Supabase JS for MVP to prevent fetch loop issues.
  // Wait, I will extract exactly what the API does for stability in SSR.
  
  const { data: profile } = await supabase.from('business_profiles').select('monthly_goal').eq('user_id', user.id).single();
  const monthlyGoal = Number(profile?.monthly_goal) || 5000;

  // Emulate API /api/metrics behavior reliably server-side
  const { data: progress } = await supabase.from('user_progress').select('started_at').eq('user_id', user.id).single();
  const startedAt = progress ? new Date(progress.started_at) : new Date();
  const daysActive = Math.max(1, Math.ceil((new Date().getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)));

  const { count: tasksCompleted } = await supabase.from('task_completions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const totalTasksToDate = daysActive * 3; 

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: revLogs } = await supabase.from('revenue_logs').select('amount').eq('user_id', user.id).gte('logged_at', firstDayOfMonth);
  const totalRevenue = revLogs?.reduce((acc, log) => acc + Number(log.amount), 0) || 0;
  
  const { count: clientsClosedMonth } = await supabase.from('lead_activities').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('activity_type', 'closed_won').gte('created_at', firstDayOfMonth);
  const avgDealSize = clientsClosedMonth && clientsClosedMonth > 0 ? (totalRevenue / clientsClosedMonth) : 0;

  const { data: leads } = await supabase.from('leads').select('status').eq('user_id', user.id);
  const funnel = { prospects: 0, contacted: 0, replied: 0, called: 0, closed: 0 };
  leads?.forEach(l => {
    if (l.status === 'Prospect') funnel.prospects++;
    if (l.status === 'Contacted') funnel.contacted++;
    if (l.status === 'Replied') funnel.replied++;
    if (l.status === 'Call Booked') funnel.called++;
    if (l.status === 'Closed Won') funnel.closed++;
  });

  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const isoString = thirtyAgo.toISOString().split('T')[0];
  const { data: snapshots } = await supabase.from('metrics_snapshots').select('snapshot_date, dms_sent').eq('user_id', user.id).gte('snapshot_date', isoString).order('snapshot_date', { ascending: true });

  const metricsData = {
     summary: { daysActive, completionScore: { completed: tasksCompleted || 0, total: totalTasksToDate } },
     revenue: { earned: totalRevenue, clientsClosed: clientsClosedMonth || 0, avgDealSize },
     funnel,
     timeline: snapshots || []
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Performance Record</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm font-bold text-indigo-400">Day {metricsData.summary.daysActive} of 30</span>
            <span className="text-zinc-600">|</span>
            <span className="text-sm font-medium text-zinc-400">
              Task Execution: {metricsData.summary.completionScore.completed}/{metricsData.summary.completionScore.total}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column Strategy */}
        <div className="space-y-8">
           <RevenueSection revenue={metricsData.revenue} goal={monthlyGoal} />
           <ConsistencyCalendar timelineData={metricsData.timeline} />
        </div>

        {/* Right Column Engine */}
        <div className="space-y-8">
           <ConversionFunnel data={metricsData.funnel} />
           <OutreachCharts timelineData={metricsData.timeline} />
        </div>
      </div>
      
    </div>
  );
}
