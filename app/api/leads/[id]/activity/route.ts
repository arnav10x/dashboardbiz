import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const activitySchema = z.object({
  newStatus: z.string(),
  note: z.string().optional()
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await request.json();
    const { newStatus, note } = activitySchema.parse(json);

    // 1. Update Lead Status and Updated Timestamp
    const { error: leadErr } = await supabase
      .from('leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (leadErr) throw leadErr;

    // 2. Log Activity
    const { data: activity, error: actErr } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: params.id,
        user_id: user.id,
        activity_type: newStatus,
        notes: note || `Status changed to ${newStatus}`
      })
      .select()
      .single();

    if (actErr) throw actErr;

    return NextResponse.json({ success: true, activity, newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
