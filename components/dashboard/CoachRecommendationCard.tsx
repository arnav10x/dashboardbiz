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
  opener: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  offer: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  targeting: { icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  followup: { icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  timing: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
};

export function CoachRecommendationCard({ type, diagnosis, fix, exampleBefore, exampleAfter }: CoachRecommendationCardProps) {
  const config = typeConfig[type] || typeConfig.offer;
  const Icon = config.icon;

  return (
    <div className={`p-5 rounded-lg border bg-[#18181b] ${config.border} space-y-4`}>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-md ${config.bg}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <span className={`text-[10px] uppercase font-bold tracking-widest ${config.color}`}>
          {type} improvement
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">The Issue</span>
          <p className="text-sm text-zinc-300 font-medium leading-relaxed">{diagnosis}</p>
        </div>
        <div className="flex flex-col pt-2">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">The Fix</span>
          <p className="text-sm text-zinc-100 font-bold leading-relaxed">{fix}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="bg-[#09090b] p-3 rounded border border-zinc-800 relative overflow-hidden">
           <span className="absolute top-2 right-2 text-[8px] font-bold text-red-500/50 uppercase tracking-widest">Before</span>
           <p className="text-xs text-zinc-500 italic pr-6	">"{exampleBefore}"</p>
        </div>
        <div className="bg-indigo-500/5 p-3 rounded border border-indigo-500/20 relative overflow-hidden">
           <span className="absolute top-2 right-2 text-[8px] font-bold text-indigo-400/50 uppercase tracking-widest">After</span>
           <p className="text-xs text-indigo-100 font-medium pr-6">"{exampleAfter}"</p>
        </div>
      </div>
    </div>
  );
}
