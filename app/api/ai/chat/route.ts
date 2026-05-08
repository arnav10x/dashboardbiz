import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAI } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, history } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'No message provided' }, { status: 400 });

    // Fetch business context
    const [{ data: profile }, { data: progress }] = await Promise.all([
      supabase.from('business_profiles').select('service, niche, offer_statement, price, monthly_goal').eq('user_id', user.id).single(),
      supabase.from('user_progress').select('started_at, roadmap_days(day_number)').eq('user_id', user.id).single(),
    ]);

    const rawDay = progress?.roadmap_days;
    const dayNumber = (Array.isArray(rawDay) ? rawDay[0] : rawDay as any)?.day_number || 1;
    const daysActive = progress?.started_at
      ? Math.ceil((Date.now() - new Date(progress.started_at).getTime()) / 86_400_000)
      : 1;

    // Fetch recent metrics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: snapshots } = await supabase
      .from('metrics_snapshots')
      .select('dms_sent, calls_booked, clients_closed')
      .eq('user_id', user.id)
      .gte('snapshot_date', sevenDaysAgo.toISOString().split('T')[0]);

    const metrics = (snapshots || []).reduce(
      (acc, s) => ({
        dmsSent: acc.dmsSent + (s.dms_sent || 0),
        callsBooked: acc.callsBooked + (s.calls_booked || 0),
        clientsClosed: acc.clientsClosed + (s.clients_closed || 0),
      }),
      { dmsSent: 0, callsBooked: 0, clientsClosed: 0 }
    );

    const systemPrompt = `You are a brutally direct outreach coach inside Founder OS, a 30-day client-acquisition platform.

Founder context:
- Service: ${profile?.service || 'unknown'}
- Niche: ${profile?.niche || 'unknown'}
- Offer: "${profile?.offer_statement || 'not set'}"
- Price: $${profile?.price || '?'}/mo
- Monthly revenue goal: $${profile?.monthly_goal || '?'}
- Sprint day: ${dayNumber} of 30 (${daysActive} days active)
- Last 7 days: ${metrics.dmsSent} DMs sent, ${metrics.callsBooked} calls booked, ${metrics.clientsClosed} clients closed

Rules:
- Answer in 2-4 sentences max. Be direct and specific to their business context above.
- No generic motivational fluff. Give them an action or diagnosis.
- If they ask something unrelated to business/sales/outreach, redirect them back.`;

    // Build message history for the AI (cap at last 10 exchanges to avoid token overflow)
    const recentHistory = (history || []).slice(-10);
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...recentHistory.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.5,
      max_tokens: 200,
    });

    const reply = completion.choices[0].message.content?.trim() || "I couldn't generate a response. Try again.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
