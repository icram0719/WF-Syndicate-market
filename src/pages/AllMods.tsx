import React, { useState, useMemo } from 'react';
import { SYNDICATES } from '../data/syndicates';
import { ModCard } from '../components/ModCard';
import { usePrices } from '../context/PriceContext';
import { FilterBar, FilterState } from '../components/FilterBar';
import { cn } from '../components/Layout';
import { Activity } from 'lucide-react';

export const AllMods: React.FC = () => {
  const { prices, loading } = usePrices();
  const [activeTab, setActiveTab] = useState<'mods' | 'items'>('mods');
  const [filters, setFilters] = useState<FilterState>({
    syndicate: 'all',
    rank: 'rank0',
    sortBy: 'price',
    sortOrder: 'desc',
    search: '',
  });

  const topModIds = useMemo(() => {
    const ids = new Set<string>();
    SYNDICATES.forEach(syndicate => {
      const itemsList = activeTab === 'mods' ? syndicate.mods : (syndicate.items || []);
      const modsWithScores = itemsList.map(mod => {
        const modData = prices[mod.urlName];
        const stats = modData?.rank0;
        const score = stats?.profitScore ?? 0;
        return { id: mod.urlName, score };
      });
      modsWithScores.sort((a, b) => b.score - a.score).slice(0, 2).forEach(m => ids.add(m.id));
    });
    return ids;
  }, [prices, activeTab]);

  const filteredMods = useMemo(() => {
    let mods = SYNDICATES.flatMap(s => {
      const itemsList = activeTab === 'mods' ? s.mods : (s.items || []);
      return itemsList.map(m => ({ 
        ...m, 
        syndicateId: s.id, 
        syndicateName: s.name, 
        syndicateColor: s.color 
      }));
    });

    // Filter by Syndicate
    if (filters.syndicate !== 'all') {
      mods = mods.filter(m => m.syndicateId === filters.syndicate);
    }

    // Filter by Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      mods = mods.filter(m => m.name.toLowerCase().includes(searchLower) || m.urlName.replace(/_/g, ' ').includes(searchLower));
    }

    // Sort
    return mods.sort((a, b) => {
      const dataA = prices[a.urlName]?.[filters.rank];
      const dataB = prices[b.urlName]?.[filters.rank];
      
      const priceA = dataA?.minPrice;
      const priceB = dataB?.minPrice;
      
      const countA = dataA?.orderCount ?? 0;
      const countB = dataB?.orderCount ?? 0;
      
      const scoreA = dataA?.profitScore ?? 0;
      const scoreB = dataB?.profitScore ?? 0;

      // Handle nulls for price sort
      if (filters.sortBy === 'price') {
        const hasA = priceA !== null && priceA !== undefined && priceA > 0;
        const hasB = priceB !== null && priceB !== undefined && priceB > 0;
        
        if (!hasA && !hasB) return 0;
        if (!hasA) return 1; // Put missing data at the end
        if (!hasB) return -1; // Put missing data at the end
        
        return filters.sortOrder === 'asc' ? priceA! - priceB! : priceB! - priceA!;
      }
      
      if (filters.sortBy === 'popularity') {
        const hasA = scoreA > 0;
        const hasB = scoreB > 0;
        
        if (!hasA && !hasB) return 0;
        if (!hasA) return 1; // Put missing data at the end
        if (!hasB) return -1; // Put missing data at the end
        
        return filters.sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      
      if (filters.sortBy === 'syndicate') {
        const syndicateCompare = a.syndicateName.localeCompare(b.syndicateName);
        if (syndicateCompare !== 0) {
          return filters.sortOrder === 'asc' ? syndicateCompare : -syndicateCompare;
        }
        // Fallback to name if same syndicate
        return a.name.localeCompare(b.name);
      }
      
      // Name sort
      const nameCompare = a.name.localeCompare(b.name);
      return filters.sortOrder === 'asc' ? nameCompare : -nameCompare;
    });
  }, [filters, prices, activeTab]);

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Syndicate Offerings</h1>
          <p className="mt-2 text-indigo-400/70">Track and filter offerings across all syndicates. <span className="text-indigo-400 font-medium drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">Highlighted items</span> have the highest profit score (Price × Volume).</p>
        </div>
        
        <div className="flex space-x-1 rounded-xl bg-[#050508]/80 p-1 w-fit border border-indigo-500/20 shadow-inner backdrop-blur-md">
          <button
            onClick={() => setActiveTab('mods')}
            className={cn(
              "rounded-lg px-6 py-2 text-sm font-medium transition-all duration-300",
              activeTab === 'mods' 
                ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/30" 
                : "text-indigo-400/50 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent"
            )}
          >
            Mods
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={cn(
              "rounded-lg px-6 py-2 text-sm font-medium transition-all duration-300",
              activeTab === 'items' 
                ? "bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] border border-indigo-500/30" 
                : "text-indigo-400/50 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent"
            )}
          >
            Weapons & Items
          </button>
        </div>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      {Object.keys(prices).length === 0 && loading && (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-indigo-500/20 border-dashed bg-[#050508]/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-indigo-400/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500/50 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <p className="font-mono text-sm uppercase tracking-widest">Analyzing market data...</p>
          </div>
        </div>
      )}

      {Object.keys(prices).length === 0 && !loading && (
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
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredMods.map((mod) => (
          <ModCard
            key={`${mod.syndicateId}-${mod.urlName}`}
            name={mod.name}
            urlName={mod.urlName}
            syndicateColor={mod.syndicateColor}
            syndicateName={mod.syndicateName}
            displayRank={filters.rank}
            showSyndicate={true}
            isHighlighted={topModIds.has(mod.urlName)}
          />
        ))}
      </div>
      
      {filteredMods.length === 0 && Object.keys(prices).length > 0 && (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-indigo-500/20 border-dashed bg-[#050508]/50 text-indigo-400/50 backdrop-blur-sm font-mono text-sm uppercase tracking-widest">
          No items found matching your filters.
        </div>
      )}
    </div>
  );
};
