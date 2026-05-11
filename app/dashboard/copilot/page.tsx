"use client"
import * as React from 'react';
import { Send, Zap, Plus, TrendingUp, DollarSign, Users, BarChart2, Megaphone, ShoppingCart, Globe, RotateCcw } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// ── Quick question sets by category ──────────────────────────────────────────
const QUICK_QUESTIONS = [
  { icon: TrendingUp,   label: 'Top priority this week?',         q: 'What should be my top business priority this week?' },
  { icon: DollarSign,   label: 'Where am I losing money?',        q: 'Where am I most likely losing money or leaving revenue on the table?' },
  { icon: BarChart2,    label: 'How to improve conversion?',      q: 'How can I improve my conversion rate right now?' },
  { icon: Megaphone,    label: 'Best platform for ads?',          q: 'Which ad platform should I focus on for my business type and what budget should I start with?' },
  { icon: Users,        label: 'How to get more leads?',          q: 'What are the best lead generation strategies for my specific business?' },
  { icon: Globe,        label: 'Social media strategy?',          q: 'What social media strategy should I be using, and which platforms should I prioritize?' },
  { icon: ShoppingCart, label: 'How to scale past $10k?',         q: 'What are the key steps I need to take to scale my business past $10k/month?' },
  { icon: RotateCcw,    label: 'What should I automate first?',   q: 'What parts of my business should I automate or outsource first to buy back my time?' },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function AiAvatar() {
  return (
    <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
      <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <AiAvatar />
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5">
          {[0, 150, 300].map(delay => (
            <span
              key={delay}
              className="h-2 w-2 rounded-full animate-bounce"
              style={{ background: 'var(--text-muted)', animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 border" style={{ background: 'var(--accent-muted)', borderColor: 'var(--accent-border)' }}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <AiAvatar />
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 border" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{msg.content}</p>
        <p className="text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {msg.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

const WELCOME = `I'm your Founder OS Business Advisor — a full-spectrum growth expert built into your dashboard.

Unlike the outreach sidebar, I cover everything it takes to actually scale a business:

→ Social media strategy & content (which platforms, what to post, how often)
→ Paid ads (Meta, Instagram, TikTok, Google — budget, targeting, creative)
→ Website, product, and offer optimization
→ Business systems, automation, and when to hire
→ Pricing strategy, packaging, and revenue diversification
→ Competitor research and positioning

The more you tell me about your business, the more specific my advice gets. Start by asking anything, or pick a question below.`;

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CopilotPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'ai', content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sessionId] = React.useState(() => Date.now().toString());
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const history = messages
        .filter(m => m.role !== 'ai' || !m.content.startsWith("I'm your Founder OS"))
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      const reply = data.reply || 'Something went wrong. Try again.';
      setMessages(prev => [...prev, { role: 'ai', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network error. Check your connection and try again.', timestamp: new Date() }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function startNewChat() {
    setMessages([{ role: 'ai', content: WELCOME, timestamp: new Date() }]);
    setInput('');
    inputRef.current?.focus();
  }

  return (
    <div className="flex" style={{ height: 'calc(100vh - 3.5rem)', background: 'var(--app-bg)' }}>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--topbar-bg)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
              <Zap className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Founder OS Business Advisor</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ready · Powered by Groq</p>
              </div>
            </div>
          </div>
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Plus className="h-3.5 w-3.5" />
            New chat
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 min-h-0">
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          {sending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick question pills */}
        <div className="px-6 py-3 border-t flex-shrink-0 overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2 min-w-max">
            {QUICK_QUESTIONS.slice(0, 4).map(qq => (
              <button
                key={qq.label}
                onClick={() => send(qq.q)}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all hover:opacity-80 disabled:opacity-40"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                <qq.icon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                {qq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--topbar-bg)' }}>
          <div
            className="flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all focus-within:border-[var(--accent)]"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your business advisor anything…"
              disabled={sending}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none leading-relaxed max-h-32 disabled:opacity-50"
              style={{ color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:opacity-80 disabled:opacity-30 text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
            Shift+Enter for new line · Enter to send · Powered by Groq · Llama-3.3-70b
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="hidden xl:flex w-72 flex-col border-l flex-shrink-0" style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>

        {/* Business context */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>Business Context</p>
          <BusinessContextPanel />
        </div>

        {/* Quick questions */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Quick Questions</p>
          <div className="space-y-1.5">
            {QUICK_QUESTIONS.map(qq => (
              <button
                key={qq.label}
                onClick={() => send(qq.q)}
                disabled={sending}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs transition-all hover:opacity-80 disabled:opacity-40 border"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                <qq.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                {qq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Capability hint */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="rounded-xl border p-3 space-y-2" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>I can help with</p>
            {[
              'Meta & Instagram Ads',
              'TikTok / YouTube / LinkedIn',
              'Offer & pricing design',
              'Website conversion',
              'Scaling systems & hiring',
              'E-commerce & product ops',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Business context panel (loads profile data) ───────────────────────────────
function BusinessContextPanel() {
  const [ctx, setCtx] = React.useState<{ businessType: string; stage: string; goal: string; hasContext: boolean } | null>(null);

  React.useEffect(() => {
    fetch('/api/user/context')
      .then(r => r.json())
      .then(d => setCtx(d))
      .catch(() => setCtx({ businessType: '', stage: '', goal: '', hasContext: false }));
  }, []);

  if (!ctx) return <div className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--card-bg)' }} />;

  if (!ctx.hasContext) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border p-3 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No profile set up yet.</p>
          <a href="/dashboard/settings" className="text-xs font-semibold mt-1 block" style={{ color: 'var(--accent)' }}>
            Set up in Settings →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[
        { label: 'Type', val: ctx.businessType },
        { label: 'Stage', val: ctx.stage },
        { label: 'Goal', val: ctx.goal },
      ].filter(r => r.val).map(row => (
        <div key={row.label} className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{row.val}</span>
        </div>
      ))}
    </div>
  );
}
