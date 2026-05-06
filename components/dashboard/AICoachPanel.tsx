"use client"
import * as React from 'react';
import { CoachRecommendationCard, RecommendationType } from './CoachRecommendationCard';
import { Sparkles, RefreshCcw, Loader2, AlertCircle } from 'lucide-react';

interface Recommendation {
  type: RecommendationType;
  diagnosis: string;
  fix: string;
  example_before: string;
  example_after: string;
}

interface CoachReport {
  performance_summary: string;
  primary_issue: string;
  recommendations: Recommendation[];
}

export function AICoachPanel() {
  const [report, setReport] = React.useState<CoachReport | null>(null);
  const [generatedAt, setGeneratedAt] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [regenerating, setRegenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchReport = async (isRegeneration = false) => {
    try {
      if (isRegeneration) setRegenerating(true);
      else setLoading(true);
      setError(null);

      const method = isRegeneration ? 'POST' : 'GET';
      const res = await fetch('/api/ai/coach', { method });
      const data = await res.json();

      if (data.needsRegeneration) {
        await fetchReport(true);
        return;
      }

      if (data.error) throw new Error(data.error);

      setReport(data.report);
      setGeneratedAt(data.generatedAt);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AI Coach');
    } finally {
      setLoading(false);
      setRegenerating(false);
    }
  };

  React.useEffect(() => {
    fetchReport();
  }, []);

  const timeAgoLabel = React.useMemo(() => {
    if (!generatedAt) return '';
    const diffMins = Math.floor((Date.now() - new Date(generatedAt).getTime()) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return '>24h ago';
  }, [generatedAt, regenerating]);

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-10 flex flex-col items-center justify-center gap-4 min-h-[320px]">
        <Loader2 className="h-7 w-7 text-emerald-500 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white mb-1">Consulting AI Coach...</p>
          <p className="text-xs text-zinc-600 max-w-[180px]">Analyzing your outreach data and offer.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/[0.05] border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-3">
          <p className="text-sm text-red-300 font-medium">{error}</p>
          <button
            onClick={() => fetchReport(true)}
            className="text-[10px] font-bold text-white bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors uppercase tracking-widest"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <h2 className="text-base font-bold text-white">Brutal Accountability</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium text-zinc-600 hidden sm:block">{timeAgoLabel}</span>
            <button
              onClick={() => fetchReport(true)}
              disabled={regenerating}
              className="p-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-400 rounded-lg transition-all active:scale-95 disabled:opacity-40"
              title="Regenerate"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div>
            <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-[0.15em] mb-2">Performance Summary</p>
            <p className="text-base font-medium text-white leading-relaxed">{report?.performance_summary}</p>
          </div>
          <div className="bg-black/40 border border-white/[0.06] p-4 rounded-xl">
            <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-[0.15em] mb-1.5">Primary ROI Lever</p>
            <p className="text-sm font-semibold text-zinc-200">{report?.primary_issue}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {report?.recommendations.map((rec, i) => (
          <CoachRecommendationCard
            key={i}
            type={rec.type}
            diagnosis={rec.diagnosis}
            fix={rec.fix}
            exampleBefore={rec.example_before}
            exampleAfter={rec.example_after}
          />
        ))}
      </div>
    </div>
  );
}
