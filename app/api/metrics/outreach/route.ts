import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { incrementOutreach } from '@/lib/metrics';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const newSnapshot = await incrementOutreach(user.id);
    return NextResponse.json({ success: true, count: newSnapshot.dms_sent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch the last 7 trailing days natively using Postgres intervals
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoString = sevenDaysAgo.toISOString().split('T')[0];

    const { data: snapshots, error } = await supabase
      .from('metrics_snapshots')
      .select('snapshot_date, dms_sent')
      .eq('user_id', user.id)
      .gte('snapshot_date', isoString)
      .order('snapshot_date', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ snapshots: snapshots || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
