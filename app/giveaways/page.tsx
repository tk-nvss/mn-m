"use client";

import { useEffect, useState } from "react";
import { 
  FiGift, 
  FiChevronRight, 
  FiShare2, 
  FiAward, 
  FiCheckCircle, 
  FiZap, 
  FiArchive, 
  FiKey 
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { EmptyState } from "@/components/common";
import GiveawayEntryModal from "@/components/Giveaway/GiveawayEntryModal";
import { useAuthStore } from "@/store/useAuthStore";

// Helper function to pick dynamic icon & style based on giveaway title/prize
function getGiveawayIcon(title: string = "", prize: string = "") {
  const t = (title + " " + prize).toLowerCase();

  if (t.includes("reedm") || t.includes("redeem") || t.includes("code") || t.includes("voucher")) {
    return {
      icon: FiKey,
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
    <div className="min-h-screen pb-16 pt-3 sm:pt-4 bg-[var(--background)]">
      
      {/* ── SIMPLE COMPACT PAGE HEADING ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)]/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 shrink-0">
              <FiGift size={16} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--foreground)] leading-none italic">
                Live Drops & <span className="text-[var(--accent)]">Free Giveaways</span>
              </h1>
              <p className="text-[10px] text-[var(--muted)] font-medium mt-0.5 leading-tight">
                Enter 100% free drops to win MLBB Diamonds, Redeem Codes, & Weekly Passes.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--card)]/60 border border-[var(--border)] text-[9px] font-bold text-[var(--foreground)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            100% Free Entry
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* ── ACTIVE GIVEAWAYS SECTION ──────────────────────────────────────── */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <FiZap size={14} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                Active Giveaways
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-36 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] animate-pulse" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {giveaways.map(g => {
                const isFull = g.maxEntries > 0 && g.entryCount >= g.maxEntries;
                const fillPercent = g.maxEntries > 0 ? Math.min(100, Math.round((g.entryCount / g.maxEntries) * 100)) : 0;
                const iconInfo = getGiveawayIcon(g.title, g.prize);
                const IconComponent = iconInfo.icon;

                return (
                  <motion.div
                    key={g._id}
                    whileHover={{ y: isFull ? 0 : -3 }}
                    onClick={() => !isFull && setSelectedGiveaway(g)}
                    className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-[var(--card)]/60 border transition-all duration-300 backdrop-blur-sm ${
                      isFull 
                        ? "opacity-60 border-[var(--border)]" 
                        : "cursor-pointer border-[var(--border)] hover:border-[var(--accent)]/40 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Badge & Fill Count Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!isFull ? (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                          ) : null}
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isFull ? "text-[var(--muted)]" : "text-red-500"}`}>
                            {isFull ? "CLOSED" : "LIVE DROP"}
                          </span>
                        </div>

                        <span className="text-[9px] font-bold text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded-full border border-[var(--border)] font-mono">
                          {g.maxEntries > 0 ? `${g.entryCount || 0}/${g.maxEntries} Filled` : `${g.entryCount || 0} Joined`}
                        </span>
                      </div>

                      {/* Dynamic Icon & Title */}
                      <div className="flex items-start gap-2.5">
                        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border ${
                          isFull 
                            ? "bg-[var(--foreground)]/5 border-[var(--border)] text-[var(--muted)]" 
                            : iconInfo.colorClass
                        }`}>
                          <IconComponent size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[var(--foreground)] text-xs leading-snug tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                            {g.title}
                          </h3>
                          <p className="text-[10px] font-semibold text-[var(--muted)] mt-0.5 truncate">
                            Prize: {g.prize}
                          </p>
                        </div>
                      </div>

                      {/* Compact Entry Progress Bar */}
                      {g.maxEntries > 0 && (
                        <div className="pt-1">
                          <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                            <div 
                              className={`h-full transition-all duration-500 ${isFull ? "bg-slate-400" : "bg-[var(--accent)]"}`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compact Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-[var(--border)]/60 flex items-center justify-between gap-2">
                      <button 
                        className="flex items-center gap-1 px-2 py-1 text-[9px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--background)] rounded-lg transition-colors border border-[var(--border)]"
                        onClick={(e) => handleShare(e, g)}
                        aria-label="Share Giveaway"
                      >
                        <FiShare2 size={11} />
                        <span>{copiedId === g._id ? "Copied!" : "Share"}</span>
                      </button>

                      <button
                        disabled={isFull}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          isFull 
                            ? "bg-[var(--foreground)]/5 text-[var(--muted)] cursor-not-allowed" 
                            : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-sm hover:shadow active:scale-95"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFull) setSelectedGiveaway(g);
                        }}
                      >
                        <span>{isFull ? "Full" : "Enter"}</span>
                        {!isFull && <FiChevronRight size={12} />}
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
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <FiAward size={14} />
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                Your Claimed Rewards
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wonGiveaways.map(g => (
                <div 
                  key={g._id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 shadow-sm"
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <FiAward size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <FiCheckCircle size={10} className="text-amber-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">
                        REWARD CLAIMED
                      </span>
                    </div>
                    <h3 className="font-bold text-[var(--foreground)] text-xs truncate">
                      {g.title}
                    </h3>
                    <p className="text-[10px] text-[var(--muted)] font-medium truncate">
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
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--muted)] border border-[var(--border)]">
                <FiArchive size={14} />
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                Completed Drops
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pastGiveaways.map(g => (
                <div 
                  key={g._id} 
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card)]/30 border border-[var(--border)] opacity-75"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--foreground)]/5 text-[var(--muted)] border border-[var(--border)]">
                    <FiCheckCircle size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)] inline-block mb-0.5">
                      ENDED
                    </span>
                    <h3 className="font-bold text-[var(--foreground)] text-[11px] truncate leading-snug">
                      {g.title}
                    </h3>
                    <p className="text-[9px] text-[var(--muted)] truncate">
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
