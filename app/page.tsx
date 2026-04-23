import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Founder OS | Stop watching. Start closing.',
  description: 'The AI system that turns business ideas into paying clients — one day at a time.',
  openGraph: {
    title: 'Founder OS | Stop watching. Start closing.',
    description: 'The AI system that turns business ideas into paying clients.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Founder OS Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Founder OS | Stop watching. Start closing.',
    description: 'The AI system that turns business ideas into paying clients.',
    images: ['/og-image.jpg'],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tighter">
            FOUNDER<span className="text-indigo-500">OS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
              Start Free Sprint
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Join 47 founders executing daily
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Stop watching. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Start closing.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            The AI system that turns business ideas into paying clients — one day at a time.
          </p>
          
          <Link href="/signup" className="inline-block bg-indigo-600 text-white font-semibold text-lg px-8 py-4 rounded-full hover:bg-indigo-500 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]">
            Start your free 30-day sprint
          </Link>

          {/* Hero Visual Mockup */}
          <div className="mt-20 max-w-4xl mx-auto border border-white/10 rounded-2xl bg-black/50 backdrop-blur-sm p-4 md:p-8 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-20 border border-white/10 bg-white/5 rounded-xl p-6">
              <div>
                <p className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-wider">Current Sprint</p>
                <p className="text-3xl font-bold">Day 12 <span className="text-gray-500">/ 30</span></p>
              </div>
              <div className="h-12 w-px bg-white/10 hidden md:block"></div>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-wider">Clients Closed</p>
                  <p className="text-3xl font-bold text-green-400">3</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1 font-mono uppercase tracking-wider">Revenue Earned</p>
                  <p className="text-3xl font-bold text-indigo-400">$4,200</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              You know what to do. <br className="md:hidden" />
              <span className="text-gray-500">You're just not doing it.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black border border-white/10 p-8 rounded-2xl hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Everyone has the idea.</h3>
              <p className="text-gray-400">Nobody has the system. Watching another tutorial won't build your agency. Consistent daily action will.</p>
            </div>

            <div className="bg-black border border-white/10 p-8 rounded-2xl hover:border-cyan-500/30 transition-colors">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">YouTube gives knowledge.</h3>
              <p className="text-gray-400">Not execution. You are stuck in a consumption loop, feeling productive while making zero dollars.</p>
            </div>

            <div className="bg-black border border-white/10 p-8 rounded-2xl hover:border-purple-500/30 transition-colors">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">ChatGPT builds.</h3>
              <p className="text-gray-400">It can't get you clients. Having a perfect service means nothing if you aren't doing the boring work to sell it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Your execution OS.</h2>
          <p className="text-xl text-gray-400 mb-16">Not another productivity tool.</p>
          
          <div className="relative mx-auto max-w-5xl">
            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-[100px] -z-10" />
            
            {/* Dashboard Mockup Container */}
            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden flex flex-col">
              {/* Fake Browser Header */}
              <div className="h-10 border-b border-white/10 flex items-center px-4 gap-2 bg-[#111]">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="mx-auto bg-white/5 rounded-md px-3 py-1 text-xs text-gray-500 font-mono flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  app.founderos.com
                </div>
              </div>
              
              {/* Dashboard Layout */}
              <div className="flex h-[500px]">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/5 p-4 flex flex-col gap-4 hidden md:flex bg-black">
                  <div className="h-6 w-24 bg-white/10 rounded mb-4"></div>
                  <div className="h-8 w-full bg-indigo-500/20 rounded flex items-center px-3 border border-indigo-500/30">
                    <div className="w-4 h-4 rounded bg-indigo-400/50 mr-2"></div>
                    <div className="h-2 w-16 bg-white/60 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-white/5 rounded flex items-center px-3">
                    <div className="w-4 h-4 rounded bg-white/20 mr-2"></div>
                    <div className="h-2 w-20 bg-white/20 rounded"></div>
                  </div>
                  <div className="h-8 w-full bg-white/5 rounded flex items-center px-3">
                    <div className="w-4 h-4 rounded bg-white/20 mr-2"></div>
                    <div className="h-2 w-12 bg-white/20 rounded"></div>
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-6 lg:p-8 bg-black/50 text-left overflow-hidden relative">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Wednesday Sprint</h3>
                      <p className="text-gray-400 text-sm">You have 3 non-negotiable tasks today.</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold border border-green-500/20">
                      Day 12 Streak
                    </div>
                  </div>
                  
                  {/* Tasks */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center"></div>
                      <div className="flex-1">
                        <div className="h-4 w-48 bg-white/60 rounded mb-2"></div>
                        <div className="h-2 w-32 bg-white/20 rounded"></div>
                      </div>
                      <div className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30">Revenue Action</div>
                    </div>
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full border border-gray-500 flex items-center justify-center"></div>
                      <div className="flex-1">
                        <div className="h-4 w-64 bg-white/60 rounded mb-2"></div>
                        <div className="h-2 w-24 bg-white/20 rounded"></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center gap-4 opacity-50">
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-white/40 rounded mb-2 line-through"></div>
                        <div className="h-2 w-16 bg-white/20 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Coach Overlay */}
                  <div className="absolute bottom-6 right-6 w-64 bg-[#1A1A1A] border border-indigo-500/30 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Coach</p>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      You missed your outreach goal yesterday. Let's send 5 DMs right now. I've drafted an opener for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-8 left-16 right-16 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
            
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-black border border-indigo-500 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Onboard your offer</h3>
              <p className="text-gray-400 leading-relaxed">
                Tell us what you sell. Our AI refines your positioning, pricing, and pitch in under 5 minutes.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-black border border-indigo-500 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Execute daily</h3>
              <p className="text-gray-400 leading-relaxed">
                Stop guessing. Wake up to 3 non-negotiable revenue actions prioritized specifically for your business.
              </p>
            </div>

            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto bg-black border border-indigo-500 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Close clients</h3>
              <p className="text-gray-400 leading-relaxed">
                Track leads in the Kanban, analyze your conversion metrics, and get AI coaching to handle objections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-900/10 to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Pricing that scales with you</h2>
            <p className="text-xl text-gray-400">No credit card required to start closing.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto relative z-10">
            {/* Free Tier */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-2">Sprint</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">Free</span>
                <span className="text-gray-400">forever</span>
              </div>
              <p className="text-gray-400 mb-8 h-12">Everything you need to get your first paying clients.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Full 30-day execution sprint</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Daily personalized tasks</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Basic CRM & lead tracking</span>
                </li>
              </ul>
              
              <Link href="/signup" className="block w-full text-center py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-colors">
                Start Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-black border border-indigo-500 rounded-3xl p-8 relative shadow-[0_0_30px_-5px_rgba(79,70,229,0.3)]">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                AFTER 30 DAYS
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold">$10</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mb-8 h-12">For founders scaling past their first $1k/month.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Advanced conversion analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Custom roadmap generation</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>Unlimited AI coaching chats</span>
                </li>
              </ul>
              
              <Link href="/signup" className="block w-full text-center py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors">
                Start Free Sprint First
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What exactly is Founder OS?",
                a: "It's an execution platform disguised as a daily planner. It takes the proven steps to get clients for a service business and spoon-feeds them to you as 3 daily, non-negotiable actions."
              },
              {
                q: "Who is this for?",
                a: "Anyone trying to start a service-based online business (SMMA, AI automation, web design, freelancing) who struggles with knowing what to do next and staying consistent."
              },
              {
                q: "Why not just use ChatGPT?",
                a: "ChatGPT gives you information. It doesn't hold you accountable. Founder OS provides the structure, tracks your leads, measures your conversion rate, and forces you to execute instead of just chatting."
              },
              {
                q: "How long does it take?",
                a: "The core sprint is 30 days. You only need about 60-90 minutes of focused execution per day to complete your tasks."
              },
              {
                q: "Does this work for [X] service?",
                a: "Yes. Getting clients for any B2B service requires the same fundamentals: an offer, targeted outreach, and sales calls. Founder OS forces you to do all three."
              },
              {
                q: "What happens after the 30 days?",
                a: "You'll have built the habit of execution and (likely) closed your first clients. You can upgrade to Pro for $10/mo to get advanced analytics and custom scaling roadmaps, or stay on the free tier forever."
              }
            ].map((faq, i) => (
              <details key={i} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold select-none group-open:text-indigo-400 group-open:bg-white/[0.02]">
                  {faq.q}
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="p-6 pt-0 text-gray-400 border-t border-white/5">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-24 px-6 text-center border-t border-white/10 bg-black">
        <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to do the work?</h2>
        <Link href="/signup" className="inline-block bg-white text-black font-semibold text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition-colors">
          Start your 30-day sprint — free
        </Link>
        <p className="mt-12 text-sm text-gray-500">
          © {new Date().getFullYear()} Founder OS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
