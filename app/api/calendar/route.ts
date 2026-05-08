import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  event_type: z.enum(['meeting', 'call', 'follow-up', 'other']).default('meeting'),
  lead_id: z.string().uuid().optional().nullable(),
});

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: events, error } = await supabase
      .from('calendar_events')
      .select(`*, leads(id, name, company)`)
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await request.json();
    const parsed = eventSchema.parse(json);

    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        ...parsed,
        lead_id: parsed.lead_id || null,
      })
      .select(`*, leads(id, name, company)`)
      .single();

    if (error) throw error;
    return NextResponse.json({ event });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
