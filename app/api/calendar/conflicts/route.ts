import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Check if a proposed time window conflicts with existing events
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { start_time, end_time, exclude_id } = await request.json();
    if (!start_time || !end_time) {
      return NextResponse.json({ error: 'start_time and end_time required' }, { status: 400 });
    }

    // Overlap condition: existing.start < proposed.end AND existing.end > proposed.start
    let query = supabase
      .from('calendar_events')
      .select('id, title, start_time, end_time, event_type')
      .eq('user_id', user.id)
      .lt('start_time', end_time)
      .gt('end_time', start_time);

    if (exclude_id) {
      query = query.neq('id', exclude_id);
    }

    const { data: conflicts, error } = await query;
    if (error) throw error;

    return NextResponse.json({ conflicts: conflicts || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
