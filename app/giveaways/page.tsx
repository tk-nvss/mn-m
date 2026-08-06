"use client";

import { useEffect, useState } from "react";
import { FiGift, FiChevronRight, FiUsers, FiShare2, FiAward } from "react-icons/fi";
import GiveawayEntryModal from "@/components/Giveaway/GiveawayEntryModal";
import { useAuthStore } from "@/store/useAuthStore";

export default function GiveawaysPage() {
  const { token, _hasHydrated } = useAuthStore();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [wonGiveaways, setWonGiveaways] = useState<any[]>([]);
  const [pastGiveaways, setPastGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<any>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    
    const headers: any = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/giveaway", { headers })
      .then(r => r.json())
      .then(d => {
        if (d.giveaways) setGiveaways(d.giveaways);
        if (d.wonGiveaways) setWonGiveaways(d.wonGiveaways);
        if (d.pastGiveaways) setPastGiveaways(d.pastGiveaways);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [_hasHydrated, token]);

  const handleShare = async (e: React.MouseEvent, g: any) => {
    e.stopPropagation();
    const url = `${window.location.origin}?giveaway=${g._id}`;
    const shareData = {
      title: g.title,
      text: `Join the ${g.title} on MLBB Top Up India!`,
      url: url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-24 pt-8 md:pt-12 px-6">
      
      <div className="mb-5 flex items-center gap-2 px-1">
        <FiGift className="text-[var(--accent)]" size={18} />
        <h1 className="text-base font-black text-[var(--foreground)] tracking-tight">Active Giveaways</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin" />
        </div>
      ) : giveaways.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-[1.25rem] bg-[var(--foreground)]/[0.02]">
          <FiGift size={24} className="mx-auto text-[var(--muted)] opacity-30 mb-2" />
          <p className="text-xs font-bold text-[var(--muted)]">No active drops right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {giveaways.map(g => {
            const isFull = g.maxEntries > 0 && g.entryCount >= g.maxEntries;
            
            return (
              <div
                key={g._id}
                onClick={() => !isFull && setSelectedGiveaway(g)}
                className={`relative flex items-center gap-3 p-3 rounded-[1.25rem] bg-[var(--card)] border transition-all duration-300 ${
                  isFull 
                    ? "opacity-60 border-[var(--border)]" 
                    : "cursor-pointer border-[var(--border)] hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5"
                }`}
              >
                {/* Thin accent top line */}
                {!isFull && <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50" />}

                {/* Icon */}
                <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${isFull ? "bg-[var(--foreground)]/5 text-[var(--muted)]" : "bg-[var(--accent)]/10 text-[var(--accent)]"}`}>
                  <FiGift size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {!isFull && <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-[pulse_1.5s_ease-in-out_infinite]" />}
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isFull ? "text-[var(--muted)]" : "text-[#ef4444]"}`}>
                      {isFull ? "Ended" : "Live Drop"}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--muted)] ml-auto">
                      {g.maxEntries > 0 ? `${g.entryCount || 0}/${g.maxEntries} Filled` : `${g.entryCount || 0} Joined`}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-[var(--foreground)] text-[13px] leading-tight">
                    {g.title}
                  </h3>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">
                    {g.prize}
                  </p>
                </div>

                {/* Action */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <button 
                    className="flex items-center justify-center w-7 h-7 text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.08] rounded-lg transition-colors border border-[var(--border)]"
                    onClick={(e) => handleShare(e, g)}
                    aria-label="Share"
                  >
                    <FiShare2 size={12} />
                  </button>
                  <button aria-label="button"
                    disabled={isFull}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      isFull 
                        ? "bg-[var(--foreground)]/5 text-[var(--muted)]" 
                        : "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20 hover:shadow-lg hover:shadow-[var(--accent)]/30 hover:-translate-y-0.5"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isFull) setSelectedGiveaway(g);
                    }}
                  >
                    {isFull ? "Full" : "Enter"} <FiChevronRight size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Won Giveaways */}
      {wonGiveaways.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2 px-1">
            <FiAward className="text-yellow-500" size={18} />
            <h2 className="text-sm font-black text-[var(--foreground)] tracking-tight">Your Past Wins</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wonGiveaways.map(g => (
              <div key={g._id} className="relative flex items-center gap-3 p-3 rounded-[1.25rem] bg-[var(--foreground)]/[0.02] border border-yellow-500/20 opacity-80">
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-yellow-500/10 text-yellow-500">
                  <FiAward size={18} />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-yellow-500">Your rewards have been sent</span>
                  </div>
                  <h3 className="font-bold text-[var(--foreground)] text-[13px] leading-tight">
                    {g.title}
                  </h3>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">
                    Prize: {g.prize}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Giveaways */}
      {pastGiveaways.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2 px-1">
            <FiGift className="text-[var(--muted)]" size={18} />
            <h2 className="text-sm font-black text-[var(--foreground)] tracking-tight">Past Giveaways</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastGiveaways.map(g => (
              <div key={g._id} className="relative flex items-center gap-3 p-3 rounded-[1.25rem] bg-[var(--foreground)]/[0.02] border border-[var(--border)] opacity-70">
                <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-[var(--foreground)]/5 text-[var(--muted)]">
                  <FiGift size={18} />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">Ended</span>
                  </div>
                  <h3 className="font-bold text-[var(--foreground)] text-[13px] leading-tight line-through decoration-[var(--muted)]/50">
                    {g.title}
                  </h3>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">
                    Prize: {g.prize}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedGiveaway && (
        <GiveawayEntryModal
          giveaway={selectedGiveaway}
          onClose={() => setSelectedGiveaway(null)}
        />
      )}
    </div>
  );
}
