"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  ChevronDown,
  ShoppingBag,
  Smartphone,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { StatusBadge, SearchInput, EmptyState, Pagination } from "@/components/common";
import { formatCurrency, formatDate, formatTime, formatDateTime } from "@/utils";

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key, e) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 1500);
  };

  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    gameSlug: "",
    from: "",
    to: "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrdersList();
  }, [page, limit, search, filters]);

  /* ================= FETCH ORDERS LIST ================= */
  const fetchOrdersList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        ...(filters.status && { status: filters.status }),
        ...(filters.gameSlug && { gameSlug: filters.gameSlug }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(
        `/api/admin/orders/data?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setOrders(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch orders list failed", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ORDER STATUS ================= */
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to update order");
        return;
      }

      fetchOrdersList();
    } catch (err) {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <h2 className="text-lg font-black tracking-widest uppercase italic text-[var(--foreground)]">Orders</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[9px] font-black tracking-widest text-[var(--muted)] uppercase">
              {pagination.total} ORDERS
            </span>
          </div>
          <button aria-label="button"
            onClick={() => { fetchOrdersList(); }}
            className="p-1.5 rounded-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all"
          >
            <RefreshCcw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>


      <div className="flex flex-row gap-2 mb-2">
        <SearchInput
          value={search}
          onChange={(val) => {
            setPage(1);
            setSearch(val);
          }}
          placeholder="Search by Order ID, Email, Method..."
          loading={loading}
          className="flex-1"
        />
        <div className="flex gap-2">
          <button aria-label="button"
            onClick={() => setShowFilters(true)}
            className="h-9 w-9 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] flex items-center justify-center hover:bg-[var(--foreground)]/[0.05] transition-all outline-none"
          >
            <Filter size={14} className="text-[var(--accent)]" />
          </button>
          
          {(search || filters.status || filters.gameSlug || filters.from || filters.to) && (
            <button aria-label="button"
              onClick={() => {
                setSearch("");
                setFilters({ status: "", gameSlug: "", from: "", to: "" });
              }}
              className="px-3 h-9 rounded-full text-rose-500 hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-widest transition-all"
            >
              Clear
            </button>
          )}
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
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">Loading Orders...</p>
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
                    {["Game", "Time", "Item Details", "Method", "Price", "Status"].map((h) => (
                      <th key={h} className="px-6 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {orders.map((o, idx) => {
                    return (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => setSelectedOrder(o)}
                        className="group hover:bg-[var(--foreground)]/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-bold uppercase text-xs">{o.gameSlug}</span>
                            <span className="text-[10px] text-[var(--muted)] font-medium truncate max-w-[140px] lowercase">{o.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-medium">{formatDate(o.createdAt)}</span>
                            <span className="text-[10px] text-[var(--muted)]">{formatTime(o.createdAt)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <span className="text-[var(--foreground)]/80 font-bold truncate block text-xs">{o.itemName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-tight truncate">
                              {o.playerId}{o.zoneId ? ` (${o.zoneId})` : ""} {o.playerName ? `• ${o.playerName}` : ""}
                            </span>
                            {o.playerId && (
                              <button
                                type="button"
                                onClick={(e) => handleCopy(o.zoneId ? `${o.playerId} ${o.zoneId}` : o.playerId, `player-${o._id}`, e)}
                                className="p-1 rounded hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--accent)] active:scale-95 transition-all shrink-0"
                                title="Copy Player ID & Zone"
                              >
                                {copiedKey === `player-${o._id}` ? (
                                  <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                                    <Check size={11} className="text-emerald-500" />
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold">Copied</span>
                                  </span>
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase border border-[var(--border)] px-2 py-1 rounded-md bg-[var(--foreground)]/[0.02]">
                            {o.paymentMethod || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base font-black text-emerald-500 tabular-nums">
                            {formatCurrency(o.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            value={o.status}
                            disabled={updating}
                            onChange={(v) => updateOrderStatus(o.orderId, v)}
                            options={[
                              { value: "pending", label: "Pending" },
                              { value: "success", label: "Success" },
                              { value: "failed", label: "Failed" },
                              { value: "refund", label: "Refund" },
                            ]}
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-2">
              {orders.map((o, idx) => {
                return (
                  <motion.div
                    key={o._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedOrder(o)}
                    className="p-3 rounded-[1.2rem] border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.05] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="flex flex-col min-w-0">
                        <p className="font-bold text-[var(--foreground)] uppercase text-[10px] leading-none mb-0.5 truncate">{o.gameSlug}</p>
                        <p className="text-[9px] text-[var(--muted)] font-medium truncate max-w-[150px] lowercase leading-none">{o.email}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-black text-emerald-500 tabular-nums">{formatCurrency(o.price)}</span>
                        <span className="text-[7px] font-bold text-[var(--muted)] uppercase opacity-60 tracking-tighter">{o.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-[10px]">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--foreground)]/80 line-clamp-1 truncate">"{o.itemName}"</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-[8.5px] font-mono text-[var(--muted)] uppercase tracking-tight truncate">
                            {o.playerId}{o.zoneId ? ` (${o.zoneId})` : ""} {o.playerName ? `• ${o.playerName}` : ""}
                          </p>
                          {o.playerId && (
                            <button
                              type="button"
                              onClick={(e) => handleCopy(o.zoneId ? `${o.playerId} ${o.zoneId}` : o.playerId, `m-player-${o._id}`, e)}
                              className="p-0.5 rounded hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--accent)] active:scale-95 transition-all shrink-0"
                              title="Copy Player ID"
                            >
                              {copiedKey === `m-player-${o._id}` ? (
                                <Check size={10} className="text-emerald-500" />
                              ) : (
                                <Copy size={10} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-end mr-1">
                          <span className="font-bold text-[var(--muted)]/60 leading-tight">{formatDate(o.createdAt)}</span>
                          <span className="text-[8px] font-medium text-[var(--muted)]/40 leading-tight">{formatTime(o.createdAt)}</span>
                        </div>
                        <StatusDropdown
                          value={o.status}
                          disabled={updating}
                          onChange={(v) => updateOrderStatus(o.orderId, v)}
                          compact
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "success", label: "Success" },
                            { value: "failed", label: "Failed" },
                            { value: "refund", label: "Refund" },
                          ]}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!orders.length && (
              <EmptyState
                icon={ShoppingBag}
                title="No Orders Found"
                description="Try clearing your search or adjusting the filters."
              />
            )}

            {/* ================= PAGINATION ================= */}
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemLabel="Orders"
              onPageChange={setPage}
              variant="numbered"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--background)]/95 backdrop-blur-3xl border-l border-white/5 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-[1110] flex flex-col"
            >
              <div className="p-5 md:p-6 border-b border-white/5 bg-gradient-to-b from-[var(--card)]/50 to-transparent">
                <div className="flex items-start justify-between mb-5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <p className="text-[9px] font-mono font-black text-[var(--accent)] uppercase tracking-[0.2em] opacity-80 drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]">
                        #{selectedOrder.orderId.toUpperCase()}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(selectedOrder.orderId, `drawer-oid-${selectedOrder._id}`, e)}
                        className="p-1 rounded hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--accent)] transition-all shrink-0"
                        title="Copy Order ID"
                      >
                        {copiedKey === `drawer-oid-${selectedOrder._id}` ? (
                          <span className="text-[8px] font-bold text-emerald-500 flex items-center gap-0.5">
                            <Check size={10} className="text-emerald-500" /> Copied
                          </span>
                        ) : (
                          <Copy size={10} />
                        )}
                      </button>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Order Details</h3>
                  </div>
                  <button aria-label="button"
                    onClick={() => setSelectedOrder(null)}
                    className="w-9 h-9 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]/40 hover:text-[var(--foreground)] hover:bg-red-500/20 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-[var(--card)] to-[var(--background)] border border-[var(--border)] shadow-sm">
                  <div>
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-0.5">Settlement</p>
                    <span className="text-2xl font-black text-emerald-500 tabular-nums leading-none">{formatCurrency(selectedOrder.price)}</span>
                  </div>
                  <StatusDropdown
                    value={selectedOrder.status}
                    compact
                    onChange={(v) => {
                      updateOrderStatus(selectedOrder.orderId, v);
                      setSelectedOrder(null);
                    }}
                    options={[
                      { value: "pending", label: "Pending" },
                      { value: "success", label: "Success" },
                      { value: "failed", label: "Failed" },
                      { value: "refund", label: "Refund" },
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 md:space-y-6">
                <DrawerSection icon={<Gamepad2 size={14} />} title="Item Info">
                  <DrawerDetail label="Game" value={selectedOrder.gameSlug} emphasize />
                  <DrawerDetail label="Item Name" value={selectedOrder.itemName} />
                  <DrawerDetail label="Item Code" value={selectedOrder.itemSlug} />
                </DrawerSection>

                <DrawerSection icon={<Smartphone size={14} />} title="Player ID Info">
                  <DrawerDetail
                    label="Player Name"
                    value={selectedOrder.playerName || "Unknown"}
                    copyText={selectedOrder.playerName}
                    onCopy={(txt, e) => handleCopy(txt, `drawer-pname-${selectedOrder._id}`, e)}
                    isCopied={copiedKey === `drawer-pname-${selectedOrder._id}`}
                  />
                  <DrawerDetail
                    label="Player ID"
                    value={selectedOrder.playerId}
                    emphasize
                    copyText={selectedOrder.playerId}
                    onCopy={(txt, e) => handleCopy(txt, `drawer-pid-${selectedOrder._id}`, e)}
                    isCopied={copiedKey === `drawer-pid-${selectedOrder._id}`}
                  />
                  <DrawerDetail
                    label="Server/Zone"
                    value={selectedOrder.zoneId || "GLOBAL"}
                    copyText={selectedOrder.zoneId}
                    onCopy={(txt, e) => handleCopy(txt, `drawer-zone-${selectedOrder._id}`, e)}
                    isCopied={copiedKey === `drawer-zone-${selectedOrder._id}`}
                  />
                  {selectedOrder.playerId && selectedOrder.zoneId && (
                    <DrawerDetail
                      label="Combo (ID + Zone)"
                      value={`${selectedOrder.playerId} ${selectedOrder.zoneId}`}
                      copyText={`${selectedOrder.playerId} ${selectedOrder.zoneId}`}
                      onCopy={(txt, e) => handleCopy(txt, `drawer-combo-${selectedOrder._id}`, e)}
                      isCopied={copiedKey === `drawer-combo-${selectedOrder._id}`}
                    />
                  )}
                </DrawerSection>

                <DrawerSection icon={<CreditCard size={14} />} title="Payment Info">
                  <DrawerDetail label="Payment Method" value={selectedOrder.paymentMethod} />
                  <DrawerDetail label="Platform" value={selectedOrder.platform?.toLowerCase() === "pwa" ? "📱 Installed PWA" : "🌐 Web Browser"} />
                  <div className="flex items-center justify-between gap-1 group w-full py-0.5">
                    <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest">Payment Status</span>
                    <StatusBadge status={selectedOrder.paymentStatus} size="xs" />
                  </div>
                  <div className="flex items-center justify-between gap-1 group w-full py-0.5">
                    <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest">Product Status</span>
                    <StatusBadge status={selectedOrder.topupStatus} size="xs" />
                  </div>
                </DrawerSection>

                <DrawerSection icon={<User size={14} />} title="Buyer Info">
                  <DrawerDetail
                    label="Email"
                    value={selectedOrder.email || "GUEST"}
                    copyText={selectedOrder.email}
                    onCopy={(txt, e) => handleCopy(txt, `drawer-email-${selectedOrder._id}`, e)}
                    isCopied={copiedKey === `drawer-email-${selectedOrder._id}`}
                  />
                  <DrawerDetail
                    label="Phone"
                    value={selectedOrder.phone || "N/A"}
                    copyText={selectedOrder.phone}
                    onCopy={(txt, e) => handleCopy(txt, `drawer-phone-${selectedOrder._id}`, e)}
                    isCopied={copiedKey === `drawer-phone-${selectedOrder._id}`}
                    whatsappUrl={selectedOrder.phone ? getWhatsAppUrl(selectedOrder.phone, selectedOrder) : null}
                  />
                  <DrawerDetail label="Time" value={formatDateTime(selectedOrder.createdAt)} />

                  {selectedOrder.phone && (
                    <a
                      href={getWhatsAppUrl(selectedOrder.phone, selectedOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 font-bold text-xs transition-all active:scale-[0.98] group shadow-[0_0_12px_rgba(16,185,129,0.1)]"
                    >
                      <FaWhatsapp size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span>Chat with Buyer on WhatsApp</span>
                      <ExternalLink size={11} className="opacity-60" />
                    </a>
                  )}
                </DrawerSection>

                <div className="pb-6" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ================= FILTER MODAL ================= */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--background)] border-l border-[var(--border)] shadow-2xl z-[1110] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Find Orders</h3>
                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* GAME SLUG */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Game Filter</label>
                  <div className="relative">
                    <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/40" size={18} />
                    <input
                      placeholder="e.g. mlbb, bgmi..."
                      value={filters.gameSlug}
                      onChange={(e) => {
                        setPage(1);
                        setFilters({ ...filters, gameSlug: e.target.value });
                      }}
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-sm font-bold focus:border-[var(--accent)]/50 outline-none uppercase transition-all placeholder:text-[var(--muted)]/40"
                    />
                  </div>
                </div>

                {/* STATUS FILTER */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Process Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["pending", "success", "failed", "refund"].map((st) => (
                      <button aria-label="button"
                        key={st}
                        onClick={() => {
                          setPage(1);
                          setFilters({ ...filters, status: filters.status === st ? "" : st });
                        }}
                        className={`
                          py-3.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                          ${filters.status === st
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                            : "border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--muted)] hover:text-[var(--foreground)]"}
                        `}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]/50" />

                {/* DATE RANGE */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">From</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => {
                        setPage(1);
                        setFilters({ ...filters, from: e.target.value });
                      }}
                      className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-[10px] font-black focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">To</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => {
                        setPage(1);
                        setFilters({ ...filters, to: e.target.value });
                      }}
                      className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-[10px] font-black focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[var(--foreground)]/[0.02] border-t border-[var(--border)]">
                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 rounded-2xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-[0.2em] text-xs hover:scale-[0.98] transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div >
  );
}

/* ================= CUSTOM DROPDOWN ================= */
function StatusDropdown({ value, onChange, options, disabled, compact }) {
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

  const styles = {
    pending: "text-amber-500",
    success: "text-emerald-500",
    failed: "text-rose-500",
    refund: "text-blue-500",
  };

  return (
    <div className="relative" ref={containerRef}>
      <button aria-label="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between gap-2 px-3 
          ${compact ? "h-8 min-w-[100px]" : "h-10 min-w-[120px]"}
          rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] 
          text-[10px] font-black uppercase transition-all
          ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-[var(--foreground)]/[0.08]"}
          ${isOpen ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/30" : ""}
        `}
      >
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full bg-current ${styles[value]}`} />
          <span className={styles[value]}>{selectedOption?.label}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 4 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-[1200] right-0 w-full min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-1 overflow-hidden backdrop-blur-xl"
          >
            {options.map((option) => (
              <button aria-label="button"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-left text-[9px] font-black uppercase rounded-lg transition-all
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

/* ================= HELPERS Interface ================= */

function getWhatsAppUrl(phone, order) {
  if (!phone) return null;
  let clean = phone.toString().replace(/[^0-9]/g, "");
  if (clean.length === 10) {
    clean = "91" + clean;
  }
  const orderId = order?.orderId || (order?._id ? String(order._id).slice(-8).toUpperCase() : "");
  const itemName = order?.itemName || "Diamond Top-up";
  const text = `Hello! Regarding your order #${orderId} (${itemName}) on BlueBuff...`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

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

function DrawerDetail({ label, value, emphasize, copyText, onCopy, isCopied, whatsappUrl }) {
  return (
    <div className="flex items-end justify-between gap-1 group w-full">
      <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-widest whitespace-nowrap mb-0.5">{label}</span>
      <div className="flex-1 border-b-2 border-dotted border-[var(--border)]/30 mx-2 mb-1.5 opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-1.5 justify-end max-w-[65%]">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm font-black text-right truncate text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 transition-colors"
            title="Open WhatsApp chat with buyer"
          >
            <span className="truncate">{value || "N/A"}</span>
            <FaWhatsapp size={12} className="text-emerald-400 shrink-0 inline-block ml-0.5" />
          </a>
        ) : (
          <span className={`text-xs md:text-sm font-black text-right truncate ${emphasize ? "text-[var(--accent)] drop-shadow-[0_0_5px_rgba(var(--accent-rgb),0.3)] italic uppercase" : "text-[var(--foreground)]"}`}>
            {value || "N/A"}
          </span>
        )}
        {copyText && (
          <button
            type="button"
            onClick={(e) => onCopy && onCopy(copyText, e)}
            className="p-1 rounded hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--accent)] active:scale-95 transition-all shrink-0"
            title={`Copy ${label}`}
          >
            {isCopied ? (
              <span className="text-[8.5px] font-bold text-emerald-500 flex items-center gap-0.5">
                <Check size={10} className="text-emerald-500" />
              </span>
            ) : (
              <Copy size={10} />
            )}
          </button>
        )}
      </div>
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
