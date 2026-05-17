import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as z from 'zod';

const completeSchema = z.object({
  isCompleted: z.boolean(),
});

export async function POST(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const json = await request.json();
    const { isCompleted } = completeSchema.parse(json);
    const taskId = params.taskId;

    if (isCompleted) {
       // Insert task completion log
       const { error } = await supabase.from('task_completions').insert({
         user_id: user.id,
         daily_task_id: taskId,
       });
       
       // Handle uniqueness constraint violations gracefully (already completed)
       if (error && error.code !== '23505') { 
         throw new Error(error.message);
       }
    } else {
       // Allow unticking (destroying completion) if UX requires
       await supabase.from('task_completions')
         .delete()
         .eq('user_id', user.id)
         .eq('daily_task_id', taskId);
    }

    return NextResponse.json({ success: true, taskId, isCompleted });
  } catch (error: any) {
    console.error('API Task Complete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
