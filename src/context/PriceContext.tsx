import React, { createContext, useContext, useEffect, useState } from 'react';
import { SYNDICATES } from '../data/syndicates';

export interface ModStats {
  minPrice: number | null;
  avgPrice: number | null;
  orderCount: number;
  volume: number;
  profitScore: number;
}

export interface ModData {
  rank0: ModStats;
  maxRank: ModStats;
  lastUpdated: number;
}

interface PriceContextType {
  prices: Record<string, ModData | null>;
  loading: boolean;
  progress: number;
  total: number;
  lastRefreshed: Date | null;
  refresh: () => void;
}

const PriceContext = createContext<PriceContextType | undefined>(undefined);

export const usePrices = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrices must be used within a PriceProvider');
  }
  return context;
};

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<Record<string, ModData | null>>({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  const allMods = Array.from(new Set(SYNDICATES.flatMap(s => [
    ...s.mods.map(m => m.urlName),
    ...(s.items ? s.items.map(i => i.urlName) : [])
  ])));
  const total = allMods.length;

  const calculateStats = (orders: any[], stats: any[], rank: number): ModStats => {
    let volume = 0;
    
    // Calculate volume from recent statistics (last 48 hours)
    if (stats && stats.length > 0) {
      // Filter stats by rank (or assume 0 if not provided)
      const rankStats = stats.filter(s => s.mod_rank === rank || s.mod_rank === undefined);
      // Get the last 48 hours of volume
      volume = rankStats.reduce((acc, s) => acc + (s.volume || 0), 0);
      // Average daily volume (divide by 2 since it's 48 hours)
      volume = Math.round(volume / 2);
    }

    if (orders.length === 0) {
      return { minPrice: null, avgPrice: null, orderCount: 0, volume, profitScore: 0 };
    }
    
    // Sort by price ascending
    const sortedOrders = [...orders].sort((a, b) => a.platinum - b.platinum);
    
    // Take the 3 lowest prices (or all if less than 3)
    const lowestThree = sortedOrders.slice(0, 3);
    const sum = lowestThree.reduce((acc, o) => acc + o.platinum, 0);
    const avgOfLowest = Math.round((sum / lowestThree.length) * 10) / 10;
    
    // Calculate profit score (price * volume)
    const profitScore = Math.round(avgOfLowest * volume);

    // We'll use the average of the 3 lowest as our "minPrice" for more stability
    return {
      minPrice: avgOfLowest,
      avgPrice: Math.round((orders.reduce((a, b) => a + b.platinum, 0) / orders.length) * 10) / 10,
      orderCount: orders.length,
      volume,
      profitScore
    };
  };

  const CACHE_KEY = 'warframe_market_prices_v1';
  const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  const fetchPrices = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setPrices(data);
            setLastRefreshed(new Date(timestamp));
            setProgress(total);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached prices', e);
        }
      }
    }

    setLoading(true);
    setProgress(0);
    
    const newPrices: Record<string, ModData | null> = {};
    let completed = 0;
    
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < allMods.length; i += BATCH_SIZE) {
      const batch = allMods.slice(i, i + BATCH_SIZE);
      try {
        const res = await fetch('/api/market/data/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: batch })
        });
        
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const results = await res.json();
            const batchPrices: Record<string, ModData | null> = {};
            
            for (const urlName of batch) {
              const data = results[urlName];
              if (data && !data.error) {
                const orders = data.orders?.data || (data.orders?.payload && data.orders?.payload.orders);
                const stats = data.statistics?.payload?.statistics_closed?.['48hours'] || [];
                
                if (orders && Array.isArray(orders)) {
                  const sellOrders = orders.filter((o: any) => (o.type === 'sell' || o.order_type === 'sell'));
                  const rank0Orders = sellOrders.filter((o: any) => (o.rank === 0 || o.mod_rank === 0 || o.rank === undefined));
                  const maxRankOrders = sellOrders.filter((o: any) => (o.rank > 0 || o.mod_rank > 0));

                  batchPrices[urlName] = {
                    rank0: calculateStats(rank0Orders, stats, 0),
                    maxRank: calculateStats(maxRankOrders, stats, 5),
                    lastUpdated: Date.now()
                  };
                } else {
                  batchPrices[urlName] = null;
                }
              } else {
                batchPrices[urlName] = null;
              }
              newPrices[urlName] = batchPrices[urlName];
            }
            
            setPrices(prev => ({ ...prev, ...batchPrices }));
          }
        } else {
          console.error(`[PriceContext] Batch fetch failed: ${res.status}`);
        }
      } catch (e: any) {
        console.error(`[PriceContext] Batch fetch error:`, e.message);
      }
      
      completed += batch.length;
      setProgress(Math.min(completed, total));
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: newPrices,
      timestamp: Date.now()
    }));
    
    setLoading(false);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    fetchPrices(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PriceContext.Provider value={{ prices, loading, progress, total, lastRefreshed, refresh: () => fetchPrices(true) }}>
      {children}
    </PriceContext.Provider>
  );
};
