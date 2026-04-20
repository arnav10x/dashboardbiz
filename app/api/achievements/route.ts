import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureAchievementsSeeded } from '@/lib/seed/achievements';
import { evaluateAchievementTriggers } from '@/lib/achievements/check-triggers';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureAchievementsSeeded(supabase);

    // Provide user achievements vs global achievements
    const { data: allAchievements } = await supabase.from('achievements').select('*');
    const { data: userUnlocked } = await supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', user.id);

    const unlockedMap: Record<string, string> = {};
    if (userUnlocked) {
      userUnlocked.forEach(u => unlockedMap[u.achievement_id] = u.earned_at);
    }

    const payload = (allAchievements || []).map(a => ({
      ...a,
      isEarned: !!unlockedMap[a.id],
      earnedAt: unlockedMap[a.id] || null
    }));

    return NextResponse.json({ achievements: payload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Can be called to manually trigger a sync check 
    const newBadges = await evaluateAchievementTriggers(user.id);
    return NextResponse.json({ recentlyEarned: newBadges });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
