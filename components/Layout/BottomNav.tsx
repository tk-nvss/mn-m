"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  FiGrid, 
  FiShoppingBag, 
  FiGift, 
  FiHeadphones 
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide BottomNav on admin / full-screen checkout pages
  const hideOnRoutes = ["/admin", "/owner-panal", "/login", "/register"];
  if (hideOnRoutes.some((route) => pathname?.startsWith(route))) return null;

  const isHomeActive = pathname === "/";

  const navItems = [
    { label: "Games", icon: FiGrid, path: "/games", action: () => router.push("/games") },
    { label: "Tournaments", icon: FaTrophy, path: "/dashboard/tournaments", action: () => router.push("/dashboard/tournaments") },
    { label: "Giveaways", icon: FiGift, path: "/giveaways", action: () => router.push("/giveaways") },
    { label: "Orders", icon: FiShoppingBag, path: "/dashboard/orders", action: () => router.push("/dashboard/orders") },
    { label: "Support", icon: FiHeadphones, path: "/dashboard/support", action: () => router.push("/dashboard/support") },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-auto max-w-[96%] flex justify-center px-1">
      {/* Floating Pill Container - Uses Dynamic Theme Variables */}
      <div className="pointer-events-auto relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-full bg-[var(--card)]/90 backdrop-blur-2xl border border-[var(--border)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] text-[var(--foreground)]">
        
        {/* Combined Left Capsule: Home Button with Brand MT Logo + Indicator Dot */}
        <button
          onClick={() => router.push("/")}
          className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 active:scale-95 shrink-0 ${
            isHomeActive
              ? "bg-[var(--accent)] text-white shadow-[0_0_20px_rgba(var(--accent-rgb),0.45)] scale-105 border border-[var(--accent)]"
              : "bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)] hover:scale-105"
          }`}
          aria-label="Home"
          title="Home"
        >
          {/* MT Logo */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Image
              src="/pwa-icon.png"
              alt="Home"
              width={22}
              height={22}
              className={`w-5 h-5 object-contain transition-transform duration-300 ${
                isHomeActive ? "scale-105 brightness-110" : ""
              }`}
              priority
            />
          </div>

          {/* Theme Indicator Dot */}
          <span className={`w-1.5 h-1.5 rounded-full ${
            isHomeActive ? "bg-white shadow-[0_0_6px_#ffffff]" : "bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] animate-pulse"
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
                  ? "bg-[var(--accent)] text-white shadow-[0_0_18px_rgba(var(--accent-rgb),0.4)] scale-105"
                  : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
              }`}
              aria-label={item.label}
              title={item.label}
            >
              <Icon 
                className={`text-[1.05rem] sm:text-[1.1rem] transition-transform duration-200 ${
                  isActive ? "text-white scale-105" : ""
                }`} 
              />
            </button>
          );
        })}

      </div>
    </div>
  );
}
