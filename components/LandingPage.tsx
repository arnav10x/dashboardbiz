'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Brain, BarChart3, Target, Star, Check, ArrowRight, Flame, Shield, Clock, Activity } from 'lucide-react'

// ─── Particles ────────────────────────────────────────────────────────────────

function useParticles(ref: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    let raf: number
    type P = { x:number; y:number; vx:number; vy:number; r:number; a:number; ph:number; dp:number }
    const pts: P[] = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const spawn = () => {
      pts.length = 0
      const n = Math.min(Math.floor(window.innerWidth / 16), 100)
      for (let i = 0; i < n; i++) pts.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx:(Math.random()-.5)*.28, vy:-Math.random()*.38-.05, r:Math.random()*1.4+.4, a:Math.random()*.28+.07, ph:Math.random()*Math.PI*2, dp:Math.random()*.003+.001 })
    }
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      for (let i=0;i<pts.length;i++) {
        const p = pts[i]; p.x+=p.vx; p.y+=p.vy; p.ph+=p.dp
        if (p.y<-4){p.y=canvas.height+4;p.x=Math.random()*canvas.width}
        if (p.x<-4) p.x=canvas.width+4; if (p.x>canvas.width+4) p.x=-4
        const al = p.a*(.7+.3*Math.sin(p.ph))
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(139,92,246,${al})`; ctx.fill()
        for (let j=i+1;j<pts.length;j++) {
          const q=pts[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.hypot(dx,dy)
          if (d<130) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle=`rgba(139,92,246,${(1-d/130)*.07})`; ctx.lineWidth=.6; ctx.stroke() }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    resize(); spawn(); draw()
    window.addEventListener('resize',()=>{resize();spawn()})
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  }, [ref])
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting){e.target.classList.add('lp-in');obs.unobserve(e.target)} }),
      { threshold:.06, rootMargin:'0px 0px -30px 0px' }
    )
    document.querySelectorAll('.lp-reveal').forEach(el=>obs.observe(el))
    return ()=>obs.disconnect()
  },[])
}

// ─── 3D Tilt on hover ─────────────────────────────────────────────────────────

function use3DTilt(str=10) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const el=ref.current; if (!el) return
    const mv=(e:MouseEvent)=>{
      const r=el.getBoundingClientRect()
      const x=((e.clientX-r.left)/r.width-.5)*str
      const y=((e.clientY-r.top)/r.height-.5)*-str
      el.style.transform=`perspective(700px) rotateY(${x}deg) rotateX(${y}deg) scale(1.025)`
      el.style.transition='transform .05s linear'
    }
    const lv=()=>{ el.style.transform='perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)'; el.style.transition='transform .5s cubic-bezier(.34,1.56,.64,1)' }
    el.addEventListener('mousemove',mv); el.addEventListener('mouseleave',lv)
    return ()=>{ el.removeEventListener('mousemove',mv); el.removeEventListener('mouseleave',lv) }
  },[str])
  return ref
}

// ─── Logo Mark ────────────────────────────────────────────────────────────────

function LogoMark({size=34}:{size?:number}) {
  const [err,setErr]=useState(false)
  const r=Math.round(size*.22)
  if (err) return (
    <div style={{width:size,height:size,borderRadius:r,background:'linear-gradient(135deg,#8B5CF6,#6D28D9)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
      <span style={{color:'#fff',fontWeight:900,fontSize:Math.round(size*.55),fontFamily:'system-ui',lineHeight:1,letterSpacing:'-0.04em'}}>P</span>
    </div>
  )
  return <img src="/logo.png" alt="prspectve" width={size} height={size} style={{display:'block',flexShrink:0,borderRadius:r}} onError={()=>setErr(true)}/>
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div style={{width:680,borderRadius:16,border:'1px solid rgba(139,92,246,0.32)',overflow:'hidden',boxShadow:'0 0 0 1px rgba(255,255,255,.06),0 60px 120px rgba(0,0,0,.55),0 0 100px rgba(139,92,246,.18),inset 0 1px 0 rgba(255,255,255,.08)',background:'#080b0d',fontFamily:'system-ui,sans-serif',fontSize:11,position:'relative'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(139,92,246,.08) 0%,transparent 60%)',pointerEvents:'none',zIndex:1}}/>

      {/* Titlebar */}
      <div style={{background:'#0a0d11',borderBottom:'1px solid rgba(255,255,255,.055)',padding:'9px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',zIndex:2}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{display:'flex',gap:5}}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}</div>
          <div style={{width:1,height:14,background:'rgba(255,255,255,.08)',margin:'0 4px'}}/>
          <LogoMark size={20}/><span style={{fontWeight:800,fontSize:12,color:'#f4f6f4'}}>prspectve</span>
        </div>
        <span style={{fontSize:9,color:'#374151'}}>JUNE 2026  •  MON</span>
        <div style={{padding:'4px 10px',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',borderRadius:6,fontSize:10,fontWeight:700,color:'#fff',boxShadow:'0 0 14px rgba(139,92,246,.5)'}}>+ Add data</div>
      </div>

      {/* Body */}
      <div style={{display:'flex',height:368}}>
        {/* Sidebar */}
        <div style={{width:108,background:'#060809',borderRight:'1px solid rgba(255,255,255,.04)',padding:'10px 0',flexShrink:0}}>
          {[{l:'Overview',a:true},{l:'Tasks',a:false},{l:'Pipeline',a:false},{l:'Calendar',a:false}].map(item=>(
            <div key={item.l} style={{padding:'6px 12px',display:'flex',alignItems:'center',gap:7,background:item.a?'rgba(139,92,246,.12)':'transparent',borderRight:item.a?'2px solid #8b5cf6':'2px solid transparent'}}>
              <div style={{width:12,height:12,borderRadius:3,background:item.a?'#8b5cf6':'rgba(255,255,255,.08)',boxShadow:item.a?'0 0 8px rgba(139,92,246,.7)':'none'}}/>
              <span style={{fontSize:10,color:item.a?'#f4f6f4':'#374151',fontWeight:item.a?600:400}}>{item.l}</span>
            </div>
          ))}
          <div style={{padding:'7px 12px 3px',fontSize:8,color:'#2d3748',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginTop:5}}>Tools</div>
          {['AI Coach','Team','Integrations'].map(l=>(
            <div key={l} style={{padding:'5px 12px',display:'flex',alignItems:'center',gap:7}}>
              <div style={{width:12,height:12,borderRadius:3,background:'rgba(255,255,255,.05)'}}/><span style={{fontSize:10,color:'#2d3748'}}>{l}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{flex:1,padding:'11px 13px',display:'flex',flexDirection:'column',gap:8,overflowY:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontSize:9,color:'#4b5563'}}>◀</span>
            <span style={{fontSize:12,fontWeight:700,color:'#f4f6f4'}}>June 2026</span>
            <span style={{fontSize:9,color:'#4b5563'}}>▶</span>
            <div style={{padding:'2px 7px',background:'rgba(139,92,246,.12)',border:'1px solid rgba(139,92,246,.28)',borderRadius:4,fontSize:7.5,color:'#8b5cf6',fontWeight:700}}>LIVE</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
            {[{l:'REVENUE',v:'$450K',t:'+32%'},{l:'NET PROFIT',v:'$427K',t:'95% mrg'},{l:'PIPELINE',v:'12',t:'leads'},{l:'TASKS',v:'3/8',t:'today'}].map(s=>(
              <div key={s.l} style={{background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.05)',borderRadius:8,padding:'8px 9px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-8,right:-8,width:32,height:32,background:'radial-gradient(circle,rgba(139,92,246,.18),transparent)',borderRadius:'50%'}}/>
                <div style={{fontSize:7,color:'#374151',fontWeight:700,letterSpacing:'.08em',marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:15,fontWeight:800,color:'#f4f6f4',lineHeight:1,marginBottom:2}}>{s.v}</div>
                <div style={{fontSize:8,color:'#8b5cf6'}}>{s.t}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr 1fr',gap:6,flex:1,minHeight:0}}>
            <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:8,padding:'9px 11px',overflow:'hidden'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:7.5,color:'#374151',fontWeight:700,letterSpacing:'.08em'}}>REVENUE HISTORY</span>
                <span style={{fontSize:7.5,color:'#8b5cf6',fontWeight:700}}>+32%</span>
              </div>
              <div style={{fontSize:15,fontWeight:800,color:'#f4f6f4',marginBottom:7}}>$450,983</div>
              <svg width="100%" height="50" viewBox="0 0 180 50" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient>
                  <filter id="gl"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <path d="M0,46C30,46 50,44 70,40C90,36 110,24 130,12C150,2 165,0 180,0" fill="none" stroke="#8b5cf6" strokeWidth="1.5" filter="url(#gl)"/>
                <path d="M0,46C30,46 50,44 70,40C90,36 110,24 130,12C150,2 165,0 180,0 L180,50 L0,50Z" fill="url(#dlg)"/>
              </svg>
            </div>
            <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:8,padding:'9px 11px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <div style={{fontSize:7.5,color:'#374151',fontWeight:700,letterSpacing:'.08em',marginBottom:7,alignSelf:'flex-start'}}>MONTHLY TARGET</div>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="5"/>
                <circle cx="30" cy="30" r="24" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeDasharray="150.8" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 30 30)" style={{filter:'drop-shadow(0 0 5px rgba(139,92,246,.7))'}}/>
                <text x="30" y="28" textAnchor="middle" fill="#8b5cf6" fontSize="9" fontWeight="800">100%</text>
                <text x="30" y="38" textAnchor="middle" fill="#4b5563" fontSize="6.5">of goal</text>
              </svg>
              <div style={{fontSize:12,fontWeight:800,color:'#f4f6f4',marginTop:5}}>$450,983</div>
              <div style={{fontSize:7.5,color:'#8b5cf6',marginTop:1}}>Goal achieved!</div>
            </div>
            <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:8,padding:'9px 11px'}}>
              <div style={{fontSize:7.5,color:'#374151',fontWeight:700,letterSpacing:'.08em',marginBottom:6}}>TODAY'S TASKS  3/8</div>
              {[{d:true,t:'Develop lead gen strategy'},{d:true,t:'Identify potential leads'},{d:false,t:'Add first real lead'},{d:false,t:'Send 10 cold DMs'}].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:5,alignItems:'flex-start',marginBottom:5}}>
                  <div style={{width:10,height:10,borderRadius:2,marginTop:1,flexShrink:0,background:t.d?'#8b5cf6':'transparent',border:t.d?'none':'1px solid rgba(255,255,255,.1)',boxShadow:t.d?'0 0 6px rgba(139,92,246,.6)':'none'}}/>
                  <span style={{fontSize:8,color:t.d?'#374151':'#9ca3af',textDecoration:t.d?'line-through':'none',lineHeight:1.4}}>{t.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coach */}
        <div style={{width:130,background:'#060809',borderLeft:'1px solid rgba(255,255,255,.04)',padding:'11px 9px',display:'flex',flexDirection:'column',gap:7,flexShrink:0}}>
          <div style={{fontSize:10,fontWeight:700,color:'#f4f6f4',display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#8b5cf6',boxShadow:'0 0 7px rgba(139,92,246,.9)'}}/>AI Coach
          </div>
          <div style={{fontSize:8,color:'#4b5563',lineHeight:1.5}}>Pipeline empty — outreach is highest-leverage now.</div>
          <div style={{padding:'5px 6px',background:'rgba(139,92,246,.08)',border:'1px solid rgba(139,92,246,.18)',borderRadius:5}}>
            <div style={{fontSize:7.5,fontWeight:800,color:'#8b5cf6',letterSpacing:'.06em',marginBottom:2}}>PRIMARY FOCUS</div>
            <div style={{fontSize:7.5,color:'#c4c9c5',lineHeight:1.4}}>Close 2 warm leads to hit target.</div>
          </div>
          {[{n:'1',ti:'REVENUE FIX',b:"Identify 2 warm leads."},{n:'2',ti:'PIPELINE',b:'Add 5 new prospects.'}].map(it=>(
            <div key={it.n} style={{display:'flex',gap:5,alignItems:'flex-start'}}>
              <div style={{width:13,height:13,borderRadius:3,background:'rgba(139,92,246,.14)',border:'1px solid rgba(139,92,246,.22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:7.5,color:'#8b5cf6',flexShrink:0,fontWeight:700}}>{it.n}</div>
              <div><div style={{fontSize:7.5,fontWeight:700,color:'#6b7280',letterSpacing:'.06em'}}>{it.ti}</div><div style={{fontSize:7.5,color:'#4b5563',lineHeight:1.4,marginTop:1}}>{it.b}</div></div>
            </div>
          ))}
          <div style={{marginTop:'auto',display:'flex',gap:4}}>
            <div style={{flex:1,padding:'4px 6px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:5,fontSize:7.5,color:'#374151'}}>Ask anything...</div>
            <div style={{width:20,height:20,borderRadius:4,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 10px rgba(139,92,246,.5)'}}><ArrowRight size={9} color="#fff"/></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Features Hub (dark) ──────────────────────────────────────────────────────

const FEATURES = [
  { Icon: Target,     title: 'Daily Action Dashboard', desc: '1-3 non-negotiable tasks every morning. The roadmap is fixed. Your job is to execute — nothing else.',  tag: 'Core'       },
  { Icon: BarChart3,  title: 'P&L Tracking',           desc: 'Log revenue and expenses, see your financial trajectory at a glance. No spreadsheets, no confusion.',   tag: 'Finance'    },
  { Icon: Users,      title: 'Pipeline Kanban',         desc: 'Lead → Contacted → Meeting → Closed. Never let a warm lead slip through the cracks again.',             tag: 'Pipeline'   },
  { Icon: Brain,      title: 'AI Coach',                desc: 'A strict performance coach in your pocket. Objection scripts, pitch rewrites, and brutal honesty.',      tag: 'AI'         },
  { Icon: Flame,      title: 'Streak & Momentum',       desc: 'Daily streaks, penalties for missed days, and dopamine-hit celebrations when you close a client.',       tag: 'Motivation' },
  { Icon: TrendingUp, title: 'Performance Reports',     desc: 'DM rates, reply rates, pipeline velocity — data-driven insights to sharpen your outreach daily.',        tag: 'Analytics'  },
]

function FeaturesHub() {
  const [active,setActive]=useState(false)
  const ref=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const el=ref.current; if (!el) return
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setActive(true);obs.disconnect()}},{threshold:.1})
    obs.observe(el); return ()=>obs.disconnect()
  },[])

  const W=1100,H=660,HX=550,HY=330,CW=228,CH=190
  const positions=[
    {left:18,top:8,ccx:132,ccy:105},{left:436,top:8,ccx:550,ccy:105},{left:854,top:8,ccx:968,ccy:105},
    {left:18,top:462,ccx:132,ccy:557},{left:436,top:462,ccx:550,ccy:557},{left:854,top:462,ccx:968,ccy:557},
  ]

  return (
    <div ref={ref} style={{position:'relative',maxWidth:W,height:H,margin:'0 auto'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'visible'}}>
        {[120,90,62].map((r,i)=>(
          <circle key={r} cx={HX} cy={HY} r={r} fill="none" stroke={`rgba(139,92,246,${[.06,.13,.28][i]})`} strokeWidth="1" opacity={active?1:0} style={{transition:'opacity .5s ease .05s'}}/>
        ))}
        {positions.map((pos,i)=>{
          const dx=pos.ccx-HX,dy=pos.ccy-HY,len=Math.hypot(dx,dy),nx=dx/len,ny=dy/len
          const x1=HX+nx*70,y1=HY+ny*70,x2=pos.ccx-nx*16,y2=pos.ccy-ny*16
          const ll=Math.hypot(x2-x1,y2-y1)
          const d=.3+i*.055
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" strokeDasharray={ll} strokeDashoffset={active?0:ll} style={{transition:`stroke-dashoffset .75s ease ${d}s`,filter:'drop-shadow(0 0 3px rgba(139,92,246,.5))'}}/>
              <circle cx={x2} cy={y2} r={3.5} fill="#8b5cf6" opacity={active?.65:0} style={{transition:`opacity .35s ease ${d+.7}s`,filter:'drop-shadow(0 0 4px rgba(139,92,246,.8))'}}/>
            </g>
          )
        })}
      </svg>

      {/* Hub centre */}
      <div style={{position:'absolute',left:HX,top:HY,transform:active?'translate(-50%,-50%) scale(1)':'translate(-50%,-50%) scale(0)',opacity:active?1:0,transition:'opacity .5s ease,transform .65s cubic-bezier(.34,1.56,.64,1)',zIndex:10}}>
        <div style={{position:'absolute',inset:-32,borderRadius:'50%',border:'1px solid rgba(139,92,246,.14)',animation:active?'lp-orb 5s ease-in-out infinite':'none'}}/>
        <div style={{width:116,height:116,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.18) 0%,rgba(109,40,217,.07) 70%)',border:'1.5px solid rgba(139,92,246,.5)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 0 60px rgba(139,92,246,.25),0 0 120px rgba(139,92,246,.1),inset 0 1px 0 rgba(255,255,255,.08)'}}>
          <LogoMark size={42}/>
          <span style={{fontSize:9.5,fontWeight:900,color:'#8b5cf6',marginTop:5,letterSpacing:'.08em',textTransform:'uppercase'}}>prspectve</span>
        </div>
      </div>

      {FEATURES.map((f,i)=>{
        const pos=positions[i],dx=HX-pos.ccx,dy=HY-pos.ccy,delay=.08+i*.08
        return (
          <div key={f.title} style={{position:'absolute',left:pos.left,top:pos.top,opacity:active?1:0,transform:active?'translate(0,0) scale(1)':`translate(${dx}px,${dy}px) scale(0)`,transition:`opacity .55s ease ${delay}s,transform .65s cubic-bezier(.34,1.56,.64,1) ${delay}s`}}>
            <div className="lp-hub-card" style={{width:CW,background:'rgba(15,17,22,.9)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(139,92,246,.14)',borderRadius:14,padding:'20px 18px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04)'}}>
              <div style={{position:'absolute',top:-28,right:-28,width:90,height:90,background:'radial-gradient(circle,rgba(139,92,246,.08),transparent)',borderRadius:'50%',pointerEvents:'none'}}/>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:13}}>
                <div style={{width:42,height:42,background:'rgba(139,92,246,.12)',border:'1px solid rgba(139,92,246,.25)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 18px rgba(139,92,246,.15)'}}><f.Icon size={19} color="#8b5cf6"/></div>
                <span style={{fontSize:9.5,fontWeight:800,padding:'3px 9px',background:'rgba(139,92,246,.1)',color:'#8b5cf6',borderRadius:9999,letterSpacing:'.05em',border:'1px solid rgba(139,92,246,.2)'}}>{f.tag}</span>
              </div>
              <h3 style={{fontSize:14,fontWeight:700,marginBottom:7,letterSpacing:'-.01em',color:'#f4f6f4',lineHeight:1.3}}>{f.title}</h3>
              <p style={{color:'#64748b',fontSize:12,lineHeight:1.65,margin:0}}>{f.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 3D Feature Card ──────────────────────────────────────────────────────────

function TiltCard({children,style}:{children:React.ReactNode;style?:React.CSSProperties}) {
  const ref=use3DTilt(9)
  return <div ref={ref} style={{...style}}>{children}</div>
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage({isLoggedIn=false}:{isLoggedIn?:boolean}) {
  const canvasRef=useRef<HTMLCanvasElement>(null)
  const [scrolled,setScrolled]=useState(false)
  useParticles(canvasRef)
  useScrollReveal()
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>24)
    window.addEventListener('scroll',fn,{passive:true})
    return ()=>window.removeEventListener('scroll',fn)
  },[])

  const TESTIMONIALS=[
    {name:'Marcus T.',role:'SMMA Founder',avatar:'MT',quote:'Closed my first $1,500 client on Day 17. The daily tasks and AI coach removed every excuse I had. Nothing else comes close.'},
    {name:'Priya S.',role:'Freelance Dev',avatar:'PS',quote:"I used to open 12 different tabs every morning. Now I open prspectve, see my tasks, and get to work. Absolutely game-changing."},
    {name:'Jake L.',role:'AI Agency Owner',avatar:'JL',quote:'The pipeline board alone is worth it. I can see exactly where every prospect is. Closed 3 clients in my first 30 days.'},
  ]

  return (
    <div style={{background:'#030405',color:'#f4f6f4',minHeight:'100vh',overflowX:'hidden'}}>

      <style>{`
        @keyframes lp-orb{0%,100%{transform:scale(1) translate(0,0);opacity:1}50%{transform:scale(1.22) translate(20px,-24px);opacity:.6}}
        @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes lp-float3d{0%,100%{transform:perspective(1300px) rotateX(6deg) rotateY(-14deg) rotateZ(.8deg) translateY(0)}50%{transform:perspective(1300px) rotateX(6deg) rotateY(-14deg) rotateZ(.8deg) translateY(-20px)}}
        @keyframes lp-rise{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lp-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.4}}
        @keyframes lp-shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes lp-aurora{0%,100%{opacity:.7;transform:scale(1) rotate(0deg)}33%{opacity:.9;transform:scale(1.08) rotate(3deg)}66%{opacity:.6;transform:scale(.96) rotate(-2deg)}}
        @keyframes lp-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes lp-border{0%,100%{opacity:.5}50%{opacity:1}}
        .lp-reveal{opacity:0;transform:translateY(28px);transition:opacity .75s cubic-bezier(.16,1,.3,1),transform .75s cubic-bezier(.16,1,.3,1)}
        .lp-reveal.lp-in{opacity:1;transform:translateY(0)}
        .lp-d1{transition-delay:.1s}.lp-d2{transition-delay:.22s}.lp-d3{transition-delay:.34s}.lp-d4{transition-delay:.46s}
        .lp-hero-a{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .1s both}
        .lp-hero-b{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .22s both}
        .lp-hero-c{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .36s both}
        .lp-hero-d{animation:lp-rise .7s cubic-bezier(.16,1,.3,1) .5s both}
        .lp-hero-e{animation:lp-rise .9s cubic-bezier(.16,1,.3,1) .56s both}
        .lp-glow-btn{position:relative;overflow:hidden;transition:box-shadow .2s ease,transform .2s ease!important}
        .lp-glow-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15) 0%,transparent 55%);pointer-events:none}
        .lp-glow-btn:hover{box-shadow:0 0 28px rgba(139,92,246,.45),0 10px 24px rgba(139,92,246,.2)!important;transform:translateY(-2px)!important}
        .lp-navlink{color:rgba(255,255,255,.5);text-decoration:none;font-size:14px;font-weight:500;transition:color .2s}
        .lp-navlink:hover{color:#f4f6f4}
        .lp-hub-card{transition:transform .22s cubic-bezier(.16,1,.3,1),box-shadow .22s ease,border-color .22s ease}
        .lp-hub-card:hover{transform:translateY(-5px) scale(1.02);border-color:rgba(139,92,246,.35)!important;box-shadow:0 24px 48px rgba(0,0,0,.5),0 0 20px rgba(139,92,246,.12)!important}
        .lp-tcard:hover{border-color:rgba(139,92,246,.3)!important;transform:translateY(-4px);box-shadow:0 24px 48px rgba(0,0,0,.4),0 0 20px rgba(139,92,246,.1)!important}
        /* Responsive */
        .lp-hero-dash{display:flex}
        .lp-feat-hub-wrap{display:block}
        .lp-feat-grid-wrap{display:none}
        @media(max-width:1023px){
          .lp-nav-links{display:none!important}
          .lp-hero-grid{grid-template-columns:1fr!important;gap:48px!important;text-align:center}
          .lp-hero-dash{display:none!important}
          .lp-hero-btns{justify-content:center!important}
          .lp-hero-badges{justify-content:center!important}
          .lp-hero-h1{font-size:48px!important}
          .lp-stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-preview-grid{grid-template-columns:1fr!important}
          .lp-feat-hub-wrap{display:none!important}
          .lp-feat-grid-wrap{display:grid!important;grid-template-columns:repeat(2,1fr);gap:18px}
          .lp-ai-inner{grid-template-columns:1fr!important;padding:40px 32px!important;gap:36px!important}
          .lp-test-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-footer-inner{flex-direction:column!important;gap:16px!important;text-align:center!important}
        }
        @media(max-width:639px){
          .lp-sign-in-btn{display:none!important}
          .lp-hero-h1{font-size:36px!important;letter-spacing:-.025em!important}
          .lp-hero-p{font-size:16px!important}
          .lp-hero-btns a,.lp-hero-btns div{font-size:15px!important;padding:13px 22px!important}
          .lp-stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .lp-preview-grid{grid-template-columns:1fr!important}
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

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}/>

      {/* Global bg orbs */}
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,overflow:'hidden'}}>
        <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,.09) 0%,transparent 65%)',top:-260,right:-180,animation:'lp-orb 10s ease-in-out infinite'}}/>
        <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(109,40,217,.06) 0%,transparent 65%)',bottom:'0%',left:-160,animation:'lp-orb 14s ease-in-out infinite 3s'}}/>
        <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(167,139,250,.04) 0%,transparent 65%)',top:'42%',left:'36%',animation:'lp-orb 18s ease-in-out infinite 7s'}}/>
        {/* Subtle grid */}
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,.055) 1px,transparent 1px)',backgroundSize:'32px 32px',maskImage:'radial-gradient(ellipse 100% 100% at 50% 0%,black 40%,transparent 100%)',WebkitMaskImage:'radial-gradient(ellipse 100% 100% at 50% 0%,black 40%,transparent 100%)'}}/>
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,height:64,padding:'0 28px',display:'flex',alignItems:'center',background:scrolled?'rgba(3,4,5,0.88)':'transparent',backdropFilter:scrolled?'blur(24px)':'none',WebkitBackdropFilter:scrolled?'blur(24px)':'none',borderBottom:scrolled?'1px solid rgba(255,255,255,0.07)':'1px solid transparent',transition:'all .3s ease'}}>
        <div style={{display:'flex',alignItems:'center',gap:9,flex:1}}>
          <LogoMark size={34}/>
          <span style={{fontWeight:900,fontSize:18,letterSpacing:'-.02em',color:'#f4f6f4'}}>prspectve</span>
          <span style={{fontSize:9,padding:'2px 7px',background:'rgba(139,92,246,.14)',borderRadius:5,color:'#a78bfa',fontWeight:700,letterSpacing:'.05em',border:'1px solid rgba(139,92,246,.25)'}}>BETA</span>
        </div>
        <div className="lp-nav-links" style={{display:'flex',alignItems:'center',gap:28}}>
          {['Features','How it works','Reviews'].map((t,i)=>(
            <a key={t} href={['#features','#how','#reviews'][i]} className="lp-navlink">{t}</a>
          ))}
        </div>
        <div style={{flex:1,display:'flex',justifyContent:'flex-end',gap:8}}>
          {isLoggedIn?(
            <Link href="/dashboard" className="lp-glow-btn" style={{padding:'8px 20px',borderRadius:8,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 16px rgba(139,92,246,.32)'}}>Go to Dashboard →</Link>
          ):(
            <>
              <Link href="/login" className="lp-sign-in-btn" style={{padding:'8px 18px',borderRadius:8,background:'transparent',color:'rgba(255,255,255,.55)',fontSize:14,fontWeight:600,textDecoration:'none',border:'1px solid rgba(255,255,255,.1)',transition:'all .2s'}}>Sign in</Link>
              <Link href="/signup" className="lp-glow-btn" style={{padding:'8px 20px',borderRadius:8,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontSize:14,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 16px rgba(139,92,246,.32)'}}>Get started →</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{position:'relative',zIndex:1,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'130px 28px 90px',overflow:'hidden'}}>
        {/* Aurora blobs */}
        <div style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}}>
          <div style={{position:'absolute',width:1000,height:1000,borderRadius:'50%',background:'radial-gradient(circle at 40% 40%,rgba(139,92,246,.18) 0%,rgba(109,40,217,.07) 40%,transparent 68%)',top:-350,right:-300,animation:'lp-aurora 14s ease-in-out infinite',filter:'blur(2px)'}}/>
          <div style={{position:'absolute',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle at 55% 55%,rgba(139,92,246,.12) 0%,rgba(109,40,217,.05) 45%,transparent 68%)',bottom:-250,left:-220,animation:'lp-aurora 18s ease-in-out infinite 2s',filter:'blur(2px)'}}/>
          <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(167,139,250,.1) 0%,transparent 68%)',top:'15%',left:'18%',animation:'lp-aurora 13s ease-in-out infinite 4s',filter:'blur(3px)'}}/>
          {/* Dot mesh */}
          <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(139,92,246,.13) 1px,transparent 1px)',backgroundSize:'36px 36px',maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)',WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)'}}/>
          {/* Top scan line */}
          <div style={{position:'absolute',left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(139,92,246,.4),transparent)',top:0,animation:'lp-scan 8s linear infinite',opacity:.4}}/>
        </div>

        <div className="lp-hero-grid" style={{maxWidth:1220,width:'100%',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>
          {/* Left copy */}
          <div>
            <div className="lp-hero-a" style={{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 14px',background:'rgba(139,92,246,.1)',border:'1px solid rgba(139,92,246,.28)',borderRadius:9999,marginBottom:28}}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#8b5cf6',display:'block',animation:'lp-pulse 2.2s ease-in-out infinite',boxShadow:'0 0 8px rgba(139,92,246,.9)'}}/>
              <span style={{fontSize:12,fontWeight:700,color:'#a78bfa'}}>Now FREE in beta</span>
            </div>

            <h1 className="lp-hero-b lp-hero-h1" style={{fontSize:64,fontWeight:900,lineHeight:1.04,marginBottom:22,letterSpacing:'-.04em',color:'#f4f6f4'}}>
              The performance OS<br/>
              <span style={{background:'linear-gradient(130deg,#a78bfa 0%,#8b5cf6 40%,#6d28d9 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                built for founders.
              </span>
            </h1>

            <p className="lp-hero-c lp-hero-p" style={{fontSize:17,lineHeight:1.75,color:'#94a3b8',marginBottom:36,maxWidth:440}}>
              Track P&L, revenue, clients, and tasks. Manage your pipeline. Get AI-coached to scale — all in one ruthlessly focused dashboard.
            </p>

            <div className="lp-hero-d lp-hero-btns" style={{display:'flex',gap:12,alignItems:'center',marginBottom:24}}>
              {isLoggedIn?(
                <Link href="/dashboard" className="lp-glow-btn" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'15px 32px',borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontSize:16,fontWeight:800,textDecoration:'none',boxShadow:'0 8px 28px rgba(139,92,246,.4),inset 0 1px 0 rgba(255,255,255,.18)'}}>
                  Go to Dashboard <ArrowRight size={16}/>
                </Link>
              ):(
                <>
                  <Link href="/signup" className="lp-glow-btn" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'15px 32px',borderRadius:12,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontSize:16,fontWeight:800,textDecoration:'none',boxShadow:'0 8px 28px rgba(139,92,246,.4),inset 0 1px 0 rgba(255,255,255,.18)'}}>
                    Start for free <ArrowRight size={16}/>
                  </Link>
                  <Link href="/login" style={{display:'inline-flex',alignItems:'center',gap:6,padding:'15px 28px',borderRadius:12,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.7)',fontSize:16,fontWeight:600,textDecoration:'none',transition:'all .2s',backdropFilter:'blur(8px)'}}>
                    Sign in
                  </Link>
                </>
              )}
            </div>

            <div className="lp-hero-d lp-hero-badges" style={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:18,color:'#64748b',fontSize:13}}>
              {['Free forever plan','30-day roadmap included','No credit card'].map(t=>(
                <span key={t} style={{display:'flex',alignItems:'center',gap:5}}>
                  <Check size={12} color="#8b5cf6"/> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — 3D dashboard */}
          <div className="lp-hero-e lp-hero-dash" style={{display:'flex',justifyContent:'center',alignItems:'center',position:'relative'}}>
            {/* Glow behind mockup */}
            <div style={{position:'absolute',width:500,height:300,background:'radial-gradient(ellipse,rgba(139,92,246,.22),transparent 70%)',borderRadius:'50%',filter:'blur(32px)',pointerEvents:'none'}}/>
            {/* Floating stat chips */}
            <div style={{position:'absolute',top:'6%',left:'-4%',zIndex:20,animation:'lp-float 5s ease-in-out infinite .5s'}}>
              <div style={{padding:'8px 14px',background:'rgba(15,17,22,.92)',backdropFilter:'blur(20px)',border:'1px solid rgba(139,92,246,.28)',borderRadius:12,boxShadow:'0 16px 40px rgba(0,0,0,.4)',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:9,background:'rgba(139,92,246,.14)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(139,92,246,.22)'}}><Activity size={14} color="#8b5cf6"/></div>
                <div><div style={{fontSize:14,fontWeight:800,color:'#f4f6f4',lineHeight:1}}>+32%</div><div style={{fontSize:10,color:'#64748b',marginTop:1}}>Revenue MoM</div></div>
              </div>
            </div>
            <div style={{position:'absolute',bottom:'12%',right:'-6%',zIndex:20,animation:'lp-float 6s ease-in-out infinite 1.2s'}}>
              <div style={{padding:'8px 14px',background:'rgba(15,17,22,.92)',backdropFilter:'blur(20px)',border:'1px solid rgba(139,92,246,.25)',borderRadius:12,boxShadow:'0 16px 40px rgba(0,0,0,.4)',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:9,background:'rgba(139,92,246,.14)',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid rgba(139,92,246,.22)'}}><Brain size={14} color="#8b5cf6"/></div>
                <div><div style={{fontSize:14,fontWeight:800,color:'#f4f6f4',lineHeight:1}}>AI Coach</div><div style={{fontSize:10,color:'#8b5cf6',marginTop:1}}>● Active now</div></div>
              </div>
            </div>
            <div style={{position:'absolute',top:'42%',right:'-8%',zIndex:20,animation:'lp-float 7s ease-in-out infinite 2s'}}>
              <div style={{padding:'8px 14px',background:'rgba(15,17,22,.92)',backdropFilter:'blur(20px)',border:'1px solid rgba(139,92,246,.22)',borderRadius:12,boxShadow:'0 16px 40px rgba(0,0,0,.4)',textAlign:'center',minWidth:80}}>
                <div style={{fontSize:22,fontWeight:900,color:'#f4f6f4',lineHeight:1}}>🔥 14</div>
                <div style={{fontSize:10,color:'#64748b',marginTop:2}}>Day streak</div>
              </div>
            </div>
            <div style={{animation:'lp-float3d 7s ease-in-out infinite',transformOrigin:'center center',filter:'drop-shadow(0 60px 80px rgba(0,0,0,.5)) drop-shadow(0 0 80px rgba(139,92,246,.15))'}}>
              <DashboardMockup/>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(255,255,255,.06)',borderBottom:'1px solid rgba(255,255,255,.06)',background:'rgba(255,255,255,.025)',backdropFilter:'blur(12px)',padding:'22px 28px'}}>
        <div style={{maxWidth:960,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center',gap:48,flexWrap:'wrap'}}>
          {[{Icon:Shield,label:'SOC 2 compliant infrastructure'},{Icon:Users,label:'2,400+ founders onboarded'},{Icon:Clock,label:'Average setup: under 3 min'},{Icon:Star,label:'4.9 / 5.0 average rating'}].map(({Icon,label})=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:8,color:'rgba(255,255,255,.45)',fontSize:13,fontWeight:600}}>
              <Icon size={14} color="#8b5cf6"/>{label}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURE PREVIEW ── */}
      <div style={{position:'relative',zIndex:1,padding:'90px 28px'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="lp-reveal" style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'#8b5cf6',marginBottom:14}}>What you get</div>
            <h2 style={{fontSize:40,fontWeight:900,letterSpacing:'-.03em',lineHeight:1.1,marginBottom:14,color:'#f4f6f4'}}>One system. Replace them all.</h2>
            <p style={{fontSize:15,color:'#64748b',maxWidth:480,margin:'0 auto',lineHeight:1.7}}>Most founders track P&L in spreadsheets, leads in notes, and get advice from YouTube. prspectve replaces all of it.</p>
          </div>
          <div className="lp-preview-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22}}>

            {/* P&L Card */}
            <TiltCard style={{borderRadius:18,overflow:'hidden'}}>
              <div className="lp-reveal lp-d1" style={{background:'rgba(15,17,22,.85)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(139,92,246,.14)',borderRadius:18,padding:'24px 22px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04)',transition:'border-color .3s,box-shadow .3s'}}>
                <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,background:'radial-gradient(circle,rgba(139,92,246,.1),transparent)',borderRadius:'50%',pointerEvents:'none'}}/>
                <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',background:'rgba(139,92,246,.12)',color:'#a78bfa',borderRadius:9999,letterSpacing:'.05em',border:'1px solid rgba(139,92,246,.2)'}}>P&L TRACKING</span>
                <div style={{marginTop:16,padding:'12px 14px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,marginBottom:18}}>
                  <div style={{fontSize:7.5,color:'#4b5563',fontWeight:700,letterSpacing:'.08em',marginBottom:10}}>THIS PERIOD</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[{l:'REVENUE',v:'$8,400',hi:false},{l:'EXPENSES',v:'$2,100',hi:false},{l:'PROFIT',v:'$6,300',hi:true},{l:'MARGIN',v:'75%',hi:true}].map(m=>(
                      <div key={m.l}><div style={{fontSize:7.5,color:'#4b5563',fontWeight:700,letterSpacing:'.08em',marginBottom:2}}>{m.l}</div><div style={{fontSize:16,fontWeight:800,color:m.hi?'#a78bfa':'#f4f6f4',lineHeight:1}}>{m.v}</div></div>
                    ))}
                  </div>
                  <svg width="100%" height="24" viewBox="0 0 160 24" preserveAspectRatio="none" style={{marginTop:12,display:'block'}}>
                    <defs><linearGradient id="fp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>
                    <path d="M0,22C20,20 40,18 60,13C80,8 100,6 120,4C140,2 152,1 160,0.5" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M0,22C20,20 40,18 60,13C80,8 100,6 120,4C140,2 152,1 160,0.5 L160,24 L0,24Z" fill="url(#fp1)"/>
                  </svg>
                </div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:7,color:'#f4f6f4',letterSpacing:'-.01em'}}>Know your numbers.</h3>
                <p style={{color:'#64748b',fontSize:13,lineHeight:1.65,margin:0}}>Log revenue and expenses. See your P&L, margin, and growth trend — no spreadsheets, no formulas, no confusion.</p>
              </div>
            </TiltCard>

            {/* Pipeline Card */}
            <TiltCard style={{borderRadius:18,overflow:'hidden'}}>
              <div className="lp-reveal lp-d2" style={{background:'rgba(15,17,22,.85)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(139,92,246,.14)',borderRadius:18,padding:'24px 22px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04)',transition:'border-color .3s,box-shadow .3s'}}>
                <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,background:'radial-gradient(circle,rgba(139,92,246,.1),transparent)',borderRadius:'50%',pointerEvents:'none'}}/>
                <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',background:'rgba(139,92,246,.12)',color:'#a78bfa',borderRadius:9999,letterSpacing:'.05em',border:'1px solid rgba(139,92,246,.2)'}}>PIPELINE</span>
                <div style={{marginTop:16,padding:'12px 14px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,marginBottom:18}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7}}>
                    {[{s:'CONTACTED',c:'#64748b',ls:['Alex R.','Maria C.']},{s:'MEETING',c:'#f59e0b',ls:['James T.']},{s:'CLOSED',c:'#8b5cf6',ls:['Sarah K.']}].map(col=>(
                      <div key={col.s}><div style={{fontSize:7.5,fontWeight:700,color:col.c,letterSpacing:'.06em',marginBottom:5}}>{col.s}</div>{col.ls.map(l=><div key={l} style={{padding:'4px 7px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.06)',borderRadius:5,fontSize:8,color:'#94a3b8',marginBottom:3}}>{l}</div>)}</div>
                    ))}
                  </div>
                </div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:7,color:'#f4f6f4',letterSpacing:'-.01em'}}>Never lose a warm lead.</h3>
                <p style={{color:'#64748b',fontSize:13,lineHeight:1.65,margin:0}}>Drag leads from cold to closed. See exactly where every deal stands and which ones need attention today.</p>
              </div>
            </TiltCard>

            {/* AI Coach Card */}
            <TiltCard style={{borderRadius:18,overflow:'hidden'}}>
              <div className="lp-reveal lp-d3" style={{background:'rgba(15,17,22,.85)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(139,92,246,.14)',borderRadius:18,padding:'24px 22px',position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,.4),0 0 0 1px rgba(255,255,255,.04)',transition:'border-color .3s,box-shadow .3s'}}>
                <div style={{position:'absolute',top:-40,right:-40,width:140,height:140,background:'radial-gradient(circle,rgba(139,92,246,.1),transparent)',borderRadius:'50%',pointerEvents:'none'}}/>
                <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',background:'rgba(139,92,246,.12)',color:'#a78bfa',borderRadius:9999,letterSpacing:'.05em',border:'1px solid rgba(139,92,246,.2)'}}>AI COACH</span>
                <div style={{marginTop:16,padding:'12px 14px',background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,marginBottom:18,display:'flex',flexDirection:'column',gap:7}}>
                  {[{ai:true,m:'3 leads stuck 8+ days. Added follow-up tasks for each.'},{ai:false,m:'Best move this week?'},{ai:true,m:'Close Alex R. — warm 10 days. Script drafted.'}].map((msg,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:msg.ai?'flex-start':'flex-end'}}>
                      <div style={{maxWidth:'88%',padding:'7px 10px',borderRadius:msg.ai?'8px 8px 8px 2px':'8px 8px 2px 8px',background:msg.ai?'rgba(255,255,255,.04)':'rgba(139,92,246,.12)',border:`1px solid ${msg.ai?'rgba(255,255,255,.07)':'rgba(139,92,246,.22)'}`,color:msg.ai?'#94a3b8':'#c4b5fd',fontSize:9,lineHeight:1.55}}>
                        {msg.ai&&<div style={{fontSize:7.5,fontWeight:800,color:'#8b5cf6',marginBottom:2,letterSpacing:'.06em'}}>AI COACH</div>}{msg.m}
                      </div>
                    </div>
                  ))}
                </div>
                <h3 style={{fontSize:16,fontWeight:700,marginBottom:7,color:'#f4f6f4',letterSpacing:'-.01em'}}>AI that acts, not advises.</h3>
                <p style={{color:'#64748b',fontSize:13,lineHeight:1.65,margin:0}}>Reads your revenue, pipeline, and tasks — then executes. Writes scripts, adds tasks, and tells you what to do next.</p>
              </div>
            </TiltCard>

          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-feat-section" style={{position:'relative',zIndex:1,padding:'100px 28px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(139,92,246,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.02) 1px,transparent 1px)',backgroundSize:'72px 72px',pointerEvents:'none'}}/>
        <div style={{maxWidth:1200,margin:'0 auto',position:'relative'}}>
          <div className="lp-reveal" style={{textAlign:'center',marginBottom:72}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'#8b5cf6',marginBottom:16}}>One dashboard</div>
            <h2 style={{fontSize:46,fontWeight:900,letterSpacing:'-.035em',lineHeight:1.08,marginBottom:16,color:'#f4f6f4'}}>Everything you need.<br/>Nothing you don't.</h2>
            <p style={{color:'#64748b',fontSize:16,maxWidth:500,margin:'0 auto',lineHeight:1.7}}>Stop juggling 12 different tabs. prspectve connects daily tasks, P&L, pipeline, and AI coaching into one ruthlessly focused dashboard.</p>
          </div>
          <div className="lp-feat-hub-wrap"><FeaturesHub/></div>
          <div className="lp-feat-grid-wrap">
            {FEATURES.map((f,i)=>(
              <div key={f.title} className={`lp-reveal lp-d${(i%2)+1}`} style={{background:'rgba(15,17,22,.85)',backdropFilter:'blur(20px)',border:'1px solid rgba(139,92,246,.14)',borderRadius:14,padding:'24px 20px',position:'relative',overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,.3)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                  <div style={{width:42,height:42,background:'rgba(139,92,246,.12)',border:'1px solid rgba(139,92,246,.22)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center'}}><f.Icon size={19} color="#8b5cf6"/></div>
                  <span style={{fontSize:10,fontWeight:800,padding:'3px 9px',background:'rgba(139,92,246,.1)',color:'#a78bfa',borderRadius:9999,letterSpacing:'.05em'}}>{f.tag}</span>
                </div>
                <h3 style={{fontSize:15,fontWeight:700,marginBottom:8,letterSpacing:'-.01em',color:'#f4f6f4',lineHeight:1.3}}>{f.title}</h3>
                <p style={{color:'#64748b',fontSize:13,lineHeight:1.65}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="lp-how-section" style={{position:'relative',zIndex:1,padding:'90px 28px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div className="lp-reveal" style={{textAlign:'center',marginBottom:60}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'#8b5cf6',marginBottom:16}}>How it works</div>
            <h2 style={{fontSize:44,fontWeight:900,letterSpacing:'-.035em',color:'#f4f6f4'}}>Three steps to your first client.</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {[
              {n:'01',title:'Set up your profile',desc:'Tell prspectve your niche, service, and daily outreach goal. The AI tailors your 30-day execution roadmap in seconds.'},
              {n:'02',title:'Execute every single day',desc:'Log in each morning. Your 1-3 tasks are waiting. Focus Mode locks you in. prspectve penalizes inaction and rewards consistency.'},
              {n:'03',title:'Close your first deal',desc:'As leads warm up, move them through your pipeline. The AI coach sharpens your pitch and handles objections in real-time.'},
            ].map((s,i)=>(
              <div key={s.n} className={`lp-reveal lp-d${i+1}`} style={{display:'flex',gap:0,alignItems:'stretch',position:'relative'}}>
                {/* Left: number + line */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0,width:60}}>
                  <div style={{width:50,height:50,borderRadius:14,background:'rgba(139,92,246,.12)',border:'1px solid rgba(139,92,246,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#8b5cf6',boxShadow:'0 0 20px rgba(139,92,246,.2)',flexShrink:0,zIndex:1}}>{s.n}</div>
                  {i<2&&<div style={{flex:1,width:1,background:'linear-gradient(180deg,rgba(139,92,246,.3),rgba(139,92,246,.08))',minHeight:40,margin:'4px 0'}}/>}
                </div>
                {/* Right: content */}
                <div style={{flex:1,paddingLeft:24,paddingBottom:i<2?40:0,paddingTop:8}}>
                  <div style={{fontSize:19,fontWeight:700,marginBottom:9,letterSpacing:'-.01em',color:'#f4f6f4'}}>{s.title}</div>
                  <div style={{color:'#64748b',fontSize:15,lineHeight:1.7}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI COACH CALLOUT ── */}
      <section className="lp-ai-section" style={{position:'relative',zIndex:1,padding:'100px 28px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div className="lp-ai-inner" style={{background:'rgba(10,12,16,.8)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',border:'1px solid rgba(139,92,246,.18)',borderRadius:22,padding:'60px 64px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',position:'relative',overflow:'hidden',boxShadow:'0 0 0 1px rgba(255,255,255,.04),0 32px 80px rgba(0,0,0,.5),0 0 100px rgba(139,92,246,.08)'}}>
            <div style={{position:'absolute',bottom:-120,right:-120,width:400,height:400,background:'radial-gradient(circle,rgba(139,92,246,.07),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
            <div style={{position:'absolute',top:-80,left:-80,width:300,height:300,background:'radial-gradient(circle,rgba(139,92,246,.04),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}/>
            <div className="lp-reveal">
              <div style={{fontSize:11,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'#8b5cf6',marginBottom:18}}>AI Coach</div>
              <h2 style={{fontSize:40,fontWeight:900,letterSpacing:'-.035em',lineHeight:1.1,marginBottom:18,color:'#f4f6f4'}}>Your coach gives you<br/>brutal, honest feedback.</h2>
              <p style={{color:'#64748b',fontSize:15,lineHeight:1.75,marginBottom:28}}>Paste a prospect's objection. Get a word-for-word rebuttal in seconds. Pre-call roleplay. Post-call debrief. The AI never sugarcoats — and it controls your entire workspace.</p>
              {['Handle any objection with a word-for-word script','Full read/write access to your entire dashboard','Creates and manages your to-do list automatically','Reads your pipeline and suggests next actions','Analyzes your P&L and revenue trends in real-time','Truly hands-off — just ask and it executes'].map(t=>(
                <div key={t} style={{display:'flex',alignItems:'center',gap:9,marginBottom:10}}>
                  <div style={{width:18,height:18,borderRadius:5,background:'rgba(139,92,246,.14)',border:'1px solid rgba(139,92,246,.28)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Check size={10} color="#8b5cf6"/></div>
                  <span style={{fontSize:14,color:'#94a3b8'}}>{t}</span>
                </div>
              ))}
            </div>
            {/* Chat mockup */}
            <div className="lp-reveal lp-d2" style={{background:'rgba(6,8,10,.95)',border:'1px solid rgba(139,92,246,.22)',borderRadius:16,overflow:'hidden',boxShadow:'0 0 0 1px rgba(255,255,255,.04),0 32px 64px rgba(0,0,0,.4),0 0 60px rgba(139,92,246,.1)',fontFamily:'system-ui,sans-serif'}}>
              <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 14px rgba(139,92,246,.5)'}}><Brain size={15} color="#fff"/></div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#f4f6f4'}}>prspectve AI Coach</div>
                  <div style={{fontSize:10,color:'#8b5cf6',display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:'#8b5cf6',display:'inline-block',boxShadow:'0 0 6px rgba(139,92,246,.9)'}}/>Online · Full dashboard access</div>
                </div>
              </div>
              <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:11}}>
                {[
                  {ai:true,m:"I reviewed your pipeline. You have 3 leads stuck in 'Contacted' for 5+ days. Want me to write follow-up scripts for all of them right now?"},
                  {ai:false,m:'Yes, also they said they\'re "not interested" — what do I say?'},
                  {ai:true,m:'"Not interested" = pain not established. Reply: \'Totally get it. Quick question: what\'s your biggest challenge getting clients right now?\' I\'ve also added 3 follow-up tasks to your list.'},
                  {ai:false,m:'What about my P&L, am I on track?'},
                  {ai:true,m:"You're at $0 revenue on Day 12. Based on pipeline velocity, you need 2 more meetings booked this week. I've added 'Book 2 meetings' as today's priority task. Let's go."},
                ].map((m,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:m.ai?'flex-start':'flex-end'}}>
                    <div style={{maxWidth:'85%',padding:'10px 13px',borderRadius:m.ai?'12px 12px 12px 3px':'12px 12px 3px 12px',background:m.ai?'rgba(255,255,255,.05)':'rgba(139,92,246,.14)',border:`1px solid ${m.ai?'rgba(255,255,255,.07)':'rgba(139,92,246,.24)'}`,color:m.ai?'#94a3b8':'#c4b5fd',fontSize:12,lineHeight:1.6}}>
                      {m.ai&&<div style={{fontSize:9,fontWeight:800,color:'#8b5cf6',marginBottom:4,letterSpacing:'.08em'}}>AI COACH</div>}{m.m}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'12px 18px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:9}}>
                <div style={{flex:1,padding:'9px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,color:'#374151',fontSize:12}}>Ask your coach anything...</div>
                <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 0 16px rgba(139,92,246,.4)',cursor:'pointer'}}><ArrowRight size={14} color="#fff"/></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" className="lp-test-section" style={{position:'relative',zIndex:1,padding:'90px 28px',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(139,92,246,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.02) 1px,transparent 1px)',backgroundSize:'72px 72px',pointerEvents:'none'}}/>
        <div style={{maxWidth:1100,margin:'0 auto',position:'relative'}}>
          <div className="lp-reveal" style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'#8b5cf6',marginBottom:16}}>Testimonials</div>
            <h2 style={{fontSize:44,fontWeight:900,letterSpacing:'-.035em',color:'#f4f6f4'}}>Real founders. Real results.</h2>
          </div>
          <div className="lp-test-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {TESTIMONIALS.map((t,i)=>(
              <TiltCard key={t.name} style={{borderRadius:18,overflow:'hidden'}}>
                <div className={`lp-reveal lp-tcard lp-d${i+1}`} style={{background:'rgba(15,17,22,.85)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:'1px solid rgba(139,92,246,.12)',borderRadius:18,padding:28,boxShadow:'0 8px 32px rgba(0,0,0,.4)',transition:'all .3s'}}>
                  <div style={{display:'flex',marginBottom:14}}>
                    {Array.from({length:5}).map((_,j)=><Star key={j} size={14} fill="#8b5cf6" color="#8b5cf6"/>)}
                  </div>
                  <p style={{color:'#94a3b8',fontSize:14,lineHeight:1.75,marginBottom:22,fontStyle:'italic'}}>"{t.quote}"</p>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff',boxShadow:'0 0 14px rgba(139,92,246,.4)'}}>{t.avatar}</div>
                    <div><div style={{fontSize:13,fontWeight:700,color:'#f4f6f4'}}>{t.name}</div><div style={{fontSize:11,color:'#4b5563',marginTop:1}}>{t.role}</div></div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-section" style={{position:'relative',zIndex:1,padding:'130px 28px',borderTop:'1px solid rgba(139,92,246,.12)',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%,rgba(139,92,246,.12) 0%,rgba(109,40,217,.05) 40%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(139,92,246,.1) 1px,transparent 1px)',backgroundSize:'32px 32px',opacity:.5,pointerEvents:'none',maskImage:'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 100%)',WebkitMaskImage:'radial-gradient(ellipse 70% 70% at 50% 50%,black 20%,transparent 100%)'}}/>
        {/* Scan line */}
        <div style={{position:'absolute',left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(139,92,246,.5),transparent)',animation:'lp-scan 10s linear infinite',opacity:.35}}/>
        <div className="lp-reveal" style={{maxWidth:680,margin:'0 auto',textAlign:'center',position:'relative'}}>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:'.18em',textTransform:'uppercase',color:'#8b5cf6',marginBottom:20}}>Get started today</div>
          <h2 className="lp-cta-h2" style={{fontSize:56,fontWeight:900,letterSpacing:'-.04em',lineHeight:1.04,marginBottom:22,color:'#f4f6f4'}}>
            Your first client<br/>
            <span style={{background:'linear-gradient(130deg,#a78bfa 0%,#8b5cf6 40%,#6d28d9 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',backgroundSize:'200% auto',animation:'lp-shimmer 4s linear infinite'}}>
              is 30 days away.
            </span>
          </h2>
          <p style={{color:'#64748b',fontSize:17,marginBottom:48,lineHeight:1.7}}>Stop consuming. Start executing. prspectve gives you the structure, tools, and AI coaching to land your first client — faster than you think.</p>
          <Link href={isLoggedIn?'/dashboard':'/signup'} className="lp-glow-btn" style={{display:'inline-flex',alignItems:'center',gap:10,padding:'18px 44px',borderRadius:14,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',color:'#fff',fontSize:18,fontWeight:800,textDecoration:'none',boxShadow:'0 12px 44px rgba(139,92,246,.45),inset 0 1px 0 rgba(255,255,255,.18)'}}>
            {isLoggedIn?'Go to Dashboard':'Start for free'} <ArrowRight size={18}/>
          </Link>
          <div style={{marginTop:20,color:'#374151',fontSize:13}}>Free to start · No credit card · Cancel anytime</div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer" style={{position:'relative',zIndex:1,borderTop:'1px solid rgba(255,255,255,.06)',padding:'36px 28px',background:'rgba(3,4,5,.98)'}}>
        <div className="lp-footer-inner" style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <LogoMark size={28}/>
            <span style={{fontWeight:900,fontSize:17,letterSpacing:'-.02em',color:'#f4f6f4'}}>prspectve</span>
          </div>
          <div style={{color:'#374151',fontSize:13}}>© 2025 prspectve. Built for founders who mean business.</div>
          <div style={{display:'flex',gap:20}}>
            <Link href="/login" style={{color:'#4b5563',textDecoration:'none',fontSize:13,transition:'color .2s'}}>Sign in</Link>
            <Link href="/signup" style={{color:'#8b5cf6',textDecoration:'none',fontSize:13,fontWeight:700}}>Get started →</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
