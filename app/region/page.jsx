"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";
import RecentVerifiedPlayers from "./RecentVerifiedPlayers";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";
import api from "@/lib/axios";
import { formatRegion } from "@/utils/regionFormatter";

export default function RegionPage() {
  const [id, setId] = useState("");
  const [zone, setZone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!id || !zone) return;
    setLoading(true);
    try {
      const { data } = await api.post("/api/check-region", { id, zone });
      setResult(data);
      if (data?.success === 200 && data?.data?.valid !== false) {
        saveVerifiedPlayer({
          playerId: id,
          zoneId: zone,
          username: data.data.username,
          region: data.data.region,
          savedAt: Date.now(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[var(--background)] px-4 py-2 sm:py-4 flex flex-col items-center">
      <div className="w-full max-w-md relative z-10 pt-4 sm:pt-2">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[var(--accent)]/5 rounded-2xl flex items-center justify-center border border-[var(--accent)]/10">
              <Icons.search className="text-xl text-[var(--accent)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic text-[var(--foreground)] leading-none">
              Region <span className="text-[var(--accent)]">Check</span>
            </h1>
          </div>
          <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest opacity-40 italic">Check your game region fast.</p>
        </motion.div>

        {/* SCANNER CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--card)]/30 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl relative"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50 ml-1">Player ID</label>
                <input
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-black italic tracking-widest text-[var(--foreground)] placeholder:text-[var(--muted)]/20 outline-none focus:border-[var(--accent)]/30 transition-all uppercase"
                  placeholder="1234..."
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50 ml-1">Zone ID</label>
                <input
                  className="w-full px-3 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-black italic tracking-widest text-[var(--foreground)] placeholder:text-[var(--muted)]/20 outline-none focus:border-[var(--accent)]/30 transition-all uppercase"
                  placeholder="5678"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                />
              </div>
            </div>

            <button aria-label="button"
              onClick={handleCheck}
              disabled={loading || !id || !zone}
              className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-widest italic text-[11px] hover:scale-[1.01] active:scale-95 disabled:opacity-20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner size="xs" color="current" />
              ) : (
                <>
                  <span>Check Region</span>
                  <Icons.checkCircle size={14} />
                </>
              )}
            </button>
          </div>

          {/* RESULT AREA */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mt-4 rounded-2xl p-4 border ${result.success === 200 && result.data?.valid !== false ? "bg-emerald-500/5 border-emerald-500/10" : "bg-rose-500/5 border-rose-500/10"}`}
              >
                {result.success === 200 && result.data?.valid !== false ? (
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Icons.user size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/50 mb-0.5">Name</p>
                      <h2 className="text-base font-black italic uppercase text-[var(--foreground)] truncate leading-tight">
                        {result.data?.username}
                      </h2>
                      <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter mt-1 block">
                        Region: {formatRegion(result.data?.region)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-1 text-rose-500">
                    <Icons.close size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest italic">Not Found</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RECENT PLAYERS */}
        <div className="mt-8 transition-opacity">
          <RecentVerifiedPlayers
            limit={5}
            onSelect={(player) => {
              setId(player.playerId);
              setZone(player.zoneId);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </div>
    </section>
  );
}
