"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  FiRefreshCw, FiSearch, FiChevronLeft, FiChevronRight, FiFilter,
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState("");

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
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"><FiCheckCircle size={10} /> Paid & Delivered</span>;
      }
      if (event.status === "failed") {
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"><FiXCircle size={10} /> Failed</span>;
      }
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"><FiClock size={10} /> Pending</span>;
    }

    if (event.type === "wallet") {
      return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
          event.statusText?.includes("+")
            ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}>
          <FiPocket size={10} /> {event.statusText}
        </span>
      );
    }

    if (event.type === "user") {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20"><FiUsers size={10} /> Joined</span>;
    }

    if (event.type === "support") {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20"><FiMessageSquare size={10} /> Support</span>;
    }

    if (event.type === "pwa") {
      return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20"><FiSmartphone size={10} /> App Installed</span>;
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
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Store Activity Feed
            </h2>
            <button
              onClick={() => fetchActivity()}
              disabled={loading}
              className="p-1.5 rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--muted)] mt-0.5">
            Realtime event log of orders, wallet deposits, signups, support tickets, and app downloads ({totalEvents} total recorded)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onNavigate && (
            <button
              onClick={() => onNavigate("analytics")}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-all flex items-center gap-1 cursor-pointer"
            >
              ← Back to Analytics
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {FILTER_TYPES.map((f) => {
            const Icon = f.icon;
            const active = type === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setType(f.id); setPage(1); }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                }`}
              >
                <Icon size={12} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Time Range */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Time range pills */}
          <div className="flex p-0.5 bg-[var(--foreground)]/[0.04] border border-[var(--border)] rounded-lg gap-0.5">
            {TIME_RANGES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTimeRange(t.id); setPage(1); }}
                className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  timeRange === t.id
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <FiSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search user, order..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--foreground)]/40 text-[var(--foreground)]"
            />
          </div>
        </div>
      </div>

      {/* Activity List Container */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 overflow-hidden shadow-xs">
        {loading && events.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--muted)] flex flex-col items-center gap-2">
            <FiRefreshCw size={18} className="animate-spin text-emerald-500" />
            <span>Loading live store events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--muted)]">
            No activity records matched your filter.
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]/50">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-3 sm:p-4 hover:bg-[var(--foreground)]/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                {/* Left side: Icon + Title + Details */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] shrink-0 mt-0.5 sm:mt-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">
                        {event.title}
                      </h4>
                      {getEventBadge(event)}
                    </div>
                    <p className="text-[11px] sm:text-xs text-[var(--muted)] font-normal mt-0.5 break-words">
                      {event.subtitle}
                    </p>
                  </div>
                </div>

                {/* Right side: Amount + Timestamp + Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-stretch sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/30">
                  <div className="text-left sm:text-right">
                    {event.amount !== null && event.amount !== undefined && (
                      <div className={`text-xs sm:text-sm font-black tabular-nums ${
                        event.status === "failed" ? "text-rose-500" : "text-emerald-500"
                      }`}>
                        {formatCurrency(event.amount)}
                      </div>
                    )}
                    <span className="text-[10px] text-[var(--muted)] font-mono block">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>

                  {event.type === "order" && onNavigate && (
                    <button
                      onClick={() => onNavigate("orders")}
                      className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--foreground)]/[0.06] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="View in Orders"
                    >
                      <FiArrowUpRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[var(--border)]/70 flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Page <strong className="text-[var(--foreground)]">{page}</strong> of <strong className="text-[var(--foreground)]">{totalPages}</strong></span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
                className="px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              >
                <FiChevronLeft size={12} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages || loading}
                className="px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
              >
                Next <FiChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
