export function RevenueProgress({ currentRevenue, goalRevenue }: { currentRevenue: number, goalRevenue: number }) {
  const percentage = Math.min((currentRevenue / goalRevenue) * 100, 100);
  const remaining = goalRevenue - currentRevenue;

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Monthly Target</h3>
          <p className="text-3xl font-bold text-white font-mono">
            ${currentRevenue.toLocaleString()} 
            <span className="text-base text-zinc-500 font-sans font-medium ml-1">/ ${goalRevenue.toLocaleString()}</span>
          </p>
        </div>
        <div className="text-right">
          {remaining > 0 ? (
            <div className="text-sm font-medium text-zinc-400 bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-md inline-block">
              <span className="text-indigo-400 font-bold">${remaining.toLocaleString()}</span> away
            </div>
          ) : (
            <div className="text-sm font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 px-3 py-1.5 rounded-md inline-block">
              Goal Achieved! 🏆
            </div>
          )}
        </div>
      </div>
      
      <div className="h-4 w-full bg-[#09090b] rounded-full overflow-hidden border border-zinc-800">
        <div 
          className="h-full bg-indigo-500 relative transition-all duration-1000 ease-in-out"
          style={{ width: `${Math.max(percentage, 2)}%` }}
        >
          {percentage > 5 && (
             <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50" />
          )}
        </div>
      </div>
    </div>
  );
}
