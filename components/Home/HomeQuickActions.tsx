"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  Inbox,
  LifeBuoy,
  Wallet,
  BookOpen,
  Zap,
} from "lucide-react";

/* ===================== CONFIG ===================== */

const quickActions = [
  { title: "Region", href: "/region", icon: Globe, color: "#3b82f6" },
  { title: "Orders", href: "/dashboard/orders", icon: Inbox, color: "#64748b" },
  { title: "Support", href: "/dashboard/support", icon: LifeBuoy, color: "#06b6d4" },
  { title: "Wallet", href: "/dashboard/wallet", icon: Wallet, color: "#10b981" },
  { title: "Blog", href: "/blog", icon: BookOpen, color: "#eab308", isHighlight: true },
  { title: "Earn", href: "/dashboard/coins", icon: Zap, color: "#a855f7", isHighlight: true },
];

/* ===================== COMPONENT ===================== */

export default function HomeQuickActions() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  const getTargetHref = (item: any) => {
    const isAuthProtected = item.title === "Orders" || item.title === "Support";
    if (isAuthProtected && !isLoggedIn) {
      return `/login?redirect=${item.href}`;
    }
    return item.href;
  };

  const ActionCard = ({ item }: any) => {
    const Icon = item.icon;
    const isColorful = item.isColorful;
    const isHighlight = item.isHighlight;
    const highlightColor = item.color || "#a855f7";

    return (
      <div className="flex-1 opacity-100 translate-y-0">
        <Link
          href={getTargetHref(item)}
          className="group relative flex flex-col items-center justify-center py-1.5 px-0.5"
        >
          {/* Enhanced Icon Section */}
          <div className="relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-500">

            {/* VALENTINE SPECIAL HIGHLIGHT (Static version) / EARN HIGHLIGHT */}
            {isColorful && (
              <>
                <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                <div className="absolute -inset-1 border border-dashed border-rose-500/30 rounded-xl" />
              </>
            )}

            {isHighlight && (
              <>
                <div
                  className="absolute inset-0 rounded-xl shadow-md opacity-90"
                  style={{
                    background: `linear-gradient(to bottom right, ${highlightColor}, ${highlightColor}DD)`,
                    boxShadow: `0 0 8px ${highlightColor}33`
                  }}
                />
                <div className="absolute inset-0 border border-white/20 rounded-xl" />
              </>
            )}

            {/* Ultra-Subtle Hover Ring */}
            <div
              className={`absolute inset-0 rounded-xl border transition-all duration-500 scale-125 group-hover:scale-100 ${
                isColorful ? "border-rose-500/20 bg-rose-500/5" :
                isHighlight ? "opacity-0" :
                "border-white/0 group-hover:border-white/5 group-hover:bg-white/[0.02]"
              }`}
            />

            {/* Ambient Backlight */}
            <div
              className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
              style={{ backgroundColor: item.color }}
            />

            {/* The Icon */}
            <div className={`
              relative z-10 transition-all duration-500
              group-hover:-translate-y-1
              ${isColorful ? "text-rose-500" : ""}
              ${isHighlight ? "text-white scale-110" : ""}
            `}>
              <Icon
                size={isColorful ? 22 : isHighlight ? 20 : 20}
                strokeWidth={isColorful ? 2 : isHighlight ? 2.5 : 1.25}
                style={{ color: (isColorful || isHighlight) ? undefined : item.color }}
                className={`
                  transition-transform duration-500
                  ${isColorful ? "drop-shadow-[0_0_12px_rgba(255,46,99,0.5)] group-hover:scale-125" : "group-hover:scale-115"}
                `}
              />
            </div>
          </div>

          {/* Title */}
          <span
            className={`
              mt-1 text-[8px] sm:text-[9px] font-black tracking-[0.05em] uppercase transition-all duration-300
              ${isColorful ? "text-rose-500 scale-105" :
                isHighlight ? "scale-105 font-black" :
                "text-[var(--muted)] group-hover:text-[var(--foreground)]"}
            `}
            style={{ color: isHighlight ? highlightColor : undefined }}
          >
            {item.title}
          </span>

          {/* Status Bar */}
          <div className={`mt-1.5 h-[1.5px] transition-all duration-500 rounded-full ${
            isColorful ? "w-4 bg-rose-500 opacity-60" :
            isHighlight ? "w-5 opacity-80" :
            "w-0 group-hover:w-3 opacity-40"
            }`}
            style={{ backgroundColor: isColorful ? undefined : highlightColor }}
          />
        </Link>
      </div>
    );
  };

  return (
    <section className="relative max-w-7xl mx-auto px-4 mt-1">
      <div className="relative z-10 max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
        <div className="flex justify-between gap-1">
          {quickActions.map((item) => (
            <ActionCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
