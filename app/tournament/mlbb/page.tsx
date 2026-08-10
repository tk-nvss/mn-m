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

const STATUS_STYLE: Record<string, string> = {
  open:     "bg-emerald-500/10 text-emerald-500 border-emerald-500/25",
  ongoing:  "bg-blue-500/10 text-blue-400 border-blue-500/25",
  upcoming: "bg-amber-500/10 text-amber-500 border-amber-500/25",
  closed:   "bg-rose-500/10 text-rose-400 border-rose-500/25",
  ended:    "bg-[var(--border)]/20 text-[var(--muted)] border-[var(--border)]",
};

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
  const searchParams = useSearchParams();
  const directId = searchParams.get("id");

  useEffect(() => {
    fetch("/api/tournaments?game=mlbb")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFormats(d.data);
          if (directId) {
            const match = d.data.find((t: any) => t._id === directId);
            if (match && match.status !== "ended") openRegister(match);
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
        if (data.newCoinBalance !== undefined) useAuthStore.getState().setWalletBalance(data.newCoinBalance);
        setTimeout(() => {
          setRegistering(null);
          fetch("/api/tournaments?game=mlbb").then(r => r.json()).then(d => { if (d.success) setFormats(d.data); });
        }, 2000);
      } else {
        setMsg({ text: data.message || "Registration failed", type: "error" });
      }
    } catch { setMsg({ text: "Server error. Try again.", type: "error" }); }
    finally { setFormLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-32">
      <div className="max-w-xl mx-auto px-4 pt-8 space-y-5">

        {/* ── BREADCRUMB ── */}
        <Link href="/tournament"
          className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50 hover:text-[var(--foreground)] transition-colors">
          <FiChevronLeft size={13} /> All Games
        </Link>

        {/* ── TITLE ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--border)] shrink-0">
            <Image src="/logoBB.png" alt="MLBB" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/50">Mobile Legends: Bang Bang</p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
              Pick a <span className="text-[var(--accent)]">Format</span>
            </h1>
          </div>
        </motion.div>

        {/* ── LOADING ── */}
        {loading && (
          <SkeletonGrid count={2} cols="grid-cols-1" gap="gap-4">
            <TournamentSkeleton />
          </SkeletonGrid>
        )}

        {/* ── EMPTY ── */}
        {!loading && active.length === 0 && (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-[var(--border)]">
            <div className="w-12 h-12 rounded-2xl border border-[var(--border)] mx-auto flex items-center justify-center text-[var(--muted)]/30">
              <FiSearch size={20} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]/40">No Games Found</p>
            <p className="text-[9px] text-[var(--muted)]/30 uppercase tracking-wide">No active tournaments right now. Check back later!</p>
          </div>
        )}

        {/* ── TOURNAMENT CARDS ── */}
        {!loading && active.map((fmt, i) => {
          const isExpired = fmt.endsAt && new Date() > new Date(fmt.endsAt);
          const ds = isExpired ? "ended" : fmt.status;
          const pct = Math.min(100, Math.round((fmt.slotsFilled / fmt.slots) * 100));
          const isFree = fmt.entryCoins === 0;

          return (
            <motion.div
              key={fmt._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4"
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-[var(--foreground)]">{fmt.title}</p>
                  {fmt.subtitle && <p className="text-[9px] text-[var(--muted)]/50 mt-0.5">{fmt.subtitle}</p>}
                  <p className="text-[8px] text-[var(--muted)]/40 uppercase tracking-widest mt-0.5">{fmt.format}</p>
                  {fmt.startsAt && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FiClock size={9} className="text-[var(--accent)]" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--accent)]">
                        Starts: {new Date(fmt.startsAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border shrink-0 ${STATUS_STYLE[ds]}`}>
                  {ds}
                </span>
              </div>

              {/* Prize + Slots */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GiTrophy size={12} className="text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/60">
                    Prize: <span className="text-[var(--foreground)]">{fmt.prize}</span>
                  </span>
                </div>
                <span className="text-[8px] font-bold text-[var(--muted)]/40">{fmt.slotsFilled}/{fmt.slots} slots</span>
              </div>

              {/* Slot progress bar */}
              <div className="h-1 w-full rounded-full bg-[var(--border)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </div>

              {/* Entry tag */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                  isFree
                    ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-500"
                    : "bg-[var(--accent)]/8 border-[var(--accent)]/20 text-[var(--accent)]"
                }`}>
                  {isFree ? <FiStar size={9} /> : <FiZap size={9} />}
                  {isFree ? "Free Entry" : `${fmt.entryCoins} BBC Coins`}
                </span>
              </div>

              {/* CTA button */}
              <button aria-label="button"
                onClick={() => openRegister(fmt)}
                disabled={ds !== "open" && ds !== "upcoming" && ds !== "ongoing"}
                className={`w-full h-11 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  ds === "ended"    ? "border-[var(--border)] text-[var(--muted)]" :
                  ds === "upcoming" ? "border-amber-500/25 bg-amber-500/8 text-amber-500 hover:bg-amber-500 hover:text-white hover:border-amber-500" :
                  ds === "ongoing"  ? "border-blue-500/25 bg-blue-500/8 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500" :
                                     "border-[var(--accent)]/25 bg-[var(--accent)]/8 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]"
                }`}
              >
                {ds === "ended"    ? <><FiLock size={12} /> Tournament Ended</> :
                 ds === "upcoming" ? <><FiClock size={12} /> Pre-Register <FiChevronRight size={10} /></> :
                 ds === "ongoing"  ? <><FiZap size={12} /> Tournament Live <FiChevronRight size={10} /></> :
                                    <><FiZap size={12} /> Join Tournament Now <FiChevronRight size={10} /></>}
              </button>
            </motion.div>
          );
        })}

        {/* ── MEMBERSHIP CARD ── */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
              <FiStar size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[7px] font-black uppercase tracking-widest text-[var(--accent)]/70 mb-0.5">Membership</p>
              <p className="text-[11px] font-black uppercase tracking-tight text-[var(--foreground)]">Unlimited Entries</p>
              <p className="text-[8px] text-[var(--muted)]/50 font-bold uppercase tracking-wide mt-0.5">Free = 1 entry/day · Members = unlimited</p>
            </div>
            <Link href="/contact"
              className="shrink-0 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
              Join
            </Link>
          </motion.div>
        )}

        {/* ── ENDED ── */}
        {!loading && ended.length > 0 && (
          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/30 px-1">Ended</p>
            {ended.map(t => (
              <div key={t._id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border)]/50 bg-[var(--card)]/50 opacity-50">
                <div>
                  <p className="text-[10px] font-black uppercase text-[var(--foreground)]">{t.title}</p>
                  <p className="text-[8px] text-[var(--muted)]/50 uppercase tracking-wide">{t.format}</p>
                </div>
                <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border border-[var(--border)] text-[var(--muted)]/40">Ended</span>
              </div>
            ))}
          </div>
        )}

        {/* ── FOOTER NOTE ── */}
        <p className="text-center text-[8px] font-bold text-[var(--muted)]/25 uppercase tracking-widest">
          Register 1 hr before match · Results on Instagram
        </p>
      </div>

      {/* ── REGISTRATION MODAL ── */}
      <AnimatePresence>
        {registering && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRegistering(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl"
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
                  <FiX size={13} />
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
                    ? <FiLoader className="animate-spin" size={14} />
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
