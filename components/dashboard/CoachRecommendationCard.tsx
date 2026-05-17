import * as React from 'react';
import { Target, MessageSquare, Zap, Clock, Users } from 'lucide-react';

export type RecommendationType = 'opener' | 'offer' | 'targeting' | 'followup' | 'timing';

interface CoachRecommendationCardProps {
  type: RecommendationType;
  diagnosis: string;
  fix: string;
  exampleBefore: string;
  exampleAfter: string;
}

const typeConfig = {
  opener:    { icon: MessageSquare, color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20' },
  offer:     { icon: Zap,           color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20' },
  targeting: { icon: Target,        color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  followup:  { icon: Clock,         color: 'text-teal-400',    bg: 'bg-teal-400/10',    border: 'border-teal-400/20' },
  timing:    { icon: Users,         color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
};

export function CoachRecommendationCard({
  type,
  diagnosis,
  fix,
  exampleBefore,
  exampleAfter,
}: CoachRecommendationCardProps) {
  const config = typeConfig[type] || typeConfig.offer;
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-2xl border bg-white/[0.02] ${config.border} space-y-4`}>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        </div>
        <span className={`text-[9px] uppercase font-bold tracking-[0.15em] ${config.color}`}>
          {type} fix
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-[0.1em] mb-1">The Issue</p>
          <p className="text-sm text-zinc-400 leading-relaxed">{diagnosis}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold text-emerald-500 tracking-[0.1em] mb-1">The Fix</p>
          <p className="text-sm text-white font-semibold leading-relaxed">{fix}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-1">
        <div className="bg-black/40 p-3 rounded-xl border border-white/[0.05] relative">
          <span className="absolute top-2 right-2 text-[8px] font-bold text-red-500/40 uppercase tracking-widest">Before</span>
          <p className="text-[11px] text-zinc-600 italic pr-10">"{exampleBefore}"</p>
        </div>
        <div className="bg-emerald-500/[0.05] p-3 rounded-xl border border-emerald-500/20 relative">
          <span className="absolute top-2 right-2 text-[8px] font-bold text-emerald-500/50 uppercase tracking-widest">After</span>
          <p className="text-[11px] text-emerald-200 font-medium pr-10">"{exampleAfter}"</p>
        </div>
      </div>
    </div>
  );
}
