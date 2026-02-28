import React, { useMemo } from 'react';
import { SYNDICATES } from '../data/syndicates';
import { ModCard } from '../components/ModCard';
import { usePrices } from '../context/PriceContext';
import { cn } from '../components/Layout';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';

export const Suggestions: React.FC = () => {
  const { prices, loading } = usePrices();

  const topOfferings = useMemo(() => {
    return SYNDICATES.map((syndicate) => {
      // Combine mods and items for suggestions
      const allOfferings = [...syndicate.mods, ...(syndicate.items || [])];
      
      const offeringsWithScores = allOfferings.map((offering) => {
        const data = prices[offering.urlName];
        const stats = data?.rank0;
        const price = stats?.minPrice ?? 0;
        const count = stats?.orderCount ?? 0;
        const volume = stats?.volume ?? 0;
        const score = stats?.profitScore ?? 0;

        return {
          ...offering,
          price,
          count,
          volume,
          score
        };
      });

      // Sort by score descending, then take top 2
      const top2 = offeringsWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      return {
        ...syndicate,
        topOfferings: top2,
      };
    });
  }, [prices]);

  return (
    <div className="space-y-12 relative z-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Best Value Offerings</h1>
          </div>
          <p className="text-indigo-400/70">The top 2 most profitable items to sell from each syndicate based on Profit Score.</p>
        </div>
        
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-sm">
          <TrendingUp className="h-4 w-4" />
          <span>Highest Profit Score</span>
        </div>
      </div>

      {loading && Object.keys(prices).length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-indigo-500/20 border-dashed bg-[#050508]/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-indigo-400/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/50 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <p className="font-mono text-sm uppercase tracking-widest">Analyzing market data...</p>
          </div>
        </div>
      ) : Object.keys(prices).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-[#050508]/80 p-8 text-center shadow-[0_8px_30px_rgba(239,68,68,0.1)] backdrop-blur-md">
          <div className="mb-4 rounded-full bg-red-500/10 p-3 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Connection Issue</h3>
          <p className="mt-2 max-w-md text-sm text-red-400/70">
            We're having trouble reaching the Warframe Market API. This is often due to temporary rate limits. Please try refreshing in a few moments.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-6 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow-inner"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {topOfferings.map((syndicate) => (
            <section
              key={syndicate.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-indigo-500/10 bg-[#0a0a0f]/80 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:border-indigo-500/30"
            >
              <div className={cn("flex items-center justify-between border-b border-indigo-500/10 p-4 relative overflow-hidden", syndicate.bg)}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className={cn("h-3 w-3 rounded-full bg-current shadow-[0_0_8px_currentColor]", syndicate.color)} />
                  <h2 className={cn("text-lg font-semibold tracking-tight drop-shadow-[0_0_8px_currentColor]", syndicate.color)}>
                    {syndicate.name}
                  </h2>
                </div>
                <div className="rounded bg-[#050508]/80 px-2 py-1 text-xs font-medium text-indigo-400/70 border border-indigo-500/20 relative z-10">
                  Top 2
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                {syndicate.topOfferings.map((offering) => (
                  <ModCard
                    key={`${syndicate.id}-${offering.urlName}`}
                    name={offering.name}
                    urlName={offering.urlName}
                    syndicateColor={syndicate.color}
                    displayRank="rank0"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
