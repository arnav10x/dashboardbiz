"use client"
import * as React from 'react';
import { Sparkles, RefreshCcw, Loader2, Send, Zap } from 'lucide-react';

interface CoachReport {
  performance_summary: string;
  primary_issue: string;
  recommendations: { type: string; diagnosis: string; fix: string }[];
}

export function AICoachSidebar() {
  const [report, setReport] = React.useState<CoachReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [regenerating, setRegenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReport = async (isRegen = false) => {
    try {
      if (isRegen) setRegenerating(true);
      else setLoading(true);
      setError(null);

      const res = await fetch('/api/ai/coach', { method: isRegen ? 'POST' : 'GET' });
      const data = await res.json();

      if (data.needsRegeneration) { await fetchReport(true); return; }
      if (data.error) throw new Error(data.error);

      setReport(data.report);
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  React.useEffect(() => { fetchReport(); }, []);

  return (
    <div className="hidden lg:flex w-72 xl:w-80 flex-col bg-[#050505] border-l border-white/[0.06] h-screen sticky top-0 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AI Coach</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">How may I help?</p>
          </div>
        </div>
        <button
          onClick={() => fetchReport(true)}
          disabled={regenerating || loading}
          className="p-1.5 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-all disabled:opacity-30"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
            <p className="text-xs text-zinc-600">Analyzing your data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/[0.05] border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-red-400 mb-3">{error}</p>
            <button
              onClick={() => fetchReport(true)}
              className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest"
            >
              Retry →
            </button>
          </div>
        ) : report ? (
          <>
            {/* AI bubble: summary */}
            <div className="flex gap-2.5">
              <div className="h-6 w-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-[11px] text-zinc-300 leading-relaxed">{report.performance_summary}</p>
              </div>
            </div>

            {/* AI bubble: primary issue */}
            <div className="flex gap-2.5">
              <div className="h-6 w-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Primary ROI Lever</p>
                <p className="text-[11px] text-emerald-200 leading-relaxed font-medium">{report.primary_issue}</p>
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations?.slice(0, 3).map((rec, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="h-6 w-6 bg-white/[0.03] border border-white/[0.06] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold text-zinc-600">
                  {i + 1}
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{rec.type} fix</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{rec.fix}</p>
                </div>
              </div>
            ))}
          </>
        ) : null}
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.07] rounded-xl px-3 py-2.5">
          <input
            type="text"
            placeholder="Ask anything..."
            disabled
            className="flex-1 bg-transparent text-xs text-zinc-400 placeholder:text-zinc-700 outline-none cursor-not-allowed"
          />
          <button disabled className="text-zinc-700">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-zinc-800 text-center mt-2">Chat coming soon</p>
      </div>
    </div>
  );
}
