'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { TrendingUp, Users, Brain, BarChart3, Target, Star, Check, ArrowRight, Flame, Shield, Clock, Activity, Zap, Trophy, CalendarCheck, Settings, BarChart2, Award, Calendar, Puzzle } from 'lucide-react'

const ThreeBackground = dynamic(() => import('./ThreeBackground'), { ssr: false })

// ─── Constellation Particles (hero only) ─────────────────────────────────────

function useParticles(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number
    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; ph: number; dp: number }
    const pts: P[] = []
    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    const spawn = () => {
      pts.length = 0
      const n = Math.min(Math.floor(canvas.width / 28), 55)
      for (let i = 0; i < n; i++) pts.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.2 + .4, a: Math.random() * .18 + .06, ph: Math.random() * Math.PI * 2, dp: Math.random() * .002 + .001 })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy; p.ph += p.dp
        if (p.x < -4) p.x = canvas.width + 4; if (p.x > canvas.width + 4) p.x = -4
        if (p.y < -4) p.y = canvas.height + 4; if (p.y > canvas.height + 4) p.y = -4
        const al = p.a * (.7 + .3 * Math.sin(p.ph))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139,92,246,${al})`; ctx.fill()
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j]; const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 140) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 140) * .055})`; ctx.lineWidth = .6; ctx.stroke() }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    resize(); spawn(); draw()
    const ro = new ResizeObserver(() => { resize(); spawn() })
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [ref])
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('lp-in'); obs.unobserve(e.target) } }),
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

// ─── 3D Tilt on hover ─────────────────────────────────────────────────────────

function use3DTilt(str = 10) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const mv = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      const x = ((e.clientX - r.left) / r.width - .5) * str
      const y = ((e.clientY - r.top) / r.height - .5) * -str
      el.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) scale(1.025)`
      el.style.transition = 'transform .05s linear'
    }
    const lv = () => { el.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)'; el.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)' }
    el.addEventListener('mousemove', mv); el.addEventListener('mouseleave', lv)
    return () => { el.removeEventListener('mousemove', mv); el.removeEventListener('mouseleave', lv) }
  }, [str])
  return ref
}

// ─── Logo Mark ────────────────────────────────────────────────────────────────

function LogoMark({ size = 34 }: { size?: number }) {
  const [err, setErr] = useState(false)
  const r = Math.round(size * .22)
  if (err) return (
    <div style={{ width: size, height: size, borderRadius: r, background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ color: '#fff', fontWeight: 900, fontSize: Math.round(size * .55), fontFamily: 'system-ui', lineHeight: 1, letterSpacing: '-.04em' }}>P</span>
    </div>
  )
  return <img src="/logo.png" alt="prspectve" width={size} height={size} style={{ display: 'block', flexShrink: 0, borderRadius: r }} onError={() => setErr(true)} />
}

// ─── Glow Button (UIVerse by Creatlydev, adapted) ─────────────────────────────

function GlowButton({ href, size = 'md', children }: { href: string; size?: 'md' | 'lg'; children: React.ReactNode }) {
  const isLg = size === 'lg'
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'inline-block' }}>
      <button className={`prsp-btn ${isLg ? 'prsp-btn-lg' : ''}`}>
        <svg strokeLinejoin="round" strokeLinecap="round" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="prsp-btn-icon" xmlns="http://www.w3.org/2000/svg">
          <path fill="none" d="M0 0h24v24H0z" stroke="none"></path>
          <path d="M5 12h14"></path>
          <path d="M13 18l6 -6"></path>
          <path d="M13 6l6 6"></path>
        </svg>
        <span className="prsp-btn-label">{children}</span>
      </button>
    </Link>
  )
}

// ─── Dashboard Mockup (accurate sidebar + AI Coach) ───────────────────────────

function DashboardMockup() {
  const NAV = [
    { l: 'Overview', a: true },
    { l: 'Tasks', a: false },
    { l: 'Pipeline', a: false },
    { l: 'P&L Calendar', a: false },
  ]
  const TOOLS = [
    { l: 'AI Co-pilot', dot: true },
    { l: 'Integrations', dot: false },
  ]
  const INSIGHTS = [
    { l: 'Reports' },
    { l: 'Achievements' },
    { l: 'Settings' },
  ]

  return (
    <div style={{ width: 690, borderRadius: 16, border: '1px solid rgba(139,92,246,0.4)', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,.05), 0 0 0 6px rgba(139,92,246,.08), 0 0 0 14px rgba(139,92,246,.04), 0 60px 120px rgba(0,0,0,.45), 0 0 100px rgba(139,92,246,.22), inset 0 1px 0 rgba(255,255,255,.07)', background: '#080b0d', fontFamily: 'system-ui,sans-serif', fontSize: 11, position: 'relative' }}>
      {/* Inner glow overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,.09) 0%,transparent 55%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* Titlebar */}
      <div style={{ background: '#0a0d11', borderBottom: '1px solid rgba(255,255,255,.055)', padding: '9px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ display: 'flex', gap: 5 }}>{['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}</div>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,.08)', margin: '0 4px' }} />
          <LogoMark size={20} /><span style={{ fontWeight: 800, fontSize: 12, color: '#f4f6f4', marginLeft: 4 }}>prspectve</span>
        </div>
        <span style={{ fontSize: 9, color: '#374151' }}>JUNE 2026  •  MON  10:47 PM</span>
        <div style={{ padding: '4px 10px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#fff', boxShadow: '0 0 14px rgba(139,92,246,.5)' }}>+ Add data</div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', height: 375 }}>

        {/* Sidebar */}
        <div style={{ width: 116, background: '#060809', borderRight: '1px solid rgba(255,255,255,.045)', padding: '10px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Main nav */}
          {NAV.map(item => (
            <div key={item.l} style={{ padding: '6px 11px', display: 'flex', alignItems: 'center', gap: 7, background: item.a ? 'rgba(139,92,246,.13)' : 'transparent', borderRight: item.a ? '2px solid #8b5cf6' : '2px solid transparent' }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: item.a ? '#8b5cf6' : 'rgba(255,255,255,.08)', flexShrink: 0, boxShadow: item.a ? '0 0 8px rgba(139,92,246,.7)' : 'none' }} />
              <span style={{ fontSize: 10, color: item.a ? '#f4f6f4' : '#3d4a5c', fontWeight: item.a ? 600 : 400, lineHeight: 1.2 }}>{item.l}</span>
            </div>
          ))}

          {/* Tools */}
          <div style={{ padding: '8px 11px 3px', fontSize: 8, color: '#2a3240', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 6 }}>Tools</div>
          {TOOLS.map(item => (
            <div key={item.l} style={{ padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,.06)', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#3d4a5c', flex: 1, lineHeight: 1.2 }}>{item.l}</span>
              {item.dot && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,.8)', flexShrink: 0 }} />}
            </div>
          ))}

          {/* Insights */}
          <div style={{ padding: '8px 11px 3px', fontSize: 8, color: '#2a3240', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>Insights</div>
          {INSIGHTS.map(item => (
            <div key={item.l} style={{ padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 13, height: 13, borderRadius: 3, background: 'rgba(255,255,255,.06)', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#3d4a5c', lineHeight: 1.2 }}>{item.l}</span>
            </div>
          ))}

          {/* Bottom user pill */}
          <div style={{ marginTop: 'auto', padding: '8px 11px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', flexShrink: 0 }}>N</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>navbuilds</div>
                <div style={{ fontSize: 7.5, color: '#374151' }}>Free plan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 9, color: '#4b5563' }}>◀</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f4f6f4' }}>June 2026</span>
            <span style={{ fontSize: 9, color: '#4b5563' }}>▶</span>
            <span style={{ fontSize: 9, color: '#374151', marginLeft: 2 }}>3 of 3 periods</span>
            <div style={{ padding: '2px 7px', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.28)', borderRadius: 4, fontSize: 7.5, color: '#8b5cf6', fontWeight: 700, marginLeft: 4 }}>LIVE</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {[{ l: 'REVENUE', v: '$450,983', t: '+32%', bar: true }, { l: 'NET PROFIT', v: '$427,541', t: '95% margin' }, { l: 'PIPELINE', v: '12 leads', t: '3 warm' }, { l: 'TASKS', v: '3/8', t: 'today' }].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '8px 9px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -8, right: -8, width: 32, height: 32, background: 'radial-gradient(circle,rgba(139,92,246,.18),transparent)', borderRadius: '50%' }} />
                <div style={{ fontSize: 7, color: '#374151', fontWeight: 700, letterSpacing: '.08em', marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f4f6f4', lineHeight: 1, marginBottom: 2 }}>{s.v}</div>
                <div style={{ fontSize: 8, color: '#8b5cf6' }}>{s.t}</div>
                {s.bar && <div style={{ marginTop: 5, height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1 }}><div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg,#8b5cf6,#a78bfa)', borderRadius: 1 }} /></div>}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 6, flex: 1, minHeight: 0 }}>
            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '9px 11px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 7.5, color: '#374151', fontWeight: 700, letterSpacing: '.08em' }}>REVENUE HISTORY</span>
                <span style={{ fontSize: 7.5, color: '#8b5cf6', fontWeight: 700 }}>+32%</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f4f6f4', marginBottom: 7 }}>$450,983</div>
              <svg width="100%" height="50" viewBox="0 0 180 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient>
                  <filter id="gl"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <path d="M0,46C30,46 50,44 70,40C90,36 110,24 130,12C150,2 165,0 180,0" fill="none" stroke="#8b5cf6" strokeWidth="1.5" filter="url(#gl)" />
                <path d="M0,46C30,46 50,44 70,40C90,36 110,24 130,12C150,2 165,0 180,0 L180,50 L0,50Z" fill="url(#dlg)" />
              </svg>
            </div>
            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '9px 11px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 7.5, color: '#374151', fontWeight: 700, letterSpacing: '.08em', marginBottom: 7, alignSelf: 'flex-start' }}>MONTHLY TARGET</div>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5" />
                <circle cx="30" cy="30" r="24" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeDasharray="150.8" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 30 30)" style={{ filter: 'drop-shadow(0 0 5px rgba(139,92,246,.7))' }} />
                <text x="30" y="28" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="800">100%</text>
                <text x="30" y="38" textAnchor="middle" fill="#4b5563" fontSize="6.5">of goal</text>
              </svg>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#f4f6f4', marginTop: 5 }}>$450,983</div>
              <div style={{ fontSize: 7.5, color: '#22c55e', marginTop: 1, fontWeight: 700 }}>Goal achieved!</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8, padding: '9px 11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 7.5, color: '#374151', fontWeight: 700, letterSpacing: '.08em' }}>TODAY'S TASKS</span>
                <span style={{ fontSize: 8, color: '#8b5cf6', fontWeight: 700 }}>3/8</span>
              </div>
              {[{ d: true, t: 'Develop lead gen strategy' }, { d: true, t: 'Identify potential leads' }, { d: true, t: 'Review pipeline status' }, { d: false, t: 'Add first real lead' }, { d: false, t: 'Send 10 cold DMs' }].map((tk, i) => (
                <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, marginTop: 1, flexShrink: 0, background: tk.d ? '#8b5cf6' : 'transparent', border: tk.d ? 'none' : '1px solid rgba(255,255,255,.1)', boxShadow: tk.d ? '0 0 6px rgba(139,92,246,.6)' : 'none' }} />
                  <span style={{ fontSize: 8, color: tk.d ? '#374151' : '#9ca3af', textDecoration: tk.d ? 'line-through' : 'none', lineHeight: 1.4 }}>{tk.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coach panel */}
        <div style={{ width: 136, background: '#060809', borderLeft: '1px solid rgba(255,255,255,.045)', padding: '11px 10px', display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f4f6f4', display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 7px rgba(34,197,94,.9)' }} />AI Co-pilot
            </div>
            <div style={{ fontSize: 7.5, color: '#22c55e', fontWeight: 600 }}>Online</div>
          </div>

          {/* Insight */}
          <div style={{ fontSize: 8, color: '#4b5563', lineHeight: 1.5, padding: '5px 7px', background: 'rgba(255,255,255,.02)', borderRadius: 5 }}>Revenue dropped 100% this period — identify what stalled the pipeline.</div>

          {/* Primary focus */}
          <div style={{ padding: '6px 7px', background: 'rgba(139,92,246,.09)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 6 }}>
            <div style={{ fontSize: 7.5, fontWeight: 800, color: '#8b5cf6', letterSpacing: '.06em', marginBottom: 3 }}>PRIMARY FOCUS</div>
            <div style={{ fontSize: 8, color: '#c4b5fd', lineHeight: 1.4 }}>Pipeline is empty — outreach is the highest-leverage activity right now.</div>
          </div>

          {/* Action items */}
          {[
            { n: '1', ti: 'REVENUE FIX', b: "You're at $100. Close 2 warm leads this period." },
            { n: '2', ti: 'PIPELINE', b: 'Add 5 new prospects to your pipeline.' },
            { n: '3', ti: 'CONSISTENCY', b: 'Log P&L data every day this week.' },
          ].map(it => (
            <div key={it.n} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(139,92,246,.14)', border: '1px solid rgba(139,92,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, color: '#8b5cf6', flexShrink: 0, fontWeight: 700 }}>{it.n}</div>
              <div>
                <div style={{ fontSize: 7.5, fontWeight: 700, color: '#6b7280', letterSpacing: '.06em' }}>{it.ti}</div>
                <div style={{ fontSize: 7.5, color: '#4b5563', lineHeight: 1.4, marginTop: 1 }}>{it.b}</div>
              </div>
            </div>
          ))}

          {/* Input */}
          <div style={{ marginTop: 'auto', display: 'flex', gap: 5 }}>
            <div style={{ flex: 1, padding: '5px 7px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 6, fontSize: 8, color: '#374151' }}>Ask anything...</div>
            <div style={{ width: 22, height: 22, borderRadius: 5, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(139,92,246,.5)', flexShrink: 0 }}><ArrowRight size={10} color="#fff" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Features Hub ─────────────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Target, title: 'Daily Action Dashboard', desc: '1-3 non-negotiable tasks every morning. The roadmap is fixed. Your job is to execute — nothing else.', tag: 'Core' },
  { Icon: BarChart3, title: 'P&L Tracking', desc: 'Log revenue and expenses, see your financial trajectory at a glance. No spreadsheets, no confusion.', tag: 'Finance' },
  { Icon: Users, title: 'Pipeline Kanban', desc: 'Lead → Contacted → Meeting → Closed. Never let a warm lead slip through the cracks again.', tag: 'Pipeline' },
  { Icon: Brain, title: 'AI Coach', desc: 'A strict performance coach in your pocket. Objection scripts, pitch rewrites, and brutal honesty.', tag: 'AI' },
  { Icon: Flame, title: 'Streak & Momentum', desc: 'Daily streaks, penalties for missed days, and dopamine-hit celebrations when you close a client.', tag: 'Motivation' },
  { Icon: TrendingUp, title: 'Performance Reports', desc: 'DM rates, reply rates, pipeline velocity — data-driven insights to sharpen your outreach daily.', tag: 'Analytics' },
]

function FeaturesHub() {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: .1 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  const W = 1100, H = 660, HX = 550, HY = 330, CW = 228
  const positions = [
    { left: 18, top: 8, ccx: 132, ccy: 105 }, { left: 436, top: 8, ccx: 550, ccy: 105 }, { left: 854, top: 8, ccx: 968, ccy: 105 },
    { left: 18, top: 462, ccx: 132, ccy: 557 }, { left: 436, top: 462, ccx: 550, ccy: 557 }, { left: 854, top: 462, ccx: 968, ccy: 557 },
  ]
  return (
    <div ref={ref} style={{ position: 'relative', maxWidth: W, height: H, margin: '0 auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
        {[120, 90, 62].map((r, i) => (
          <circle key={r} cx={HX} cy={HY} r={r} fill="none" stroke={`rgba(139,92,246,${[.08, .16, .30][i]})`} strokeWidth="1" opacity={active ? 1 : 0} style={{ transition: 'opacity .5s ease .05s' }} />
        ))}
        {positions.map((pos, i) => {
          const dx = pos.ccx - HX, dy = pos.ccy - HY, len = Math.hypot(dx, dy), nx = dx / len, ny = dy / len
          const x1 = HX + nx * 70, y1 = HY + ny * 70, x2 = pos.ccx - nx * 16, y2 = pos.ccy - ny * 16
          const ll = Math.hypot(x2 - x1, y2 - y1), d = .3 + i * .055
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeDasharray={ll} strokeDashoffset={active ? 0 : ll} style={{ transition: `stroke-dashoffset .75s ease ${d}s` }} />
              <circle cx={x2} cy={y2} r={3.5} fill="#8b5cf6" opacity={active ? .7 : 0} style={{ transition: `opacity .35s ease ${d + .7}s` }} />
            </g>
          )
        })}
      </svg>
      <div style={{ position: 'absolute', left: HX, top: HY, transform: active ? 'translate(-50%,-50%) scale(1)' : 'translate(-50%,-50%) scale(0)', opacity: active ? 1 : 0, transition: 'opacity .5s ease,transform .65s cubic-bezier(.34,1.56,.64,1)', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -32, borderRadius: '50%', border: '1px solid rgba(139,92,246,.12)', animation: active ? 'lp-orb 5s ease-in-out infinite' : 'none' }} />
        <div style={{ width: 116, height: 116, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.14) 0%,rgba(109,40,217,.05) 70%)', border: '1.5px solid rgba(139,92,246,.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(139,92,246,.18),0 0 100px rgba(139,92,246,.08)' }}>
          <LogoMark size={42} />
          <span style={{ fontSize: 9.5, fontWeight: 900, color: '#8b5cf6', marginTop: 5, letterSpacing: '.08em', textTransform: 'uppercase' }}>prspectve</span>
        </div>
      </div>
      {FEATURES.map((f, i) => {
        const pos = positions[i], dx = HX - pos.ccx, dy = HY - pos.ccy, delay = .08 + i * .08
        return (
          <div key={f.title} style={{ position: 'absolute', left: pos.left, top: pos.top, opacity: active ? 1 : 0, transform: active ? 'translate(0,0) scale(1)' : `translate(${dx}px,${dy}px) scale(0)`, transition: `opacity .55s ease ${delay}s,transform .65s cubic-bezier(.34,1.56,.64,1) ${delay}s` }}>
            <div className="lp-hub-card" style={{ width: CW, background: '#ffffff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, padding: '20px 18px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.07)' }}>
              <div style={{ position: 'absolute', top: -28, right: -28, width: 90, height: 90, background: 'radial-gradient(circle,rgba(139,92,246,.07),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
                <div style={{ width: 42, height: 42, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><f.Icon size={19} color="#8b5cf6" /></div>
                <span style={{ fontSize: 9.5, fontWeight: 800, padding: '3px 9px', background: 'rgba(139,92,246,.08)', color: '#8b5cf6', borderRadius: 9999, letterSpacing: '.05em' }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 7, letterSpacing: '-.01em', color: '#0f172a', lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Tilt Card ────────────────────────────────────────────────────────────────

function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = use3DTilt(9)
  return <div ref={ref} style={{ ...style }}>{children}</div>
}

// ─── Execution Track ──────────────────────────────────────────────────────────

function ExecutionTrack() {
  const PHASES = [
    {
      phase: 'SETUP', timeframe: 'Day 1  ·  5 minutes',
      headline: 'Your OS is live before your coffee gets cold.',
      body: 'Tell prspectve your niche, service, and daily outreach goal. A personalised 30-day execution roadmap generates in seconds.',
      Icon: CalendarCheck, accent: '#8b5cf6', accentBg: 'rgba(139,92,246,.07)',
      mockup: (
        <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '.1em', marginBottom: 9 }}>ONBOARDING  ·  STEP 2 OF 3</div>
          {[{ l: 'Your niche', v: 'Social Media Marketing' }, { l: 'Primary service', v: 'Content creation + ads' }, { l: 'Daily outreach goal', v: '15 DMs / day' }].map(f => (
            <div key={f.l} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700, letterSpacing: '.07em', marginBottom: 2 }}>{f.l.toUpperCase()}</div>
              <div style={{ padding: '5px 8px', background: '#fff', border: '1px solid rgba(139,92,246,.25)', borderRadius: 5, fontSize: 10, color: '#0f172a', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {f.v}<div style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6' }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '5px 10px', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#fff', textAlign: 'center', boxShadow: '0 4px 12px rgba(139,92,246,.3)' }}>Generate my roadmap</div>
        </div>
      ),
    },
    {
      phase: 'EXECUTE', timeframe: 'Days 2 – 29  ·  Daily',
      headline: 'Open it every morning. Do the three things. Close the tab.',
      body: 'Your 1-3 non-negotiable tasks are pre-loaded. Log P&L, move leads, track your streak. The system penalises inaction — and rewards consistency.',
      Icon: Zap, accent: '#7c3aed', accentBg: 'rgba(124,58,237,.07)',
      mockup: (
        <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '.1em' }}>TODAY'S TASKS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', background: 'rgba(124,58,237,.08)', borderRadius: 9999, border: '1px solid rgba(124,58,237,.2)' }}>
              <Flame size={9} color="#7c3aed" />
              <span style={{ fontSize: 8, fontWeight: 800, color: '#7c3aed' }}>14 day streak</span>
            </div>
          </div>
          {[{ done: true, t: 'Send 15 cold DMs to e-com founders', pts: '+50' }, { done: true, t: 'Follow up: Alex R. (warm lead, 7 days)', pts: '+30' }, { done: false, t: "Log today's P&L entry", pts: '+20' }].map((tk, i) => (
            <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'center', padding: '5px 7px', background: '#fff', borderRadius: 6, border: `1px solid ${tk.done ? 'rgba(139,92,246,.15)' : 'rgba(0,0,0,.07)'}`, marginBottom: 5 }}>
              <div style={{ width: 13, height: 13, borderRadius: 4, background: tk.done ? '#8b5cf6' : 'transparent', border: tk.done ? 'none' : '1.5px solid #cbd5e1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: tk.done ? '0 0 8px rgba(139,92,246,.5)' : 'none' }}>
                {tk.done && <Check size={7} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 8.5, color: tk.done ? '#94a3b8' : '#0f172a', textDecoration: tk.done ? 'line-through' : 'none', flex: 1, lineHeight: 1.3 }}>{tk.t}</span>
              <span style={{ fontSize: 8, color: '#8b5cf6', fontWeight: 700, flexShrink: 0 }}>{tk.pts}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      phase: 'WIN', timeframe: 'Day 30  ·  First close',
      headline: 'Pipeline goes green. AI writes the closing email.',
      body: 'Your AI Coach has been watching every move. When the moment is right, it hands you the exact script to close — and moves the lead to CLOSED for you.',
      Icon: Trophy, accent: '#6d28d9', accentBg: 'rgba(109,40,217,.07)',
      mockup: (
        <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid rgba(0,0,0,.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, letterSpacing: '.1em' }}>PIPELINE</div>
            <div style={{ fontSize: 8.5, color: '#8b5cf6', fontWeight: 700 }}>Deal closed</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 8 }}>
            {[{ s: 'CONTACTED', c: '#94a3b8', ls: ['Maria C.', 'James T.'] }, { s: 'MEETING', c: '#f59e0b', ls: ['Priya K.'] }, { s: 'CLOSED', c: '#8b5cf6', ls: ['Alex R. — $1,500'] }].map(col => (
              <div key={col.s}><div style={{ fontSize: 7, fontWeight: 700, color: col.c, letterSpacing: '.06em', marginBottom: 4 }}>{col.s}</div>{col.ls.map(l => <div key={l} style={{ padding: '4px 6px', background: col.s === 'CLOSED' ? 'rgba(139,92,246,.08)' : '#fff', border: `1px solid ${col.s === 'CLOSED' ? 'rgba(139,92,246,.25)' : 'rgba(0,0,0,.08)'}`, borderRadius: 4, fontSize: 7.5, color: col.s === 'CLOSED' ? '#7c3aed' : '#64748b', marginBottom: 3, fontWeight: col.s === 'CLOSED' ? 700 : 400 }}>{l}</div>)}</div>
            ))}
          </div>
          <div style={{ padding: '5px 7px', background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.18)', borderRadius: 6 }}>
            <div style={{ fontSize: 7.5, fontWeight: 800, color: '#8b5cf6', letterSpacing: '.06em', marginBottom: 2 }}>AI CO-PILOT</div>
            <div style={{ fontSize: 8, color: '#475569', lineHeight: 1.4 }}>Alex is ready. I drafted your closing email — send it now.</div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto' }}>
      {/* Phase rail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 52, position: 'relative' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '55%', height: 1, background: 'linear-gradient(90deg,rgba(139,92,246,.2),rgba(139,92,246,.55),rgba(109,40,217,.2))' }} />
        {PHASES.map((p) => (
          <div key={p.phase} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: `2px solid ${p.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 4px rgba(139,92,246,.08),0 4px 16px rgba(0,0,0,.1)` }}>
              <p.Icon size={16} color={p.accent} />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, fontWeight: 800, color: p.accent, letterSpacing: '.12em' }}>{p.phase}</div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{p.timeframe}</div>
          </div>
        ))}
      </div>

      {/* Panels */}
      <div className="lp-exec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
        {PHASES.map((p, i) => (
          <TiltCard key={p.phase} style={{ borderRadius: i === 0 ? '18px 0 0 18px' : i === 2 ? '0 18px 18px 0' : '0', overflow: 'hidden' }}>
            <div className={`lp-reveal lp-d${i + 1}`} style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,.07)', borderBottom: '1px solid rgba(0,0,0,.07)', borderLeft: i === 0 ? '1px solid rgba(0,0,0,.07)' : '1px solid rgba(139,92,246,.12)', borderRight: i === 2 ? '1px solid rgba(0,0,0,.07)' : 'none', padding: '28px 26px 32px', position: 'relative', overflow: 'hidden', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${p.accent},${p.accent}88)` }} />
              <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle,${p.accentBg},transparent)`, borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ marginBottom: 22, position: 'relative', zIndex: 1 }}>{p.mockup}</div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: 10, letterSpacing: '-.02em' }}>{p.headline}</h3>
                <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{p.body}</p>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

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
    { name: 'Priya S.', role: 'Freelance Dev', avatar: 'PS', quote: "I used to open 12 different tabs every morning. Now I open prspectve, see my tasks, and get to work. Absolutely game-changing." },
    { name: 'Jake L.', role: 'AI Agency Owner', avatar: 'JL', quote: 'The pipeline board alone is worth it. I can see exactly where every prospect is. Closed 3 clients in my first 30 days.' },
  ]

  return (
    <div style={{ background: '#ffffff', color: '#0f172a', minHeight: '100vh', overflowX: 'hidden' }}>

      <style>{`
        /* ── Keyframes ── */
        @keyframes lp-orb{0%,100%{transform:scale(1) translate(0,0)}50%{transform:scale(1.22) translate(20px,-24px)}}
        @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes lp-float3d{0%,100%{transform:perspective(1300px) rotateX(6deg) rotateY(-14deg) rotateZ(.8deg) translateY(0)}50%{transform:perspective(1300px) rotateX(6deg) rotateY(-14deg) rotateZ(.8deg) translateY(-20px)}}
        @keyframes lp-rise{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lp-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.4}}
        @keyframes lp-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes lp-aurora{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}
        @keyframes lp-glow-ring{0%,100%{opacity:.55}50%{opacity:1}}

        /* ── Button (UIVerse by Creatlydev) ── */
        .prsp-btn{
          line-height:1;background:linear-gradient(90deg,rgba(77,54,208,1) 0%,rgba(132,116,254,1) 100%);
          cursor:pointer;display:inline-flex;align-items:center;gap:.4em;
          padding:.72em .95em;padding-right:1.2em;
          color:#fff;border:1px solid transparent;font-weight:700;border-radius:2em;
          font-size:1rem;box-shadow:0 0.7em 1.5em -0.5em hsla(249,62%,51%,.74);
          transition:border-color .2s,transform .3s,box-shadow .2s;
          -webkit-tap-highlight-color:transparent;-webkit-appearance:none;
        }
        .prsp-btn-lg{font-size:1.13rem;padding:.85em 1.1em;padding-right:1.4em;}
        .prsp-btn:hover{border-color:#f4f5f2;}
        .prsp-btn:active{transform:scale(.98);box-shadow:0 .5em 1.5em -.5em hsla(249,62%,51%,.74);}
        .prsp-btn-icon{width:1.4em;height:1.4em;flex-shrink:0;}
        .prsp-btn-lg .prsp-btn-icon{width:1.55em;height:1.55em;}
        .prsp-btn-label{white-space:nowrap;}

        /* ── Scroll reveal ── */
        .lp-reveal{opacity:0;transform:translateY(28px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
        .lp-reveal.lp-in{opacity:1;transform:translateY(0)}
        .lp-d1{transition-delay:.1s}.lp-d2{transition-delay:.22s}.lp-d3{transition-delay:.34s}.lp-d4{transition-delay:.46s}
        .lp-hero-a{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .1s both}
        .lp-hero-b{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .22s both}
        .lp-hero-c{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .36s both}
        .lp-hero-d{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .5s both}
        .lp-hero-e{animation:lp-rise .9s cubic-bezier(.16,1,.3,1) .56s both}

        /* ── Misc interactive ── */
        .lp-navlink{color:#64748b;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
        .lp-navlink:hover{color:#0f172a}
        .lp-hub-card{transition:transform .22s cubic-bezier(.16,1,.3,1),box-shadow .22s ease,border-color .22s ease}
        .lp-hub-card:hover{transform:translateY(-5px) scale(1.02);border-color:rgba(139,92,246,.25)!important;box-shadow:0 20px 40px rgba(0,0,0,.1),0 0 16px rgba(139,92,246,.08)!important}
        .lp-tcard:hover{border-color:rgba(139,92,246,.25)!important;transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,.12),0 0 20px rgba(139,92,246,.07)!important}

        /* ── Section glass backgrounds (show Three.js) ── */
        .lp-glass-section{background:rgba(248,250,252,0.78)!important;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}

        /* ── Responsive ── */
        .lp-hero-dash{display:flex}
        .lp-feat-hub-wrap{display:block}
        .lp-feat-grid-wrap{display:none}
        @media(max-width:1023px){
          .lp-nav-links{display:none!important}
          .lp-hero-grid{grid-template-columns:1fr!important;gap:48px!important;text-align:center}
          .lp-hero-dash{display:none!important}
          .lp-hero-btns{justify-content:center!important;flex-wrap:wrap}
          .lp-hero-badges{justify-content:center!important}
          .lp-hero-h1{font-size:48px!important}
          .lp-preview-grid{grid-template-columns:1fr!important}
          .lp-feat-hub-wrap{display:none!important}
          .lp-feat-grid-wrap{display:grid!important;grid-template-columns:repeat(2,1fr);gap:18px}
          .lp-ai-inner{grid-template-columns:1fr!important;padding:40px 32px!important;gap:36px!important}
          .lp-test-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-footer-inner{flex-direction:column!important;gap:16px!important;text-align:center!important}
          .lp-exec-grid{grid-template-columns:1fr!important}
          .lp-exec-grid > *{border-radius:16px!important;margin-bottom:16px}
        }
        @media(max-width:639px){
          .lp-sign-in-btn{display:none!important}
          .lp-hero-h1{font-size:36px!important;letter-spacing:-.025em!important}
          .lp-hero-p{font-size:16px!important}
          .lp-feat-section{padding:70px 20px!important}
          .lp-feat-grid-wrap{grid-template-columns:1fr!important}
          .lp-how-section{padding:64px 20px!important}
          .lp-ai-section{padding:64px 20px!important}
          .lp-ai-inner{padding:28px 20px!important}
          .lp-test-section{padding:64px 20px!important}
          .lp-test-grid{grid-template-columns:1fr!important}
          .lp-cta-section{padding:90px 20px!important}
          .lp-cta-h2{font-size:34px!important}
          .lp-footer{padding:28px 20px!important}
        }
      `}</style>

      {/* Three.js 3D background */}
      <ThreeBackground />

      {/* Soft gradient overlay — keeps text readable */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(237,233,254,.45) 0%,rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 64, padding: '0 28px', display: 'flex', alignItems: 'center', background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent', backdropFilter: scrolled ? 'blur(24px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none', borderBottom: scrolled ? '1px solid rgba(0,0,0,.08)' : '1px solid transparent', transition: 'all .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1 }}>
          <LogoMark size={34} />
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-.02em', color: '#0f172a' }}>prspectve</span>
          <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(139,92,246,.1)', borderRadius: 5, color: '#8b5cf6', fontWeight: 700, letterSpacing: '.05em', border: '1px solid rgba(139,92,246,.2)' }}>BETA</span>
        </div>
        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Features', 'How it works', 'Reviews'].map((t, i) => (
            <a key={t} href={['#features', '#how', '#reviews'][i]} className="lp-navlink">{t}</a>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center' }}>
          {isLoggedIn ? (
            <GlowButton href="/dashboard">Go to Dashboard</GlowButton>
          ) : (
            <>
              <Link href="/login" className="lp-sign-in-btn" style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', color: '#475569', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(0,0,0,.1)', transition: 'all .2s' }}>Sign in</Link>
              <GlowButton href="/signup">Get started</GlowButton>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '130px 28px 90px', overflow: 'hidden' }}>

        {/* Constellation canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

        {/* Aurora blobs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: 'radial-gradient(circle,rgba(196,167,255,.2) 0%,rgba(167,139,250,.07) 40%,transparent 68%)', top: -280, right: -240, animation: 'lp-aurora 14s ease-in-out infinite', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.1) 0%,transparent 68%)', bottom: -200, left: -180, animation: 'lp-aurora 18s ease-in-out infinite 3s', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(221,214,254,.15) 0%,transparent 68%)', top: '18%', left: '16%', animation: 'lp-aurora 12s ease-in-out infinite 5s', filter: 'blur(3px)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(139,92,246,.1) 1px,transparent 1px)', backgroundSize: '36px 36px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)' }} />
        </div>

        <div className="lp-hero-grid" style={{ maxWidth: 1220, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          {/* Left copy */}
          <div>
            <div className="lp-hero-a" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.22)', borderRadius: 9999, marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6', display: 'block', animation: 'lp-pulse 2.2s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6' }}>Now FREE in beta</span>
            </div>
            <h1 className="lp-hero-b lp-hero-h1" style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.04, marginBottom: 22, letterSpacing: '-.04em', color: '#0f172a' }}>
              The performance OS<br />
              <span style={{ background: 'linear-gradient(130deg,#6d28d9 0%,#8b5cf6 45%,#a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                built for founders.
              </span>
            </h1>
            <p className="lp-hero-c lp-hero-p" style={{ fontSize: 17, lineHeight: 1.75, color: '#64748b', marginBottom: 36, maxWidth: 440 }}>
              Track P&L, revenue, clients, and tasks. Manage your pipeline. Get AI-coached to scale — all in one ruthlessly focused dashboard.
            </p>
            <div className="lp-hero-d lp-hero-btns" style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 24 }}>
              {isLoggedIn ? (
                <GlowButton href="/dashboard" size="lg">Go to Dashboard</GlowButton>
              ) : (
                <>
                  <GlowButton href="/signup" size="lg">Start for free</GlowButton>
                  <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '15px 28px', borderRadius: 12, background: 'rgba(255,255,255,.7)', border: '1px solid rgba(0,0,0,.1)', color: '#475569', fontSize: 16, fontWeight: 600, textDecoration: 'none', transition: 'all .2s', backdropFilter: 'blur(8px)' }}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <div className="lp-hero-d lp-hero-badges" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 18, color: '#94a3b8', fontSize: 13 }}>
              {['Free forever plan', '30-day roadmap included', 'No credit card'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={12} color="#8b5cf6" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 3D dashboard + chips */}
          <div className="lp-hero-e lp-hero-dash" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>

            {/* Purple glow ring behind dashboard */}
            <div style={{ position: 'absolute', width: 560, height: 360, borderRadius: 24, background: 'transparent', border: '1px solid rgba(139,92,246,.35)', boxShadow: '0 0 0 8px rgba(139,92,246,.07), 0 0 0 20px rgba(139,92,246,.04), 0 0 80px rgba(139,92,246,.18), 0 0 140px rgba(139,92,246,.1)', animation: 'lp-glow-ring 4s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', width: 500, height: 300, background: 'radial-gradient(ellipse,rgba(139,92,246,.2),transparent 70%)', borderRadius: '50%', filter: 'blur(32px)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Floating chips — dark theme matching dashboard */}
            <div style={{ position: 'absolute', top: '6%', left: '-4%', zIndex: 20, animation: 'lp-float 5s ease-in-out infinite .5s' }}>
              <div style={{ padding: '8px 14px', background: 'rgba(8,11,14,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,.28)', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(139,92,246,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,.25)' }}><Activity size={14} color="#8b5cf6" /></div>
                <div><div style={{ fontSize: 14, fontWeight: 800, color: '#f4f6f4', lineHeight: 1 }}>+32%</div><div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>Revenue MoM</div></div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '12%', right: '-6%', zIndex: 20, animation: 'lp-float 6s ease-in-out infinite 1.2s' }}>
              <div style={{ padding: '8px 14px', background: 'rgba(8,11,14,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,.25)', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(139,92,246,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,.22)' }}><Brain size={14} color="#8b5cf6" /></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f4f6f4', lineHeight: 1 }}>AI Co-pilot</div>
                  <div style={{ fontSize: 10, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,.8)' }} /><span style={{ color: '#22c55e', fontWeight: 600 }}>Active now</span></div>
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '42%', right: '-8%', zIndex: 20, animation: 'lp-float 7s ease-in-out infinite 2s' }}>
              <div style={{ padding: '8px 14px', background: 'rgba(8,11,14,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,.22)', borderRadius: 12, boxShadow: '0 16px 40px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flame size={18} color="#8b5cf6" />
                <div><div style={{ fontSize: 14, fontWeight: 800, color: '#f4f6f4', lineHeight: 1 }}>14 day</div><div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>Streak</div></div>
              </div>
            </div>

            <div style={{ animation: 'lp-float3d 7s ease-in-out infinite', transformOrigin: 'center center', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 60px 80px rgba(0,0,0,.22)) drop-shadow(0 0 80px rgba(139,92,246,.18))' }}>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(0,0,0,.06)', borderBottom: '1px solid rgba(0,0,0,.06)', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(12px)', padding: '22px 28px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[{ Icon: Shield, label: 'SOC 2 compliant infrastructure' }, { Icon: Users, label: '2,400+ founders onboarded' }, { Icon: Clock, label: 'Average setup: under 3 min' }, { Icon: Star, label: '4.9 / 5.0 average rating' }].map(({ Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13, fontWeight: 600 }}>
              <Icon size={14} color="#8b5cf6" />{label}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE PREVIEW ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '90px 28px', background: '#ffffff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 14 }}>What you get</div>
            <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 14, color: '#0f172a' }}>One system. Replace them all.</h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>Most founders track P&L in spreadsheets, leads in notes, and get advice from YouTube. prspectve replaces all of it.</p>
          </div>
          <div className="lp-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {/* P&L Card */}
            <TiltCard style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div className="lp-reveal lp-d1" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 18, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.07)', transition: 'border-color .3s,box-shadow .3s' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle,rgba(139,92,246,.06),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(139,92,246,.08)', color: '#8b5cf6', borderRadius: 9999, letterSpacing: '.05em' }}>P&L TRACKING</span>
                <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ fontSize: 7.5, color: '#94a3b8', fontWeight: 700, letterSpacing: '.08em', marginBottom: 10 }}>THIS PERIOD</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[{ l: 'REVENUE', v: '$8,400', hi: false }, { l: 'EXPENSES', v: '$2,100', hi: false }, { l: 'PROFIT', v: '$6,300', hi: true }, { l: 'MARGIN', v: '75%', hi: true }].map(m => (
                      <div key={m.l}><div style={{ fontSize: 7.5, color: '#94a3b8', fontWeight: 700, letterSpacing: '.08em', marginBottom: 2 }}>{m.l}</div><div style={{ fontSize: 16, fontWeight: 800, color: m.hi ? '#8b5cf6' : '#0f172a', lineHeight: 1 }}>{m.v}</div></div>
                    ))}
                  </div>
                  <svg width="100%" height="24" viewBox="0 0 160 24" preserveAspectRatio="none" style={{ marginTop: 12, display: 'block' }}>
                    <defs><linearGradient id="fp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0,22C20,20 40,18 60,13C80,8 100,6 120,4C140,2 152,1 160,0.5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M0,22C20,20 40,18 60,13C80,8 100,6 120,4C140,2 152,1 160,0.5 L160,24 L0,24Z" fill="url(#fp1)" />
                  </svg>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 7, color: '#0f172a', letterSpacing: '-.01em' }}>Know your numbers.</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>Log revenue and expenses. See your P&L, margin, and growth trend — no spreadsheets, no formulas.</p>
              </div>
            </TiltCard>
            {/* Pipeline Card */}
            <TiltCard style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div className="lp-reveal lp-d2" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 18, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.07)', transition: 'border-color .3s,box-shadow .3s' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle,rgba(139,92,246,.06),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(139,92,246,.08)', color: '#8b5cf6', borderRadius: 9999, letterSpacing: '.05em' }}>PIPELINE</span>
                <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                    {[{ s: 'CONTACTED', c: '#94a3b8', ls: ['Alex R.', 'Maria C.'] }, { s: 'MEETING', c: '#f59e0b', ls: ['James T.'] }, { s: 'CLOSED', c: '#8b5cf6', ls: ['Sarah K.'] }].map(col => (
                      <div key={col.s}><div style={{ fontSize: 7.5, fontWeight: 700, color: col.c, letterSpacing: '.06em', marginBottom: 5 }}>{col.s}</div>{col.ls.map(l => <div key={l} style={{ padding: '4px 7px', background: '#ffffff', border: '1px solid rgba(0,0,0,.08)', borderRadius: 4, fontSize: 8, color: '#64748b', marginBottom: 3 }}>{l}</div>)}</div>
                    ))}
                  </div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 7, color: '#0f172a', letterSpacing: '-.01em' }}>Never lose a warm lead.</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>Drag leads from cold to closed. See exactly where every deal stands and which need attention today.</p>
              </div>
            </TiltCard>
            {/* AI Coach Card */}
            <TiltCard style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div className="lp-reveal lp-d3" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 18, padding: '24px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.07)', transition: 'border-color .3s,box-shadow .3s' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'radial-gradient(circle,rgba(139,92,246,.06),transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(139,92,246,.08)', color: '#8b5cf6', borderRadius: 9999, letterSpacing: '.05em' }}>AI CO-PILOT</span>
                <div style={{ marginTop: 16, padding: '12px 14px', background: '#f8fafc', border: '1px solid rgba(0,0,0,.06)', borderRadius: 12, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[{ ai: true, m: '3 leads stuck 8+ days. Added follow-up tasks for each.' }, { ai: false, m: 'Best move this week?' }, { ai: true, m: 'Close Alex R. — warm 10 days. Script drafted.' }].map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.ai ? 'flex-start' : 'flex-end' }}>
                      <div style={{ maxWidth: '88%', padding: '7px 10px', borderRadius: msg.ai ? '8px 8px 8px 2px' : '8px 8px 2px 8px', background: msg.ai ? '#ffffff' : 'rgba(139,92,246,.08)', border: `1px solid ${msg.ai ? 'rgba(0,0,0,.07)' : 'rgba(139,92,246,.18)'}`, color: msg.ai ? '#475569' : '#6d28d9', fontSize: 9, lineHeight: 1.55 }}>
                        {msg.ai && <div style={{ fontSize: 7.5, fontWeight: 800, color: '#8b5cf6', marginBottom: 2, letterSpacing: '.06em' }}>AI CO-PILOT</div>}{msg.m}
                      </div>
                    </div>
                  ))}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 7, color: '#0f172a', letterSpacing: '-.01em' }}>AI that acts, not advises.</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0 }}>Reads your revenue, pipeline, and tasks — then executes. Writes scripts, adds tasks, tells you what to do next.</p>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* ── FEATURES HUB — glass so Three.js shows through ── */}
      <section id="features" className="lp-feat-section lp-glass-section" style={{ position: 'relative', zIndex: 1, padding: '100px 28px', borderTop: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 16 }}>One dashboard</div>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1.08, marginBottom: 16, color: '#0f172a' }}>Everything you need.<br />Nothing you don't.</h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Stop juggling 12 different tabs. prspectve connects daily tasks, P&L, pipeline, and AI coaching into one ruthlessly focused dashboard.</p>
          </div>
          <div className="lp-feat-hub-wrap"><FeaturesHub /></div>
          <div className="lp-feat-grid-wrap">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`lp-reveal lp-d${(i % 2) + 1}`} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, padding: '24px 20px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><f.Icon size={19} color="#8b5cf6" /></div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(139,92,246,.08)', color: '#8b5cf6', borderRadius: 9999, letterSpacing: '.05em' }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-.01em', color: '#0f172a', lineHeight: 1.3 }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXECUTION TRACK ── */}
      <section id="how" className="lp-how-section" style={{ position: 'relative', zIndex: 1, padding: '100px 28px', background: '#ffffff', borderTop: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 16 }}>The execution track</div>
            <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-.035em', color: '#0f172a', marginBottom: 14 }}>From zero to your first client.</h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>Not a funnel. Not a course. A daily operating system that drags you to the finish line — even on days you don't feel like it.</p>
          </div>
          <ExecutionTrack />
        </div>
      </section>

      {/* ── AI COACH — glass so Three.js shows through ── */}
      <section className="lp-ai-section lp-glass-section" style={{ position: 'relative', zIndex: 1, padding: '100px 28px', borderTop: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-ai-inner" style={{ background: 'rgba(255,255,255,.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,.12)', borderRadius: 22, padding: '60px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 40px rgba(139,92,246,.06), 0 0 0 1px rgba(255,255,255,.6)' }}>
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle,rgba(139,92,246,.05),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div className="lp-reveal">
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 18 }}>AI Co-pilot</div>
              <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-.035em', lineHeight: 1.1, marginBottom: 18, color: '#0f172a' }}>Your coach gives you<br />brutal, honest feedback.</h2>
              <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>Paste a prospect's objection. Get a word-for-word rebuttal in seconds. Pre-call roleplay. Post-call debrief. The AI never sugarcoats — and it controls your entire workspace.</p>
              {['Handle any objection with a word-for-word script', 'Full read/write access to your entire dashboard', 'Creates and manages your to-do list automatically', 'Reads your pipeline and suggests next actions', 'Analyzes your P&L and revenue trends in real-time', 'Truly hands-off — just ask and it executes'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={10} color="#8b5cf6" /></div>
                  <span style={{ fontSize: 14, color: '#475569' }}>{t}</span>
                </div>
              ))}
            </div>
            {/* Chat mockup */}
            <div className="lp-reveal lp-d2" style={{ background: 'rgba(8,11,14,.97)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,.04),0 32px 64px rgba(0,0,0,.2),0 0 60px rgba(139,92,246,.08)', fontFamily: 'system-ui,sans-serif' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(139,92,246,.5)' }}><Brain size={15} color="#fff" /></div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f6f4' }}>prspectve AI Co-pilot</div>
                  <div style={{ fontSize: 10, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,.9)' }} />Online · Full dashboard access</div>
                </div>
              </div>
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { ai: true, m: "I reviewed your pipeline. 3 leads stuck in 'Contacted' for 5+ days. Want me to write follow-up scripts for all of them?" },
                  { ai: false, m: 'Yes, also they said "not interested" — what do I say?' },
                  { ai: true, m: '"Not interested" = pain not established. Reply: \'Totally get it. Quick question: what\'s your biggest challenge getting clients?\' I\'ve added 3 follow-up tasks to your list.' },
                  { ai: false, m: 'What about my P&L, am I on track?' },
                  { ai: true, m: "You're at $0 revenue on Day 12. Need 2 more meetings booked this week. I've added 'Book 2 meetings' as today's priority task. Let's go." },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.ai ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '85%', padding: '10px 13px', borderRadius: m.ai ? '12px 12px 12px 3px' : '12px 12px 3px 12px', background: m.ai ? 'rgba(255,255,255,.05)' : 'rgba(139,92,246,.14)', border: `1px solid ${m.ai ? 'rgba(255,255,255,.07)' : 'rgba(139,92,246,.24)'}`, color: m.ai ? '#94a3b8' : '#c4b5fd', fontSize: 12, lineHeight: 1.6 }}>
                      {m.ai && <div style={{ fontSize: 9, fontWeight: 800, color: '#8b5cf6', marginBottom: 4, letterSpacing: '.08em' }}>AI CO-PILOT</div>}{m.m}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 9 }}>
                <div style={{ flex: 1, padding: '9px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, color: '#374151', fontSize: 12 }}>Ask your coach anything...</div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(139,92,246,.4)', cursor: 'pointer' }}><ArrowRight size={14} color="#fff" /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="lp-test-section" style={{ position: 'relative', zIndex: 1, padding: '90px 28px', background: '#ffffff', borderTop: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-.035em', color: '#0f172a' }}>Real founders. Real results.</h2>
          </div>
          <div className="lp-test-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <TiltCard key={t.name} style={{ borderRadius: 18, overflow: 'hidden' }}>
                <div className={`lp-reveal lp-tcard lp-d${i + 1}`} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 18, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,.06)', transition: 'all .3s' }}>
                  <div style={{ display: 'flex', marginBottom: 14 }}>
                    {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill="#8b5cf6" color="#8b5cf6" />)}
                  </div>
                  <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.75, marginBottom: 22, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{t.avatar}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.name}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{t.role}</div></div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-section" style={{ position: 'relative', zIndex: 1, padding: '130px 28px', background: 'linear-gradient(135deg,#faf7ff 0%,#f3f0ff 50%,#ede9fe 100%)', borderTop: '1px solid rgba(139,92,246,.1)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle,rgba(139,92,246,.1),transparent 68%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(139,92,246,.12) 1px,transparent 1px)', backgroundSize: '32px 32px', opacity: .5, pointerEvents: 'none', maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 100%)' }} />
        <div className="lp-reveal" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#8b5cf6', marginBottom: 20 }}>Get started today</div>
          <h2 className="lp-cta-h2" style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.04, marginBottom: 22, color: '#0f172a' }}>
            Your first client<br />
            <span style={{ background: 'linear-gradient(130deg,#6d28d9,#8b5cf6,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% auto', animation: 'lp-shimmer 4s linear infinite' }}>
              is 30 days away.
            </span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 17, marginBottom: 48, lineHeight: 1.7 }}>Stop consuming. Start executing. prspectve gives you the structure, tools, and AI coaching to land your first client — faster than you think.</p>
          <GlowButton href={isLoggedIn ? '/dashboard' : '/signup'} size="lg">
            {isLoggedIn ? 'Go to Dashboard' : 'Start for free'}
          </GlowButton>
          <div style={{ marginTop: 20, color: '#94a3b8', fontSize: 13 }}>Free to start · No credit card · Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(0,0,0,.07)', padding: '36px 28px', background: '#ffffff' }}>
        <div className="lp-footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoMark size={28} />
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: '-.02em', color: '#0f172a' }}>prspectve</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>© 2025 prspectve. Built for founders who mean business.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link href="/login" style={{ color: '#64748b', textDecoration: 'none', fontSize: 13, transition: 'color .2s' }}>Sign in</Link>
            <Link href="/signup" style={{ color: '#8b5cf6', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>Get started →</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
