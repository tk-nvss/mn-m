"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";

export default function SupportBanner() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello,%20I%20need%20help%20with%20my%20top-up%20order`;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-3 mb-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        
        {/* Support Image & Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Thumbnail / Compact Image */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl overflow-hidden border border-[var(--border)] bg-black">
            <Image
              src="https://res.cloudinary.com/dwt0xaang/image/upload/v1778586426/ajgfvaehf_vtgcin.png"
              alt="Support"
              fill
              className="object-cover"
            />
          </div>

          {/* Text Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                Need Help With <span className="text-[var(--accent)]">Your Order?</span>
              </h3>
            </div>
            <p className="text-[9px] sm:text-[10px] text-[var(--muted)] font-medium truncate">
              24×7 Instant Support • Fast WhatsApp assistance & quick resolution
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 !text-white text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-95 group w-full md:w-auto shrink-0"
        >
          <FaWhatsapp size={15} className="text-white shrink-0" />
          <span className="text-white">Chat On WhatsApp</span>
          <FiChevronRight size={13} className="text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>

      </div>
    </section>
  );
}
