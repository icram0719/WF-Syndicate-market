import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { usePrices } from '../context/PriceContext';
import { RefreshCw, Activity, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const Layout: React.FC = () => {
  const { loading, progress, total, refresh, lastRefreshed } = usePrices();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="sticky top-0 z-50 border-b border-indigo-500/10 bg-[#050508]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2.5 group">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform overflow-hidden">
                  <div className="absolute inset-0 bg-indigo-400/20 blur-xl group-hover:bg-indigo-400/30 transition-colors" />
                  <Activity className="h-5 w-5 relative z-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight leading-none text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">WF SYNDICATE</span>
                  <span className="text-[10px] font-bold text-indigo-400/70 tracking-[0.2em] leading-none mt-1">MARKET TRACKER</span>
                </div>
              </NavLink>
              
              <nav className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                      isActive
                        ? "text-zinc-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                        : "text-indigo-400/50 hover:text-indigo-400/80"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>All Offerings</span>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-active"
                          className="absolute inset-0 bg-indigo-500/10 rounded-lg -z-10 border border-indigo-500/20 shadow-inner"
                        />
                      )}
                    </>
                  )}
                </NavLink>
                <NavLink
                  to="/suggestions"
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all",
                      isActive
                        ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        : "text-indigo-400/50 hover:text-indigo-400/80"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Suggestions</span>
                      {isActive && (
                        <motion.div 
                          layoutId="nav-active"
                          className="absolute inset-0 bg-indigo-500/10 rounded-lg -z-10 border border-indigo-500/20 shadow-inner"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </nav>
            </div>

            <div className="flex items-center gap-6">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 text-[10px] font-bold text-zinc-400"
                  >
                    <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-900 border border-zinc-800">
                      <motion.div 
                        className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress / total) * 100}%` }}
                      />
                    </div>
                    <span className="tabular-nums">{Math.round((progress / total) * 100)}%</span>
                  </motion.div>
                ) : lastRefreshed && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hidden text-[10px] font-bold text-indigo-400/50 uppercase tracking-widest sm:block"
                  >
                    SYNCED {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={refresh}
                disabled={loading}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#050508]/50 border border-indigo-500/20 text-indigo-400/70 transition-all hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/10 disabled:opacity-50 shadow-inner"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                {loading && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 pb-24 md:pb-10">
        <Outlet />
      </main>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-indigo-500/10 bg-[#050508]/90 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] pb-safe">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <nav className="flex items-center justify-around p-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-1",
                isActive
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-indigo-400/50 hover:text-indigo-400/80"
              )
            }
          >
            <Activity className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">All</span>
          </NavLink>
          <NavLink
            to="/suggestions"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all flex-1",
                isActive
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-indigo-400/50 hover:text-indigo-400/80"
              )
            }
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Best</span>
          </NavLink>
        </nav>
      </div>

      <footer className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-indigo-500/10 relative z-10 hidden md:block">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-[10px] font-bold text-indigo-400/50 uppercase tracking-[0.3em]">Data Source</span>
            <a href="https://warframe.market" target="_blank" rel="noreferrer" className="text-xs font-medium text-indigo-400/70 hover:text-indigo-400 transition-colors drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">Warframe Market API</a>
          </div>
          <div className="text-[10px] font-bold text-indigo-400/30 uppercase tracking-[0.2em]">
            Tenno Market Intelligence &copy; 2026
          </div>
        </div>
      </footer>
    </div>
  );
};
