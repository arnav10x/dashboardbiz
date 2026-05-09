import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { EarnedCelebration } from '@/components/achievements/EarnedCelebration';
import { ensureAchievementsSeeded } from '@/lib/seed/achievements';
import { evaluateAchievementTriggers } from '@/lib/achievements/check-triggers';
import { Trophy } from 'lucide-react';
import type { Rarity } from '@/lib/seed/achievements';

// ── Score helpers ────────────────────────────────────────────────────────────

const RANKS = [
  { min: 90, name: 'Founder',    color: 'text-red-400',    desc: 'Top of the game' },
  { min: 75, name: 'Elite',      color: 'text-blue-400',   desc: 'Proven operator' },
  { min: 60, name: 'Pro',        color: 'text-purple-400', desc: 'Gaining traction' },
  { min: 40, name: 'Builder',    color: 'text-amber-400',  desc: 'Building momentum' },
  { min: 20, name: 'Contender',  color: 'text-orange-400', desc: 'Finding your footing' },
  { min: 0,  name: 'Rookie',     color: 'text-zinc-400',   desc: 'Just getting started' },
];

function getRank(ovr: number) {
  return RANKS.find(r => ovr >= r.min) ?? RANKS[RANKS.length - 1];
}

// ── Score card component ─────────────────────────────────────────────────────

function ScoreCard({ label, value, max, accent }: { label: string; value: number; max: number; accent?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="app-card rounded-2xl p-5 shadow-sm dark:shadow-none flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
        <p className="text-[9px] text-[var(--text-muted)] font-mono">/{max}</p>
      </div>
      <p className={`text-3xl font-black font-mono tracking-tight ${accent || 'text-[var(--text-primary)]'}`}>
        {value}
      </p>
      <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--app-bg)' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${accent ? 'bg-emerald-500' : 'bg-emerald-500/60'}`}
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

// ── Heatmap ──────────────────────────────────────────────────────────────────

function ActivityHeatmap({ activeDates }: { activeDates: Record<string, number> }) {
  const WEEKS = 14;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // Build grid: oldest first (left → right)
  const cells: { date: Date; level: number }[] = [];
  for (let w = WEEKS - 1; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - w * 7 - d);
      const key = date.toISOString().split('T')[0];
      const activity = activeDates[key] || 0;
      const level = activity === 0 ? 0 : activity < 5 ? 1 : activity < 15 ? 2 : 3;
      cells.push({ date, level });
    }
  }

  const activeDays = Object.values(activeDates).filter(v => v > 0).length;

  const cellColor = (level: number) => {
    if (level === 0) return 'bg-white/[0.04] dark:bg-white/[0.03]';
    if (level === 1) return 'bg-emerald-900/80';
    if (level === 2) return 'bg-emerald-600/80';
    return 'bg-emerald-400';
  };

  const months: string[] = [];
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (WEEKS - 1 - w) * 7);
    const m = d.toLocaleString('default', { month: 'short' });
    months.push(w === 0 || months[w - 1] !== m ? m : '');
  }

  return (
    <div className="app-card rounded-2xl p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">Activity Heatmap</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{activeDays} active days in the last {WEEKS} weeks</p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
          <span>Less</span>
          {[0, 1, 2, 3].map(l => (
            <div key={l} className={`h-3 w-3 rounded-sm ${cellColor(l)}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="grid mb-1" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)`, gap: '3px' }}>
            {months.map((m, i) => (
              <p key={i} className="text-[8px] text-[var(--text-muted)] font-medium">{m}</p>
            ))}
          </div>
          {/* Grid: 7 rows × WEEKS cols */}
          {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => (
            <div key={dayOfWeek} className="grid mb-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)`, gap: '3px' }}>
              {Array.from({ length: WEEKS }, (_, w) => {
                const cell = cells[w * 7 + (6 - dayOfWeek)];
                return cell ? (
                  <div
                    key={w}
                    title={`${cell.date.toLocaleDateString()}: ${activeDates[cell.date.toISOString().split('T')[0]] || 0} actions`}
                    className={`h-3.5 w-full rounded-sm transition-colors ${cellColor(cell.level)}`}
                  />
                ) : <div key={w} className="h-3.5" />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── OVR card ─────────────────────────────────────────────────────────────────

function OvrCard({ ovr, rank }: { ovr: number; rank: ReturnType<typeof getRank> }) {
  const allRanks = ['Rookie', 'Contender', 'Builder', 'Pro', 'Elite', 'Founder'];
  return (
    <div className="app-card rounded-2xl p-6 shadow-sm dark:shadow-none flex flex-col gap-4 h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Overall Rating</p>
          <p className={`text-5xl font-black font-mono mt-1 ${rank.color}`}>{ovr}</p>
          <p className={`text-lg font-bold mt-0.5 ${rank.color}`}>{rank.name}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{rank.desc}</p>
        </div>
        <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center bg-emerald-500/5">
          <Trophy className="h-7 w-7 text-emerald-500" />
        </div>
      </div>

      {/* Rank ladder */}
      <div className="space-y-1.5 mt-auto">
        {allRanks.slice().reverse().map((r) => {
          const isActive = r === rank.name;
          const rankDef = RANKS.find(rd => rd.name === r);
          return (
            <div key={r} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all ${isActive ? 'bg-emerald-500/10' : ''}`}>
              <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />
              <span className={`text-[10px] font-semibold flex-1 ${isActive ? (rankDef?.color ?? 'text-emerald-400') : 'text-[var(--text-muted)]'}`}>
                {r}
              </span>
              {isActive && <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Current</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AchievementsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await ensureAchievementsSeeded(supabase);
  await evaluateAchievementTriggers(user.id);

  // ── Fetch all data in parallel ────────────────────────────────────────────
  const [
    { data: allAchievements },
    { data: userUnlocked },
    { data: snaps },
    { data: leads },
    { data: progress },
  ] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', user.id),
    supabase.from('metrics_snapshots').select('snapshot_date, dms_sent, calls_booked, clients_closed, revenue').eq('user_id', user.id),
    supabase.from('leads').select('status').eq('user_id', user.id),
    supabase.from('user_progress').select('roadmap_days(day_number)').eq('user_id', user.id).single(),
  ]);

  // ── Earned map ───────────────────────────────────────────────────────────
  const unlockedMap: Record<string, string> = {};
  (userUnlocked || []).forEach(u => { unlockedMap[u.achievement_id] = u.earned_at; });

  const hydratedAchievements = (allAchievements || []).map(a => ({
    ...a,
    isEarned: !!unlockedMap[a.id],
    earnedAt: unlockedMap[a.id] || null,
  }));

  const totalEarned = hydratedAchievements.filter(a => a.isEarned).length;
  const totalBadges = hydratedAchievements.length;

  // ── Score computation ────────────────────────────────────────────────────
  const totalDMs = (snaps || []).reduce((a, s) => a + (s.dms_sent || 0), 0);
  const totalRevenue = (snaps || []).reduce((a, s) => a + (Number(s.revenue) || 0), 0);
  const totalLeads = (leads || []).length;
  const closedLeads = (leads || []).filter(l => l.status?.toLowerCase() === 'closed').length;
  const rawDay = progress?.roadmap_days;
  const currentDay = ((Array.isArray(rawDay) ? rawDay[0] : rawDay) as any)?.day_number || 1;

  const revenueScore  = Math.min(25, Math.floor(totalRevenue / 400));
  const pipelineScore = Math.min(20, totalLeads * 2);
  const outreachScore = Math.min(15, Math.floor(totalDMs / 10));
  const consistScore  = Math.min(20, Math.floor((currentDay / 30) * 20));
  const badgeScore    = Math.min(20, Math.round((totalEarned / Math.max(totalBadges, 1)) * 20));
  const ovr = revenueScore + pipelineScore + outreachScore + consistScore + badgeScore;
  const rank = getRank(ovr);

  // ── Heatmap data ─────────────────────────────────────────────────────────
  const activeDates: Record<string, number> = {};
  (snaps || []).forEach(s => {
    if (!s.snapshot_date) return;
    const key = s.snapshot_date.split('T')[0];
    const activity = (s.dms_sent || 0) + (s.calls_booked || 0) + (s.clients_closed || 0);
    activeDates[key] = (activeDates[key] || 0) + activity;
  });

  // ── Category order ───────────────────────────────────────────────────────
  const CATEGORIES = ['Revenue', 'Outreach', 'Pipeline', 'Consistency', 'Performance'];

  return (
    <div className="p-8 md:p-10 max-w-6xl mx-auto space-y-8">

      {/* ── Score grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* OVR card spans 1 col */}
        <OvrCard ovr={ovr} rank={rank} />

        {/* Score cards: 2×2 + 1 on right */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <ScoreCard label="Revenue Score"   value={revenueScore}  max={25} accent="text-emerald-500" />
          <ScoreCard label="Pipeline Score"  value={pipelineScore} max={20} />
          <ScoreCard label="Outreach Score"  value={outreachScore} max={15} />
          <ScoreCard label="Consistency"     value={consistScore}  max={20} />
          <ScoreCard label="Badge Score"     value={badgeScore}    max={20} />
          <div className="app-card rounded-2xl p-5 shadow-sm dark:shadow-none flex flex-col gap-3 justify-center items-center">
            <Trophy className="h-6 w-6 text-amber-500" />
            <div className="text-center">
              <p className="text-3xl font-black font-mono text-amber-500">{totalEarned}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-0.5">Total Badges</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">of {totalBadges}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Heatmap ── */}
      <ActivityHeatmap activeDates={activeDates} />

      {/* ── Trophy Room ── */}
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-amber-500 flex-shrink-0" />
            <div>
              <h1 className="text-xl font-black text-[var(--text-primary)]">Trophy Room</h1>
              <p className="text-[11px] text-[var(--text-muted)]">We do not reward participation. We reward output.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Completion</p>
            <p className="text-2xl font-black font-mono text-amber-500">
              {totalEarned}<span className="text-base text-[var(--text-muted)]">/{totalBadges}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full overflow-hidden mb-8" style={{ background: 'var(--app-bg)' }}>
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-700"
            style={{ width: `${totalBadges > 0 ? (totalEarned / totalBadges) * 100 : 0}%` }}
          />
        </div>

        {/* Badge categories */}
        <div className="space-y-10">
          {CATEGORIES.map(category => {
            const catBadges = hydratedAchievements.filter(a => a.category === category);
            if (catBadges.length === 0) return null;
            const earned = catBadges.filter(a => a.isEarned).length;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    {category}
                  </p>
                  <span className="text-[9px] font-bold text-[var(--text-muted)] border rounded-lg px-2 py-0.5 uppercase tracking-widest" style={{ borderColor: 'var(--border)' }}>
                    {earned} / {catBadges.length} earned
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {catBadges.map(badge => (
                    <AchievementBadge
                      key={badge.id}
                      name={badge.name}
                      description={badge.description}
                      isEarned={badge.isEarned}
                      earnedAt={badge.earnedAt}
                      emoji={badge.badge_image_url}
                      rarity={(badge.rarity as Rarity) || 'common'}
                      xp={badge.xp || 50}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
