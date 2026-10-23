"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { EmptyState, SectionTitle } from "@/components/common";
import GiveawayEntryModal from "@/components/Giveaway/GiveawayEntryModal";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Sparkles,
  Gift,
  Ticket,
  Crown,
  Trophy,
  History,
  CheckCircle2,
  Share2,
  HelpCircle,
  ChevronRight,
  Flame,
} from "lucide-react";

// Helper function to pick dynamic icon & style based on giveaway title/prize
function getGiveawayIcon(title: string = "", prize: string = "") {
  const t = (title + " " + prize).toLowerCase();

  if (t.includes("reedm") || t.includes("redeem") || t.includes("code") || t.includes("voucher")) {
    return {
      icon: Ticket,
      colorClass: "text-purple-400",
    };
  }
  if (t.includes("pass") || t.includes("weekly") || t.includes("wdp") || t.includes("diamond")) {
    return {
      icon: Sparkles,
      colorClass: "text-amber-400",
    };
  }
  if (t.includes("membership") || t.includes("month") || t.includes("vip")) {
    return {
      icon: Crown,
      colorClass: "text-cyan-400",
    };
  }
  return {
    icon: Gift,
    colorClass: "text-[var(--accent)]",
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
  const [showInfo, setShowInfo] = useState(false);

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
    <div className="min-h-screen pb-16 pt-3 sm:pt-5 bg-[var(--background)]">
      
      {/* ── CLEAN MINIMAL HEADER ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-5">
        <div className="pb-3 border-b border-[var(--border)]/60">
          <SectionTitle
            as="h1"
            subtitle="FREE REWARDS & DROPS"
            title="GIVEAWAYS & DROPS"
            highlight="DROPS"
            pulse
            description="Enter free drops to win MLBB Diamonds, Passes & Vouchers"
            action={
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  showInfo
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--card)] hover:bg-[var(--card)]/70 text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
                }`}
                title="How it works"
              >
                <HelpCircle size={13} className={showInfo ? "text-white" : "text-[var(--accent)]"} />
                <span className="hidden sm:inline">How it works</span>
              </button>
            }
          />
        </div>

        {/* ── EXPANDABLE "HOW IT WORKS" INFO DRAWER ─────────────────────── */}
        {showInfo && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm animate-in fade-in">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--foreground)]">
                <HelpCircle className="text-[var(--accent)]" size={14} />
                <span>How Live Drops & Giveaways Work</span>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] font-bold cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-[var(--muted)]">
              <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <span className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-black text-[10px] flex items-center justify-center mb-1">1</span>
                <p className="font-bold text-[var(--foreground)] text-[11px]">1. Click Enter</p>
                <p className="text-[10px] mt-0.5">Pick any active drop and provide your Player ID & Server ID.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <span className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-black text-[10px] flex items-center justify-center mb-1">2</span>
                <p className="font-bold text-[var(--foreground)] text-[11px]">2. Slots Fill Up</p>
                <p className="text-[10px] mt-0.5">As players enter, the progress bar fills until all slots are taken.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <span className="w-5 h-5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-black text-[10px] flex items-center justify-center mb-1">3</span>
                <p className="font-bold text-[var(--foreground)] text-[11px]">3. Instant Distribution</p>
                <p className="text-[10px] mt-0.5">Winners receive rewards directly into their in-game account.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* ── ACTIVE GIVEAWAYS SECTION ──────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] leading-none flex items-center gap-1.5">
              <Flame size={14} className="text-rose-500 fill-rose-500/20" />
              <span>Active Giveaways</span>
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-[var(--card)] border border-[var(--border)] shimmer-overlay" />
              ))}
            </div>
          ) : giveaways.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No Active Drops Right Now"
              description="All giveaway slots have been filled. New MLBB diamond drops & redeem code giveaways are posted daily!"
              size="md"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    className={`group relative flex flex-col justify-between p-3 rounded-xl bg-[var(--card)]/60 hover:bg-[var(--card)] border border-[var(--border)]/40 hover:border-[var(--accent)]/40 transition-all duration-200 ${
                      isFull ? "opacity-60" : "cursor-pointer"
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Meta Header: Status & Count */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isFull ? "bg-[var(--muted)]" : "bg-emerald-500 animate-pulse"}`} />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            {isFull ? "Closed" : "Live Drop"}
                          </span>
                        </div>

                        <span className="text-[9px] font-semibold text-[var(--muted)]">
                          {g.maxEntries > 0 ? `${g.entryCount || 0}/${g.maxEntries} Filled` : `${g.entryCount || 0} Joined`}
                        </span>
                      </div>

                      {/* Icon + Title */}
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 shrink-0 ${iconInfo.colorClass}`}>
                          <IconComponent size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-[var(--foreground)] text-xs tracking-tight group-hover:text-[var(--accent)] transition-colors truncate leading-tight">
                            {displayTitle}
                          </h3>
                          <p className="text-[10px] text-[var(--muted)] truncate mt-0.5">
                            Prize: <span className="font-semibold text-[var(--foreground)]">{displayPrize}</span>
                          </p>
                        </div>
                      </div>

                      {/* Progress Line */}
                      {g.maxEntries > 0 && (
                        <div className="h-1 w-full bg-[var(--background)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[var(--muted)]" : "bg-[var(--accent)]"}`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 mt-2 border-t border-[var(--border)]/30 flex items-center justify-between gap-2">
                      <button 
                        className="flex items-center gap-1 text-[10.5px] font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        onClick={(e) => handleShare(e, g)}
                        aria-label="Share Giveaway"
                      >
                        <Share2 size={11} />
                        <span>{copiedId === g._id ? "Copied" : "Share"}</span>
                      </button>

                      <button
                        disabled={isFull}
                        className={`flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                          isFull 
                            ? "bg-[var(--muted)]/10 text-[var(--muted)] cursor-not-allowed" 
                            : "bg-[var(--accent)] text-white hover:opacity-90 active:scale-95"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFull) setSelectedGiveaway(g);
                        }}
                      >
                        <span>{isFull ? "Closed" : "Enter"}</span>
                        {!isFull && <ChevronRight size={11} />}
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
          <section className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] leading-none flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-500" />
                <span>Your Claimed Rewards</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {wonGiveaways.map(g => (
                <div 
                  key={g._id} 
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20"
                >
                  <div className="shrink-0 text-amber-500 mt-0.5">
                    <Trophy size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={9} className="text-amber-500" />
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
          <section className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--muted)]/40" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] leading-none flex items-center gap-1.5">
                <History size={14} className="text-[var(--muted)]" />
                <span>Completed Drops</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {pastGiveaways.map(g => (
                <div 
                  key={g._id} 
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card)]/40 border border-[var(--border)]/30 opacity-75"
                >
                  <div className="shrink-0 text-emerald-500/80 mt-0.5">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)] bg-[var(--background)] px-1 py-0.2 rounded inline-block">
                      ENDED
                    </span>
                    <h3 className="font-bold text-[var(--foreground)] text-[10px] truncate leading-tight">
                      {g.title}
                    </h3>
                    <p className="text-[8px] text-[var(--muted)] truncate">
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
