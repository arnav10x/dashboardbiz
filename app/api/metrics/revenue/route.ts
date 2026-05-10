import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluateAchievementTriggers } from '@/lib/achievements/check-triggers';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { amount, clientName } = body;

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    const today = new Date().toISOString().split('T')[0];

    // Insert into revenue_logs (for progress page history)
    const { error: logError } = await supabase.from('revenue_logs').insert({
      user_id: user.id,
      amount: numAmount,
      client_name: clientName || null,
      logged_at: new Date().toISOString(),
    });
    if (logError) throw logError;

    // Also upsert today's metrics_snapshot so the dashboard KPIs update
    const { data: snap } = await supabase
      .from('metrics_snapshots')
      .select('id, revenue, clients_closed')
      .eq('user_id', user.id)
      .eq('snapshot_date', today)
      .single();

    if (snap) {
      await supabase.from('metrics_snapshots').update({
        revenue: (Number(snap.revenue) || 0) + numAmount,
        clients_closed: (snap.clients_closed || 0) + 1,
        updated_at: new Date().toISOString(),
      }).eq('id', snap.id);
    } else {
      await supabase.from('metrics_snapshots').insert({
        user_id: user.id,
        snapshot_date: today,
        revenue: numAmount,
        clients_closed: 1,
      });
    }

    evaluateAchievementTriggers(user.id).catch(e => console.error(e));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
