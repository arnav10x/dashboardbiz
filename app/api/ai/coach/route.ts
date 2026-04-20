import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import { COACH_SYSTEM_PROMPT, buildCoachUserPrompt, CoachContext } from '@/lib/ai/coach-prompts';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Check for Cached Report (Last 24 hours)
    const { data: cachedReport } = await supabase
      .from('ai_coach_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedReport) {
      const generatedAt = new Date(cachedReport.generated_at);
      const now = new Date();
      const diffHours = (now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        return NextResponse.json({ 
          report: cachedReport.report_json,
          generatedAt: cachedReport.generated_at,
          isCached: true
        });
      }
    }

    return NextResponse.json({ needsRegeneration: true });
  } catch (error: any) {
    console.error('Coaching Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Gather Context
    // Business Profile
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('No business profile found.');

    // Metrics (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: snapshots } = await supabase
      .from('metrics_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('snapshot_date', sevenDaysAgo.toISOString().split('T')[0]);

    const metrics = (snapshots || []).reduce((acc, snap) => ({
      dmsSent: acc.dmsSent + (snap.dms_sent || 0),
      repliesReceived: acc.repliesReceived + (snap.replies_received || 0),
      callsBooked: acc.callsBooked + (snap.calls_booked || 0),
      clientsClosed: acc.clientsClosed + (snap.clients_closed || 0),
    }), { dmsSent: 0, repliesReceived: 0, callsBooked: 0, clientsClosed: 0 });

    // Progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('started_at')
      .eq('user_id', user.id)
      .single();

    const startedAt = progress ? new Date(progress.started_at) : new Date();
    const now = new Date();
    const daysActive = Math.ceil((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));

    const context: CoachContext = {
      niche: profile.niche,
      service: profile.service,
      offerStatement: profile.offer_statement || "No offer statement generated yet.",
      metrics: { ...metrics, daysActive }
    };

    // 3. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: COACH_SYSTEM_PROMPT },
        { role: "user", content: buildCoachUserPrompt(context) }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    const reportJson = JSON.parse(completion.choices[0].message.content || '{}');

    // 4. Cache Result
    const { data: savedReport, error: saveError } = await supabase
      .from('ai_coach_reports')
      .insert({
        user_id: user.id,
        report_json: reportJson,
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return NextResponse.json({ 
      report: reportJson,
      generatedAt: savedReport.generated_at,
      isCached: false 
    });

  } catch (error: any) {
    console.error('AI Coaching Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
