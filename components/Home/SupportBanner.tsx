"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiClock, FiShield, FiChevronRight } from "react-icons/fi";

export default function SupportBanner() {
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello,%20I%20need%20help%20with%20my%20top-up%20order`;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-6 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-3 sm:p-4 lg:p-5 rounded-[1.5rem] sm:rounded-[2rem] bg-[var(--card)]/40 border border-[var(--border)] shadow-sm backdrop-blur-md">
        
        {/* Left Side: Compact Support Banner Image */}
        <div className="md:col-span-7 lg:col-span-7 relative w-full aspect-[2.1/1] sm:aspect-[2.35/1] rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden border border-[var(--border)] shadow-md bg-black group">
          <Image
            src="https://res.cloudinary.com/dwt0xaang/image/upload/v1778586426/ajgfvaehf_vtgcin.png"
            alt="Support Banner"
            fill
            className="object-cover object-top sm:object-center transition-transform duration-500 group-hover:scale-[1.01]"
            priority
          />
        </div>

        {/* Right Side: Desktop Support Info & Instant Contact CTA */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col justify-center space-y-3.5 px-1 sm:px-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>24×7 Instant Support</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
              Need Help With <span className="text-[var(--accent)]">Your Order?</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--muted)] mt-1.5 leading-relaxed">
              Have questions about your top-up, payment confirmation, or player ID? Our support team is online 24×7 to assist you immediately.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-[var(--foreground)]">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--background)]/60 border border-[var(--border)]/60">
              <FiClock className="text-[var(--accent)] shrink-0" size={14} />
              <span>&lt; 3 Min Replies</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--background)]/60 border border-[var(--border)]/60">
              <FiShield className="text-emerald-500 shrink-0" size={14} />
              <span>100% Safe Topup</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 !text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 group w-full sm:w-auto"
            >
              <FaWhatsapp size={16} className="text-white shrink-0" />
              <span className="text-white">Chat On WhatsApp</span>
              <FiChevronRight size={14} className="text-white shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
