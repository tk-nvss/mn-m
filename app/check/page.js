"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckPage() {
  const [game, setGame] = useState("");
  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    if (!game || !userId) {
      setError("Game and User ID are required");
      setLoading(false);
      return;
    }

    try {
      let url = `https://game-off-ten.vercel.app/api/v1/check?game=${game.toLowerCase()}&user_id=${userId}`;
      if (serverId) {
        url += `&server_id=${serverId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data));
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-12 flex items-center justify-center">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-[var(--card)]/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-3xl overflow-hidden relative">
          {/* Top Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--accent)]/20 shadow-inner">
              <Icons.database className="text-3xl text-[var(--accent)]" />
            </div>
            <h1 className="text-3xl font-[1000] uppercase tracking-tighter italic text-[var(--foreground)] mb-2">
              Game <span className="text-[var(--accent)]">Checker</span>
            </h1>
            <p className="text-xs text-[var(--muted)] font-black uppercase tracking-[0.3em] opacity-60">Database Verification Utility</p>
          </div>

          <div className="space-y-4">
            {/* Game Input */}
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Service Type</label>
              <div className="relative group">
                <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                <input
                  placeholder="e.g. bgmi, pubg, mlbb..."
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-[var(--foreground)] placeholder-[var(--muted)]/30 focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* User ID Input */}
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Account reference</label>
              <div className="relative group">
                <Icons.user className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                <input
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-[var(--foreground)] placeholder-[var(--muted)]/30 focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Server ID Input */}
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Origin Node (Optional)</label>
              <div className="relative group">
                <Icons.globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                <input
                  placeholder="Server ID"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-bold text-[var(--foreground)] placeholder-[var(--muted)]/30 focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="relative group mt-6 px-1">
              <div className="absolute inset-0 bg-[var(--accent)] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity rounded-2xl" />
              <button
                onClick={handleCheck}
                disabled={loading}
                className="relative w-full py-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-[0.2em] text-[13px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-3"
                    >
                      <LoadingSpinner size="xs" color="current" />
                      Decrypting...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-3"
                    >
                      Validate Account
                      <Icons.checkCircle className="text-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Button Shimmer */}
                {!loading && (
                  <motion.div
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full skew-x-[-30deg]"
                  />
                )}
              </button>
            </div>

            {/* Result Area */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-4"
                >
                  <div className="flex items-center gap-2 mb-3 text-emerald-400">
                    <FiCheckCircle />
                    <span className="text-[10px] font-black uppercase tracking-widest">Success Response</span>
                  </div>
                  <pre className="text-[11px] font-mono text-[var(--muted)] overflow-auto max-h-48 custom-scrollbar bg-black/20 p-3 rounded-xl">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 p-4"
                >
                  <div className="flex items-center gap-2 mb-3 text-rose-400">
                    <FiAlertCircle />
                    <span className="text-[10px] font-black uppercase tracking-widest">Error Logs</span>
                  </div>
                  <pre className="text-[11px] font-mono text-rose-300/70 overflow-auto max-h-48 custom-scrollbar bg-black/20 p-3 rounded-xl whitespace-pre-wrap">
                    {error}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

