import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { service, niche, result, price } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a business positioning expert. Given this founder's service, niche, result, and price, craft a single sharp offer statement in this format: 'I help [specific niche] [achieve specific result] through [service], guaranteed, for $[price]/mo.' Make it concrete. No fluff. Max 2 sentences.`
        },
        {
          role: "user",
          content: `Service: ${service}\nNiche: ${niche}\nResult: ${result}\nPrice: $${price}`
        }
      ],
      temperature: 0.7,
    });

    const statement = completion.choices[0].message.content?.replace(/['"]/g, '').trim();

    return NextResponse.json({ 
      offerStatement: statement
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json({ error: 'Failed to generate offer' }, { status: 500 });
  }
}
