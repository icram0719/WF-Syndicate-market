import React from 'react';
import { Search, Filter, ArrowUpDown, Layers } from 'lucide-react';
import { SYNDICATES } from '../data/syndicates';

export interface FilterState {
  syndicate: string;
  rank: 'rank0' | 'maxRank';
  sortBy: 'price' | 'popularity' | 'name' | 'syndicate';
  sortOrder: 'asc' | 'desc';
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const handleChange = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-indigo-500/10 bg-[#0a0a0f]/80 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md md:flex-row md:items-center md:justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
      
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center relative z-10">
        {/* Search */}
        <div className="relative flex-1 md:max-w-xs group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="block w-full rounded-lg border border-indigo-500/20 bg-[#050508]/50 py-2 pl-10 pr-8 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500/50 focus:bg-[#050508]/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
          />
          {filters.search && (
            <button
              onClick={() => handleChange('search', '')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-indigo-400/50 hover:text-indigo-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}
        </div>

        {/* Syndicate Filter */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Filter className="h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <select
            value={filters.syndicate}
            onChange={(e) => handleChange('syndicate', e.target.value)}
            className="block w-full appearance-none rounded-lg border border-indigo-500/20 bg-[#050508]/50 py-2 pl-10 pr-8 text-sm text-zinc-100 focus:border-indigo-500/50 focus:bg-[#050508]/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
          >
            <option value="all">All Syndicates</option>
            {SYNDICATES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Rank Filter */}
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Layers className="h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <select
            value={filters.rank}
            onChange={(e) => handleChange('rank', e.target.value as 'rank0' | 'maxRank')}
            className="block w-full appearance-none rounded-lg border border-indigo-500/20 bg-[#050508]/50 py-2 pl-10 pr-8 text-sm text-zinc-100 focus:border-indigo-500/50 focus:bg-[#050508]/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
          >
            <option value="rank0">Rank 0 (Unranked)</option>
            <option value="maxRank">Max Rank</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 relative z-10">
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <ArrowUpDown className="h-4 w-4 text-indigo-400/50 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value as any)}
            className="block w-full appearance-none rounded-lg border border-indigo-500/20 bg-[#050508]/50 py-2 pl-10 pr-8 text-sm text-zinc-100 focus:border-indigo-500/50 focus:bg-[#050508]/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
          >
            <option value="price">Sort by Price</option>
            <option value="popularity">Sort by Popularity</option>
            <option value="name">Sort by Name</option>
            <option value="syndicate">Sort by Syndicate</option>
          </select>
        </div>

        <button
          onClick={() => handleChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="flex items-center justify-center rounded-lg border border-indigo-500/20 bg-[#050508]/50 p-2 text-indigo-400/70 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/40 transition-all shadow-inner"
          title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          <ArrowUpDown className={`h-4 w-4 transition-transform ${filters.sortOrder === 'desc' ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
