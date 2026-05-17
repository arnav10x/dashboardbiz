import { createClient } from '@/lib/supabase/server';

export type Task = {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  is_personalized: boolean;
  roadmap_day_id: string;
};

// Core Defensive Progress Advancer (Run on dashboard load to simulate nightly CRON)
export async function ensureCurrentDay() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Real world implementation would use pg_cron. Here we defensively advance the day
  // based on the difference between user_progress.started_at and current time.
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!progress) return null;

  const startDate = new Date(progress.started_at);
  const now = new Date();
  // Calculate days passed since start (simplistic timezone check based on midnight UTC)
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / msPerDay);
  
  // Cap at day 30 natively
  const targetDayNumber = Math.min(Math.max(1, daysPassed + 1), 30);

  // Fetch the definitive UUID for the target day
  const { data: targetDayRow } = await supabase
    .from('roadmap_days')
    .select('id, day_number')
    .eq('day_number', targetDayNumber)
    .single();

  if (targetDayRow && progress.current_roadmap_day_id !== targetDayRow.id) {
    // Advance Day
    await supabase.from('user_progress').update({
       current_roadmap_day_id: targetDayRow.id,
       updated_at: new Date().toISOString()
    }).eq('id', progress.id);
  }

  return targetDayRow?.id || progress.current_roadmap_day_id;
}

export async function getTodayTasks(): Promise<{ tasks: Task[], needsPersonalization: boolean, streak: number }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const roadmapDayId = await ensureCurrentDay();
  if (!roadmapDayId) throw new Error('Progress not found');

  // 1. Fetch AI personalized tasks for this user and this day
  const { data: customTasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('roadmap_day_id', roadmapDayId);

  // 2. Fetch standard seed tasks for this day
  const { data: seedTasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .is('user_id', null)
    .eq('roadmap_day_id', roadmapDayId);

  // Determine which to show (If no custom tasks exist, personalization hasn't run yet)
  const useSeed = !customTasks || customTasks.length === 0;
  const rawTasks = useSeed ? (seedTasks || []) : customTasks;

  // 3. Fetch completion logs
  // Get all completions for this user to calculate streak safely
  const { data: allCompletions } = await supabase
    .from('task_completions')
    .select('daily_task_id, completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  const completionSet = new Set(allCompletions?.map(c => c.daily_task_id) || []);

  const formattedTasks = rawTasks.map(t => ({
     id: t.id,
     title: t.title,
     description: t.description || '',
     roadmap_day_id: t.roadmap_day_id,
     is_completed: completionSet.has(t.id),
     is_personalized: !useSeed,
  }));

  // Arbitrary streak calculation logic. Group completions by UTC date, check if consecutive.
  // In v1, streak = 0 implementation fallback.
  // ADHD-informed design: don't wipe it completely, maybe halflife it or pause it.
  const streak = 0; // Requires complex time-series aggregation omitted for briefness

  return {
    tasks: formattedTasks,
    needsPersonalization: useSeed && formattedTasks.length > 0,
    streak: streak
  };
}
