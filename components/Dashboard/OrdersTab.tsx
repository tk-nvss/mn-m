"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/icons";
import { SearchInput, EmptyState, Pagination } from "@/components/common";
import OrderItem, { OrderType } from "./OrderItem";
import { OrderSkeleton } from "../Skeleton/Skeleton";
import api from "@/lib/axios";

export default function OrdersTab() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    api.post("/api/order/user", { page, limit, search, status: statusFilter })
      .then((res) => res.data)
      .then((data) => {
        if (!data.success) return;

        setOrders(data.orders || []);
        setTotalCount(data.totalCount || 0);
      })
      .finally(() => setLoading(false));
  }, [token, page, search, limit, statusFilter]);

  /* ================= RESET PAGE ON SEARCH ================= */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
            <Icons.shoppingBag size={14} />
          </div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-[900] uppercase italic tracking-tighter text-[var(--foreground)] leading-none mt-1">Your Orders</h3>
            <div className="px-2 py-0.5 rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest mt-1">
              {loading ? "..." : `${totalCount} Order${totalCount !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        {/* SEARCH CONSOLE */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-64 flex-1">
            <SearchInput
              value={search}
              onChange={(val) => {
                setPage(1);
                setSearch(val);
              }}
              placeholder="Search orders..."
              size="sm"
            />
          </div>
          <FilterDropdown status={statusFilter} setStatus={setStatusFilter} />
        </div>
      </div>

      {/* MISSION LIST */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Icons.shoppingBag}
            title="No Orders Yet"
            description="You haven't placed any topup orders yet. Check out our game catalog to get started!"
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03, type: "spring", stiffness: 300, damping: 30 }}
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

function FilterDropdown({ status, setStatus }: { status: string, setStatus: (s: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button aria-label="filter" onClick={() => setIsOpen(!isOpen)} className={`w-9 h-9 flex items-center justify-center rounded-2xl border transition-colors ${isOpen || status !== 'all' ? 'bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'}`}>
        <Icons.filter size={14} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 bg-[var(--background)] border border-[var(--border)] rounded shadow-xl z-50 p-4"
          >
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {["all", "pending", "success", "failed"].map(f => (
                    <button aria-label="button" key={f} onClick={() => { setStatus(f); setIsOpen(false); }} className={`px-2 py-1 rounded border text-[9px] font-bold uppercase tracking-widest transition-colors ${status === f ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]" : "bg-transparent border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)]"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
