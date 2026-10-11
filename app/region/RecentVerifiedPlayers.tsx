"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiGlobe, FiChevronRight, FiClock, FiRotateCcw } from "react-icons/fi";
import { getVerifiedPlayers } from "@/utils/storage/verifiedPlayerStorage";
import { formatRegion } from "@/utils/regionFormatter";

function timeAgo(ts?: number) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "NOW";
  if (min < 60) return `${min}M AGO`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}H AGO`;
  const d = Math.floor(hr / 24);
  return `${d}D AGO`;
}

export default function RecentVerifiedPlayers({
  onSelect,
  limit = 10,
}: {
  onSelect: (player: any) => void;
  limit?: number;
}) {
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    setPlayers(getVerifiedPlayers(limit));
  }, [limit]);

  if (!players.length) return null;

  return (
    <div className="space-y-2">
      {/* List */}
      <div className="grid grid-cols-1 gap-2">
        <AnimatePresence>
          {players.map((p, index) => (
            <motion.button
              key={`${p.playerId}-${p.zoneId}-${index}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(p)}
              className="
                w-full text-left
                rounded-xl
                bg-[var(--card)] hover:bg-[var(--card)]/70
                transition-all duration-200
                p-2.5 sm:p-3 group flex items-center justify-between gap-3
              "
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--accent)] transition-all shrink-0">
                  <FiUser size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-tight italic truncate text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-none mb-1">
                    {p.username || "Unknown Player"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[8.5px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    <span>{p.playerId}</span>
                    {p.zoneId && (
                      <>
                        <span className="opacity-40">|</span>
                        <span>{p.zoneId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-2 py-0.5 bg-[var(--background)] rounded-md flex items-center gap-1 border border-[var(--border)]">
                  <FiGlobe className="text-[9px] text-[var(--accent)]" />
                  <span className="text-[9px] font-black text-[var(--foreground)] uppercase tracking-wider opacity-80">
                    {formatRegion(p.region)}
                  </span>
                </div>
                <FiChevronRight className="text-xs text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

