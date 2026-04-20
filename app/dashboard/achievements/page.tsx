import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { Trophy } from 'lucide-react';
import { ensureAchievementsSeeded } from '@/lib/seed/achievements';

export default async function AchievementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Ensure DB has defaults natively before checking load states
  await ensureAchievementsSeeded(supabase);

  // Directly fetch combined state for zero-layout shift MVP load
  const { data: allAchievements } = await supabase.from('achievements').select('*');
  const { data: userUnlocked } = await supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', user.id);

  const unlockedMap: Record<string, string> = {};
  if (userUnlocked) {
    userUnlocked.forEach(u => unlockedMap[u.achievement_id] = u.earned_at);
  }

  // Pre-calculate aggregate state for Header
  let totalEarned = 0;
  const hydratedAchievements = (allAchievements || []).map(a => {
    const isEarned = !!unlockedMap[a.id];
    if (isEarned) totalEarned++;
    return {
      ...a,
      isEarned,
      earnedAt: unlockedMap[a.id] || null
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Trophy Room</h1>
          </div>
          <p className="text-zinc-400 font-medium max-w-xl">
             We do not reward participation. We reward output. Badges unlock instantly upon breaching revenue-driving volume thresholds in the wild.
          </p>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Global Completion</span>
           <span className="text-3xl font-black text-amber-500 font-mono">
             {totalEarned}<span className="text-xl text-zinc-600">/{hydratedAchievements.length}</span>
           </span>
        </div>
      </div>

      <div className="pt-4">
         <AchievementGrid initialData={hydratedAchievements} />
      </div>

    </div>
  );
}
