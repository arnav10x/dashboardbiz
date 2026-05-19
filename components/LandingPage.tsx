'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Zap, TrendingUp, Users, Brain, BarChart3, Target, Star, Check, ArrowRight, Flame } from 'lucide-react'

// ─── Particle Canvas ───────────────────────────────────────────────────────────

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number }
    const pts: Particle[] = []

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }

    function spawn() {
      const count = Math.min(Math.floor(window.innerWidth / 18), 90)
      pts.length = 0
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -Math.random() * 0.4 - 0.05,
          r: Math.random() * 1.2 + 0.4,
          a: Math.random() * 0.45 + 0.08,
        })
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        p.x += p.vx
        p.y += p.vy
        if (p.y < -4) { p.y = canvas!.height + 4; p.x = Math.random() * canvas!.width }
        if (p.x < -4) p.x = canvas!.width + 4
        if (p.x > canvas!.width + 4) p.x = -4

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(16,185,129,${p.a})`
        ctx!.fill()

        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j]
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 110) {
            ctx!.beginPath()
            ctx!.moveTo(p.x, p.y)
            ctx!.lineTo(q.x, q.y)
            ctx!.strokeStyle = `rgba(16,185,129,${(1 - d / 110) * 0.07})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }

    resize(); spawn(); draw()
    window.addEventListener('resize', () => { resize(); spawn() })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [canvasRef])
}

// ─── Scroll Reveal ─────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); obs.unobserve(e.target) } }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div style={{ width: 700, borderRadius: 14, border: '1px solid rgba(16,185,129,0.22)', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 50px 100px rgba(0,0,0,0.85), 0 0 90px rgba(16,185,129,0.14)', background: '#0a0c0f', fontFamily: 'system-ui,sans-serif', fontSize: 11 }}>

      {/* ── Top bar ── */}
      <div style={{ background: '#0d1014', borderBottom: '1px solid rgba(255,255,255,.07)', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={11} color="#031008"/>
          </div>
          <span style={{ fontWeight: 800, fontSize: 13, color: '#f4f6f4' }}>Strata</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#6b7280', fontSize: 10 }}>Working late, navbuilds</span>
          <span style={{ color: '#374151', fontSize: 10 }}>·</span>
          <span style={{ color: '#374151', fontSize: 10 }}>MAY 18, 2026  10:47 PM  MONDAY</span>
        </div>
        <div style={{ padding: '4px 10px', background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#031008', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>+</span> Add data
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: 'flex', height: 390 }}>

        {/* Sidebar */}
        <div style={{ width: 110, background: '#080b0d', borderRight: '1px solid rgba(255,255,255,.05)', padding: '12px 0', flexShrink: 0 }}>
          {[
            { label: 'Overview', active: true },
            { label: 'Tasks', active: false },
            { label: 'Pipeline', active: false },
            { label: 'Calendar', active: false },
          ].map(item => (
            <div key={item.label} style={{ padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 7, background: item.active ? 'rgba(16,185,129,.1)' : 'transparent', borderRight: item.active ? '2px solid #10b981' : '2px solid transparent' }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: item.active ? '#10b981' : 'rgba(255,255,255,.12)' }}/>
              <span style={{ fontSize: 11, color: item.active ? '#f4f6f4' : '#4b5563', fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </div>
          ))}
          <div style={{ padding: '8px 14px 4px', fontSize: 9, color: '#374151', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6 }}>Tools</div>
          {['AI Copilot', 'Team', 'Integrations'].map(label => (
            <div key={label} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,.08)' }}/>
              <span style={{ fontSize: 11, color: '#374151' }}>{label}</span>
            </div>
          ))}
          <div style={{ padding: '8px 14px 4px', fontSize: 9, color: '#374151', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>Insights</div>
          {['Reports', 'Achievements'].map(label => (
            <div key={label} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,.08)' }}/>
              <span style={{ fontSize: 11, color: '#374151' }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '12px 14px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Period header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#4b5563' }}>◀</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f4f6f4' }}>June 2026</span>
            <span style={{ fontSize: 10, color: '#4b5563' }}>▶</span>
            <span style={{ fontSize: 10, color: '#374151' }}>3 of 3 periods</span>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
            {[
              { label: 'REVENUE', val: '$450,983', sub: '$0 to goal', bar: true },
              { label: 'NET PROFIT', val: '$427,541', sub: '95% margin', bar: false },
              { label: 'PIPELINE LEADS', val: '0', sub: '0% conv. rate', bar: false },
              { label: 'TASKS DONE', val: '3/8', sub: 'today', bar: false },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '9px 10px' }}>
                <div style={{ fontSize: 8, color: '#4b5563', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 5 }}>{s.label}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#f4f6f4', lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
                <div style={{ fontSize: 9, color: '#374151' }}>{s.sub}</div>
                {s.bar && <div style={{ marginTop: 6, height: 3, background: 'rgba(255,255,255,.05)', borderRadius: 2 }}><div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 2 }}/></div>}
              </div>
            ))}
          </div>

          {/* Middle row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 7, flex: 1, minHeight: 0 }}>
            {/* Revenue chart */}
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: '#4b5563', fontWeight: 700, letterSpacing: '0.08em' }}>REVENUE HISTORY</span>
                <span style={{ fontSize: 9, color: '#10b981', fontWeight: 700 }}>+32%</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f4f6f4', marginBottom: 10 }}>$450,983</div>
              <svg width="100%" height="56" viewBox="0 0 180 56" preserveAspectRatio="none">
                <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/><stop offset="100%" stopColor="#10b981" stopOpacity="0"/></linearGradient></defs>
                <path d="M0,52 C30,52 50,50 70,46 C90,42 110,30 130,18 C150,8 165,4 180,2" fill="none" stroke="#10b981" strokeWidth="1.5"/>
                <path d="M0,52 C30,52 50,50 70,46 C90,42 110,30 130,18 C150,8 165,4 180,2 L180,56 L0,56 Z" fill="url(#lg)"/>
              </svg>
            </div>
            {/* Monthly target */}
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 9, color: '#4b5563', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8, alignSelf: 'flex-start' }}>MONTHLY TARGET</div>
              <svg width="70" height="70" viewBox="0 0 70 70">
                <circle cx="35" cy="35" r="28" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="5"/>
                <circle cx="35" cy="35" r="28" fill="none" stroke="#10b981" strokeWidth="5" strokeDasharray="175.9" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 35 35)"/>
                <text x="35" y="33" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="800">100%</text>
                <text x="35" y="44" textAnchor="middle" fill="#4b5563" fontSize="7">of goal</text>
              </svg>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#f4f6f4', marginTop: 6 }}>$450,983</div>
              <div style={{ fontSize: 8, color: '#10b981', marginTop: 2 }}>Goal achieved!</div>
            </div>
            {/* Tasks */}
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 9, color: '#4b5563', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>TODAY'S TASKS  3/8</div>
              {[
                { done: true, t: 'Develop lead gen strategy' },
                { done: true, t: 'Identify potential leads' },
                { done: false, t: 'Add first real lead to pipeline' },
                { done: false, t: 'Send 10 cold DMs' },
              ].map((task, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 3, marginTop: 1, flexShrink: 0, background: task.done ? '#10b981' : 'transparent', border: task.done ? 'none' : '1px solid rgba(255,255,255,.15)' }}/>
                  <span style={{ fontSize: 9, color: task.done ? '#374151' : '#9ca3af', textDecoration: task.done ? 'line-through' : 'none', lineHeight: 1.4 }}>{task.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coach panel */}
        <div style={{ width: 140, background: '#080b0d', borderLeft: '1px solid rgba(255,255,255,.05)', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#f4f6f4' }}>AI Coach</div>
          <div style={{ fontSize: 9, color: '#6b7280', lineHeight: 1.5 }}>Revenue dropped 100% this period — identify what stalled the pipeline.</div>
          <div style={{ padding: '5px 7px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 5 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: '#10b981', letterSpacing: '0.06em', marginBottom: 3 }}>PRIMARY FOCUS</div>
            <div style={{ fontSize: 9, color: '#c4c9c5', lineHeight: 1.4 }}>Pipeline is empty — outreach is the highest-leverage activity right now.</div>
          </div>
          {[
            { n: '1', title: 'REVENUE FIX', body: "You're at $100. Identify 2 warm leads to close this period." },
            { n: '2', title: 'PIPELINE FIX', body: 'Add 5 new prospects to your pipeline.' },
            { n: '3', title: 'CONSISTENCY', body: 'Log P&L data every day this week.' },
          ].map(item => (
            <div key={item.n} style={{ display: 'flex', gap: 5, alignItems: 'flex-start' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#6b7280', flexShrink: 0 }}>{item.n}</div>
              <div>
                <div style={{ fontSize: 8, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em' }}>{item.title}</div>
                <div style={{ fontSize: 8.5, color: '#6b7280', lineHeight: 1.4, marginTop: 1 }}>{item.body}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', gap: 5 }}>
            <div style={{ flex: 1, padding: '5px 7px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, fontSize: 8.5, color: '#374151' }}>Ask anything...</div>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={10} color="#031008"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Features Hub ──────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Target,     title: 'Daily Action Dashboard', desc: '1-3 non-negotiable tasks every morning. The roadmap is fixed. Your job is to execute — nothing else.',       tag: 'Core'       },
  { Icon: BarChart3,  title: 'P&L Tracking',           desc: 'Log revenue and expenses, see your financial trajectory at a glance. No spreadsheets, no confusion.',          tag: 'Finance'    },
  { Icon: Users,      title: 'Pipeline Kanban',         desc: 'Lead → Contacted → Meeting → Closed. Never let a warm lead slip through the cracks again.',                    tag: 'Pipeline'   },
  { Icon: Brain,      title: 'AI Coach',                desc: 'A strict performance coach in your pocket. Objection scripts, pitch rewrites, and brutal honesty.',             tag: 'AI'         },
  { Icon: Flame,      title: 'Streak & Momentum',       desc: 'Daily streaks, penalties for missed days, and dopamine-hit celebrations when you close a client.',              tag: 'Motivation' },
  { Icon: TrendingUp, title: 'Performance Reports',     desc: 'DM rates, reply rates, pipeline velocity — data-driven insights to sharpen your outreach daily.',               tag: 'Analytics'  },
]

function FeaturesHub() {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect() } },
      { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const W = 1100, H = 660
  const HX = 550, HY = 330
  const CW = 230, CH = 195

  // 3 cards top row, 3 cards bottom row — full horizontal spread
  const positions = [
    { left: 20,  top: 10,  ccx: 135, ccy: 107 },  // top-left
    { left: 435, top: 10,  ccx: 550, ccy: 107 },   // top-center
    { left: 850, top: 10,  ccx: 965, ccy: 107 },   // top-right
    { left: 20,  top: 455, ccx: 135, ccy: 552 },   // bottom-left
    { left: 435, top: 455, ccx: 550, ccy: 552 },   // bottom-center
    { left: 850, top: 455, ccx: 965, ccy: 552 },   // bottom-right
  ]

  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: W, height: H, margin: '0 auto' }}>

      {/* SVG: connection lines + hub rings */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
        {/* concentric rings around hub */}
        {[118, 92, 70].map((r, i) => (
          <circle key={r} cx={HX} cy={HY} r={r} fill="none"
            stroke={`rgba(16,185,129,${[0.07, 0.12, 0.22][i]})`} strokeWidth="1"
            opacity={active ? 1 : 0}
            style={{ transition: `opacity 0.5s ease 0.05s` }}
          />
        ))}

        {/* spoke lines */}
        {positions.map((pos, i) => {
          const dx = pos.ccx - HX, dy = pos.ccy - HY
          const len = Math.sqrt(dx * dx + dy * dy)
          const nx = dx / len, ny = dy / len
          const x1 = HX + nx * 72,       y1 = HY + ny * 72
          const x2 = pos.ccx - nx * 18,  y2 = pos.ccy - ny * 18
          const lineLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
          const delay = 0.28 + i * 0.055
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(16,185,129,0.28)" strokeWidth="1.5"
                strokeDasharray={lineLen} strokeDashoffset={active ? 0 : lineLen}
                style={{ transition: `stroke-dashoffset 0.7s ease ${delay}s` }}
              />
              <circle cx={x2} cy={y2} r={3.5} fill="#10b981"
                opacity={active ? 0.6 : 0}
                style={{ transition: `opacity 0.35s ease ${delay + 0.65}s` }}
              />
            </g>
          )
        })}
      </svg>

      {/* Hub centre */}
      <div style={{
        position: 'absolute', left: HX, top: HY,
        transform: active ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0)',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.5s ease 0s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) 0s',
        zIndex: 10,
      }}>
        <div style={{ position: 'absolute', inset: -30, borderRadius: '50%', border: '1px solid rgba(16,185,129,0.12)', animation: active ? 'lp-orb 5s ease-in-out infinite' : 'none' }}/>
        <div style={{
          width: 112, height: 112, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(16,185,129,0.18) 0%,rgba(5,150,105,0.07) 70%)',
          border: '1.5px solid rgba(16,185,129,0.45)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 60px rgba(16,185,129,0.24), 0 0 120px rgba(16,185,129,0.09)',
        }}>
          <Zap size={28} color="#10b981"/>
          <span style={{ fontSize: 10, fontWeight: 900, color: '#10b981', marginTop: 6, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Strata OS</span>
        </div>
      </div>

      {/* Feature cards */}
      {FEATURES.map((f, i) => {
        const pos = positions[i]
        const dx = HX - pos.ccx, dy = HY - pos.ccy
        const delay = 0.08 + i * 0.08
        return (
          <div key={f.title} style={{
            position: 'absolute', left: pos.left, top: pos.top,
            opacity: active ? 1 : 0,
            transform: active ? 'translate(0,0) scale(1)' : `translate(${dx}px,${dy}px) scale(0)`,
            transition: `opacity 0.55s ease ${delay}s, transform 0.65s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`,
          }}>
            <div className="lp-hub-card" style={{
              width: CW,
              background: 'linear-gradient(145deg,rgba(14,17,20,.98),rgba(5,6,8,.98))',
              border: '1px solid rgba(255,255,255,.07)',
              borderRadius: 14, padding: '22px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: -32, right: -32, width: 100, height: 100, background: 'radial-gradient(circle,rgba(16,185,129,.08),transparent)', borderRadius: '50%', pointerEvents: 'none' }}/>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,.09)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <f.Icon size={20} color="#10b981"/>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(16,185,129,.07)', color: '#10b981', borderRadius: 9999, letterSpacing: '0.05em' }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em', color: '#f4f6f4', lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scrolled, setScrolled] = useState(false)

  useParticles(canvasRef)
  useScrollReveal()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const TESTIMONIALS = [
    { name: 'Marcus T.', role: 'SMMA Founder', avatar: 'MT', quote: 'Closed my first $1,500 client on Day 17. The daily tasks and AI coach removed every excuse I had. Nothing else comes close.' },
    { name: 'Priya S.', role: 'Freelance Dev', avatar: 'PS', quote: 'I used to open 12 different tabs every morning. Now I open Strata, see my tasks, and get to work. Absolutely game-changing.' },
    { name: 'Jake L.', role: 'AI Agency Owner', avatar: 'JL', quote: 'The pipeline board alone is worth it. I can see exactly where every prospect is. Closed 3 clients in my first 30 days.' },
  ]

  return (
    <div style={{ background: '#030405', color: '#f4f6f4', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Landing-page-scoped styles (no global resets) ── */}
      <style>{`
        @keyframes lp-orb{0%,100%{transform:scale(1) translate(0,0);opacity:1}50%{transform:scale(1.2) translate(18px,-22px);opacity:.65}}
        @keyframes lp-float3d{0%,100%{transform:perspective(1300px) rotateX(5deg) rotateY(-13deg) rotateZ(0.8deg) translateY(0)}50%{transform:perspective(1300px) rotateX(5deg) rotateY(-13deg) rotateZ(0.8deg) translateY(-20px)}}
        @keyframes lp-rise{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lp-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.5}}
        .lp-reveal{opacity:0;transform:translateY(28px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
        .lp-reveal.lp-in{opacity:1;transform:translateY(0)}
        .lp-d1{transition-delay:.1s}.lp-d2{transition-delay:.2s}.lp-d3{transition-delay:.3s}.lp-d4{transition-delay:.4s}
        .lp-hero-a{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .1s both}
        .lp-hero-b{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .22s both}
        .lp-hero-c{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .36s both}
        .lp-hero-d{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .48s both}
        .lp-hero-e{animation:lp-rise .9s cubic-bezier(.16,1,.3,1) .55s both}
        .lp-fcard{transition:transform .15s ease,box-shadow .15s ease}
        .lp-glow-btn{position:relative;overflow:hidden;transition:box-shadow .2s ease,transform .2s ease!important}
        .lp-glow-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.16) 0%,transparent 55%);pointer-events:none}
        .lp-glow-btn:hover{box-shadow:0 0 36px rgba(16,185,129,.55),0 10px 28px rgba(16,185,129,.3)!important;transform:translateY(-2px)!important}
        .lp-tcard{transition:all .3s cubic-bezier(.16,1,.3,1)}
        .lp-tcard:hover{border-color:rgba(16,185,129,.28)!important;transform:translateY(-5px);box-shadow:0 24px 48px rgba(0,0,0,.55),0 0 32px rgba(16,185,129,.07)!important}
        .lp-navlink{color:#6b7280;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
        .lp-navlink:hover{color:#f4f6f4}
        .lp-hub-card{transition:transform .22s cubic-bezier(.16,1,.3,1),box-shadow .22s ease,border-color .22s ease}
        .lp-hub-card:hover{transform:translateY(-6px) scale(1.03);border-color:rgba(16,185,129,.28)!important;box-shadow:0 22px 44px rgba(0,0,0,.65),0 0 28px rgba(16,185,129,.11)!important}
        /* ── Responsive ── */
        .lp-hero-dash{display:flex}
        .lp-feat-hub-wrap{display:block}
        .lp-feat-grid-wrap{display:none}
        @media(max-width:1023px){
          .lp-nav-links{display:none!important}
          .lp-hero-grid{grid-template-columns:1fr!important;gap:40px!important;text-align:center}
          .lp-hero-dash{display:none!important}
          .lp-hero-btns{justify-content:center!important;flex-wrap:wrap!important}
          .lp-hero-badges{justify-content:center!important}
          .lp-hero-h1{font-size:48px!important}
          .lp-stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-feat-hub-wrap{display:none!important}
          .lp-feat-grid-wrap{display:grid!important;grid-template-columns:repeat(2,1fr);gap:18px}
          .lp-ai-inner{grid-template-columns:1fr!important;padding:40px 32px!important;gap:36px!important}
          .lp-test-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-footer-inner{flex-direction:column!important;gap:16px!important;text-align:center!important}
        }
        @media(max-width:639px){
          .lp-sign-in-btn{display:none!important}
          .lp-hero-h1{font-size:34px!important;letter-spacing:-0.025em!important}
          .lp-hero-p{font-size:15px!important;max-width:100%!important}
          .lp-hero-btns a,.lp-hero-btns div{font-size:15px!important;padding:13px 22px!important}
          .lp-stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-feat-section{padding:70px 20px!important}
          .lp-feat-grid-wrap{grid-template-columns:1fr!important}
          .lp-how-section{padding:64px 20px!important}
          .lp-how-h2{font-size:30px!important}
          .lp-ai-section{padding:64px 20px!important}
          .lp-ai-inner{padding:28px 20px!important}
          .lp-ai-h2{font-size:26px!important;line-height:1.2!important}
          .lp-test-section{padding:64px 20px!important}
          .lp-test-grid{grid-template-columns:1fr!important}
          .lp-cta-section{padding:80px 20px!important}
          .lp-cta-h2{font-size:32px!important}
          .lp-footer{padding:24px 20px!important}
        }
      `}</style>

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}/>

      {/* ── Background orbs + grid ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,.11) 0%,transparent 68%)', top: -250, right: -120, animation: 'lp-orb 9s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 68%)', bottom: '5%', left: -120, animation: 'lp-orb 12s ease-in-out infinite 3s' }}/>
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle,rgba(52,211,153,.06) 0%,transparent 68%)', top: '42%', left: '32%', animation: 'lp-orb 15s ease-in-out infinite 6s' }}/>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize: '64px 64px' }}/>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 64, padding: '0 28px', display: 'flex', alignItems: 'center', background: scrolled ? 'rgba(3,4,5,0.93)' : 'transparent', backdropFilter: scrolled ? 'blur(24px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.055)' : '1px solid transparent', transition: 'all .35s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#10b981,#34d399)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(16,185,129,.42)' }}>
            <Zap size={16} color="#031008"/>
          </div>
          <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: '-0.02em' }}>Strata</span>
          <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(255,255,255,.07)', borderRadius: 5, color: '#6b7280', fontWeight: 700, letterSpacing: '0.04em' }}>BETA</span>
        </div>
        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#features" className="lp-navlink">Features</a>
          <a href="#how" className="lp-navlink">How it works</a>
          <a href="#reviews" className="lp-navlink">Reviews</a>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {isLoggedIn ? (
            <Link href="/dashboard" className="lp-glow-btn" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(16,185,129,.32)' }}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="lp-sign-in-btn" style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,.055)', color: '#c4c9c5', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', transition: 'all .2s' }}>
                Sign in
              </Link>
              <Link href="/signup" className="lp-glow-btn" style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(16,185,129,.32)' }}>
                Get started →
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '130px 28px 80px' }}>
        <div className="lp-hero-grid" style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="lp-hero-a" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: 'rgba(16,185,129,.09)', border: '1px solid rgba(16,185,129,.26)', borderRadius: 9999, marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'block', animation: 'lp-pulse 2.2s ease-in-out infinite' }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Now in Beta · 2,400+ founders building</span>
            </div>

            <h1 className="lp-hero-b lp-hero-h1" style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.04, marginBottom: 22, letterSpacing: '-0.04em' }}>
              The performance OS<br/>
              <span style={{ background: 'linear-gradient(130deg,#10b981 0%,#34d399 45%,#6ee7b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                built for founders.
              </span>
            </h1>

            <p className="lp-hero-c lp-hero-p" style={{ fontSize: 17, lineHeight: 1.72, color: '#a0a8a4', marginBottom: 36, maxWidth: 430 }}>
              Track your P&L, manage your pipeline, and get AI-coached from $0 to your first clients — all in one ruthlessly focused dashboard.
            </p>

            <div className="lp-hero-d lp-hero-btns" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22 }}>
              {isLoggedIn ? (
                <Link href="/dashboard" className="lp-glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 11, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 16, fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 26px rgba(16,185,129,.38),inset 0 1px 0 rgba(255,255,255,.22)' }}>
                  Go to Dashboard <ArrowRight size={16}/>
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="lp-glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 11, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 16, fontWeight: 800, textDecoration: 'none', boxShadow: '0 8px 26px rgba(16,185,129,.38),inset 0 1px 0 rgba(255,255,255,.22)' }}>
                    Start for free <ArrowRight size={16}/>
                  </Link>
                  <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 26px', borderRadius: 11, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#c4c9c5', fontSize: 16, fontWeight: 600, textDecoration: 'none', transition: 'all .2s' }}>
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="lp-hero-d lp-hero-badges" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, color: '#4b5563', fontSize: 13 }}>
              {['No credit card needed', 'Free forever plan', '30-day roadmap included'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={12} color="#10b981"/> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 3D dashboard */}
          <div className="lp-hero-e lp-hero-dash" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {/* Glow beneath */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%,rgba(16,185,129,.14),transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ animation: 'lp-float3d 7s ease-in-out infinite', transformOrigin: 'center center', filter: 'drop-shadow(0 50px 70px rgba(0,0,0,.88)) drop-shadow(0 0 70px rgba(16,185,129,.16))' }}>
              <DashboardMockup/>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.055)', borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(255,255,255,.012)', padding: '38px 28px' }}>
        <div className="lp-stats-grid" style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { n: '2,400+', label: 'Active Founders' },
            { n: '87%', label: 'Close First Client ≤ 30 Days' },
            { n: '$3.2M', label: 'Revenue Tracked' },
            { n: '4.9 / 5', label: 'Average Rating' },
          ].map((s, i) => (
            <div key={s.label} className={`lp-reveal lp-d${i+1}`}>
              <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, background: 'linear-gradient(135deg,#10b981,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.n}</div>
              <div style={{ color: '#4b5563', fontSize: 13, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-feat-section" style={{ position: 'relative', zIndex: 1, padding: '110px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>One dashboard</div>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 16 }}>Everything you need.<br/>Nothing you don't.</h2>
            <p style={{ color: '#6b7280', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>Stop juggling 12 different tabs. Strata connects your daily tasks, P&L, pipeline, and AI coaching into one ruthlessly focused dashboard — so you stop organizing and start earning.</p>
          </div>
          {/* Desktop hub */}
          <div className="lp-feat-hub-wrap"><FeaturesHub /></div>
          {/* Mobile / tablet card grid */}
          <div className="lp-feat-grid-wrap">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`lp-reveal lp-d${(i % 2) + 1}`} style={{ background: 'linear-gradient(145deg,rgba(14,17,20,.98),rgba(5,6,8,.98))', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -28, right: -28, width: 90, height: 90, background: 'radial-gradient(circle,rgba(16,185,129,.08),transparent)', borderRadius: '50%', pointerEvents: 'none' }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, background: 'rgba(16,185,129,.09)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <f.Icon size={19} color="#10b981"/>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(16,185,129,.07)', color: '#10b981', borderRadius: 9999, letterSpacing: '0.05em' }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em', color: '#f4f6f4', lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="lp-how-section" style={{ position: 'relative', zIndex: 1, padding: '80px 28px', background: 'rgba(255,255,255,.01)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>How it works</div>
            <h2 className="lp-how-h2" style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.035em' }}>Three steps to your first client.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {[
              { n: '01', title: 'Set up your profile', desc: 'Tell Strata your niche, service, and daily outreach goal. The AI tailors your 30-day execution roadmap in seconds.' },
              { n: '02', title: 'Execute every single day', desc: 'Log in each morning. Your 1-3 tasks are waiting. Focus Mode locks you in. Strata penalizes inaction and rewards consistency.' },
              { n: '03', title: 'Close your first deal', desc: 'As leads warm up, move them through your pipeline. The AI coach sharpens your pitch and handles objections in real-time.' },
            ].map((s, i) => (
              <div key={s.n} className={`lp-reveal lp-d${i+1}`} style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: 13, background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{s.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BIG FEATURE CALLOUT ── */}
      <section className="lp-ai-section" style={{ position: 'relative', zIndex: 1, padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-ai-inner" style={{ background: 'linear-gradient(145deg,rgba(14,17,20,.99),rgba(5,6,8,.99))', border: '1px solid rgba(16,185,129,.15)', borderRadius: 20, padding: '60px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* bg glow */}
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle,rgba(16,185,129,.1),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}/>
            <div className="lp-reveal">
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 18 }}>AI Coach</div>
              <h2 className="lp-ai-h2" style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 18 }}>Your coach gives you<br/>brutal, honest feedback.</h2>
              <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>Paste a prospect's objection. Get a word-for-word rebuttal in seconds. Pre-call roleplay. Post-call debrief. The AI never sugarcoats — and it controls your entire workspace so you don't have to.</p>
              {[
                'Handle any objection with a word-for-word script',
                'Full read/write access to your entire dashboard',
                'Creates and manages your to-do list automatically',
                'Reads your pipeline and suggests next actions',
                'Analyzes your P&L and revenue trends in real-time',
                'Truly hands-off — just ask and it executes',
              ].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <Check size={14} color="#10b981"/>
                  <span style={{ fontSize: 14, color: '#c4c9c5' }}>{t}</span>
                </div>
              ))}
            </div>
            {/* AI coach chat mockup */}
            <div className="lp-reveal lp-d2" style={{ background: 'rgba(8,11,14,.97)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,.04), 0 32px 64px rgba(0,0,0,.8), 0 0 60px rgba(16,185,129,.1)', fontFamily: 'system-ui,sans-serif' }}>
              {/* Chat header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={16} color="#031008"/>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f6f4' }}>Strata AI Coach</div>
                  <div style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}/>
                    Online · Has access to your full dashboard
                  </div>
                </div>
              </div>
              {/* Messages */}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { from: 'ai', msg: "I reviewed your pipeline. You have 3 leads stuck in 'Contacted' for 5+ days. Want me to write follow-up scripts for all of them right now?" },
                  { from: 'user', msg: 'Yes, also they said they\'re "not interested" — what do I say?' },
                  { from: 'ai', msg: '"Not interested" = pain not established yet. Reply: \'Totally get it — most founders I work with said the same. Quick question: what\'s your biggest challenge getting clients right now?\' Keep them talking. I\'ve also updated your to-do list with 3 follow-up tasks for today.' },
                  { from: 'user', msg: 'What about my P&L, am I on track?' },
                  { from: 'ai', msg: "You're at $0 revenue on Day 12. Based on your pipeline velocity, you need 2 more meetings booked this week to hit your target. I've added 'Book 2 meetings' as today's priority task. Let's go." },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: m.from === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px', background: m.from === 'user' ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${m.from === 'user' ? 'rgba(16,185,129,.25)' : 'rgba(255,255,255,.07)'}`, color: m.from === 'user' ? '#d1fae5' : '#e5e7eb', fontSize: 12, lineHeight: 1.6 }}>
                      {m.from === 'ai' && <div style={{ fontSize: 9, fontWeight: 800, color: '#10b981', marginBottom: 5, letterSpacing: '0.08em' }}>STRATA AI</div>}
                      {m.msg}
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 9 }}>
                <div style={{ flex: 1, padding: '9px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#4b5563', fontSize: 12 }}>Ask your coach anything...</div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 14px rgba(16,185,129,.35)', cursor: 'pointer' }}>
                  <ArrowRight size={15} color="#031008"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="lp-test-section" style={{ position: 'relative', zIndex: 1, padding: '80px 28px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.035em' }}>Real founders. Real results.</h2>
          </div>
          <div className="lp-test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`lp-reveal lp-tcard lp-d${i+1}`} style={{ background: 'linear-gradient(145deg,rgba(14,17,20,.99),rgba(5,6,8,.99))', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill="#10b981" color="#10b981"/>)}
                </div>
                <p style={{ color: '#c4c9c5', fontSize: 15, lineHeight: 1.7, marginBottom: 22, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#031008' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-section" style={{ position: 'relative', zIndex: 1, padding: '120px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle,rgba(16,185,129,.13),transparent 68%)', borderRadius: '50%', pointerEvents: 'none' }}/>
        <div className="lp-reveal" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Get started today</div>
          <h2 className="lp-cta-h2" style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.04, marginBottom: 20 }}>
            Your first client<br/>
            <span style={{ background: 'linear-gradient(130deg,#10b981,#34d399,#6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              is 30 days away.
            </span>
          </h2>
          <p style={{ color: '#6b7280', fontSize: 18, marginBottom: 44, lineHeight: 1.65 }}>Stop consuming. Start executing. Strata gives you the structure, tools, and AI coaching to land your first client — faster than you think.</p>
          <Link href={isLoggedIn ? '/dashboard' : '/signup'} className="lp-glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 40px', borderRadius: 13, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontSize: 18, fontWeight: 800, textDecoration: 'none', boxShadow: '0 10px 36px rgba(16,185,129,.42),inset 0 1px 0 rgba(255,255,255,.22)' }}>
            {isLoggedIn ? 'Go to Dashboard' : 'Start free — no card needed'} <ArrowRight size={18}/>
          </Link>
          <div style={{ marginTop: 20, color: '#4b5563', fontSize: 13 }}>Join 2,400+ founders already building with Strata</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,.055)', padding: '36px 28px' }}>
        <div className="lp-footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg,#10b981,#34d399)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color="#031008"/>
            </div>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-0.02em' }}>Strata</span>
          </div>
          <div style={{ color: '#2d3748', fontSize: 13 }}>© 2025 Strata. Built for founders who mean business.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/login" style={{ color: '#4b5563', textDecoration: 'none', fontSize: 13, transition: 'color .2s' }}>Sign in</Link>
            <Link href="/signup" style={{ color: '#10b981', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Get started →</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
