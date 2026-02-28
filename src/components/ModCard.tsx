import React from 'react';
import { usePrices } from '../context/PriceContext';
import { ExternalLink, Users, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from './Layout';
import { motion } from 'motion/react';

interface ModCardProps {
  name: string;
  urlName: string;
  syndicateColor?: string;
  syndicateName?: string;
  displayRank?: 'rank0' | 'maxRank';
  showSyndicate?: boolean;
  isHighlighted?: boolean;
}

export const ModCard: React.FC<ModCardProps> = ({ 
  name, 
  urlName, 
  syndicateColor,
  syndicateName,
  displayRank = 'rank0',
  showSyndicate = false,
  isHighlighted = false
}) => {
  const { prices, loading } = usePrices();
  const modData = prices[urlName];
  const isFetching = loading && !modData;

  const stats = modData ? modData[displayRank] : null;
  const price = stats?.minPrice;
  const count = stats?.orderCount ?? 0;
  const volume = stats?.volume ?? 0;
  const profitScore = stats?.profitScore ?? 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]",
        isHighlighted 
          ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
          : "border-indigo-500/10 bg-[#0a0a0f]/80 hover:border-indigo-500/30 hover:bg-[#0f0f16]/90 backdrop-blur-sm"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {isHighlighted && (
        <div className="absolute -right-6 -top-6 flex h-12 w-12 items-center justify-center bg-indigo-500/20 rotate-45">
          <Sparkles className="h-4 w-4 text-indigo-400 -rotate-45" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1">
          {showSyndicate && syndicateName && (
            <div className={cn("mb-1 text-[10px] font-bold uppercase tracking-widest opacity-80", syndicateColor)}>
              {syndicateName}
            </div>
          )}
          <h3 className={cn("font-semibold tracking-tight leading-tight", !showSyndicate && (syndicateColor || "text-zinc-100"))}>
            {name}
          </h3>
          <p className="mt-1 text-[10px] text-indigo-400/50 font-mono uppercase tracking-tighter">
            {urlName.replace(/_/g, ' ')}
          </p>
        </div>
        
        <a
          href={`https://warframe.market/items/${urlName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md p-1.5 text-indigo-400/50 transition-all hover:bg-indigo-500/10 hover:text-indigo-400"
          title="View on Warframe Market"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-4 space-y-3 relative z-10">
        {/* Price Display */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/60">
              Avg Lowest {displayRank === 'maxRank' ? '(Max)' : '(R0)'}
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              {isFetching ? (
                <div className="h-7 w-14 animate-pulse rounded bg-indigo-500/10" />
              ) : price !== undefined && price !== null ? (
                <>
                  <span className="text-2xl font-bold tracking-tight text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                    {price}
                  </span>
                  <span className="text-xs font-medium text-indigo-400/70">pt</span>
                </>
              ) : (
                <span className="text-sm font-medium text-indigo-400/40">N/A</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {price !== undefined && price !== null && (
              <div className="flex h-5 items-center rounded bg-indigo-500/10 px-1.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                SELL
              </div>
            )}
            {count > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-indigo-400/60" title={`${count} online sellers`}>
                <Users className="h-3 w-3" />
                <span>{count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Profit Score Display */}
        <div className="flex items-center justify-between border-t border-indigo-500/10 pt-3">
          <div className="flex items-center gap-1.5 text-emerald-400" title="Profit Score = Price × Daily Volume">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Profit Score</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1 text-[10px] text-emerald-400/60" title="Average daily volume">
              <span>{volume}/day</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                {profitScore > 0 ? profitScore : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
