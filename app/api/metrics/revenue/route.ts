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

    const { error } = await supabase
      .from('revenue_logs')
      .insert({
        user_id: user.id,
        amount: Number(amount),
        client_name: clientName || null,
        logged_at: new Date().toISOString()
      });

    if (error) throw error;

    // Trigger achievement check
    evaluateAchievementTriggers(user.id).catch(e => console.error(e));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
