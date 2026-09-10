"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, FiFilter, FiX,
  FiShoppingCart, FiPocket, FiUsers, FiMessageSquare, FiSmartphone, FiZap,
  FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiArrowUpRight
} from "react-icons/fi";
import { formatCurrency } from "@/utils";

const FILTER_TYPES = [
  { id: "all", label: "All Activity", icon: FiZap },
  { id: "orders", label: "Orders", icon: FiShoppingCart },
  { id: "wallet", label: "Wallet Txns", icon: FiPocket },
  { id: "users", label: "New Signups", icon: FiUsers },
  { id: "support", label: "Support Queries", icon: FiMessageSquare },
  { id: "pwa", label: "App Installs", icon: FiSmartphone },
];

const TIME_RANGES = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "7 Days" },
  { id: "month", label: "30 Days" },
  { id: "all", label: "All Time" },
];

export default function ActivityTab({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("today");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isFilterActive = type !== "all" || timeRange !== "today";

  // 300ms search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || "") : "";
      const adminPin = typeof window !== "undefined" ? (sessionStorage.getItem("adminPin") || "") : "";
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
        type,
      });

      if (debouncedSearch.trim()) params.append("search", debouncedSearch.trim());

      // Timezone-accurate IST filtering
      if (timeRange === "today") {
        const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const y = nowIST.getUTCFullYear();
        const m = nowIST.getUTCMonth();
        const d = nowIST.getUTCDate();
        const startOfTodayIST = new Date(Date.UTC(y, m, d) - 5.5 * 60 * 60 * 1000);
        params.append("startDate", startOfTodayIST.toISOString());
      } else if (timeRange === "yesterday") {
        const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
        const y = nowIST.getUTCFullYear();
        const m = nowIST.getUTCMonth();
        const d = nowIST.getUTCDate();
        const startOfYesterdayIST = new Date(Date.UTC(y, m, d - 1) - 5.5 * 60 * 60 * 1000);
        const endOfYesterdayIST = new Date(Date.UTC(y, m, d) - 5.5 * 60 * 60 * 1000 - 1);
        params.append("startDate", startOfYesterdayIST.toISOString());
        params.append("endDate", endOfYesterdayIST.toISOString());
      } else if (timeRange === "week") {
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        params.append("startDate", last7d.toISOString());
      } else if (timeRange === "month") {
        const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        params.append("startDate", last30d.toISOString());
      }

      const res = await fetch(`/api/admin/activity?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-admin-pin": adminPin,
        }
      });

      const data = await res.json();
      if (data && data.success) {
        setEvents(data.events || []);
        setTotalPages(data.totalPages || 1);
        setTotalEvents(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load activity stream", err);
    } finally {
      setLoading(false);
    }
  }, [page, type, debouncedSearch, timeRange]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatTimeAgo = (dateInput) => {
    if (!dateInput) return "Just now";
    const date = new Date(dateInput);
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getEventBadge = (event) => {
    if (event.type === "order") {
      if (event.status === "success") {
        return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20"><FiCheckCircle size={9} /> Paid & Delivered</span>;
      }
      if (event.status === "failed") {
        return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20"><FiXCircle size={9} /> Failed</span>;
      }
      return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20"><FiClock size={9} /> Pending</span>;
    }

    if (event.type === "wallet") {
      return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded border ${
          event.statusText?.includes("+")
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}>
          <FiPocket size={9} /> {event.statusText}
        </span>
      );
    }

    if (event.type === "user") {
      return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20"><FiUsers size={9} /> Joined</span>;
    }

    if (event.type === "support") {
      return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/20"><FiMessageSquare size={9} /> Support</span>;
    }

    if (event.type === "pwa") {
      return <span className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20"><FiSmartphone size={9} /> Installed</span>;
    }

    return null;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "order": return <FiShoppingCart size={14} className="text-emerald-500" />;
      case "wallet": return <FiPocket size={14} className="text-amber-400" />;
      case "user": return <FiUsers size={14} className="text-purple-400" />;
      case "support": return <FiMessageSquare size={14} className="text-blue-400" />;
      case "pwa": return <FiSmartphone size={14} className="text-cyan-400" />;
      default: return <FiZap size={14} className="text-[var(--accent)]" />;
    }
  };

  return (
    <div className="w-full space-y-3 pb-8">
      
      {/* Top Header & Search/Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--border)]/70">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Live Store Activity
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {totalEvents > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold text-[var(--foreground)] tabular-nums shadow-2xs">
                {totalEvents} <span className="text-[9px] text-[var(--muted)] font-medium">Events</span>
              </span>
            )}
            <button
              onClick={() => fetchActivity()}
              disabled={loading}
              className="w-7 h-7 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50 shrink-0"
              title="Refresh feed"
            >
              <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <FiSearch size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search activity..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-7 pr-2.5 py-1 text-xs bg-[var(--card)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-emerald-500/50 text-[var(--foreground)] shadow-2xs"
            />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            aria-label="Filter activity"
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 ${
              isFilterActive
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-emerald-500/30"
            }`}
            title="Filter activity"
          >
            <FiFilter size={12} />
          </button>

          {isFilterActive && (
            <button
              onClick={() => {
                setType("all");
                setTimeRange("today");
                setSearch("");
                setPage(1);
              }}
              className="px-2 h-7 rounded-lg text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips (Shown only when non-default filters are active) */}
      {isFilterActive && (
        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
          <span className="text-[var(--muted)] font-medium">Filters:</span>
          {type !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              {FILTER_TYPES.find(f => f.id === type)?.label}
              <button onClick={() => { setType("all"); setPage(1); }} className="hover:text-emerald-400 cursor-pointer ml-0.5">
                <FiX size={10} />
              </button>
            </span>
          )}
          {timeRange !== "today" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              Time: {TIME_RANGES.find(t => t.id === timeRange)?.label}
              <button onClick={() => { setTimeRange("today"); setPage(1); }} className="hover:text-emerald-400 cursor-pointer ml-0.5">
                <FiX size={10} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Activity List Container */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
        {loading && events.length === 0 ? (
          <div className="py-14 text-center text-xs text-[var(--muted)] flex flex-col items-center gap-2">
            <FiRefreshCw size={16} className="animate-spin text-emerald-500" />
            <span>Loading store activity...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-14 text-center text-xs text-[var(--muted)]">
            No activity records matched your filter.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]/60">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-2 sm:px-3 sm:py-2 hover:bg-[var(--foreground)]/[0.02] transition-colors flex items-center justify-between gap-2"
              >
                {/* Left side: Icon + Title + Details */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/70 flex items-center justify-center shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-[var(--foreground)] truncate">
                        {event.title}
                      </h4>
                      {getEventBadge(event)}
                    </div>
                    <p className="text-[10px] text-[var(--muted)] truncate">
                      {event.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right side: Amount + Timestamp + Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="text-right">
                    {event.amount !== null && event.amount !== undefined && (
                      <div className={`text-xs sm:text-sm font-black tabular-nums ${
                        event.status === "failed" ? "text-rose-500" : "text-emerald-500"
                      }`}>
                        {formatCurrency(event.amount)}
                      </div>
                    )}
                    <span className="text-[9px] text-[var(--muted)] font-mono block">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>

                  {event.type === "order" && onNavigate && (
                    <button
                      onClick={() => onNavigate("orders")}
                      className="w-6 h-6 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                      title="View in Orders"
                    >
                      <FiArrowUpRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-3.5 py-2 border-t border-[var(--border)]/70 flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span>Page <strong className="text-[var(--foreground)]">{page}</strong> of <strong className="text-[var(--foreground)]">{totalPages}</strong></span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="px-2 py-0.5 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
              >
                <FiChevronLeft size={11} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="px-2 py-0.5 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
              >
                Next <FiChevronRight size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= FILTER DRAWER / MODAL ================= */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-[var(--card)] border-l border-[var(--border)] z-[1110] flex flex-col"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-[var(--border)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <FiFilter size={13} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      Filter Activity
                    </h3>
                    <p className="text-[10px] text-[var(--muted)]">Narrow down live store events</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-7 h-7 rounded-lg bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer"
                >
                  <FiX size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* ACTIVITY TYPE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {FILTER_TYPES.map((f) => {
                      const Icon = f.icon;
                      const active = type === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => { setType(f.id); setPage(1); }}
                          className={`p-2.5 rounded-lg text-xs font-bold text-left transition-all flex items-center gap-2 cursor-pointer border ${
                            active
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-2xs"
                              : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <Icon size={12} className="shrink-0" />
                          <span className="truncate">{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* TIME RANGE */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Time Range
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIME_RANGES.map((t) => {
                      const active = timeRange === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => { setTimeRange(t.id); setPage(1); }}
                          className={`py-2 px-1.5 rounded-lg text-xs font-bold text-center transition-all cursor-pointer border ${
                            active
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-2xs"
                              : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[var(--border)] flex items-center justify-between gap-2 bg-[var(--foreground)]/[0.02]">
                <button
                  onClick={() => {
                    setType("all");
                    setTimeRange("today");
                    setPage(1);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all cursor-pointer hover:bg-[var(--foreground)]/[0.04]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-all cursor-pointer text-center shadow-2xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
