import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Founder OS | Stop watching. Start closing.',
  description: 'The AI system that turns business ideas into paying clients — one day at a time.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tight">
            Founder<span className="text-emerald-400">OS</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-zinc-500 hover:text-white transition-colors hidden sm:block">
              How it works
            </Link>
            <Link href="#pricing" className="text-sm text-zinc-500 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg transition-all hover:shadow-emerald-glow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-100 pointer-events-none" />
        {/* Emerald radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-10 tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            47 founders executing right now
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-7 leading-[1.05]">
            Stop watching.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Start closing.
            </span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            The AI execution system that turns your business idea into paying clients — one non-negotiable day at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base px-8 py-4 rounded-xl transition-all shadow-emerald-glow hover:shadow-emerald-glow hover:scale-[1.02]"
            >
              Start your free 30-day sprint
            </Link>
            <Link href="#how-it-works" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              See how it works →
            </Link>
          </div>

          {/* Dashboard preview card */}
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0a] shadow-2xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="h-10 border-b border-white/[0.06] flex items-center px-4 gap-2 bg-[#0d0d0d]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                </div>
                <div className="mx-auto bg-white/[0.04] rounded px-3 py-1 text-[11px] text-zinc-600 font-mono">
                  app.founderos.com
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="flex h-[420px]">
                {/* Sidebar */}
                <div className="w-44 border-r border-white/[0.05] p-4 hidden md:flex flex-col gap-3 bg-[#070707]">
                  <div className="h-5 w-20 bg-white/10 rounded mb-3" />
                  <div className="h-8 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center px-3 gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-400/50" />
                    <div className="h-2 w-14 bg-emerald-400/60 rounded" />
                  </div>
                  {[20, 16, 12].map((w, i) => (
                    <div key={i} className="h-8 w-full bg-white/[0.03] rounded-lg flex items-center px-3 gap-2">
                      <div className="w-3.5 h-3.5 rounded bg-white/10" />
                      <div className={`h-2 w-${w} bg-white/10 rounded`} />
                    </div>
                  ))}
                </div>

                {/* Main */}
                <div className="flex-1 p-6 bg-[#050505] text-left overflow-hidden relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Day 12 · Week 2</p>
                      <h3 className="text-xl font-bold">Execution Pulse</h3>
                    </div>
                    <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20">
                      12-Day Streak
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'DMs Sent', val: '34' },
                      { label: 'Calls Booked', val: '3' },
                      { label: 'Revenue', val: '$4.2k', em: true },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-1">{s.label}</p>
                        <p className={`text-lg font-bold font-mono ${s.em ? 'text-emerald-400' : 'text-white'}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {[
                      { text: 'Send 5 personalised DMs to local restaurants', done: true },
                      { text: 'Follow up with 3 prospects from yesterday', done: false },
                      { text: 'Review offer positioning with AI coach', done: false },
                    ].map((t, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${t.done ? 'border-white/[0.04] opacity-50' : 'border-white/[0.07] bg-white/[0.02]'}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'}`}>
                          {t.done && (
                            <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium ${t.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{t.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Coach widget */}
                  <div className="absolute bottom-5 right-5 w-56 bg-[#0d0d0d] border border-emerald-500/20 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">AI Coach</p>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Your reply rate dropped 4%. Let's fix your opener — I've drafted a new one.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-28 px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">The real problem</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              You know what to do.<br />
              <span className="text-zinc-500">You're just not doing it.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Everyone has the idea.',
                body: "Nobody has the system. Watching another tutorial won't build your agency. Consistent daily action will.",
              },
              {
                num: '02',
                title: 'YouTube gives knowledge.',
                body: 'Not execution. You are stuck in a consumption loop, feeling productive while making zero dollars.',
              },
              {
                num: '03',
                title: 'ChatGPT builds things.',
                body: "It can't get you clients. A perfect service means nothing if you aren't doing the boring work to sell it.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="group bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl p-8 transition-all duration-300"
              >
                <p className="text-5xl font-black text-white/[0.06] mb-6 font-mono tracking-tighter">{item.num}</p>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-emerald-300 transition-colors">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-6 bg-white/[0.01] border-t border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">The system</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {[
              {
                step: '1',
                title: 'Onboard your offer',
                body: 'Tell us what you sell. Our AI refines your positioning, pricing, and pitch in under 5 minutes.',
              },
              {
                step: '2',
                title: 'Execute daily',
                body: 'Wake up to 3 non-negotiable revenue actions — prioritized specifically for your business.',
              },
              {
                step: '3',
                title: 'Close clients',
                body: 'Track leads, analyze conversion metrics, and get AI coaching to crush every objection.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 mx-auto border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10 bg-[#050505] shadow-emerald-glow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">Built for execution</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your execution OS.</h2>
            <p className="text-zinc-500 mt-4 text-lg">Not another productivity tool.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'AI-personalized daily tasks',
                body: 'Every morning, 3 non-negotiable actions — crafted around your specific niche, service, and price point.',
                tag: 'Core',
              },
              {
                title: 'Lead pipeline tracker',
                body: 'Log prospects, track status from cold to closed, and see your pipeline in one clean view.',
                tag: 'CRM',
              },
              {
                title: 'Conversion analytics',
                body: 'DMs sent, calls booked, clients closed — know your numbers, know what to fix.',
                tag: 'Data',
              },
              {
                title: 'AI accountability coach',
                body: 'An AI that reviews your performance data daily and gives brutal, specific feedback on what to change.',
                tag: 'AI',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 rounded-2xl p-8 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded-md bg-emerald-500/5">
                    {f.tag}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-6 bg-white/[0.01] border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">Simple pricing</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Pricing that scales with you</h2>
            <p className="text-zinc-500">No credit card required to start closing.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Sprint</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-zinc-500 text-sm">forever</span>
              </div>
              <p className="text-zinc-500 text-sm mb-8">Everything you need to land your first paying clients.</p>

              <ul className="space-y-3 mb-8">
                {['Full 30-day execution sprint', 'Daily personalized AI tasks', 'Basic CRM & lead tracking'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition-colors"
              >
                Start free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#050505] border border-emerald-500/40 rounded-2xl p-8 relative shadow-emerald-glow-sm">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-black text-[9px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                After 30 days
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4">Pro</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold">$10</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
              <p className="text-zinc-500 text-sm mb-8">For founders scaling past their first $1k/month.</p>

              <ul className="space-y-3 mb-8">
                {['Advanced conversion analytics', 'Custom roadmap generation', 'Unlimited AI coaching chats'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition-all"
              >
                Start free sprint first
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 px-6 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4">Questions</p>
            <h2 className="text-3xl font-bold tracking-tight">Frequently asked</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What exactly is Founder OS?',
                a: "It's an execution platform disguised as a daily planner. It takes the proven steps to get clients for a service business and spoon-feeds them to you as 3 daily, non-negotiable actions.",
              },
              {
                q: 'Who is this for?',
                a: 'Anyone trying to start a service-based online business (SMMA, AI automation, web design, freelancing) who struggles with knowing what to do next and staying consistent.',
              },
              {
                q: 'Why not just use ChatGPT?',
                a: "ChatGPT gives you information. It doesn't hold you accountable. Founder OS provides structure, tracks your leads, measures your conversion rate, and forces execution.",
              },
              {
                q: 'How long does it take?',
                a: 'The core sprint is 30 days. You only need about 60–90 minutes of focused execution per day to complete your tasks.',
              },
              {
                q: 'What happens after the 30 days?',
                a: "You'll have built the habit of execution and (likely) closed your first clients. Upgrade to Pro for $10/mo for advanced analytics and custom scaling roadmaps, or stay free forever.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-sm select-none group-open:text-emerald-400 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-zinc-500 transition-transform group-open:rotate-180 flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-zinc-500 text-sm leading-relaxed border-t border-white/[0.05] pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-28 px-6 text-center border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-6">Ready?</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-10">Do the work.</h2>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base px-8 py-4 rounded-xl transition-all shadow-emerald-glow hover:scale-[1.02]"
          >
            Start your 30-day sprint — free
          </Link>
          <p className="mt-16 text-xs text-zinc-700">
            © {new Date().getFullYear()} Founder OS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
