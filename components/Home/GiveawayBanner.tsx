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
          className="group cursor-pointer relative flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--accent)]/50"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-[var(--accent)]/10 to-transparent" />
          
          <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Icon */}
            <div className="flex items-center ml-1 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border border-[var(--accent)]/30 z-30 shadow-sm transition-transform group-hover:scale-105 bg-[var(--accent)]/15 text-[var(--accent)]">
                <FiGift size={16} className="sm:w-4 sm:h-4 drop-shadow-sm" />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <h3 className="text-[8px] sm:text-[8.5px] font-black tracking-widest text-emerald-400 leading-tight uppercase truncate">
                  GIVEAWAY LIVE
                </h3>
                {g.maxEntries > 0 ? (
                  <span className="text-[7.5px] sm:text-[8px] font-bold text-[var(--muted)]/70 uppercase truncate">
                    • {g.entryCount || 0}/{g.maxEntries} Filled
                  </span>
                ) : (
                  <span className="text-[7.5px] sm:text-[8px] font-bold text-[var(--muted)]/70 uppercase truncate">
                    • {g.entryCount || 0} Entered
                  </span>
                )}
              </div>
              <p key={animKey} className="gw-content text-[11px] sm:text-[12.5px] font-black tracking-normal text-[var(--foreground)] mt-0.5 truncate">
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
                    className={`h-1 rounded-full transition-all duration-300 ${i === current ? "w-3 bg-[var(--accent)]" : "w-1 bg-[var(--muted)]/30"}`}
                    onClick={e => { e.stopPropagation(); setCurrent(i); setAnimKey(k => k+1); }}
                  />
                ))}
              </div>
            )}

            {/* Action Button */}
            <button 
              className="h-6 sm:h-7 px-3 sm:px-3.5 rounded-lg bg-[var(--accent)] hover:brightness-110 !text-white flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md shadow-[var(--accent)]/20 transition-all hover:scale-105 active:scale-95"
              onClick={e => { e.stopPropagation(); router.push('/giveaways'); }}
            >
              <span>Enter</span>
              <FiChevronRight size={11} />
            </button>
            
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-all duration-300"
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
