"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAward, FiChevronRight, FiLoader, FiSearch,
  FiZap, FiUsers, FiStar, FiGrid, FiShield, FiMessageCircle
} from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { TournamentSkeleton } from "@/components/Skeleton/Skeleton";

interface Tournament {
  _id: string;
  game: string;
  title: string;
  format: string;
  prize: string;
  slots: number;
  slotsFilled: number;
  entryCoins: number;
  status: "open" | "upcoming" | "ongoing" | "closed" | "ended";
  startsAt?: string;
  winner?: string | null;
}

const GAME_META: Record<string, { name: string; logo: string; href: string }> = {
  mlbb:     { name: "Mobile Legends", logo: "/logoBB.png", href: "/tournament/mlbb" },
  freefire: { name: "Free Fire",      logo: "/logoBB.png", href: "/tournament/freefire" },
  codm:     { name: "COD Mobile",     logo: "/logoBB.png", href: "/tournament/codm" },
};

const STATUS_STYLE: Record<string, string> = {
  open:     "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  ongoing:  "bg-blue-500/10 text-blue-400 border-blue-500/25",
  upcoming: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  closed:   "bg-rose-500/10 text-rose-400 border-rose-500/25",
  ended:    "bg-[var(--border)]/20 text-[var(--muted)] border-[var(--border)]",
};

// ── Section Header ──────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, icon: Icon }: any) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted)]">
      <Icon size={15} />
    </div>
    <div>
      <h2 className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] leading-none mb-0.5">{title}</h2>
      <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-wide">{subtitle}</p>
    </div>
  </div>
);

// ── Tournament Card ─────────────────────────────────────────────────────
const TournamentCard = ({ t }: { t: Tournament }) => {
  const meta = GAME_META[t.game] || { logo: "/logoBB.png", href: `/tournament/${t.game}` };
  const isFree = t.entryCoins === 0;

  return (
    <Link href={`${meta.href}?id=${t._id}`} className="block group">
      <motion.div
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3.5 hover:border-[var(--accent)]/30 transition-all duration-200"
      >
        {/* Top row: logo + title + status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-[var(--border)] shrink-0">
              <Image src={meta.logo} alt={t.game} width={36} height={36} className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-tight truncate text-[var(--foreground)]">{t.title}</p>
              <p className="text-[7px] text-[var(--muted)]/50 uppercase tracking-widest">{t.game.toUpperCase()} · {t.format}</p>
            </div>
          </div>
          <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border shrink-0 ${STATUS_STYLE[t.status]}`}>
            {t.status}
          </span>
        </div>

        {/* Middle: prize + slots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <GiTrophy size={11} className="text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-tight text-[var(--foreground)]">{t.prize}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--muted)]/50">
            <FiUsers size={10} />
            <span className="text-[8px] font-bold">{t.slotsFilled}/{t.slots}</span>
          </div>
        </div>

        {/* Bottom: entry + arrow */}
        <div className="flex items-center justify-between pt-0.5 border-t border-[var(--border)]">
          <span className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
            isFree
              ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-500"
              : "bg-[var(--accent)]/8 border-[var(--accent)]/20 text-[var(--accent)]"
          }`}>
            {isFree ? <FiStar size={9} /> : <FiZap size={9} />}
            {isFree ? "Free Entry" : `${t.entryCoins} BBC`}
          </span>
          <div className="w-7 h-7 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:bg-[var(--accent)] group-hover:text-white group-hover:border-[var(--accent)] transition-all">
            <FiChevronRight size={13} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────
export default function TournamentHub() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then(r => r.json())
      .then(d => { if (d.success) setTournaments(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const active    = useMemo(() => tournaments.filter(t => t.status !== "ended"), [tournaments]);
  const ended     = useMemo(() => tournaments.filter(t => t.status === "ended").slice(0, 5), [tournaments]);
  const featured  = useMemo(() => active.slice(0, 5), [active]);
  const freeTourneys = useMemo(() => active.filter(t => t.entryCoins === 0).slice(0, 5), [active]);
  const gameGroups = useMemo(() => {
    const g: Record<string, Tournament[]> = {};
    active.forEach(t => { if (!g[t.game]) g[t.game] = []; g[t.game].push(t); });
    return g;
  }, [active]);
  const uniqueGameIds = useMemo(() => Object.keys(gameGroups), [gameGroups]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-10">

        {/* ── HOST / SPONSOR NOTICE ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
        >
          <div className="flex items-center gap-2">
            <FiMessageCircle className="text-[var(--muted)]/50" size={11} />
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/50">
              Want to <span className="text-[var(--foreground)]">Host</span> or <span className="text-[var(--foreground)]">Sponsor</span>?
            </span>
          </div>
          <Link href="/support"
            className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)] hover:underline transition-colors">
            Contact Support
          </Link>
        </motion.div>

        {/* ── HERO HEADER ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-px bg-[var(--accent)]" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Blue Buff Esports</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight leading-tight text-[var(--foreground)]">
            Esports<br /><span className="text-[var(--accent)]">Zone</span>
          </h1>
          <p className="text-[10px] font-bold text-[var(--muted)]/50 uppercase tracking-wide leading-relaxed max-w-xs">
            Join tournaments, win prizes, and climb the ranks. Pick your game to start.
          </p>
        </motion.div>

        {/* ── LOADING ── */}
        {loading ? (
          <div className="space-y-10">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <div className="w-40 h-5 bg-[var(--card)] rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(j => <TournamentSkeleton key={j} />)}
                </div>
              </div>
            ))}
          </div>

        ) : active.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)]/30 mx-auto">
              <FiSearch size={22} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]/40">No Active Tournaments</p>
            <p className="text-[9px] text-[var(--muted)]/30 uppercase tracking-wide">New events added daily. Check back soon!</p>
          </div>

        ) : (
          <div className="space-y-12">

            {/* 1. Featured */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <SectionHeader title="Featured Events" subtitle="The most popular tournaments happening now" icon={FiStar} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured.map((t, i) => (
                  <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <TournamentCard t={t} />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* 2. Free Entry */}
            {freeTourneys.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                <SectionHeader title="Free Entry Tournaments" subtitle="No coins needed. Join and win Weekly Passes!" icon={FiZap} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freeTourneys.map((t, i) => (
                    <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                      <TournamentCard t={t} />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 3. Browse by Game */}
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <SectionHeader title="Browse by Game" subtitle="Select your favorite title to find dedicated rooms" icon={FiGrid} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {uniqueGameIds.map((gameId, i) => {
                  const meta = GAME_META[gameId] ?? { name: gameId.toUpperCase(), logo: "/logoBB.png", href: `/tournament/${gameId}` };
                  const count = gameGroups[gameId].length;
                  return (
                    <motion.div key={gameId} whileHover={{ y: -2 }}>
                      <Link href={meta.href}
                        className="group block p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-all">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors">
                            <Image src={meta.logo} alt={meta.name} width={48} height={48} className="object-cover" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-tight text-[var(--foreground)] mb-1">{meta.name}</p>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)]">{count} Rooms</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* 4. Ended */}
            {ended.length > 0 && (
              <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                <SectionHeader title="Recently Ended" subtitle="Hall of fame — See who dominated the arena" icon={FiAward} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70">
                  {ended.map(t => {
                    const meta = GAME_META[t.game] || { logo: "/logoBB.png" };
                    return (
                      <div key={t._id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[var(--border)] shrink-0">
                              <Image src={meta.logo} alt={t.game} width={32} height={32} className="object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-tight truncate text-[var(--foreground)]">{t.title}</p>
                              <p className="text-[7px] text-[var(--muted)]/40 uppercase tracking-widest">{t.game}</p>
                            </div>
                          </div>
                          <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-[var(--border)] text-[var(--muted)]/40">Ended</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                          <div className="flex items-center gap-2">
                            <FiAward size={11} className="text-amber-500" />
                            <div>
                              <p className="text-[6px] font-black uppercase tracking-widest text-[var(--muted)]/40">Champion</p>
                              <p className="text-[9px] font-black uppercase text-amber-500">{t.winner || "TBA"}</p>
                            </div>
                          </div>
                          <GiTrophy className="text-amber-500/20" size={18} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* 5. Trust Banner */}
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="w-12 h-12 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                <FiShield size={20} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] mb-1">Verified &amp; Fair Play</p>
                <p className="text-[8px] font-bold text-[var(--muted)]/50 uppercase tracking-wide leading-relaxed">
                  All tournaments are moderated by Blue Buff India. Anti-cheat active for every room. Results verified within 24 hours.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 pt-8 border-t border-[var(--border)]">
          {[FiStar, FiZap, FiAward].map((Icon, i) => (
            <div key={i} className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)]/30">
              <Icon size={12} />
            </div>
          ))}
          <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/25">
            Powered by Blue Buff India Esports
          </p>
        </div>

      </div>
    </main>
  );
}
