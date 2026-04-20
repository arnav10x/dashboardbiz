"use client"
import * as React from 'react';
import { CoachRecommendationCard, RecommendationType } from './CoachRecommendationCard';
import { Sparkles, RefreshCcw, Loader2, AlertCircle, Quote } from 'lucide-react';

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
        // Automatically trigger first generation if cache empty
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
    const now = new Date();
    const then = new Date(generatedAt);
    const diffMins = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return '>24h ago';
  }, [generatedAt, regenerating]);

  if (loading) {
    return (
      <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-sm font-bold text-white tracking-tight">Consulting AI Performance Coach...</p>
          <p className="text-xs text-zinc-500 max-w-[200px]">Analyzing 7 days of raw outreach data and your business offer.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        <div className="space-y-3">
          <p className="text-sm text-red-200 font-medium">{error}</p>
          <button 
            onClick={() => fetchReport(true)}
            className="text-xs font-bold text-white bg-red-500/20 px-3 py-1.5 rounded hover:bg-red-500/30 transition-colors uppercase tracking-widest"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      
      {/* Header Widget */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-[#09090b] border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Quote className="h-24 w-24 text-white" />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight italic">Brutal Accountability</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Last Analysis: {timeAgoLabel}
            </span>
            <button 
              onClick={() => fetchReport(true)}
              disabled={regenerating}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-all active:scale-95 disabled:opacity-50"
              title="Regenerate Report"
            >
              <RefreshCcw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="space-y-1">
             <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Performance Summary</span>
             <p className="text-lg font-medium text-white leading-relaxed">
               {report?.performance_summary}
             </p>
          </div>
          <div className="bg-[#09090b]/60 border border-zinc-800/80 p-4 rounded-lg">
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest block mb-1">Primary ROI Lever</span>
             <p className="text-sm font-bold text-zinc-200">
               {report?.primary_issue}
             </p>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
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
