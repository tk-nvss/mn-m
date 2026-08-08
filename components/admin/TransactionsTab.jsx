"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Clock,
  User,
  Gamepad2,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  CreditCard,
  Hash,
  Loader2,
  Calendar,
  Smartphone,
  ShoppingBag
} from "lucide-react";

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });





  useEffect(() => {
    fetchTransactionsList();
  }, [page, limit, search]);



  const fetchTransactionsList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/transactions/data?page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setTransactions(data?.data || []);
      setPagination(
        data?.pagination || {
          total: 0,
          page: 1,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Transaction fetch failed", err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const statusMeta = {
    success: {
      label: "Success",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />
    },
    failed: {
      label: "Failed",
      class: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: <XCircle size={12} />
    },
    pending: {
      label: "Pending",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <Clock size={12} />
    },
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-lg md:text-xl font-black tracking-widest text-[var(--foreground)] uppercase italic">Transactions</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-[var(--muted)] uppercase">
              {pagination.total} TXNS
            </span>
          </div>
          <button aria-label="button"
            onClick={() => { fetchTransactionsList(); }}
            className="h-9 w-9 rounded-full border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--foreground)]/[0.05] transition-all outline-none"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : "text-[var(--accent)]"} />
          </button>
        </div>
      </div>


      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={16} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search Order ID, Email..."
            className="w-full h-11 pl-11 pr-4 rounded-full border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-sm font-bold focus:border-[var(--accent)]/50 outline-none transition-all placeholder:text-[var(--muted)]/40"
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">Loading Records...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-[2rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]">
                  <tr className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {transactions.map((t, idx) => {
                    const meta = statusMeta[t.status] || statusMeta.pending;
                    return (
                      <motion.tr
                        key={t._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setSelectedTx(t)}
                        className="group hover:bg-[var(--foreground)]/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-medium">{new Date(t.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-[var(--muted)]/40">{new Date(t.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] text-[var(--accent)] uppercase">{t.orderId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col max-w-[150px]">
                            <span className="truncate text-[var(--foreground)] font-medium">{t.email || "Guest User"}</span>
                            <span className="text-[10px] text-[var(--muted)]/40 truncate">{t.playerId || "No ID"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--muted)]/60">
                            <Gamepad2 size={12} className="text-[var(--accent)]" />
                            {t.gameSlug}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${meta.class}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase border border-[var(--border)] px-2 py-1 rounded-md bg-[var(--foreground)]/[0.02]">
                            {t.paymentMethod || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-base font-black text-emerald-500 tracking-tighter tabular-nums">
                            ₹{t.price}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-3">
              {transactions.map((t, idx) => {
                const meta = statusMeta[t.status] || statusMeta.pending;
                return (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedTx(t)}
                    className="p-3 md:p-4 rounded-[1.25rem] border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.05] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[7px] font-bold uppercase tracking-wider ${meta.class}`}>
                            {meta.icon}
                            {meta.label}
                          </span>
                          <span className="text-[8px] font-bold text-[var(--muted)]/40 uppercase tracking-tighter truncate">{t.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[var(--foreground)]/[0.05] flex items-center justify-center shrink-0">
                            <Gamepad2 size={12} className="text-[var(--accent)]" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-[var(--foreground)] uppercase text-[10px] leading-tight">{t.gameSlug}</p>
                            <p className="text-[9px] text-[var(--muted)]/60 truncate leading-tight lowercase">{t.email || "no email"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-base font-black text-emerald-500 tracking-tighter tabular-nums">₹{t.price}</span>
                        <span className="text-[8px] font-medium text-[var(--muted)]/40 leading-none">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[9px] font-mono text-[var(--muted)]/40 border-t border-[var(--border)] pt-2 mt-2">
                      <span className="truncate uppercase">{t.orderId}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span>Details</span>
                        <ChevronRight size={10} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!transactions.length && (
              <div className="py-20 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <Hash className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-[0.2em]">No Transactions Found</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase">
                  Listing <b className="text-[var(--foreground)]">{pagination.page}</b> / {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button aria-label="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 transition-all font-mono"
                  >
                    PREV
                  </button>
                  <button aria-label="button"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)]/60 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] disabled:opacity-20 transition-all font-mono"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER ================= */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 z-[1001] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--background)]/95 backdrop-blur-3xl border-l border-white/5 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-[1002] flex flex-col"
            >
              <div className="p-5 md:p-6 border-b border-white/5 bg-gradient-to-b from-[var(--card)]/50 to-transparent">
                <div className="flex items-start justify-between mb-5">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-mono font-black text-[var(--accent)] uppercase tracking-[0.2em] opacity-80 mb-1 drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]">#{selectedTx.orderId.toUpperCase()}</p>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Transaction Summary</h3>
                  </div>
                  <button aria-label="button"
                    onClick={() => setSelectedTx(null)}
                    className="w-9 h-9 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--foreground)] hover:bg-red-500/20 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] shadow-sm">
                  <div>
                    <p className="text-[9px] font-bold text-[var(--muted)]/50 uppercase tracking-widest mb-0.5">Settlement Amount</p>
                    <span className="text-2xl font-black text-emerald-500 tabular-nums leading-none">₹{selectedTx.price}</span>
                  </div>
                  {(() => {
                    const meta = statusMeta[selectedTx.status] || statusMeta.pending;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest ${meta.class}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 md:space-y-6">
                <DrawerSection icon={<Gamepad2 size={16} />} title="Order Details">
                  <DrawerDetail label="Game" value={selectedTx.gameSlug} emphasize />
                  <DrawerDetail label="Item" value={selectedTx.itemName} />
                  <DrawerDetail label="Code" value={selectedTx.itemSlug} />
                </DrawerSection>

                <DrawerSection icon={<Smartphone size={16} />} title="Player Info">
                  <DrawerDetail label="Player ID" value={selectedTx.playerId} emphasize />
                  <DrawerDetail label="Server/Zone" value={selectedTx.zoneId || "GLOBAL"} />
                </DrawerSection>

                <DrawerSection icon={<CreditCard size={16} />} title="Payment Details">
                  <DrawerDetail label="Method" value={selectedTx.paymentMethod} />
                  <DrawerDetail label="Payment Status" value={selectedTx.paymentStatus} emphasize />
                  <DrawerDetail label="Delivery Status" value={selectedTx.topupStatus} />
                </DrawerSection>

                <DrawerSection icon={<User size={16} />} title="Customer Info">
                  <DrawerDetail label="Email" value={selectedTx.email || "GUEST"} />
                  <DrawerDetail label="Phone" value={selectedTx.phone || "UNLINKED"} />
                  <DrawerDetail label="Date & Time" value={new Date(selectedTx.createdAt).toLocaleString()} />
                </DrawerSection>

                <div className="pb-6" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= HELPERS ================= */

function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[var(--foreground)]">
        <div className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]">{icon}</div>
        <h4 className="text-[10px] font-black uppercase tracking-widest">{title}</h4>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--border)] to-transparent ml-2" />
      </div>
      <div className="flex flex-col gap-3 px-1 mt-1">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value, emphasize }) {
  return (
    <div className="flex items-end justify-between gap-1 group w-full">
      <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest whitespace-nowrap mb-0.5">{label}</span>
      <div className="flex-1 border-b-2 border-dotted border-[var(--border)]/30 mx-2 mb-1.5 opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className={`text-xs md:text-sm font-black text-right truncate max-w-[55%] ${emphasize ? "text-[var(--accent)] drop-shadow-[0_0_5px_rgba(var(--accent-rgb),0.3)] italic uppercase" : "text-[var(--foreground)]"}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}

function InsightCard({ label, value, color, pulse, compact }) {
  const colors = {
    blue: "text-blue-500 border-blue-500/10 bg-blue-500/5",
    amber: "text-amber-500 border-amber-500/10 bg-amber-500/5",
    purple: "text-purple-500 border-purple-500/10 bg-purple-500/5",
    emerald: "text-emerald-500 border-emerald-500/10 bg-emerald-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center relative overflow-hidden`}
    >
      {pulse && (
        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current animate-ping" />
      )}
      <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tight opacity-60 mb-0.5">{label}</span>
      <span className="text-xs sm:text-sm font-black tabular-nums whitespace-nowrap">{value}</span>
    </motion.div>
  );
}
