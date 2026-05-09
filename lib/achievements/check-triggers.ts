import { createClient } from '@/lib/supabase/server';
import { ensureAchievementsSeeded } from '@/lib/seed/achievements';

export async function evaluateAchievementTriggers(userId: string) {
  const supabase = createClient();
  await ensureAchievementsSeeded(supabase);

  const { data: allAchievements } = await supabase.from('achievements').select('*');
  if (!allAchievements) return [];

  const { data: earnedRel } = await supabase.from('user_achievements').select('achievement_id').eq('user_id', userId);
  const earnedSet = new Set((earnedRel || []).map(row => row.achievement_id));

  // ── Fetch aggregates ──────────────────────────────────────────────────────
  const { data: snaps } = await supabase.from('metrics_snapshots').select('dms_sent, replies_received, calls_booked, clients_closed').eq('user_id', userId);
  const totalDMs = (snaps || []).reduce((a, s) => a + (s.dms_sent || 0), 0);
  const totalReplies = (snaps || []).reduce((a, s) => a + (s.replies_received || 0), 0);
  const totalCalls = (snaps || []).reduce((a, s) => a + (s.calls_booked || 0), 0);

  const { data: leads } = await supabase.from('leads').select('status').eq('user_id', userId);
  const totalLeads = (leads || []).length;
  let closed = 0;
  leads?.forEach(l => { if ((l.status || '').toLowerCase() === 'closed') closed++; });

  const { data: revLogs } = await supabase.from('metrics_snapshots').select('revenue').eq('user_id', userId);
  const totalRevenue = (revLogs || []).reduce((a, s) => a + (Number(s.revenue) || 0), 0);

  const { data: progress } = await supabase.from('user_progress').select('roadmap_days(day_number)').eq('user_id', userId).single();
  const rawDay = progress?.roadmap_days;
  const currentDay = ((Array.isArray(rawDay) ? rawDay[0] : rawDay) as any)?.day_number || 1;

  // Consecutive day streak
  const { data: allSnaps } = await supabase.from('metrics_snapshots').select('snapshot_date').eq('user_id', userId).order('snapshot_date', { ascending: false });
  let streak = 0;
  if (allSnaps && allSnaps.length > 0) {
    const dates = allSnaps.map(s => s.snapshot_date);
    let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 60; i++) {
      const dateStr = cursor.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else break;
    }
  }

  // Weekly stats for performance
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: weekSnaps } = await supabase.from('metrics_snapshots').select('dms_sent, replies_received, calls_booked, clients_closed').eq('user_id', userId).gte('snapshot_date', sevenDaysAgo.toISOString().split('T')[0]);
  const weekDMs = (weekSnaps || []).reduce((a, s) => a + (s.dms_sent || 0), 0);
  const weekReplies = (weekSnaps || []).reduce((a, s) => a + (s.replies_received || 0), 0);
  const weekCalls = (weekSnaps || []).reduce((a, s) => a + (s.calls_booked || 0), 0);
  const weekClosed = (weekSnaps || []).reduce((a, s) => a + (s.clients_closed || 0), 0);
  const replyRate = weekDMs > 0 ? weekReplies / weekDMs : 0;
  const closeRate = weekCalls > 0 ? weekClosed / weekCalls : 0;

  // ── Evaluate candidates ───────────────────────────────────────────────────
  const candidates: string[] = [];

  // Revenue
  if (totalRevenue >= 1) candidates.push('First Dollar');
  if (totalRevenue > 0) candidates.push('In the Black'); // simplification
  if (totalRevenue >= 5000) candidates.push('$5K Month');
  if (totalRevenue >= 10000) candidates.push('$10K Month');
  if (totalRevenue >= 50000) candidates.push('$50K Month');

  // Outreach
  if (totalDMs >= 1) candidates.push('First Contact');
  if (totalDMs >= 100) candidates.push('Century');
  if (totalDMs >= 500) candidates.push('War Dialer');
  if (streak >= 7) candidates.push('Relentless');

  // Pipeline
  if (totalLeads >= 1) candidates.push('First Lead');
  if (totalLeads >= 10) candidates.push('Pipeline Builder');
  if (closed >= 1) candidates.push('First Win');
  if (closed >= 5) candidates.push('Closer');

  // Consistency
  if (currentDay >= 7) candidates.push('Day 7');
  if (currentDay >= 15) candidates.push('Halfway');
  if (streak >= 14) candidates.push('Locked In');
  if (currentDay >= 30) candidates.push('Finisher');

  // Performance
  if (closed >= 3) candidates.push('Three-Peat');
  if (replyRate >= 0.1) candidates.push('Sharp Shooter');
  if (closeRate >= 0.2) candidates.push('Converter');

  // ── Award new unlocks ─────────────────────────────────────────────────────
  const newUnlocks = [];
  for (const achName of candidates) {
    const ach = allAchievements.find(a => a.name === achName);
    if (ach && !earnedSet.has(ach.id)) {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: ach.id,
        earned_at: new Date().toISOString(),
      });
      if (!error) newUnlocks.push(ach);
    }
  }
  return newUnlocks;
}
