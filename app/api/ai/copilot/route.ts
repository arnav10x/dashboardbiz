import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAI } from '@/lib/openai';

function buildSystemPrompt(ctx: {
  businessName: string;
  yourName: string;
  businessType: string;
  industry: string;
  stage: string;
  aiContext: string;
  revenueTarget: number;
  primaryGoal: string;
  totalRevenue: number;
  totalLeads: number;
  closedClients: number;
}) {
  const hasData = ctx.totalRevenue > 0 || ctx.totalLeads > 0;

  return `You are a world-class business growth strategist and advisor built into Founder OS.
You have deep expertise in:
- Digital marketing (Meta Ads, Instagram, TikTok, Google Ads, YouTube, LinkedIn, Pinterest)
- Content strategy and organic growth for all major platforms
- Product-market fit, offer design, and pricing strategy
- E-commerce operations, Shopify/WooCommerce optimization, product sourcing
- SaaS growth, user acquisition, onboarding, and retention
- Service business scaling: packaging, hiring, systems, SOPs
- Agency operations: client delivery, team building, account management
- Brand positioning, landing page conversion, copywriting
- Lead generation funnels, email marketing, SMS campaigns
- Business finance: margins, cash flow, pricing, reinvestment strategy
- Competitor analysis and market positioning

FOUNDER CONTEXT (use this to personalize every response):
- Business Name: ${ctx.businessName || 'Not set'}
- Owner: ${ctx.yourName || 'Founder'}
- Business Type: ${ctx.businessType || 'Service'}
- Industry: ${ctx.industry || 'General'}
- Stage: ${ctx.stage || 'Pre-revenue'}
- Revenue Goal: $${ctx.revenueTarget?.toLocaleString() || '10,000'}/month
- Primary Goal: ${ctx.primaryGoal || 'Grow revenue'}
- What they do (their words): "${ctx.aiContext || 'Not described yet'}"
- Current Revenue: $${ctx.totalRevenue?.toLocaleString() || '0'}
- Total Leads: ${ctx.totalLeads || 0}
- Closed Clients: ${ctx.closedClients || 0}
- Has data: ${hasData ? 'Yes' : 'No — new user'}

YOUR ROLE:
You are their dedicated business advisor, NOT a generic outreach coach. The outreach/DM sidebar handles sales. You handle EVERYTHING ELSE:
- How to scale their specific type of business
- Which platforms to advertise on and why (with budget suggestions)
- How to improve their product, website, or service delivery
- What content to create and where to post it
- How to build systems so the business runs without them being in every task
- When and how to hire, outsource, or automate
- Pricing strategy and offer design for their stage
- How competitors in their niche are winning and how to beat them

RESPONSE STYLE:
- Be specific to their business type and stage. A pre-revenue agency needs different advice than a $10k/month e-commerce store.
- Keep responses to 3-5 sentences unless they ask for a breakdown or plan
- Be direct and actionable — give them a specific next step
- If they ask about ads, name the platform, budget range, and targeting approach
- If they ask about social media, name the exact content type, posting frequency, and platform priority
- Do not redirect them to "log data first" — if you don't have data, give advice based on their stage and business type
- Never be generic. Always tie your advice to what they told you about their business`;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, history } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'No message' }, { status: 400 });

    // Fetch all user context in parallel
    const [
      { data: settings },
      { data: profile },
      { data: leadsData },
      { data: snapshots },
    ] = await Promise.all([
      supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      supabase.from('business_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('leads').select('status').eq('user_id', user.id),
      supabase.from('metrics_snapshots').select('revenue, clients_closed').eq('user_id', user.id),
    ]);

    const totalRevenue = (snapshots || []).reduce((a, s) => a + (Number(s.revenue) || 0), 0);
    const totalLeads = (leadsData || []).length;
    const closedClients = (leadsData || []).filter(l => l.status === 'Closed Won').length;

    const systemPrompt = buildSystemPrompt({
      businessName: settings?.business_name || profile?.niche || '',
      yourName: settings?.your_name || '',
      businessType: settings?.business_type || 'Service',
      industry: settings?.industry || profile?.service || '',
      stage: settings?.stage || 'Pre-revenue',
      aiContext: settings?.ai_context || profile?.offer_statement || '',
      revenueTarget: settings?.revenue_target || Number(profile?.monthly_goal) || 10000,
      primaryGoal: settings?.primary_goal || '',
      totalRevenue,
      totalLeads,
      closedClients,
    });

    const recentHistory = (history || []).slice(-14);
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
      temperature: 0.6,
      max_tokens: 500,
    });

    const reply = completion.choices[0].message.content?.trim() || "Couldn't generate a response. Try again.";
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
