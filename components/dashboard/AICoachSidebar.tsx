"use client"
import * as React from 'react';
import { Sparkles, RefreshCcw, Loader2, Send, Zap, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface CoachReport {
  performance_summary: string;
  primary_issue: string;
  recommendations: { type: string; diagnosis: string; fix: string }[];
}

export function AICoachSidebar() {
  const [report, setReport] = React.useState<CoachReport | null>(null);
  const [reportLoading, setReportLoading] = React.useState(true);
  const [reportError, setReportError] = React.useState<string | null>(null);
  const [regenerating, setRegenerating] = React.useState(false);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever messages change
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const fetchReport = async (isRegen = false) => {
    try {
      if (isRegen) setRegenerating(true);
      else setReportLoading(true);
      setReportError(null);

      const res = await fetch('/api/ai/coach', { method: isRegen ? 'POST' : 'GET' });
      const data = await res.json();

      if (data.needsRegeneration) { await fetchReport(true); return; }
      if (data.error) throw new Error(data.error);

      setReport(data.report);
    } catch (e: any) {
      setReportError(e.message || 'Failed to load report');
    } finally {
      setReportLoading(false);
      setRegenerating(false);
    }
  };

  React.useEffect(() => { fetchReport(); }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // Build history from current messages (exclude the one just added)
      const history = messages.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: 'ai', content: data.reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: "Something went wrong. Check your connection and try again." },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="hidden lg:flex w-72 xl:w-80 flex-col h-screen sticky top-0 flex-shrink-0 border-l transition-colors duration-200" style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AI Coach</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              {reportLoading ? 'Analyzing...' : 'How may I help?'}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchReport(true)}
          disabled={regenerating || reportLoading}
          className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-all disabled:opacity-30"
          title="Refresh report"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Scrollable message area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">

        {/* Performance report bubbles */}
        {reportLoading ? (
          <div className="flex items-center gap-2.5 mt-2">
            <AiAvatar />
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 text-emerald-500 animate-spin" />
                <p className="text-[11px] text-zinc-500">Analyzing your data...</p>
              </div>
            </div>
          </div>
        ) : reportError ? (
          <div className="flex items-start gap-2.5 mt-2">
            <AiAvatar />
            <div className="bg-red-500/[0.06] border border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-3 w-3 text-red-400" />
                <p className="text-[10px] text-red-400 font-semibold">Report failed</p>
              </div>
              <p className="text-[11px] text-red-300/70 leading-relaxed">{reportError}</p>
              <button
                onClick={() => fetchReport(true)}
                className="mt-2 text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest"
              >
                Retry →
              </button>
            </div>
          </div>
        ) : report ? (
          <>
            <div className="flex items-start gap-2.5">
              <AiAvatar />
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-[11px] text-zinc-300 leading-relaxed">{report.performance_summary}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <AiAvatar />
              <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Primary Focus</p>
                <p className="text-[11px] text-emerald-200 leading-relaxed font-medium">{report.primary_issue}</p>
              </div>
            </div>

            {report.recommendations?.slice(0, 3).map((rec, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="h-6 w-6 bg-white/[0.03] border border-white/[0.06] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-zinc-600">
                  {i + 1}
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1 capitalize">{rec.type} fix</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{rec.fix}</p>
                </div>
              </div>
            ))}

            {/* Divider between report and chat */}
            {messages.length > 0 && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-white/[0.05]" />
                <p className="text-[9px] text-zinc-700 uppercase tracking-widest">Chat</p>
                <div className="flex-1 h-px bg-white/[0.05]" />
              </div>
            )}
          </>
        ) : null}

        {/* Chat message history */}
        {messages.map((msg, i) => (
          msg.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                <p className="text-[11px] text-emerald-100 leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-2.5">
              <AiAvatar />
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-[11px] text-zinc-300 leading-relaxed">{msg.content}</p>
              </div>
            </div>
          )
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex items-start gap-2.5">
            <AiAvatar />
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 flex-shrink-0 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] focus-within:border-emerald-500/30 rounded-xl px-3 py-2.5 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={reportLoading || sending}
            className="flex-1 bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending || reportLoading}
            className="text-zinc-600 hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-zinc-800 text-center mt-2">Enter to send · Powered by Groq</p>
      </div>
    </div>
  );
}

function AiAvatar() {
  return (
    <div className="h-6 w-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
      <Zap className="h-3 w-3 text-emerald-400" />
    </div>
  );
}
