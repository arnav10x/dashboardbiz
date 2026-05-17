import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  contact_info: z.string().optional(),
  niche: z.string().optional(),
  status: z.string().default('Prospect')
});

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await request.json();
    const parsed = leadSchema.parse(json);

    // 1. Insert Lead
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: parsed.name,
        company: parsed.company,
        contact_info: parsed.contact_info,
        niche: parsed.niche,
        status: parsed.status
      })
      .select()
      .single();

    if (leadError) throw leadError;

    // 2. Log initial activity
    await supabase.from('lead_activities').insert({
      user_id: user.id,
      lead_id: newLead.id,
      activity_type: 'Created',
      notes: `Added to pipeline as ${parsed.status}`
    });

    return NextResponse.json({ lead: newLead });
  } catch (error: any) {
    console.error('Lead POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
