import Link from "next/link";
import { FiShoppingCart, FiDollarSign, FiClock, FiChevronRight } from "react-icons/fi";

export default function TradeMarketplaceBanner() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-2">
      <Link href="/trade" rel="noopener noreferrer">
        <div className="group relative flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 dark:via-zinc-800 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            
            {/* Overlapping Icons */}
            <div className="flex items-center -space-x-2 sm:-space-x-3 ml-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-[var(--accent)] z-30 shadow-sm transition-transform group-hover:scale-105">
                <FiShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-[var(--accent)] z-20 shadow-sm transition-transform group-hover:scale-105 delay-75">
                <FiDollarSign size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--background)] flex items-center justify-center border-[2px] border-[var(--card)] text-[var(--accent)] z-10 shadow-sm transition-transform group-hover:scale-105 delay-150">
                <FiClock size={12} className="sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <h3 className="text-[13px] sm:text-[14px] font-black italic tracking-wide text-[var(--foreground)] leading-tight uppercase drop-shadow-md">
                Trade Marketplace
              </h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-[var(--muted)] mt-1 tracking-[0.1em] uppercase flex items-center gap-1.5">
                Buy <span className="text-[var(--muted)]/50 text-[6px]">●</span> Sell <span className="text-[var(--muted)]/50 text-[6px]">●</span> Rent
              </p>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="relative z-10 hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[9px] sm:text-[10px] font-bold text-[var(--accent)] group-hover:bg-[var(--accent)]/20 group-hover:border-[var(--accent)]/40 transition-colors uppercase tracking-wider">
            Trade Now
            <FiChevronRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
          </div>
          
          {/* Mobile Right Arrow */}
          <div className="sm:hidden relative z-10 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)]">
            <FiChevronRight size={14} />
          </div>
        </div>
      </Link>
    </section>
  );
}
