import { createClient } from '@/lib/supabase/server';
import { ensureAchievementsSeeded } from '@/lib/seed/achievements';

/**
 * Idempotently evaluates if a user has crossed any new threshold boundaries.
 * 
 * Logic handles all badges at once by simply pulling down the user's aggregates 
 * and testing against hardcoded trigger rules.
 * 
 * Returns an array of specifically unlocked Achievement Objects.
 */
export async function evaluateAchievementTriggers(userId: string) {
  const supabase = createClient();
  await ensureAchievementsSeeded(supabase);

  // 1. Fetch available achievements
  const { data: allAchievements } = await supabase.from('achievements').select('*');
  if (!allAchievements) return [];

  // 2. Fetch already earned ones so we skip idempotent testing
  const { data: earnedRel } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
  const earnedSet = new Set((earnedRel || []).map(row => row.achievement_id));

  // 3. Accumulate data
  // Outreach totals
  const { data: snaps } = await supabase.from('metrics_snapshots').select('dms_sent').eq('user_id', userId);
  const totalDMs = (snaps || []).reduce((acc, curr) => acc + (curr.dms_sent || 0), 0);

  // CRM totals
  const { data: leads } = await supabase.from('leads').select('status').eq('user_id', userId);
  let replied = 0, booked = 0, closed = 0;
  leads?.forEach(l => {
     const s = (l.status || '').toLowerCase();
     if (s === 'replied' || s === 'call_booked' || s === 'closed_won') replied++;
     if (s === 'call_booked' || s === 'closed_won') booked++;
     if (s === 'closed_won') closed++;
  });

  // Roadmap Progress
  const { data: progress } = await supabase.from('user_progress').select(`
     roadmap_days(day_number)
  `).eq('user_id', userId).single();
  
  const rawDayData = progress?.roadmap_days;
  const dayData = Array.isArray(rawDayData) ? rawDayData[0] : rawDayData;
  const currentDay = dayData?.day_number || 1;

  // Evaluate candidate logic against constraints
  const candidates: string[] = []; // Collect exact achievement Names

  if (totalDMs >= 1) candidates.push('First Contact');
  if (totalDMs >= 100) candidates.push('Century');
  if (totalDMs >= 500) candidates.push('War Dialer');

  if (replied >= 1) candidates.push('First Reply');
  if (booked >= 1) candidates.push('Booked');
  if (closed >= 1) candidates.push('Closed');
  if (closed >= 3) candidates.push('Three-Peat');

  if (currentDay >= 7) candidates.push('Day 7');
  if (currentDay >= 15) candidates.push('Halfway');
  if (currentDay >= 30) candidates.push('Finisher');

  // Performance (Mock logic for MVP - in production these would calculate weekly rates)
  const { data: recentSnaps } = await supabase.from('metrics_snapshots')
    .select('dms_sent, replies_received')
    .eq('user_id', userId)
    .limit(7);
  
  const weeklyDMs = (recentSnaps || []).reduce((acc, s) => acc + (s.dms_sent || 0), 0);
  const weeklyReplies = (recentSnaps || []).reduce((acc, s) => acc + (s.replies_received || 0), 0);
  const replyRate = weeklyDMs > 0 ? (weeklyReplies / weeklyDMs) : 0;

  if (replyRate >= 0.1) candidates.push('Sharp Shooter');
  if (booked > 0 && (closed / booked) >= 0.2) candidates.push('Converter');

  // Filter against earned explicitly using names -> ids
  const newUnlocks = [];
  
  for (const achName of candidates) {
    const ach = allAchievements.find(a => a.name === achName);
    if (ach && !earnedSet.has(ach.id)) {
       // Proceed to Attempt Insert
       const { error } = await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: ach.id,
          earned_at: new Date().toISOString()
       });

       if (!error) {
         newUnlocks.push(ach);
       }
    }
  }

  return newUnlocks; // Returns newly minted badges
}
