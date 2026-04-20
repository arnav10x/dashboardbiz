import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Header Aggregates
    const { data: progress } = await supabase.from('user_progress').select('started_at').eq('user_id', user.id).single();
    const startedAt = progress ? new Date(progress.started_at) : new Date();
    const daysActive = Math.ceil((new Date().getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));

    const { count: tasksCompleted } = await supabase.from('task_completions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const { count: totalTasksToDate } = await supabase.from('daily_tasks').select('*', { count: 'exact', head: true }); // Simplification for MVP

    // 2. Revenue Aggregates
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: revLogs } = await supabase.from('revenue_logs').select('amount').eq('user_id', user.id).gte('logged_at', firstDayOfMonth);
    const totalRevenue = revLogs?.reduce((acc, log) => acc + Number(log.amount), 0) || 0;
    
    const { count: clientsClosedMonth } = await supabase.from('lead_activities').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'Closed Won').gte('created_at', firstDayOfMonth);
    const avgDealSize = clientsClosedMonth && clientsClosedMonth > 0 ? (totalRevenue / clientsClosedMonth) : 0;

    // 3. Funnel Stats
    const { data: leads } = await supabase.from('leads').select('status').eq('user_id', user.id);
    const funnel = { prospects: 0, contacted: 0, replied: 0, called: 0, closed: 0 };
    leads?.forEach(l => {
      if (l.status === 'Prospect') funnel.prospects++;
      if (l.status === 'Contacted') funnel.contacted++;
      if (l.status === 'Replied') funnel.replied++;
      if (l.status === 'Call Booked') funnel.called++;
      if (l.status === 'Closed Won') funnel.closed++;
    });

    // 4. Outreach Timeline
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const isoString = thirtyAgo.toISOString().split('T')[0];
    const { data: snapshots } = await supabase.from('metrics_snapshots').select('snapshot_date, dms_sent, calls_booked, clients_closed').eq('user_id', user.id).gte('snapshot_date', isoString).order('snapshot_date', { ascending: true });

    return NextResponse.json({
       summary: { daysActive, completionScore: { completed: tasksCompleted || 0, total: totalTasksToDate || 90 } },
       revenue: { earned: totalRevenue, clientsClosed: clientsClosedMonth || 0, avgDealSize },
       funnel,
       timeline: snapshots || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
