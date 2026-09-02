"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiShield, FiZap, FiAlertCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { LoadingSpinner } from "@/components/common";
import { formatCurrency } from "@/utils";

export default function BuyPanel({
  activeItem,
  gameAvailablity,
  redirecting,
  goBuy,
  calculateDiscount,
  buyPanelRef,
}) {
  if (!activeItem) return null;

  // 1. If this specific item is Out of Stock / Out of Service, do NOT show the panel at all
  const isOutOfStock = activeItem.itemAvailablity === false || activeItem.isOutOfStock === true;
  if (isOutOfStock) return null;

  // 2. If item is available, check if game is manual WhatsApp order vs automated gateway
  const isManualWhatsApp = gameAvailablity === false;

  const itemImage =
    activeItem?.itemImageId?.image ||
    activeItem?.image ||
    "/logo.png";

  const discount = calculateDiscount(
    activeItem.sellingPrice,
    activeItem.dummyPrice
  );

  const supportUrl = `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "916383038691"}?text=${encodeURIComponent(
    `Hi, I want to order ${activeItem.itemName}`
  )}`;

  return (
    <div
      ref={buyPanelRef}
      className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-3 pointer-events-none pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="relative w-full max-w-4xl mx-auto pointer-events-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-[0_-6px_24px_rgba(0,0,0,0.4)]">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-[var(--accent)]/40 via-white/5 to-purple-500/20 pointer-events-none z-0" />

          {/* Main Card */}
          <div className="relative bg-[var(--card)]/95 backdrop-blur-2xl rounded-2xl overflow-hidden z-10 border border-[var(--border)]/80">

            {/* Top accent line */}
            <div className={`h-[2px] w-full bg-gradient-to-r ${isManualWhatsApp ? "from-transparent via-emerald-500/60 to-transparent" : "from-transparent via-[var(--accent)]/60 to-transparent"}`} />

            <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3">

              {/* Left: Product Thumbnail & Info */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                {/* Image */}
                <div className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-white/10 shadow-md">
                  <Image
                    src={itemImage}
                    alt={activeItem.itemName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {discount > 0 && (
                    <div className="absolute top-0 left-0 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[7px] font-black px-1 py-0.2 rounded-br-md shadow z-20">
                      -{discount}%
                    </div>
                  )}
                </div>

                {/* Name & Prices */}
                <div className="flex flex-col min-w-0 justify-center">
                  <h3 className="text-xs sm:text-sm font-black text-[var(--foreground)] tracking-tight uppercase italic truncate leading-none">
                    {activeItem.itemName}
                  </h3>

                  {/* Main Price */}
                  <div className="flex items-baseline gap-1.5 leading-none mt-1">
                    <span className="text-base sm:text-lg font-[1000] text-[var(--foreground)] tracking-tight">
                      ₹{activeItem.sellingPrice}
                    </span>
                  </div>

                  {/* Member & Reseller Price (below) */}
                  {(activeItem.memberPrice || activeItem.adminPrice) && (
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {activeItem.memberPrice && (
                        <Link
                          href="/games/membership/silver-membership"
                          className="inline-flex items-center gap-1 text-[8.5px] font-bold text-[var(--accent)] hover:opacity-80 transition-opacity"
                        >
                          <span className="text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-[var(--accent)]/10 border border-[var(--accent)]/20 leading-none">
                            MEM
                          </span>
                          <span className="font-black leading-none">₹{activeItem.memberPrice}</span>
                        </Link>
                      )}

                      {activeItem.adminPrice && (
                        <a
                          href={supportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[8.5px] font-bold text-purple-400 hover:opacity-80 transition-opacity"
                        >
                          <span className="text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 leading-none">
                            RESELLER
                          </span>
                          <span className="font-black leading-none">₹{activeItem.adminPrice}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: CTA Button */}
              {isManualWhatsApp ? (
                <a
                  href={supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 relative h-10 sm:h-11 px-4 sm:px-5 rounded-xl overflow-hidden flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] !text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-300 font-black uppercase tracking-wider text-[11px] sm:text-xs border border-white/20 group"
                >
                  <FaWhatsapp size={16} className="!text-white group-hover:scale-110 transition-transform shrink-0" />
                  <span className="!text-white font-[1000] drop-shadow-sm whitespace-nowrap">Order on WP</span>
                </a>
              ) : (
                <button
                  aria-label="Order now"
                  onClick={() => goBuy(activeItem)}
                  disabled={redirecting}
                  className={`
                    shrink-0 relative h-10 sm:h-11 px-4 sm:px-6 rounded-xl overflow-hidden flex items-center justify-center gap-1.5
                    transition-all duration-300 active:scale-95 font-[1000] uppercase tracking-tight text-xs
                    ${redirecting
                      ? 'bg-[var(--muted)]/20 text-[var(--muted)] cursor-not-allowed'
                      : 'bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground)]/90 text-[var(--background)] shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 hover:scale-[1.02]'
                    }
                  `}
                >
                  {redirecting ? (
                    <LoadingSpinner size="xs" color="current" />
                  ) : (
                    <>
                      <span>Order Now</span>
                      <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
