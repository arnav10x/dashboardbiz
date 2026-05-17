"use client"
import * as React from 'react';
import { AchievementBadge } from './AchievementBadge';
import { EarnedCelebration } from './EarnedCelebration';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  badge_image_url: string;
  isEarned: boolean;
  earnedAt: string | null;
}

export function AchievementGrid({ initialData }: { initialData: Achievement[] }) {
  // Group by category natively
  const categories = ['Outreach', 'Sales', 'Consistency', 'Performance'];
  const [data, setData] = React.useState<Achievement[]>(initialData);
  const [recentlyEarnedIds, setRecentlyEarnedIds] = React.useState<string[]>([]);

  // Periodically check for new badges unlocked in background tasks
  React.useEffect(() => {
    const checkTriggers = async () => {
      try {
        const res = await fetch('/api/achievements', { method: 'POST' });
        const triggerData = await res.json();
        
        if (triggerData.recentlyEarned && triggerData.recentlyEarned.length > 0) {
           const newIds = triggerData.recentlyEarned.map((a: any) => a.id);
           setRecentlyEarnedIds(newIds);
           
           // Clear celebration after delay
           setTimeout(() => setRecentlyEarnedIds([]), 5000);
           
           // Update local state optimisticially
           setData(prev => prev.map(a => 
              newIds.includes(a.id) 
                ? { ...a, isEarned: true, earnedAt: new Date().toISOString() } 
                : a
           ));
        }
      } catch (e) {}
    };

    checkTriggers();
    // In production we'd use websockets or longer polling, interval for MVP mock
    const interval = setInterval(checkTriggers, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* Substantial Celebration Hook Injection */}
      {recentlyEarnedIds.length > 0 && <EarnedCelebration />}

      {categories.map(category => {
        const catBadges = data.filter(a => a.category === category);
        const earnedCount = catBadges.filter(a => a.isEarned).length;
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{category} Badges</h2>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{earnedCount} / {catBadges.length} Earned</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {catBadges.map(badge => (
                <AchievementBadge 
                  key={badge.id}
                  name={badge.name}
                  description={badge.description}
                  category={badge.category}
                  isEarned={badge.isEarned}
                  earnedAt={badge.earnedAt}
                  emoji={badge.badge_image_url} // Seed stores emoji directly
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
