"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiShield, FiZap } from "react-icons/fi";
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

  const itemImage =
    activeItem?.itemImageId?.image ||
    activeItem?.image ||
    "/logo.png";

  const discount = calculateDiscount(
    activeItem.sellingPrice,
    activeItem.dummyPrice
  );

  const isUnavailable = gameAvailablity === false || activeItem.itemAvailablity === false || activeItem.isOutOfStock === true;

  const supportUrl = `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=Hi, I want to buy ${activeItem.itemName} for ₹${activeItem.sellingPrice}`;

  return (
    <div
      ref={buyPanelRef}
      className="relative w-full max-w-4xl mx-auto px-4 mt-8 mb-6 md:static md:p-0"
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-[var(--accent)]/40 via-white/5 to-purple-500/20 pointer-events-none z-0" />

        {/* Main Card */}
        <div className="relative bg-[var(--card)] rounded-2xl overflow-hidden z-10">

          {/* Top accent line */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />

          <div className="p-4 md:p-5">

            {/* Selected item row */}
            <div className="flex items-center gap-3 mb-4">
              {/* Image */}
              <div className="relative shrink-0">
                <div className="relative w-[52px] h-[52px] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                  <Image
                    src={itemImage}
                    alt={activeItem.itemName}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                {discount > 0 && (
                  <div className="absolute -top-1.5 -left-1.5 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg z-20 border border-white/10">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Name & badge */}
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[var(--accent)] mb-0.5 flex items-center gap-1">
                  <FiZap size={7} /> Selected
                </span>
                <h3 className="text-sm md:text-base font-black text-[var(--foreground)] tracking-tight uppercase italic truncate leading-tight">
                  {activeItem.itemName}
                </h3>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent mb-4" />

            {/* Price + Action row */}
            <div className="flex items-end justify-between gap-3">

              {/* Price block */}
              <div className="flex flex-col gap-2">
                {/* Main price */}
                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] md:text-[30px] font-[1000] text-[var(--foreground)] tracking-tighter leading-none">
                    ₹{activeItem.sellingPrice}
                  </span>
                  {activeItem.dummyPrice && (
                    <span className="text-[11px] font-bold text-[var(--muted)] line-through">
                      ₹{activeItem.dummyPrice}
                    </span>
                  )}
                </div>

                {/* Member & Reseller pills */}
                {(activeItem.memberPrice || activeItem.adminPrice) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeItem.memberPrice && (
                      <Link
                        href="/games/membership/silver-membership"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-all duration-200 group/pill"
                      >
                        <span className="text-[8px] font-black uppercase tracking-wider text-[var(--accent)]">Member</span>
                        <span className="text-[10px] font-[1000] text-[var(--foreground)] group-hover/pill:text-[var(--accent)] transition-colors">₹{activeItem.memberPrice}</span>
                      </Link>
                    )}
                    {activeItem.adminPrice && (
                      <a
                        href={supportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-200 group/pill"
                      >
                        <span className="text-[8px] font-black uppercase tracking-wider text-purple-400">Reseller</span>
                        <span className="text-[10px] font-[1000] text-[var(--foreground)] group-hover/pill:text-purple-400 transition-colors">₹{activeItem.adminPrice}</span>
                      </a>
                    )}
                  </div>
                )}


              </div>

              {/* CTA Button */}
              {isUnavailable ? (
                <a
                  href={supportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 relative h-12 px-5 rounded-xl overflow-hidden flex items-center justify-center gap-2 bg-[#25D366] text-black hover:brightness-110 transition-all duration-300 font-[1000] uppercase tracking-tight text-[10px] shadow-lg shadow-[#25D366]/20 active:scale-95"
                >
                  <FaWhatsapp size={15} />
                  <span>Contact Support</span>
                </a>
              ) : (
                <button
                  aria-label="Order now"
                  onClick={() => goBuy(activeItem)}
                  disabled={redirecting}
                  className={`
                    shrink-0 relative h-12 px-6 rounded-xl overflow-hidden flex items-center justify-center gap-2
                    transition-all duration-300 active:scale-95 font-[1000] uppercase tracking-tight text-xs
                    ${redirecting
                      ? 'bg-[var(--muted)]/20 text-[var(--muted)] cursor-not-allowed'
                      : 'bg-gradient-to-br from-[var(--foreground)] to-[var(--foreground)]/90 text-[var(--background)] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-[1.02]'
                    }
                  `}
                >
                  {redirecting ? (
                    <LoadingSpinner size="xs" color="current" />
                  ) : (
                    <>
                      <span>Order Now</span>
                      <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Unavailable notice */}
          {isUnavailable && (
            <div className="px-4 pb-4 pt-0">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.15em] text-amber-400 hover:bg-amber-500/15 transition-colors"
              >
                <FaWhatsapp size={10} />
                Contact customer support to buy
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
