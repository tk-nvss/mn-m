"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight, FiChevronLeft, FiZap, FiLock, FiClock, FiSearch,
  FiStar, FiAward, FiLoader, FiX, FiCheck, FiUser, FiUsers, FiPhone, FiMail
} from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import Image from "next/image";
import Link from "next/link";
import { TournamentSkeleton, SkeletonGrid } from "@/components/Skeleton/Skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { StatusBadge, LoadingSpinner, EmptyState } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatCoins, formatDateTime } from "@/utils";

interface Tournament {
  _id: string;
  game: string;
  title: string;
  subtitle?: string;
  format: string;
  prize: string;
  slots: number;
  slotsFilled: number;
  entryCoins: number;
  status: "open" | "upcoming" | "ongoing" | "closed" | "ended";
  startsAt?: string;
  endsAt?: string;
}

export default function MLBBTournamentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <MLBBTournamentContent />
    </Suspense>
  );
}

function MLBBTournamentContent() {
  const [formats, setFormats] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<Tournament | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [gameIds, setGameIds] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "" });
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const directId = searchParams.get("id");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch user joined tournaments
    if (token) {
      fetch("/api/tournaments/register", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && Array.isArray(d.data)) {
            const ids = d.data.map((e: any) => e.tournamentId?._id || e.tournamentId).filter(Boolean);
            setJoinedIds(ids);
          }
        })
        .catch(() => {});
    }

    fetch("/api/tournaments?game=mlbb")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFormats(d.data);
          if (directId) {
            const match = d.data.find((t: any) => t._id === directId);
            // If already registered, don't open register modal
            if (token) {
              fetch("/api/tournaments/register", { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(entriesRes => {
                  const userJoined = entriesRes.success && Array.isArray(entriesRes.data)
                    ? entriesRes.data.some((e: any) => (e.tournamentId?._id || e.tournamentId) === directId)
                    : false;
                  if (match && match.status !== "ended" && !userJoined) {
                    openRegister(match);
                  }
                })
                .catch(() => {
                  if (match && match.status !== "ended") openRegister(match);
                });
            } else {
              if (match && match.status !== "ended") openRegister(match);
            }
          }
        }
      })
      .finally(() => setLoading(false));

    setContactInfo({
      email: localStorage.getItem("email") || "",
      phone: localStorage.getItem("phone") || ""
    });
  }, [directId]);

  const active = formats.filter(t => t.status !== "ended");
  const ended  = formats.filter(t => t.status === "ended");

  const openRegister = (t: Tournament) => {
    setRegistering(t);
    setMsg({ text: "", type: "" });
    let count = 1;
    if (t.format.toLowerCase().includes("5v5")) count = 5;
    else if (t.format.toLowerCase().includes("4v4")) count = 4;
    else if (t.format.toLowerCase().includes("2v2")) count = 2;
    setGameIds(new Array(count).fill(""));
    setTeamName("");
  };

  const handleRegister = async () => {
    if (gameIds.length > 1 && !teamName.trim()) { setMsg({ text: "Please enter a Team Name", type: "error" }); return; }
    if (gameIds.some(id => !id.trim())) { setMsg({ text: "Please fill all Game IDs", type: "error" }); return; }
    setFormLoading(true);
    setMsg({ text: "", type: "" });
    try {
      const res = await fetch("/api/tournaments/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ tournamentId: registering?._id, contactEmail: contactInfo.email, contactPhone: contactInfo.phone, gameIds, teamName: gameIds.length > 1 ? teamName : "" })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: "Joined Successfully!", type: "success" });
        if (registering?._id) {
          setJoinedIds(prev => [...prev, registering._id]);
        }
        if (data.newCoinBalance !== undefined) useAuthStore.getState().setWalletBalance(data.newCoinBalance);
        setTimeout(() => {
          setRegistering(null);
          fetch("/api/tournaments?game=mlbb").then(r => r.json()).then(d => { if (d.success) setFormats(d.data); });
        }, 1500);
      } else {
        setMsg({ text: data.message || "Registration failed", type: "error" });
      }
    } catch { setMsg({ text: "Server error. Try again.", type: "error" }); }
    finally { setFormLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* ── BREADCRUMB & HEADER ── */}
        <div className="space-y-3 pb-2 border-b border-[var(--border)]">
          <Link href="/tournament"
            className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/60 hover:text-[var(--foreground)] transition-colors">
            <FiChevronLeft size={13} /> Back to All Games
          </Link>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shrink-0 flex items-center justify-center">
                <Image src="/game-assets/mlbbindia.webp" alt="MLBB" width={44} height={44} className="object-cover w-full h-full" onError={(e: any) => { e.currentTarget.src = "/logoBB.png"; }} />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)]">Mobile Legends: Bang Bang</p>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
                  Available <span className="text-[var(--accent)]">Rooms</span>
                </h1>
              </div>
            </div>

            <Link
              href="/dashboard/tournaments"
              style={{ color: "#ffffff" }}
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-[var(--accent)] !text-white text-[9px] font-black uppercase tracking-widest items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
            >
              <GiTrophy size={12} /> My Matches
            </Link>
          </motion.div>
        </div>

        {/* ── MEMBERSHIP NOTICE (COMPACT & SIMPLE) ── */}
        {!loading && (
          <div className="flex items-center justify-between px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 text-[9px]">
            <div className="flex items-center gap-2 text-[var(--muted)]/70">
              <FiStar size={12} className="text-[var(--accent)] shrink-0" />
              <span className="font-bold">
                <strong className="text-[var(--foreground)] uppercase">VIP Pass:</strong> Free users get 1 entry/day · VIP Members get unlimited entries
              </span>
            </div>
            <Link
              href="/contact"
              style={{ color: "#ffffff" }}
              className="shrink-0 px-3 py-1 rounded-lg bg-[var(--accent)] !text-white font-black uppercase tracking-widest text-[8px] hover:opacity-90 transition-opacity"
            >
              Join VIP
            </Link>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TournamentSkeleton />
            <TournamentSkeleton />
          </div>
        )}

        {/* ── EMPTY ── */}
        {!loading && active.length === 0 && (
          <EmptyState
            icon={Icons.trophy}
            title="No Tournaments Active"
            description="No active MLBB tournaments right now. Check back later for upcoming community cups and scrims!"
          />
        )}

        {/* ── TOURNAMENT CARDS GRID ── */}
        {!loading && active.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {active.map((fmt, i) => {
              const isExpired = fmt.endsAt && new Date() > new Date(fmt.endsAt);
              const ds = isExpired ? "ended" : fmt.status;
              const pct = Math.min(100, Math.round(((fmt.slotsFilled || 0) / (fmt.slots || 1)) * 100));
              const isFree = fmt.entryCoins === 0;
              const isJoined = joinedIds.includes(fmt._id);

              return (
                <motion.div
                  key={fmt._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl border bg-[var(--card)] p-5 space-y-4 transition-all flex flex-col justify-between ${
                    isJoined ? "border-emerald-500/30 bg-emerald-500/[0.02]" : "border-[var(--border)]"
                  }`}
                >
                  {/* Top row: Title + Format + Badges */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                            {fmt.format}
                          </span>
                          {isJoined && (
                            <span className="px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest inline-flex items-center gap-1">
                              <FiCheck size={10} /> Registered
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] mt-1">
                          {fmt.title}
                        </h3>
                        {fmt.subtitle && <p className="text-[9px] text-[var(--muted)]/50 mt-0.5">{fmt.subtitle}</p>}
                      </div>
                      <StatusBadge status={ds} size="xs" />
                    </div>

                    {/* Schedule */}
                    {fmt.startsAt && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)]/60">
                        <Icons.clock size={10} className="text-[var(--accent)] shrink-0" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)]">
                          Starts: <span className="text-[var(--foreground)] font-black">{formatDateTime(fmt.startsAt)}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Middle: Prize + Slots progress */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <GiTrophy size={13} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/60">
                          Prize: <span className="text-[var(--foreground)]">{fmt.prize}</span>
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-[var(--muted)]/50">{fmt.slotsFilled || 0}/{fmt.slots} slots</span>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isJoined ? "bg-emerald-500" : "bg-[var(--accent)]"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Bottom: Entry Badge + Action CTA */}
                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                      isFree
                        ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-500"
                        : "bg-[var(--accent)]/8 border-[var(--accent)]/20 text-[var(--accent)]"
                    }`}>
                      {isFree ? <Icons.star size={9} /> : <Icons.zap size={9} />}
                      {isFree ? "Free Entry" : formatCoins(fmt.entryCoins)}
                    </span>

                    {isJoined ? (
                      <Link
                        href="/dashboard/tournaments"
                        style={{ color: "#ffffff" }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 !text-white text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <FiCheck size={11} /> View Match <FiChevronRight size={10} />
                      </Link>
                    ) : (
                      <button
                        aria-label="button"
                        onClick={() => openRegister(fmt)}
                        disabled={ds !== "open" && ds !== "upcoming" && ds !== "ongoing"}
                        className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                          ds === "ended"    ? "border-[var(--border)] text-[var(--muted)]" :
                          ds === "upcoming" ? "border-amber-500/25 bg-amber-500/8 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500" :
                          ds === "ongoing"  ? "border-blue-500/25 bg-blue-500/8 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500" :
                                             "border-[var(--accent)]/25 bg-[var(--accent)]/8 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]"
                        }`}
                      >
                        {ds === "ended"    ? <><Icons.lock size={11} /> Ended</> :
                         ds === "upcoming" ? <><Icons.clock size={11} /> Pre-Register <Icons.chevronRight size={10} /></> :
                         ds === "ongoing"  ? <><Icons.zap size={11} /> Live <Icons.chevronRight size={10} /></> :
                                            <><Icons.zap size={11} /> Join Now <Icons.chevronRight size={10} /></>}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── ENDED ── */}
        {!loading && ended.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[var(--border)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/40 px-1">Recently Ended</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {ended.map(t => (
                <div key={t._id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 opacity-60">
                  <div>
                    <p className="text-[10px] font-black uppercase text-[var(--foreground)] truncate">{t.title}</p>
                    <p className="text-[8px] text-[var(--muted)]/50 uppercase tracking-wide">{t.format}</p>
                  </div>
                  <StatusBadge status="ended" size="xs" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── REGISTRATION MODAL ── */}
      <AnimatePresence>
        {registering && (
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRegistering(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md" />

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between p-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-[7px] font-black uppercase tracking-widest text-[var(--accent)] mb-0.5">Registration</p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">{registering.title}</h3>
                  <p className="text-[8px] text-[var(--muted)]/50 uppercase tracking-wide mt-0.5">{registering.format} · {registering.entryCoins} Coins</p>
                </div>
                <button aria-label="button" onClick={() => setRegistering(null)}
                  className="w-7 h-7 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0">
                  <Icons.close size={13} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Status message */}
                <AnimatePresence>
                  {msg.text && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-center border ${
                        msg.type === "success"
                          ? "bg-emerald-500/8 border-emerald-500/25 text-emerald-500"
                          : "bg-rose-500/8 border-rose-500/25 text-rose-500"
                      }`}>
                      {msg.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Contact fields */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Email", icon: FiMail, value: contactInfo.email },
                    { label: "Phone", icon: FiPhone, value: contactInfo.phone },
                  ].map(({ label, icon: Icon, value }) => (
                    <div key={label} className="space-y-1">
                      <label className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={11} />
                        <input disabled value={value}
                          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl py-2.5 pl-8 pr-2 text-[9px] text-[var(--foreground)]/50 outline-none" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Team name */}
                {gameIds.length > 1 && (
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40">Team Name</label>
                    <div className="relative">
                      <FiUsers className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={11} />
                      <input placeholder="e.g. Team Legends" value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2.5 pl-8 pr-3 text-[10px] text-[var(--foreground)] focus:border-[var(--foreground)]/30 outline-none transition-colors" />
                    </div>
                  </div>
                )}

                {/* Game IDs */}
                <div className="space-y-2">
                  <p className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40">Game IDs (All Players)</p>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto">
                    {gameIds.map((id, idx) => (
                      <div key={idx} className="relative">
                        <FiUser className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={11} />
                        <input placeholder={`Player ${idx + 1} ID`} value={id}
                          onChange={e => { const n = [...gameIds]; n[idx] = e.target.value; setGameIds(n); }}
                          className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-2.5 pl-8 pr-3 text-[10px] text-[var(--foreground)] focus:border-[var(--foreground)]/30 outline-none transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button aria-label="button"
                  onClick={handleRegister}
                  disabled={formLoading || msg.type === "success"}
                  className="w-full h-11 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30 hover:opacity-90 transition-opacity">
                  {formLoading
                    ? <LoadingSpinner size="xs" color="current" />
                    : msg.type === "success"
                    ? <><FiCheck size={14} /> Registered!</>
                    : "Confirm Registration"}
                </button>

                <p className="text-[7.5px] text-center text-[var(--muted)]/30 font-bold uppercase tracking-widest">
                  {registering.entryCoins > 0 ? `${registering.entryCoins} BBC will be deducted from your wallet.` : "Free entry — no coins required."}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
