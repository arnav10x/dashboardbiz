import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: settings } = await supabase
      .from('user_settings')
      .select('business_name, business_type, stage, primary_goal, revenue_target, ai_context')
      .eq('user_id', user.id)
      .single();

    const hasContext = !!(settings?.business_type || settings?.ai_context);

    return NextResponse.json({
      hasContext,
      businessName: settings?.business_name || '',
      businessType: settings?.business_type || '',
      stage: settings?.stage || '',
      goal: settings?.primary_goal || (settings?.revenue_target ? `$${Number(settings.revenue_target).toLocaleString()}/mo` : ''),
      aiContext: settings?.ai_context || '',
    });
  } catch {
    return NextResponse.json({ hasContext: false });
  }
}
