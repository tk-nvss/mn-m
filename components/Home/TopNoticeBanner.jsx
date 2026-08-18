"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";

const STORAGE_KEY = "hide_whatsapp_banner";
const ROTATE_INTERVAL = 4500;

/* ================= WHATSAPP BANNERS ================= */
const BANNERS = [
  {
    id: "discount",
    title: "PREMIUM WHATSAPP DEALS",
    subtitle: "Unlock 1–5% exclusive discount",
    badge: "VIP SAVE",
    icon: <Icons.zap />,
    color: "#eab308",
    link: `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=hii%20i%20want%20to%20prchase%20dias`,
  },
];

export default function TopNoticeBanner() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  /* ================= INITIAL VISIBILITY ================= */
  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY);
    if (!hidden) setVisible(true);
  }, []);

  /* ================= AUTO ROTATION ================= */
  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % BANNERS.length);
    }, ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  const banner = BANNERS[index];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 mt-2 mb-1 relative z-30">
      <div
        onClick={() => window.open(banner.link, "_blank")}
        className="group cursor-pointer relative flex items-center justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-[2rem] bg-[var(--card)] border border-[var(--border)] transition-all duration-500 overflow-hidden shadow-sm hover:shadow-md"
        style={{ borderColor: `color-mix(in srgb, ${banner.color} 30%, var(--border))` }}
      >
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" 
          style={{ background: `linear-gradient(90deg, transparent, ${banner.color}15, transparent)` }}
        />
        
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Icon */}
          <div className="flex items-center ml-1 shrink-0">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-[2px] border-[var(--card)] z-30 shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: banner.color, color: "#fff" }}
            >
              {banner.id === "support" || banner.id === "discount" ? (
                <Icons.whatsapp size={14} className="sm:w-4 sm:h-4 drop-shadow-sm" />
              ) : (
                <Icons.activity size={14} className="sm:w-4 sm:h-4 drop-shadow-sm" />
              )}
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[12px] sm:text-[14px] font-black italic tracking-wide text-[var(--foreground)] leading-tight uppercase drop-shadow-md truncate">
                {banner.title}
              </h3>
              <Icons.arrowRight
                className="size-3 shrink-0 group-hover:translate-x-1 transition-transform"
                style={{ color: banner.color }}
              />
            </div>
            <p className="text-[8px] sm:text-[9px] font-bold text-[var(--muted)] mt-0.5 tracking-[0.1em] uppercase truncate">
              {banner.subtitle}
            </p>
          </div>
        </div>
        
        {/* Right Side Actions */}
        <div className="relative z-10 flex items-center gap-2 shrink-0 ml-1 sm:ml-2">
          {/* Badge */}
          <div 
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors"
            style={{ 
              backgroundColor: `${banner.color}10`, 
              borderColor: `${banner.color}20`, 
              color: banner.color 
            }}
          >
            <span className="shrink-0">{banner.icon}</span>
            <span className="truncate">{banner.badge}</span>
          </div>

          <div 
            className="sm:hidden flex items-center gap-1 px-2 py-1 rounded-full border text-[8px] font-bold uppercase tracking-wider transition-colors"
            style={{ 
              backgroundColor: `${banner.color}10`, 
              borderColor: `${banner.color}20`, 
              color: banner.color 
            }}
          >
            <span className="shrink-0">{banner.icon}</span>
          </div>
          
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem(STORAGE_KEY, "true");
              setVisible(false);
            }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition-all duration-300"
            aria-label="Close"
          >
            <Icons.close size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
