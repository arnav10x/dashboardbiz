import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOpenAI } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tasks, roadmapDayId } = await request.json();
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks provided' }, { status: 400 });
    }

    // 1. Fetch business context
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('service, niche, price')
      .eq('user_id', user.id)
      .single();

    if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 });

    // 2. Map and Parallelize OpenAI Calls
    const personalizedTasks = await Promise.all(tasks.map(async (task: any) => {
      const completion = await getOpenAI().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Given that this founder offers ${profile.service} to ${profile.niche} at $${profile.price}, rewrite this generic business task to be highly specific and actionable strictly to their exact context. Max 2 sentences. Be direct. No fluff.`
          },
          {
            role: "user",
            content: `Generic Task: "${task.title} - ${task.description}"`
          }
        ],
        temperature: 0.5,
      });

      const newTitle = completion.choices[0].message.content?.replace(/['"]/g, '').trim() || task.title;

      return {
        user_id: user.id,
        roadmap_day_id: roadmapDayId,
        title: newTitle,
        description: "", // Simplified output from AI handles both
        is_mandatory: true
      };
    }));

    // 3. Insert newly minted specific tasks to shadow the canonical ones completely
    const { error } = await supabase.from('daily_tasks').insert(personalizedTasks);
    
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, count: personalizedTasks.length });
  } catch (error: any) {
    console.error('AI Personalization API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
