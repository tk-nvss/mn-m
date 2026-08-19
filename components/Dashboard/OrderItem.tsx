"use client";

import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { StatusBadge, CopyButton, LoadingSpinner } from "@/components/common";
import { formatCurrency, formatDateTime } from "@/utils";

/* ================= TYPES ================= */

export type OrderType = {
  orderId: string;
  gameSlug: string;
  itemName: string;
  playerId: string;
  playerName?: string;
  zoneId: string;
  paymentMethod: string;
  price: number;
  status: string;
  topupStatus?: string;
  createdAt: string;
};

/* ================= HELPERS ================= */

const getGameName = (slug: string) => {
  const s = slug.toLowerCase();
  const mlbbSlugs = ["mobile-legends", "mlbb", "diamond"];
  if (mlbbSlugs.some((k) => s.includes(k))) return "Mobile Legends";
  if (s.includes("pubg") || s.includes("bgmi")) return "BGMI";
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/* ================= MAIN ITEM COMPONENT ================= */

export default function OrderItem({ order, index = 0 }: { order: OrderType, index?: number }) {
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(order.status);
  const [localTopupStatus, setLocalTopupStatus] = useState(order.topupStatus);

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (verifyLoading) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setVerifyLoading(true);
    try {
      const res = await fetch("/api/order/verify-topup-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.orderId }),
      });

      const data = await res.json();
      if (data.success || data.topupStatus === "success" || data.topupStatus === "SUCCESS") {
        setLocalStatus("success");
        setLocalTopupStatus("success");
      } else if (data.message === "Topup processing") {
        setLocalTopupStatus("processing");
      } else if (data.paymentStatus === "failed") {
        setLocalStatus("failed");
      }
      
      if (data.message) {
        // We don't have a toast system visible here, so we'll just rely on status update
        console.log("Verification result:", data.message);
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const rawStatus = (
    localStatus?.toLowerCase().includes("refund")
      ? "refund"
      : (localTopupStatus || localStatus || "")
  ).toLowerCase();

  return (
    <div className={`relative overflow-hidden rounded border transition-colors ${index % 2 === 0 ? 'bg-[var(--background)] border-[var(--border)]' : 'bg-[var(--foreground)]/[0.04] border-[var(--foreground)]/[0.1]'}`}>

      {/* TOP STATUS BAR */}
      <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-[var(--border)]/50 bg-[var(--foreground)]/[0.02]">
        <div className="flex items-center gap-3">
          <StatusBadge status={rawStatus} size="xs" />

          {rawStatus === 'pending' && order.paymentMethod?.toLowerCase() === 'upi' && (
            <button aria-label="button"
              onClick={handleVerify}
              disabled={verifyLoading}
              className="px-2 py-0.5 rounded border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-[7px] font-bold uppercase tracking-widest hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-1"
            >
              {verifyLoading ? <LoadingSpinner size="xs" color="current" /> : "Check Status"}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-[7.5px] font-bold text-[var(--foreground)] font-mono break-all leading-none max-w-[140px]">
            {order.orderId.toUpperCase()}
          </span>
          <CopyButton text={order.orderId} size="xs" variant="ghost" className="p-0.5" />
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <h3 className="text-sm md:text-base font-black text-[var(--foreground)] uppercase leading-none mt-1">
              {getGameName(order.gameSlug)}
            </h3>
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider leading-none">
              {order.itemName}
            </span>
            <div className="flex items-start gap-1.5 opacity-60 mt-0.5">
              <FiUser className="text-[var(--foreground)] flex-shrink-0 mt-[1px]" size={10} />
              <span className="text-[9px] font-bold font-mono leading-snug break-words">
                {order.playerId} {order.zoneId ? `(${order.zoneId})` : ""} {order.playerName ? `• ${order.playerName}` : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end leading-none gap-2 mt-1">
            <div className="text-base md:text-lg font-black text-[var(--foreground)]">{formatCurrency(order.price)}</div>
            <div className="flex flex-col items-end gap-1 text-[8px] sm:text-[9px] font-bold text-[var(--muted)] uppercase text-right">
              <span className="text-[var(--accent)]">{order.paymentMethod}</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info for pending UPI status */}
      {rawStatus === 'pending' && order.paymentMethod?.toLowerCase() === 'upi' && (
        <div className="px-3.5 pb-3.5 mt-[-4px]">
          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
            <p className="text-[7.5px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
              Paid via UPI but order still shows pending? Tap "Check Status" above to update it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


