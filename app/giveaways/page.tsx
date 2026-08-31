"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { EmptyState } from "@/components/common";
import GiveawayEntryModal from "@/components/Giveaway/GiveawayEntryModal";
import { useAuthStore } from "@/store/useAuthStore";
import { FiGift, FiZap, FiAward, FiPackage, FiShare2, FiChevronRight, FiCheckCircle } from "react-icons/fi";

// Helper function to pick dynamic icon & style based on giveaway title/prize
function getGiveawayIcon(title: string = "", prize: string = "") {
  const t = (title + " " + prize).toLowerCase();

  if (t.includes("reedm") || t.includes("redeem") || t.includes("code") || t.includes("voucher")) {
    return {
      icon: Icons.key,
      colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };
  }
  if (t.includes("pass") || t.includes("weekly") || t.includes("wdp")) {
    return {
      icon: FiZap,
      colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  if (t.includes("membership") || t.includes("month")) {
    return {
      icon: FiAward,
      colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    };
  }
  return {
    icon: FiGift,
    colorClass: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
  };
}

export default function GiveawaysPage() {
  const { token, _hasHydrated } = useAuthStore();
  const [giveaways, setGiveaways] = useState<any[]>([]);
  const [wonGiveaways, setWonGiveaways] = useState<any[]>([]);
  const [pastGiveaways, setPastGiveaways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const url = `${window.location.origin}/giveaways?id=${g._id}`;
    const shareData = {
      title: g.title,
      text: `Join the ${g.title} drop on MLBB Top Up India!`,
      url: url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedId(g._id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="min-h-screen pb-12 pt-3 sm:pt-4 bg-[var(--background)]">
      
      {/* ── SIMPLE COMPACT PAGE HEADING ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)]/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4.5 bg-gradient-to-b from-[var(--accent)] to-cyan-500 rounded-full" />
            <div>
              <h1 className="text-sm sm:text-base font-black uppercase tracking-wider text-[var(--foreground)] leading-none italic flex items-center gap-1.5">
                <FiGift size={14} className="text-[var(--accent)]" />
                <span>Live Drops & <span className="text-[var(--accent)]">Free Giveaways</span></span>
              </h1>
              <p className="text-[9.5px] text-[var(--muted)] font-medium mt-0.5 leading-tight">
                Enter 100% free drops to win MLBB Diamonds, Redeem Codes & Passes.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)] text-[8.5px] font-black uppercase tracking-wider text-[var(--foreground)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Free
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* ── ACTIVE GIVEAWAYS SECTION ──────────────────────────────────────── */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-red-500 to-amber-500 rounded-full" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)] leading-none flex items-center gap-1.5">
              <FiZap size={13} className="text-red-500" />
              <span>Active Giveaways</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-xl bg-[var(--card)] border border-[var(--border)] shimmer-overlay" />
              ))}
            </div>
          ) : giveaways.length === 0 ? (
            <EmptyState
              icon={Icons.gift}
              title="No Active Drops Right Now"
              description="All giveaway slots have been filled. New MLBB diamond drops & redeem code giveaways are posted daily!"
              size="md"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {giveaways.map(g => {
                const isFull = g.maxEntries > 0 && g.entryCount >= g.maxEntries;
                const fillPercent = g.maxEntries > 0 ? Math.min(100, Math.round((g.entryCount / g.maxEntries) * 100)) : 0;
                const iconInfo = getGiveawayIcon(g.title, g.prize);
                const IconComponent = iconInfo.icon;
                const displayTitle = g.title?.replace(/reedm/gi, "REDEEM");
                const displayPrize = g.prize?.replace(/reedm/gi, "REDEEM");

                return (
                  <motion.div
                    key={g._id}
                    whileHover={{ y: isFull ? 0 : -2 }}
                    onClick={() => !isFull && setSelectedGiveaway(g)}
                    className={`group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl bg-[var(--card)] border transition-all duration-200 ${
                      isFull 
                        ? "opacity-60 border-[var(--border)]" 
                        : "cursor-pointer border-[var(--border)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Badge & Fill Count Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!isFull ? (
                            <span className="flex h-1.5 w-1.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                            </span>
                          ) : null}
                          <span className={`text-[8.5px] font-black uppercase tracking-wider ${isFull ? "text-[var(--muted)]" : "text-red-500"}`}>
                            {isFull ? "CLOSED" : "LIVE DROP"}
                          </span>
                        </div>

                        <span className="text-[8px] font-bold text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded-md border border-[var(--border)] font-mono">
                          {g.maxEntries > 0 ? `${g.entryCount || 0}/${g.maxEntries} Filled` : `${g.entryCount || 0} Joined`}
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-2.5">
                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isFull 
                            ? "bg-[var(--foreground)]/5 border-[var(--border)] text-[var(--muted)]" 
                            : iconInfo.colorClass
                        }`}>
                          <IconComponent size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-[var(--foreground)] text-[11px] sm:text-xs leading-snug tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 uppercase">
                            {displayTitle}
                          </h3>
                          <p className="text-[9.5px] font-semibold text-[var(--muted)] mt-0.5 truncate">
                            Prize: {displayPrize}
                          </p>
                        </div>
                      </div>

                      {/* Entry Progress Bar */}
                      {g.maxEntries > 0 && (
                        <div className="pt-0.5">
                          <div className="h-1 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                            <div 
                              className={`h-full transition-all duration-500 ${isFull ? "bg-slate-400" : "bg-[var(--accent)]"}`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compact Footer Actions */}
                    <div className="pt-2 mt-2 border-t border-[var(--border)]/40 flex items-center justify-between gap-2">
                      <button 
                        className="flex items-center gap-1 px-2 py-1 text-[8.5px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--background)] rounded-md transition-colors border border-[var(--border)] cursor-pointer"
                        onClick={(e) => handleShare(e, g)}
                        aria-label="Share Giveaway"
                      >
                        <FiShare2 size={10} />
                        <span>{copiedId === g._id ? "Copied!" : "Share"}</span>
                      </button>

                      <button
                        disabled={isFull}
                        className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isFull 
                            ? "bg-[var(--foreground)]/5 text-[var(--muted)] cursor-not-allowed" 
                            : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white active:scale-95"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFull) setSelectedGiveaway(g);
                        }}
                      >
                        <span>{isFull ? "Full" : "Enter"}</span>
                        {!isFull && <FiChevronRight size={11} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── YOUR WINS SECTION ────────────────────────────────────────────── */}
        {wonGiveaways.length > 0 && (
          <section className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)] leading-none flex items-center gap-1.5">
                <FiAward size={13} className="text-amber-500" />
                <span>Your Claimed Rewards</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {wonGiveaways.map(g => (
                <div 
                  key={g._id} 
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <FiAward size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <FiCheckCircle size={9} className="text-amber-500" />
                      <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-500">
                        REWARD CLAIMED
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--foreground)] text-[11px] truncate">
                      {g.title}
                    </h3>
                    <p className="text-[9px] text-[var(--muted)] font-medium truncate">
                      Prize: {g.prize}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── COMPLETED DROPS ─────────────────────────────────────────────── */}
        {pastGiveaways.length > 0 && (
          <section className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[var(--muted)]/40 rounded-full" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)] leading-none flex items-center gap-1.5">
                <FiPackage size={13} className="text-[var(--muted)]" />
                <span>Completed Drops</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {pastGiveaways.map(g => (
                <div 
                  key={g._id} 
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] opacity-75"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--foreground)]/5 text-[var(--muted)] border border-[var(--border)]">
                    <FiCheckCircle size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)] bg-[var(--background)] px-1 py-0.5 rounded border border-[var(--border)] inline-block mb-0.5">
                      ENDED
                    </span>
                    <h3 className="font-bold text-[var(--foreground)] text-[10.5px] truncate leading-snug">
                      {g.title}
                    </h3>
                    <p className="text-[8.5px] text-[var(--muted)] truncate">
                      {g.prize}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Entry Modal */}
      {selectedGiveaway && (
        <GiveawayEntryModal
          giveaway={selectedGiveaway}
          onClose={() => setSelectedGiveaway(null)}
        />
      )}
    </div>
  );
}
