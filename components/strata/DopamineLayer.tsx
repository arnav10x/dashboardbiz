'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Flame, Sparkles, Star, Trophy, Zap } from 'lucide-react'

type GamificationSnapshot = {
  streak: number
  longestStreak: number
  level: number
  rank: string
  totalXp: number
  xpInLevel: number
  xpForNext: number
  pct: number
  streakFreezes?: number
}

type Celebration =
  | { id: string; type: 'xp'; xp: number; fromPct: number; toPct: number; rank: string }
  | { id: string; type: 'rank'; rank: string; level: number }
  | { id: string; type: 'streak'; streak: number }

const STORAGE_KEY = 'founderos:last-gamification-snapshot'
const SEEN_KEY = 'founderos:dopamine-layer-seen'

function readStoredSnapshot(): GamificationSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as GamificationSnapshot : null
  } catch {
    return null
  }
}

function storeSnapshot(snapshot: GamificationSnapshot) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)) } catch {}
}

function hasSeenLayer() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(SEEN_KEY) === '1'
}

function markSeenLayer() {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(SEEN_KEY, '1') } catch {}
}

function normalizeSnapshot(data: any): GamificationSnapshot {
  return {
    streak: Number(data?.streak) || 0,
    longestStreak: Number(data?.longestStreak) || 0,
    level: Number(data?.level) || 1,
    rank: String(data?.rank || 'Rookie I'),
    totalXp: Number(data?.totalXp) || 0,
    xpInLevel: Number(data?.xpInLevel) || 0,
    xpForNext: Math.max(1, Number(data?.xpForNext) || 1),
    pct: Math.max(0, Math.min(100, Number(data?.pct) || 0)),
    streakFreezes: Number(data?.streakFreezes) || 0,
  }
}

function XPToast({ xp, fromPct, toPct, rank, onDone }: { xp: number; fromPct: number; toPct: number; rank: string; onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => { setVisible(false); onDone() }, 3600)
    return () => window.clearTimeout(t)
  }, [onDone])
  if (!visible) return null
  return (
    <div className="fo-xp-toast fo-dopamine-card">
      <div className="fo-xp-pop">+{xp.toLocaleString()} XP</div>
      <div className="fo-xp-toast-row">
        <Zap className="fo-xp-icon" />
        <span>{rank}</span>
      </div>
      <div className="fo-animated-xp-shell">
        <div className="fo-animated-xp-prev" style={{ width: `${fromPct}%` }} />
        <div className="fo-animated-xp-now" style={{ width: `${toPct}%` }} />
      </div>
      <p className="fo-dopamine-subtext">Progress saved from your latest real action.</p>
    </div>
  )
}

function RankUpgrade({ rank, level, onDone }: { rank: string; level: number; onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => { setVisible(false); onDone() }, 5200)
    return () => window.clearTimeout(t)
  }, [onDone])
  if (!visible) return null
  return (
    <div className="fo-rank-overlay" onClick={() => { setVisible(false); onDone() }}>
      <div className="fo-rank-burst" />
      <div className="fo-rank-modal fo-dopamine-card">
        <div className="fo-rank-orbit">
          <span /><span /><span />
          <div className="fo-rank-shield">
            <Trophy className="fo-rank-trophy" />
          </div>
        </div>
        <p className="fo-rank-kicker">Rank Upgrade</p>
        <h2>{rank}</h2>
        <p className="fo-rank-level">Level {level}</p>
        <div className="fo-rank-sparks"><Sparkles /><Star /><Sparkles /></div>
        <p className="fo-dopamine-subtext">Higher rank unlocked through real XP progress.</p>
      </div>
    </div>
  )
}

function StreakFire({ streak, onDone }: { streak: number; onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  const label = streak <= 1 ? 'Streak Started' : `${streak}-Day Streak`
  useEffect(() => {
    const t = window.setTimeout(() => { setVisible(false); onDone() }, 4300)
    return () => window.clearTimeout(t)
  }, [onDone])
  if (!visible) return null
  return (
    <div className="fo-streak-toast fo-dopamine-card">
      <div className="fo-fire-stack" aria-hidden>
        <span className="fo-fire-core" />
        <span className="fo-fire-flame fo-fire-one" />
        <span className="fo-fire-flame fo-fire-two" />
        <span className="fo-fire-flame fo-fire-three" />
      </div>
      <div>
        <p className="fo-streak-title"><Flame size={16} /> {label}</p>
        <p className="fo-dopamine-subtext">Open, execute, repeat. Keep the loop alive.</p>
      </div>
    </div>
  )
}

export function DopamineLayer() {
  const [queue, setQueue] = useState<Celebration[]>([])
  const [current, setCurrent] = useState<Celebration | null>(null)
  const currentRef = useRef<GamificationSnapshot | null>(null)
  const checkingRef = useRef(false)

  const pushCelebrations = useCallback((items: Celebration[]) => {
    if (!items.length) return
    setQueue(prev => [...prev, ...items])
  }, [])

  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0])
      setQueue(prev => prev.slice(1))
    }
  }, [current, queue])

  const finishCurrent = useCallback(() => setCurrent(null), [])

  const compareAndCelebrate = useCallback((next: GamificationSnapshot, source: 'poll' | 'event') => {
    const previous = currentRef.current || readStoredSnapshot()
    const firstRun = !hasSeenLayer() || !previous
    currentRef.current = next
    storeSnapshot(next)
    markSeenLayer()

    if (firstRun) return

    const items: Celebration[] = []
    const xpDelta = next.totalXp - previous.totalXp
    const levelDelta = next.level - previous.level
    const streakDelta = next.streak - previous.streak

    if (xpDelta > 0) {
      items.push({ id: `xp-${Date.now()}-${xpDelta}`, type: 'xp', xp: xpDelta, fromPct: previous.pct, toPct: next.pct, rank: next.rank })
    }
    if (levelDelta > 0) {
      items.push({ id: `rank-${Date.now()}-${next.level}`, type: 'rank', rank: next.rank, level: next.level })
    }
    if (streakDelta > 0 || (previous.streak === 0 && next.streak > 0 && source === 'event')) {
      items.push({ id: `streak-${Date.now()}-${next.streak}`, type: 'streak', streak: next.streak })
    }

    pushCelebrations(items)
  }, [pushCelebrations])

  const check = useCallback(async () => {
    if (checkingRef.current) return
    checkingRef.current = true
    try {
      const res = await fetch('/api/gamification', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      compareAndCelebrate(normalizeSnapshot(data), 'poll')
    } catch {
      // Silent by design. The dopamine layer should never block the app.
    } finally {
      checkingRef.current = false
    }
  }, [compareAndCelebrate])

  useEffect(() => {
    check()
    const interval = window.setInterval(check, 14000)
    const onFocus = () => { if (document.visibilityState === 'visible') check() }
    const onEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail
      if (detail) compareAndCelebrate(normalizeSnapshot(detail), 'event')
      else check()
    }
    document.addEventListener('visibilitychange', onFocus)
    window.addEventListener('founderos:gamification-updated', onEvent as EventListener)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('founderos:gamification-updated', onEvent as EventListener)
    }
  }, [check, compareAndCelebrate])

  const rendered = useMemo(() => {
    if (!current) return null
    if (current.type === 'xp') return <XPToast key={current.id} xp={current.xp} fromPct={current.fromPct} toPct={current.toPct} rank={current.rank} onDone={finishCurrent} />
    if (current.type === 'rank') return <RankUpgrade key={current.id} rank={current.rank} level={current.level} onDone={finishCurrent} />
    return <StreakFire key={current.id} streak={current.streak} onDone={finishCurrent} />
  }, [current, finishCurrent])

  return <>{rendered}</>
}
