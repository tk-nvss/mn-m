"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { LoadingSpinner, EmptyState } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatCurrency, formatNumber } from "@/utils";

export default function SpecialLeaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState<"upcoming" | "active" | "ended">("upcoming");

  const limit = 10;

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();

    // Event timeframe: Feb 5 - Feb 14
    const startDate = new Date(year, 1, 5);
    const endDate = new Date(year, 1, 14, 23, 59, 59);

    if (now < startDate) {
      setEventStatus("upcoming");
      setLoading(false);
      return;
    }

    if (now > endDate) {
      setEventStatus("ended");
      setLoading(false);
      return;
    }

    setEventStatus("active");

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(
      `/api/leaderboard?range=custom&start=${startDate.toISOString().split("T")[0]}&end=${endDate.toISOString().split("T")[0]}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => res.json())
      .then((res) => setData(res.success ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div>
      <div className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-rose-500/30 pb-32 transition-colors duration-300">
        {/* Animated Theme-Aware Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[70%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Floating Heart Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-rose-500/20"
              initial={{
                x: Math.random() * 100 + "%",
                y: "110%",
                scale: Math.random() * 0.5 + 0.5,
                rotate: Math.random() * 360
              }}
              animate={{
                y: "-10%",
                rotate: i % 2 === 0 ? 360 : -360,
              }}
              transition={{
                duration: 10 + Math.random() * 15,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 10
              }}
            >
              ❤️
            </motion.div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 md:py-24 relative z-10">

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] transition-all group no-underline"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </motion.div>

          {/* 💖 HEADER SECTION - ELITE VALENTINE STYLE */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl md:text-5xl mb-6"
            >
              💝
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-[1000] italic tracking-tighter uppercase leading-[0.9] mb-4">
              <span className="text-[var(--foreground)]">VALENTINE</span>{" "}
              <span className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]">SPECIAL</span>
            </h1>
            <p className="text-[var(--muted)] text-[10px] md:text-xs font-[900] uppercase tracking-[0.4em] leading-relaxed italic opacity-60">
              TOP COMPENDERS SPREADING THE LOVE
            </p>
            <div className="mt-8 inline-block px-6 py-2 rounded-full border border-rose-500/20 bg-rose-500/5 backdrop-blur-sm">
              <span className="text-rose-500 text-[10px] md:text-xs font-black uppercase tracking-widest">
                Event Duration: Feb 5 - Feb 14
              </span>
            </div>
          </motion.div>

          {/* EVENT STATES */}
          <AnimatePresence mode="wait">
            {eventStatus === "upcoming" ? (
              <motion.div
                key="upcoming"
                className="text-center py-24 bg-[var(--card)] rounded-[40px] border border-[var(--border)] border-rose-500/10 backdrop-blur-xl transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-6xl mb-6">⏳</div>
                <h2 className="text-2xl font-black uppercase italic text-[var(--foreground)] mb-2">Love is Warming Up</h2>
                <p className="text-[var(--muted)] font-black uppercase tracking-widest text-[10px]">Starting on February 5th</p>
              </motion.div>
            ) : eventStatus === "ended" ? (
              <motion.div
                key="ended"
                className="text-center py-24 bg-[var(--card)] rounded-[40px] border border-[var(--border)] border-rose-500/10 backdrop-blur-xl transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-6xl mb-6">💌</div>
                <h2 className="text-2xl font-black uppercase italic text-[var(--foreground)] mb-2">Event Concluded</h2>
                <p className="text-[var(--muted)] font-black uppercase tracking-widest text-[10px]">Winners will be announced soon</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                className="flex flex-col items-center justify-center py-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingSpinner size="xl" color="accent" />
                <span className="text-[10px] font-black tracking-widest text-[var(--muted)] uppercase italic mt-4">Counting Roses...</span>
              </motion.div>
            ) : (
              <div className="space-y-24">

                {/* 🏆 THE HIGHLIGHT - RANK #1 */}
                {data.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="relative group pt-12"
                  >
                    {/* Floating Medal */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                      <motion.div
                        className="w-20 h-20 bg-[var(--card)] rounded-full flex items-center justify-center border-[6px] border-[var(--background)] shadow-2xl transition-colors"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <span className="text-4xl">🥇</span>
                      </motion.div>
                    </div>

                    {/* Rose Throne Card */}
                    <div className="bg-[var(--card)] border border-[var(--border)] border-rose-500/10 rounded-[60px] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl transition-colors">
                      {/* Suble Shine */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--foreground)] opacity-[0.03] to-transparent pointer-events-none"
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      />

                      <div className="relative z-10 flex flex-col items-center">
                        {/* Avatar Wrapper */}
                        <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[var(--background)] border-[8px] border-[var(--border)] flex items-center justify-center mb-10 shadow-inner relative transition-colors">
                          <div className="w-full h-full rounded-full bg-gradient-to-b from-rose-500/10 to-transparent flex items-center justify-center">
                            <span className="text-5xl opacity-30">❤️</span>
                          </div>
                          <motion.div
                            className="absolute inset-[-15px] border border-rose-500/10 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          />
                        </div>

                        <h2 className="text-3xl md:text-5xl font-[900] uppercase tracking-tighter text-[var(--foreground)] mb-3 italic">
                          {data[0]?.user?.name || "ANONYMOUS"}
                        </h2>

                        <div className="text-5xl md:text-8xl font-[900] text-[var(--foreground)] mb-12 tracking-tighter flex items-center gap-1 italic">
                          <span>{formatCurrency(data[0]?.totalSpent || 0)}</span>
                        </div>

                        <div className="bg-[var(--background)] border border-[var(--border)] px-10 py-3 rounded-full shadow-lg hover:scale-105 transition-all">
                          <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em]">VALENTINE #1</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 📄 LIST - CLEAN HORIZONTAL ROWS */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-0 divide-y divide-[var(--border)]"
                >
                  {data.slice(1).map((item, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ x: 5, backgroundColor: "rgba(244,63,94,0.03)" }}
                      className="group flex items-center gap-4 px-6 py-8 transition-all"
                    >
                      <div className="w-14 text-[var(--muted)] opacity-20 font-black italic text-2xl group-hover:text-rose-500 group-hover:opacity-100 transition-all leading-none">
                        {index + 2}
                      </div>

                      <div className="flex-1 min-w-0 flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[10px] italic font-black text-[var(--muted)] group-hover:border-rose-500/30 transition-colors">
                          LV
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[var(--foreground)] font-[900] uppercase tracking-wider truncate text-sm md:text-lg italic group-hover:translate-x-1 transition-all">
                            {item.user?.name || "ANONYMOUS"}
                          </span>
                          <span className="text-[var(--muted)] opacity-30 text-[9px] font-black tracking-widest uppercase mt-0.5">
                            UID: {item.user?.userId || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[var(--foreground)] font-[900] text-2xl md:text-3xl italic tracking-tighter group-hover:scale-110 transition-transform origin-right">
                          <span>{formatCurrency(item.totalSpent)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {data.length === 0 && !loading && (
                    <div className="text-center py-20 text-[var(--muted)] opacity-20 font-black uppercase tracking-[0.4em] italic text-sm">
                      The ledger of love is empty
                    </div>
                  )}
                </motion.div>

                {/* Special Prize Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[40px] text-center backdrop-blur-sm"
                >
                  <p className="text-rose-500 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
                    🎁 TOP 1 PLAYERS WILL RECEIVE EXCLUSIVE VALENTINE REWARDS
                  </p>
                </motion.div>

              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
