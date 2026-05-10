export function RevenueProgress({ currentRevenue, goalRevenue }: { currentRevenue: number; goalRevenue: number }) {
  const percentage = Math.min((currentRevenue / goalRevenue) * 100, 100);
  const remaining = goalRevenue - currentRevenue;

  return (
    <div className="app-card rounded-2xl p-6 shadow-sm dark:shadow-none">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--text-secondary)' }}>Monthly Target</p>
      <div className="flex justify-between items-end mb-5">
        <p className="text-2xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
          ${currentRevenue.toLocaleString()}
          <span className="text-sm font-sans font-normal ml-1.5" style={{ color: 'var(--text-muted)' }}>/ ${goalRevenue.toLocaleString()}</span>
        </p>
        {remaining > 0 ? (
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>${remaining.toLocaleString()}</span> to go
          </span>
        ) : (
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg border" style={{ color: 'var(--accent)', background: 'var(--accent-muted)', borderColor: 'var(--accent-border)' }}>
            Goal hit ✓
          </span>
        )}
      </div>

      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--app-bg)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-in-out"
          style={{ width: `${Math.max(percentage, 1)}%`, background: 'var(--accent)' }}
        />
      </div>
    </div>
  );
}
