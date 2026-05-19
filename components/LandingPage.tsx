'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
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

// ─── Dashboard Screenshot Mockup ──────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div style={{
      width: 700,
      borderRadius: 14,
      border: '1px solid rgba(16,185,129,0.22)',
      overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 50px 100px rgba(0,0,0,0.85), 0 0 90px rgba(16,185,129,0.14)',
      background: '#030405',
    }}>
      <Image
        src="/dashboard-preview.png"
        alt="Strata dashboard"
        width={1400}
        height={684}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        priority
      />
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

  const onCardMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateZ(12px)`
  }, [])

  const onCardLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
  }, [])

  const FEATURES = [
    { icon: <Target size={20} color="#10b981"/>, title: 'Daily Action Dashboard', desc: '1-3 non-negotiable tasks every morning. The roadmap is fixed. Your job is to execute — nothing else.', tag: 'Core' },
    { icon: <BarChart3 size={20} color="#10b981"/>, title: 'P&L Tracking', desc: 'Log revenue and expenses, see your financial trajectory at a glance. No spreadsheets, no confusion.', tag: 'Finance' },
    { icon: <Users size={20} color="#10b981"/>, title: 'Pipeline Kanban', desc: 'Lead → Contacted → Meeting → Closed. Never let a warm lead slip through the cracks again.', tag: 'Pipeline' },
    { icon: <Brain size={20} color="#10b981"/>, title: 'AI Coach', desc: 'A strict performance coach in your pocket. Objection scripts, pitch rewrites, and brutal honesty.', tag: 'AI' },
    { icon: <Flame size={20} color="#10b981"/>, title: 'Streak & Momentum', desc: 'Daily streaks, penalties for missed days, and dopamine-hit celebrations when you close a client.', tag: 'Motivation' },
    { icon: <TrendingUp size={20} color="#10b981"/>, title: 'Performance Reports', desc: 'DM rates, reply rates, pipeline velocity — data-driven insights to sharpen your outreach daily.', tag: 'Analytics' },
  ]

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
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
              <Link href="/login" style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(255,255,255,.055)', color: '#c4c9c5', fontSize: 14, fontWeight: 600, textDecoration: 'none', border: '1px solid rgba(255,255,255,.1)', transition: 'all .2s' }}>
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
        <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="lp-hero-a" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: 'rgba(16,185,129,.09)', border: '1px solid rgba(16,185,129,.26)', borderRadius: 9999, marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'block', animation: 'lp-pulse 2.2s ease-in-out infinite' }}/>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>Now in Beta · 2,400+ founders building</span>
            </div>

            <h1 className="lp-hero-b" style={{ fontSize: 62, fontWeight: 900, lineHeight: 1.04, marginBottom: 22, letterSpacing: '-0.04em' }}>
              The performance OS<br/>
              <span style={{ background: 'linear-gradient(130deg,#10b981 0%,#34d399 45%,#6ee7b7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                built for founders.
              </span>
            </h1>

            <p className="lp-hero-c" style={{ fontSize: 17, lineHeight: 1.72, color: '#a0a8a4', marginBottom: 36, maxWidth: 430 }}>
              Track your P&L, manage your pipeline, and get AI-coached from $0 to your first clients — all in one ruthlessly focused dashboard.
            </p>

            <div className="lp-hero-d" style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22 }}>
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

            <div className="lp-hero-d" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, color: '#4b5563', fontSize: 13 }}>
              {['No credit card needed', 'Free forever plan', '30-day roadmap included'].map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Check size={12} color="#10b981"/> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 3D dashboard */}
          <div className="lp-hero-e" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
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
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
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
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '110px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>Everything you need</div>
            <h2 style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 16 }}>Tools that close deals.<br/>Nothing that doesn't.</h2>
            <p style={{ color: '#6b7280', fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>No fluff. No distractions. Every feature answers one question: does this help you get clients faster?</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`lp-reveal lp-fcard lp-d${(i % 3) + 1}`}
                onMouseMove={onCardMove}
                onMouseLeave={onCardLeave}
                style={{ background: 'linear-gradient(145deg,rgba(14,17,20,.99),rgba(5,6,8,.99))', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 28, cursor: 'default', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'radial-gradient(circle,rgba(16,185,129,.09),transparent)', borderRadius: '50%', pointerEvents: 'none' }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,.09)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', background: 'rgba(16,185,129,.07)', color: '#10b981', borderRadius: 9999, letterSpacing: '0.06em' }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ position: 'relative', zIndex: 1, padding: '80px 28px', background: 'rgba(255,255,255,.01)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>How it works</div>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.035em' }}>Three steps to your first client.</h2>
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
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(145deg,rgba(14,17,20,.99),rgba(5,6,8,.99))', border: '1px solid rgba(16,185,129,.15)', borderRadius: 20, padding: '60px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* bg glow */}
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle,rgba(16,185,129,.1),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}/>
            <div className="lp-reveal">
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 18 }}>AI Coach</div>
              <h2 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 18 }}>Your coach gives you<br/>brutal, honest feedback.</h2>
              <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }}>Paste a prospect's objection. Get a word-for-word rebuttal in seconds. Pre-call roleplay. Post-call debrief. The AI never sugarcoats.</p>
              {['Handle any objection with a script', 'Rewrite your pitch in real-time', 'Pre-call prep & sales roleplay', 'Tough love when you skip days'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <Check size={14} color="#10b981"/>
                  <span style={{ fontSize: 14, color: '#c4c9c5' }}>{t}</span>
                </div>
              ))}
            </div>
            {/* AI chat mockup */}
            <div className="lp-reveal lp-d2" style={{ background: 'rgba(3,4,5,.9)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20, fontFamily: 'system-ui,sans-serif', fontSize: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Coach — Strata</div>
              {[
                { from: 'user', msg: 'They said they\'re "not interested" after I sent my pitch. What do I do?' },
                { from: 'ai', msg: '"Not interested" just means you haven\'t built enough pain yet. Reply: \'Totally understand — most founders I work with said the same before seeing [specific result]. Can I ask, what\'s your biggest challenge with [their niche] right now?\' Keep them talking.' },
                { from: 'user', msg: 'What if they still don\'t reply?' },
                { from: 'ai', msg: 'Follow up 3x. Most deals close on follow-up 4-6. Silence is not rejection. Ghosting is the norm. Send a breakup email on day 14 — it often triggers a response.' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                  <div style={{ maxWidth: '82%', padding: '9px 12px', borderRadius: m.from === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px', background: m.from === 'user' ? 'rgba(16,185,129,.14)' : 'rgba(255,255,255,.05)', border: `1px solid ${m.from === 'user' ? 'rgba(16,185,129,.22)' : 'rgba(255,255,255,.07)'}`, color: m.from === 'user' ? '#c4c9c5' : '#f4f6f4', fontSize: 11, lineHeight: 1.55 }}>
                    {m.from === 'ai' && <div style={{ fontSize: 9, fontWeight: 800, color: '#10b981', marginBottom: 5, letterSpacing: '0.06em' }}>STRATA AI</div>}
                    {m.msg}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: '#4b5563', fontSize: 11 }}>Ask your coach anything...</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ArrowRight size={14} color="#031008"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" style={{ position: 'relative', zIndex: 1, padding: '80px 28px', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="lp-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 16 }}>Testimonials</div>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.035em' }}>Real founders. Real results.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
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
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 28px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle,rgba(16,185,129,.13),transparent 68%)', borderRadius: '50%', pointerEvents: 'none' }}/>
        <div className="lp-reveal" style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#10b981', marginBottom: 20 }}>Get started today</div>
          <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.04, marginBottom: 20 }}>
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
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,.055)', padding: '36px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
