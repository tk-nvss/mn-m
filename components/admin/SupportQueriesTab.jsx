"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Filter,
  Inbox,
  Send
} from "lucide-react";

export default function SupportQueriesTab() {
  const [queries, setQueries] = useState([]);
  const [activeQuery, setActiveQuery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    today: 0,
  });

  useEffect(() => {
    fetchQueriesStats();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchQueriesList();
  }, [page, limit, debouncedSearch]);

  /* ================= FETCH QUERIES STATS ================= */
  const fetchQueriesStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/support-queries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats || { total: 0, open: 0, today: 0 });
        setPagination(prev => ({ ...prev, total: data.stats?.total || 0 }));
      }
    } catch (err) {
      console.error("Fetch queries stats failed", err);
    }
  };

  /* ================= FETCH QUERIES LIST ================= */
  const fetchQueriesList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/support-queries/data?page=${page}&limit=${limit}&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setQueries(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch support queries data failed", err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND ADMIN REPLY ================= */
  const sendAdminReply = async (id, status) => {
    if (!replyText.trim()) return;
    try {
      setSendingReply(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/support-queries/reply", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, adminReply: replyText.trim(), status }),
      });
      const data = await res.json();
      if (data.success) {
        setReplySuccess("Reply sent!");
        setReplyText("");
        setActiveQuery((prev) => prev ? { ...prev, adminReply: replyText.trim(), status: status || prev.status } : null);
        fetchQueriesList();
        setTimeout(() => setReplySuccess(""), 3000);
      } else {
        alert(data.message || "Failed to send reply");
      }
    } catch {
      alert("Connection error");
    } finally {
      setSendingReply(false);
    }
  };

  /* ================= UPDATE QUERY STATUS ================= */
  const updateQueryStatus = async (id, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/support-queries/status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update status");
        return;
      }

      fetchQueriesList();
      fetchQueriesStats();
    } finally {
      setUpdating(false);
    }
  };

  const statusMeta = {
    open: {
      label: "Open",
      class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: <AlertCircle size={12} />
    },
    in_progress: {
      label: "In Progress",
      class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: <RefreshCcw size={12} className="animate-spin-slow" />
    },
    resolved: {
      label: "Resolved",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: <CheckCircle2 size={12} />
    },
    closed: {
      label: "Closed",
      class: "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]",
      icon: <X size={12} />
    },
  };

  const getStatus = (status) => status || "open";

  return (
    <div className="space-y-6 pb-6 px-4 md:px-0 max-w-full overflow-x-hidden">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <MessageSquare className="text-[var(--accent)] text-[14px]" size={16} />
            </div>
            <div>
                <h2 className="text-xs font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Support</h2>
                <p className="text-[8px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Customer Queries
                </p>
            </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 ml-auto">
          <div className="flex bg-[var(--foreground)]/[0.03] px-3 py-1.5 rounded-full border border-[var(--border)]/50 shadow-inner">
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">
              <span className="text-[var(--foreground)] mr-1">{pagination.total}</span> Total
            </span>
          </div>
          <button aria-label="button"
            onClick={() => { fetchQueriesStats(); fetchQueriesList(); }}
            className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all active:scale-95 shadow-inner"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= STATS GRID ================= */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <InsightCard
          label="Pending"
          value={stats.open}
          color="amber"
          pulse={stats.open > 0}
        />
        <InsightCard
          label="Today"
          value={stats.today}
          color="purple"
        />
      </div>

      {/* ================= SEARCH & FILTER ================= */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={14} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search queries..."
            className="w-full h-9 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] text-[10px] font-bold focus:border-[var(--accent)]/50 outline-none placeholder:text-[var(--muted)]/30 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center space-y-3"
            >
              <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
              <p className="text-xs font-bold text-[var(--muted)]/40 uppercase tracking-widest">Loading...</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5"
            >
              {queries.map((q, idx) => {
                const status = getStatus(q.status);
                const meta = statusMeta[status];

                return (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => { setActiveQuery(q); setReplyText(q.adminReply || ""); setReplySuccess(""); }}
                    className="group relative rounded-xl border border-[var(--border)] bg-[var(--card)]/40 hover:bg-[var(--foreground)]/[0.02] transition-colors cursor-pointer px-4 py-2.5 flex items-center gap-3"
                  >
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                      style={{ backgroundColor: meta.label === 'Open' ? '#f59e0b' : meta.label === 'Resolved' ? '#10b981' : '#3b82f6' }}
                    />

                    <div className="flex items-center gap-2 w-full min-w-0">
                      <span className={`shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[7px] font-black uppercase tracking-widest ${meta.class}`}>
                        {meta.label}
                      </span>
                      
                      <span className="shrink-0 text-[8px] font-bold text-[var(--muted)]/40 w-12 truncate">
                        {new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>

                      <h4 className="shrink-0 text-[11px] font-black text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors w-28 sm:w-40">
                        {q.name || q.email || "Unknown"}
                      </h4>

                      <p className="flex-1 text-[10px] font-medium text-[var(--muted)]/60 truncate">
                        {q.message}
                      </p>
                    </div>

                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted)]/30 shrink-0 group-hover:bg-[var(--foreground)]/[0.05] group-hover:text-[var(--foreground)] transition-all">
                      <ChevronRight size={12} />
                    </div>
                  </motion.div>
                );
              })}

              {!queries.length && (
                <div className="py-16 text-center border border-dashed border-[var(--border)] rounded-2xl">
                  <Inbox className="mx-auto text-[var(--muted)]/20 mb-2" size={32} />
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">No queries found</p>
                </div>
              )}

              {/* ================= PAGINATION ================= */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6">
                  <p className="text-[10px] font-bold text-[var(--muted)]/40 uppercase">
                    Page {pagination.page} / {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button aria-label="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-20 transition-all"
                    >
                      Prev
                    </button>
                    <button aria-label="button"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-20 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {activeQuery && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuery(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] rounded-[1.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest">Query Details</h3>
                <button aria-label="button"
                  onClick={() => setActiveQuery(null)}
                  className="w-7 h-7 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--foreground)] hover:bg-rose-500/20 transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                  <DetailBlock label="Name" value={activeQuery.name || "N/A"} icon={<Mail size={10} />} />
                  <DetailBlock label="Email" value={activeQuery.email || "N/A"} icon={<Mail size={10} />} />
                  <DetailBlock label="Phone" value={activeQuery.phoneNo || activeQuery.phone || "N/A"} icon={<Phone size={10} />} />
                  <DetailBlock label="Order ID" value={activeQuery.orderId || "N/A"} icon={<MessageSquare size={10} />} />
                  <DetailBlock label="Type" value={activeQuery.type} emphasize icon={<MessageSquare size={10} />} />
                  <DetailBlock label="Date" value={new Date(activeQuery.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })} icon={<Clock size={10} />} />
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]">
                  <p className="text-[9px] font-black text-[var(--muted)]/40 uppercase tracking-widest">Message</p>
                  <p className="text-xs font-medium leading-relaxed text-[var(--foreground)]">
                    {activeQuery.message}
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-[var(--border)]">
                  <p className="text-[9px] font-black text-[var(--muted)]/40 uppercase tracking-widest ml-1">Status</p>
                  <CustomDropdown
                    value={getStatus(activeQuery.status)}
                    onChange={(newStatus) => {
                      updateQueryStatus(activeQuery._id, newStatus);
                      setActiveQuery((prev) => prev ? { ...prev, status: newStatus } : null);
                    }}
                    disabled={updating}
                    options={[
                      { value: "open", label: "Open" },
                      { value: "in_progress", label: "In Progress" },
                      { value: "resolved", label: "Resolved" },
                      { value: "closed", label: "Closed" },
                    ]}
                  />
                </div>

                {/* ===== ADMIN REPLY ===== */}
                <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                  <p className="text-[9px] font-black text-[var(--muted)]/40 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Send size={10} className="text-[var(--accent)]" /> Admin Reply
                  </p>

                  {activeQuery.adminReply && (
                    <div className="p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                      <p className="text-[8px] font-black tracking-widest text-[var(--accent)] uppercase mb-1">Previous reply</p>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed">{activeQuery.adminReply}</p>
                    </div>
                  )}

                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the user..."
                    rows={2}
                    className="w-full p-3 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder:text-[var(--muted)]/30 outline-none focus:border-[var(--accent)]/50 resize-none transition-all shadow-inner"
                  />

                  {replySuccess && (
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={10} /> {replySuccess}
                    </p>
                  )}

                  <button aria-label="button"
                    disabled={!replyText.trim() || sendingReply}
                    onClick={() => sendAdminReply(activeQuery._id, getStatus(activeQuery.status))}
                    className="w-full h-9 rounded-full bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98] disabled:opacity-30 transition-all"
                  >
                    {sendingReply ? <Loader2 size={12} className="animate-spin" /> : <><Send size={12} /> Send Reply</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function CustomDropdown({ value, onChange, options, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button aria-label="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full h-11 px-4 
          rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          text-xs font-bold uppercase transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.08] active:scale-[0.98]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : "text-[var(--foreground)]"}
        `}
      >
        <span className={value === "resolved" ? "text-emerald-500" : value === "in_progress" ? "text-blue-500" : value === "open" ? "text-amber-500" : "text-[var(--foreground)]/40"}>
          {selectedOption?.label}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-300 text-[var(--muted)] ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-[1110] w-full rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button aria-label="button"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase rounded-lg transition-all
                  ${option.value === value
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)]"}
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBlock({ label, value, emphasize, icon }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[8px] font-black text-[var(--muted)]/40 uppercase tracking-widest flex items-center gap-1">
        <span className="text-[var(--accent)]">{icon}</span> {label}
      </p>
      <p className={`text-[11px] font-black break-all leading-tight ${emphasize ? "text-[var(--accent)] uppercase italic tracking-wider" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}

function InsightCard({ label, value, color, pulse }) {
  const colors = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-3 py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center relative bg-[var(--card)]/40`}
    >
      {pulse && (
        <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-current animate-ping" />
      )}
      <span className="text-[7px] font-black uppercase tracking-widest opacity-80 mb-0.5">{label}</span>
      <span className="text-sm font-black tabular-nums whitespace-nowrap leading-none">{value}</span>
    </motion.div>
  );
}
