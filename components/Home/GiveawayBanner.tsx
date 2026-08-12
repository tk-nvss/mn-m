"use client";

import { useEffect, useState, useRef } from "react";
import { FiGift, FiChevronRight, FiX } from "react-icons/fi";
import { useRouter } from "next/navigation";

const ROTATE_INTERVAL = 4000;

export default function GiveawayBanner() {
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [current, setCurrent]     = useState(0);
  const [visible, setVisible]     = useState(false);
  const [animKey, setAnimKey]     = useState(0);
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/giveaway")
      .then(r => r.json())
      .then(d => { if (d.giveaways?.length) { setGiveaways(d.giveaways); setVisible(true); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (giveaways.length <= 1) return;
    timerRef.current = setInterval(() => {
      setAnimKey(k => k + 1);
      setCurrent(c => (c + 1) % giveaways.length);
    }, ROTATE_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [giveaways.length]);

  if (!visible || !giveaways.length) return (
    <div className="max-w-7xl mx-auto px-4 mt-4 mb-2 h-[52px]" aria-hidden="true" />
  );
  const g = giveaways[current];

  return (
    <>
      <style>{`
        @keyframes gw-swap { 0%{opacity:0;transform:translateX(8px)} 100%{opacity:1;transform:translateX(0)} }
        .gw-content { animation: gw-swap 0.28s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
      <section className="w-full max-w-7xl mx-auto px-4 mt-2 mb-1 relative z-30">
        <div 
          onClick={() => router.push('/giveaways')}
          className="group cursor-pointer relative flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[2rem] bg-[var(--card)] dark:bg-[var(--accent)]/10 border border-[var(--border)] dark:border-[var(--accent)]/20 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--accent)]/50"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-[var(--accent)]/10 to-transparent" />
          
          <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Icon */}
            <div className="flex items-center ml-1 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[0.8rem] sm:rounded-[1rem] flex items-center justify-center border-[2px] border-[var(--background)] dark:border-[var(--card)] z-30 shadow-sm transition-transform group-hover:scale-105 bg-[var(--accent)]/10 dark:bg-[var(--accent)]/20 text-[var(--accent)]">
                <FiGift size={16} className="sm:w-4 sm:h-4 drop-shadow-sm" />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <h3 className="text-[9px] sm:text-[10px] font-black tracking-widest text-red-500 leading-tight uppercase truncate">
                  GIVEAWAY LIVE
                </h3>
                {g.maxEntries > 0 ? (
                  <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 dark:text-[var(--muted)] uppercase truncate">
                    • {g.entryCount || 0}/{g.maxEntries} Filled
                  </span>
                ) : (
                  <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 dark:text-[var(--muted)] uppercase truncate">
                    • {g.entryCount || 0} Entered
                  </span>
                )}
              </div>
              <p key={animKey} className="gw-content text-[12px] sm:text-[14px] font-black tracking-wide text-[var(--foreground)] mt-0.5 truncate">
                {g.title}
              </p>
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="relative z-10 flex items-center gap-2 shrink-0 ml-1 sm:ml-2">
            
            {/* Dots if multiple */}
            {giveaways.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 mr-2">
                {giveaways.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${i === current ? "w-3 bg-[var(--accent)]" : "w-1 bg-[var(--accent)]/30"}`}
                    onClick={e => { e.stopPropagation(); setCurrent(i); setAnimKey(k => k+1); }}
                  />
                ))}
              </div>
            )}

            {/* Action Button */}
            <button 
              className="h-7 sm:h-8 px-3 sm:px-4 rounded-full sm:rounded-[0.5rem] bg-[var(--accent)] text-white flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-black uppercase tracking-wider shadow-md shadow-[var(--accent)]/20 transition-transform hover:scale-105"
              onClick={e => { e.stopPropagation(); router.push('/giveaways'); }}
            >
              Enter <FiChevronRight size={12} />
            </button>
            
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
              aria-label="Close"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
