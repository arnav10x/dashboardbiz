import { createClient } from '@/lib/supabase/server';
import { evaluateAchievementTriggers } from '@/lib/achievements/check-triggers';

export async function incrementOutreach(userId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  // Read-Modify-Write (Acceptable for solo-SaaS workloads)
  const { data: snapshot } = await supabase
    .from('metrics_snapshots')
    .select('dms_sent, id')
    .eq('user_id', userId)
    .eq('snapshot_date', today)
    .single();

  let newData;

  if (snapshot) {
     const { data, error } = await supabase
       .from('metrics_snapshots')
       .update({ dms_sent: (snapshot.dms_sent || 0) + 1, updated_at: new Date().toISOString() })
       .eq('id', snapshot.id)
       .select()
       .single();
     if (error) throw error;
     newData = data;
  } else {
     const { data, error } = await supabase
       .from('metrics_snapshots')
       .insert({ user_id: userId, snapshot_date: today, dms_sent: 1 })
       .select()
       .single();
     if (error) throw error;
     newData = data;
  }

  // Trigger achievement evaluation asynchronously cleanly
  // Note: Since Supabase constraints are intact, this safely processes triggers headless based on updated db states.
  evaluateAchievementTriggers(userId).catch(e => console.error("Achievement error:", e));

  return newData;
}

// evaluateAchievements is now strictly localized inside lib/achievements/check-triggers.ts 
// See evaluateAchievementTriggers export for the unified scalable pattern.

export async function getTodaySnapshot(userId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('metrics_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('snapshot_date', today)
    .single();

  return data || { dms_sent: 0, calls_booked: 0, clients_closed: 0, revenue: 0 };
}

export async function getWeeklySnapshots(userId: string) {
  const supabase = createClient();
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isoString = sevenDaysAgo.toISOString().split('T')[0];

  const { data } = await supabase
    .from('metrics_snapshots')
    .select('snapshot_date, dms_sent')
    .eq('user_id', userId)
    .gte('snapshot_date', isoString)
    .order('snapshot_date', { ascending: true });

  return data || [];
}
