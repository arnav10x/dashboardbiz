"use client"
import * as React from 'react';

// For the MVP, we mock the consistency boolean grid, 
// in production this matches task_completions grouped by date.
export function ConsistencyCalendar({ timelineData }: { timelineData: any[] }) {
  const [grid, setGrid] = React.useState<boolean[]>(Array(30).fill(false));

  React.useEffect(() => {
    // Generate a quick 30 day sequence. If they sent > 0 DMs, we deem it 'active' for this prototype
    if (timelineData && timelineData.length > 0) {
      const activeArr = timelineData.slice(-30).map(d => d.dms_sent > 0);
      // Pad to 30 elements visually
      while (activeArr.length < 30) {
        activeArr.unshift(false); 
      }
      setGrid(activeArr);
    }
  }, [timelineData]);

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6">
      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">30-Day Activity Log</h3>
      
      <div className="grid grid-cols-10 gap-2 mb-6">
        {grid.map((isActive, i) => (
          <div 
            key={i} 
            className={`aspect-square rounded-[3px] transition-colors duration-500 border ${isActive ? 'bg-indigo-500 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
            title={`Day ${30 - i} ago`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-zinc-800 pt-4">
        <div>
           <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Active Days</p>
           <p className="text-xl font-mono font-bold text-white">{grid.filter(Boolean).length}</p>
        </div>
        <div>
           <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Current Streak</p>
           <p className="text-xl font-mono font-bold text-indigo-400">0</p>
        </div>
        <div>
           <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Consistency</p>
           <p className="text-xl font-mono font-bold text-white">{Math.round((grid.filter(Boolean).length / 30) * 100)}%</p>
        </div>
      </div>
    </div>
  )
}
