"use client";

import { useEffect, useState } from "react";
import { FiAward, FiLoader, FiChevronLeft, FiChevronRight, FiLock, FiInfo, FiX, FiCheckCircle, FiCopy, FiClock, FiChevronRight as FiArrow } from "react-icons/fi";
import { TableRowSkeleton } from "@/components/Skeleton/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 5;

export default function JoinedTournaments() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); return; }
        const res = await fetch("/api/tournaments/register", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setEntries(data.data || []);
        else setEntries([]);
      } catch { setEntries([]); }
      finally { setLoading(false); }
    };
    fetchEntries();
  }, []);

  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE);
  const currentItems = entries.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const getStatusStyle = (entry) => {
    if (entry.isWinner) return { bg: "bg-amber-500/10 border-amber-500/25 text-amber-500", label: "🏆 Winner" };
    if (entry.isEliminated) return { bg: "bg-rose-500/10 border-rose-500/25 text-rose-400", label: "Eliminated" };
    return { bg: "bg-emerald-500/10 border-emerald-500/25 text-emerald-500", label: `Round ${entry.currentRound}` };
  };

  if (loading) return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
            {["Tournament", "Format", "Time", "Status"].map(h => (
              <th key={h} className="px-3 py-2.5 text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody><TableRowSkeleton cols={4} /><TableRowSkeleton cols={4} /><TableRowSkeleton cols={4} /></tbody>
      </table>
    </div>
  );

  if (!entries || entries.length === 0) return (
    <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-[var(--border)]">
      <div className="w-14 h-14 rounded-2xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)]/30 mx-auto">
        <FiAward size={24} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]/40">No Active Registrations</p>
      <p className="text-[9px] text-[var(--muted)]/30 uppercase tracking-wide">You haven't joined any tournaments yet.</p>
    </div>
  );

  return (
    <div className="space-y-3">

      {/* ── HOW TO JOIN BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-3.5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5"
      >
        <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
          <FiInfo size={12} />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)] mb-0.5">How to Join</p>
          <p className="text-[8px] text-[var(--muted)]/60 leading-relaxed font-bold uppercase tracking-wide">
            Room ID appears 15–30 mins before game. Please{" "}
            <span className="text-[var(--accent)]">join 5 mins before</span> start time.
          </p>
        </div>
      </motion.div>

      {/* ── ENTRIES HEADER ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40">My Entries ({entries.length})</p>
      </div>

      {/* ── ENTRY CARDS ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden divide-y divide-[var(--border)]">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 bg-[var(--foreground)]/[0.02]">
          <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40">Tournament</span>
          <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40 text-center w-10">Format</span>
          <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40 text-center w-14">Time</span>
          <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40 text-right w-16">Status</span>
        </div>

        <AnimatePresence mode="wait">
          {currentItems.map((entry, idx) => {
            const { bg, label } = getStatusStyle(entry);
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => setSelectedEntry(entry)}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 cursor-pointer hover:bg-[var(--foreground)]/[0.02] transition-colors"
              >
                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/8 flex items-center justify-center text-[var(--accent)] shrink-0">
                    <FiAward size={11} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-black text-[var(--foreground)] uppercase truncate leading-tight">
                      {entry.teamName ? entry.teamName : (entry.tournamentId?.title || "Scrim")}
                    </p>
                    <p className="text-[7px] text-[var(--muted)]/40 uppercase tracking-tight truncate">
                      {entry.teamName ? entry.tournamentId?.title : (entry.tournamentId?.game || "MLBB")}
                    </p>
                  </div>
                </div>

                {/* Format */}
                <span className="text-[8px] font-bold text-[var(--muted)]/60 uppercase w-10 text-center">
                  {entry.tournamentId?.format?.split(' ')[0] || "1v1"}
                </span>

                {/* Time */}
                <div className="flex flex-col items-center w-14">
                  <span className="text-[8px] font-black text-[var(--foreground)] uppercase">
                    {entry.tournamentId?.startsAt ? new Date(entry.tournamentId.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA"}
                  </span>
                  <span className="text-[6px] text-[var(--muted)]/40 uppercase tracking-tight">
                    {entry.tournamentId?.startsAt ? new Date(entry.tournamentId.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Date TBA"}
                  </span>
                </div>

                {/* Status */}
                <div className="w-16 flex justify-end">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-tight border ${bg}`}>
                    {label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[8px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button aria-label="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-25 transition-colors"
            >
              <FiChevronLeft size={13} />
            </button>
            <button aria-label="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-25 transition-colors"
            >
              <FiChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              className="relative w-full max-w-[300px] rounded-2xl bg-[var(--background)] border border-[var(--border)] shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between p-4 border-b border-[var(--border)]">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">Tournament Details</p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
                    {selectedEntry.teamName || selectedEntry.tournamentId?.title}
                  </h3>
                  {selectedEntry.teamName && (
                    <p className="text-[8px] text-[var(--muted)]/50 uppercase tracking-wide mt-0.5">
                      {selectedEntry.tournamentId?.title}
                    </p>
                  )}
                </div>
                <button aria-label="button" onClick={() => setSelectedEntry(null)}
                  className="w-7 h-7 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0">
                  <FiX size={13} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Status + Format row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <p className="text-[6px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1">Progress</p>
                    <p className={`text-[8px] font-black uppercase ${
                      selectedEntry.isWinner ? "text-amber-500" :
                      selectedEntry.isEliminated ? "text-rose-400" : "text-emerald-500"}`}>
                      {selectedEntry.isWinner ? "🏆 Winner" : selectedEntry.isEliminated ? "Eliminated" : `Round ${selectedEntry.currentRound}`}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <p className="text-[6px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1">Format</p>
                    <p className="text-[8px] font-black uppercase text-[var(--foreground)]">{selectedEntry.tournamentId?.format || "1v1"}</p>
                  </div>
                </div>

                {/* Time + IDs row */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <p className="text-[6px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1">Game Time</p>
                    <p className="text-[8px] font-black text-[var(--foreground)]">
                      {selectedEntry.tournamentId?.startsAt ? new Date(selectedEntry.tournamentId.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA"}
                    </p>
                    <p className="text-[7px] text-[var(--muted)]/40 mt-0.5">
                      {selectedEntry.tournamentId?.startsAt ? new Date(selectedEntry.tournamentId.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : "Date TBA"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                    <p className="text-[6px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1">My ID</p>
                    {selectedEntry.gameIds?.slice(0, 2).map((id, i) => (
                      <p key={i} className="text-[7px] font-mono text-[var(--foreground)] truncate">{id}</p>
                    ))}
                  </div>
                </div>

                {/* Room info */}
                <div className="p-3 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <FiLock size={10} className="text-[var(--accent)]" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--foreground)]">Room Details</span>
                  </div>
                  {selectedEntry.assignedRoomId || selectedEntry.tournamentId?.roomId ? (
                    <div className="space-y-1.5">
                      {[
                        { label: "ID", value: selectedEntry.assignedRoomId || selectedEntry.tournamentId?.roomId, key: "roomId" },
                        { label: "Pass", value: selectedEntry.assignedRoomPassword || selectedEntry.tournamentId?.roomPassword || "None", key: "roomPass" },
                      ].map(({ label, value, key }) => (
                        <div key={key} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[var(--background)]/60 border border-[var(--border)]">
                          <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/50">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-[var(--foreground)]">{value}</span>
                            {value !== "None" && (
                              <button aria-label="button" onClick={() => copyToClipboard(value, key)}>
                                {copiedKey === key
                                  ? <FiCheckCircle size={10} className="text-emerald-500" />
                                  : <FiCopy size={10} className="text-[var(--muted)]/40 hover:text-[var(--accent)] transition-colors" />
                                }
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[8px] text-[var(--muted)]/40 text-center py-2 border border-dashed border-[var(--accent)]/20 rounded-xl font-bold uppercase tracking-wide">
                      ID appears 15–30 mins before game
                    </p>
                  )}
                </div>

                {/* Reminder */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <FiClock size={11} className="text-amber-500 shrink-0" />
                  <p className="text-[8px] font-black uppercase tracking-widest text-amber-500">Join 5 mins before start!</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
