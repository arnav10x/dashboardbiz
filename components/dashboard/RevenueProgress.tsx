export function RevenueProgress({
  currentRevenue,
  goalRevenue,
}: {
  currentRevenue: number;
  goalRevenue: number;
}) {
  const percentage = Math.min((currentRevenue / goalRevenue) * 100, 100);
  const remaining = goalRevenue - currentRevenue;

  return (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.15em] mb-4">Monthly Target</p>
      <div className="flex justify-between items-end mb-5">
        <p className="text-2xl font-bold text-white font-mono">
          ${currentRevenue.toLocaleString()}
          <span className="text-sm text-zinc-600 font-sans font-normal ml-1.5">/ ${goalRevenue.toLocaleString()}</span>
        </p>
        {remaining > 0 ? (
          <span className="text-xs font-medium text-zinc-500">
            <span className="text-emerald-400 font-bold">${remaining.toLocaleString()}</span> to go
          </span>
        ) : (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            Goal hit ✓
          </span>
        )}
      </div>

      <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_8px_#10b981]"
          style={{ width: `${Math.max(percentage, 1)}%` }}
        />
      </div>
    </div>
  );
}
