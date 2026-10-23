"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Check, Search, ShoppingBag } from "lucide-react";
import { SearchInput, EmptyState, Pagination, SectionTitle } from "@/components/common";
import OrderItem, { OrderType } from "./OrderItem";
import { OrderSkeleton } from "../Skeleton/Skeleton";
import api from "@/lib/axios";

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [dateRange, setDateRange] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalCount / limit);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= LOAD ORDERS ================= */
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    api.post("/api/order/user", {
      page,
      limit,
      search,
      status: statusFilter,
      sortBy,
      dateRange,
    })
      .then((res) => res.data)
      .then((data) => {
        if (!data.success) return;

        setOrders(data.orders || []);
        setTotalCount(data.totalCount || 0);
      })
      .finally(() => setLoading(false));
  }, [token, page, search, limit, statusFilter, sortBy, dateRange]);

  /* ================= RESET PAGE ON SEARCH & FILTER CHANGE ================= */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortBy, dateRange]);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0) +
    (dateRange !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="space-y-2.5 relative z-30">
        <SectionTitle
          subtitle="ORDER HISTORY"
          title="YOUR ORDERS"
          icon={<ShoppingBag className="w-3.5 h-3.5 text-[var(--accent)]" />}
          action={
            <div className="relative w-full sm:w-72">
              <div className="relative flex items-center">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 pointer-events-none flex items-center justify-center">
                  <Search size={13} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                  placeholder="Search orders..."
                  className="w-full h-9 pl-9 pr-14 text-xs rounded-full border border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)]/40 focus:border-[var(--accent)]/50 focus:bg-[var(--background)] focus:ring-2 focus:ring-[var(--accent)]/10 font-sans"
                />

                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setPage(1);
                        setSearch("");
                      }}
                      className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <FilterBottomSheet
                    status={statusFilter}
                    setStatus={setStatusFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    activeCount={activeFilterCount}
                  />
                </div>
              </div>
            </div>
          }
        />

        {/* SUB-HEADER INFO: COUNT ON RIGHT BELOW SEARCH */}
        <div className="flex justify-between items-center pr-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--foreground)]/[0.06] text-[var(--foreground)] border border-[var(--border)]">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--foreground)]/[0.06] text-[var(--foreground)] border border-[var(--border)]">
                Sort: {sortBy === "oldest" ? "Oldest" : sortBy === "price_high" ? "Price: High to Low" : "Price: Low to High"}
                <button
                  type="button"
                  onClick={() => setSortBy("newest")}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {dateRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--foreground)]/[0.06] text-[var(--foreground)] border border-[var(--border)]">
                Date: {dateRange === "today" ? "Today" : dateRange === "7days" ? "Last 7 Days" : "Last 30 Days"}
                <button
                  type="button"
                  onClick={() => setDateRange("all")}
                  className="hover:opacity-75 cursor-pointer ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-[var(--muted)] tabular-nums ml-auto">
            {loading ? "Loading..." : `${totalCount} order${totalCount !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* MISSION LIST */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No Orders Yet"
            description="You haven't placed any topup orders yet. Check out our game catalog to get started!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 30 }}
                  className="h-full"
                >
                  <OrderItem order={order} index={idx} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* TACTICAL PAGINATION */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalCount}
        itemLabel="Orders"
        onPageChange={setPage}
        variant="numbered"
      />
    </div>
  );
}

interface FilterBottomSheetProps {
  status: string;
  setStatus: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  dateRange: string;
  setDateRange: (d: string) => void;
  activeCount: number;
}

function FilterBottomSheet({
  status,
  setStatus,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  activeCount,
}: FilterBottomSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const statusOptions = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "success", label: "Success" },
    { id: "failed", label: "Failed" },
  ];

  const sortOptions = [
    { id: "newest", label: "Newest First" },
    { id: "oldest", label: "Oldest First" },
    { id: "price_high", label: "Amount: High to Low" },
    { id: "price_low", label: "Amount: Low to High" },
  ];

  const dateOptions = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "7days", label: "Last 7 Days" },
    { id: "30days", label: "Last 30 Days" },
  ];

  const resetAll = () => {
    setStatus("all");
    setSortBy("newest");
    setDateRange("all");
  };

  const sheetContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
          >
            {/* Drag / Pull handle */}
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[var(--accent)]" />
                <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Filter & Sort Orders</span>
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors cursor-pointer mr-1"
                  >
                    Reset All
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Section 1: Order Status */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Order Status</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {statusOptions.map((opt) => {
                  const isSelected = status === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatus(opt.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section 2: Date Range */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Date Range</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {dateOptions.map((opt) => {
                  const isSelected = dateRange === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDateRange(opt.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section 3: Sort By */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Sort By</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left flex items-center justify-between ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={13} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-[var(--border)]/60 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer text-center shadow-xs"
              >
                Apply Filters {activeCount > 0 ? `(${activeCount})` : ""}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Filter orders"
        onClick={() => setIsOpen(true)}
        className={`relative w-7 h-7 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
          activeCount > 0
            ? "bg-[var(--accent)] text-white shadow-2xs"
            : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06]"
        }`}
      >
        <Filter size={13} />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-[var(--accent)] text-[8px] font-black flex items-center justify-center shadow-xs">
            {activeCount}
          </span>
        )}
      </button>

      {mounted && typeof document !== "undefined"
        ? createPortal(sheetContent, document.body)
        : null}
    </>
  );
}
