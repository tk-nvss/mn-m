"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Gamepad2, 
  Trophy, 
  CalendarDays, 
  ShoppingBag, 
  Headset 
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide BottomNav on admin, auth pages, and inside game detail/purchase pages
  const hideOnRoutes = ["/admin", "/owner-panal", "/login", "/register"];
  if (
    pathname?.startsWith("/games/") ||
    hideOnRoutes.some((route) => pathname?.startsWith(route))
  ) {
    return null;
  }

  const isHomeActive = pathname === "/";

  const navItems = [
    { label: "Games", icon: Gamepad2, path: "/games", action: () => router.push("/games") },
    { label: "Events", icon: CalendarDays, path: "/events", action: () => router.push("/events") },
    { label: "Tournaments", icon: Trophy, path: "/dashboard/tournaments", action: () => router.push("/dashboard/tournaments") },
    { label: "Orders", icon: ShoppingBag, path: "/dashboard/orders", action: () => router.push("/dashboard/orders") },
    { label: "Support", icon: Headset, path: "/dashboard/support", action: () => router.push("/dashboard/support") },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-auto max-w-[96%] flex justify-center px-1">
      {/* Floating Pill Container - Uses Dynamic Theme Variables */}
      <div className="pointer-events-auto relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-full bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] text-[var(--foreground)]">
        
        {/* Combined Left Capsule: Home Button with Brand MT Logo + Indicator Dot */}
        <button
          onClick={() => router.push("/")}
          className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 active:scale-95 shrink-0 ${
            isHomeActive
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)]"
          }`}
          aria-label="Home"
          title="Home"
        >
          {/* MT Logo */}
          <div className="relative w-5 h-5 flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-white/10 bg-[#09090b]">
            <Image
              src="/pwa-icon.png"
              alt="Home"
              width={20}
              height={20}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHomeActive ? "brightness-110" : ""
              }`}
              priority
            />
          </div>

          {/* Theme Indicator Dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${
            isHomeActive ? "bg-white" : "bg-[var(--accent)]"
          }`} />
        </button>

        {/* Destination Icons */}
        {navItems.map((item, idx) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path + "/"));
          const Icon = item.icon;

          return (
            <button
              key={idx}
              onClick={item.action}
              className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 shrink-0 active:scale-95 ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon 
                size={18}
                strokeWidth={2.2}
                className={`transition-transform duration-200 ${
                  isActive ? "text-white" : ""
                }`} 
              />
            </button>
          );
        })}

      </div>
    </div>
  );
}
