"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FiBell, FiX, FiCheck } from "react-icons/fi";
import {
  isPushNotificationSupported,
  isDeviceAlreadySubscribed,
  getNotificationPermission,
  subscribeToPush,
} from "@/lib/pushNotification";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationPrompt() {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    // Only run on client
    if (!isPushNotificationSupported()) return;

    // Rule: Once success / granted on this device, NEVER ask again!
    if (isDeviceAlreadySubscribed()) {
      return;
    }

    // If permission was already explicitly denied by user, do not show
    const permission = getNotificationPermission();
    if (permission === "denied") {
      return;
    }

    // Check if dismissed recently (e.g., 3 days)
    const dismissedUntil = localStorage.getItem("push_prompt_dismissed_until");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // If user just logged in or is active, show prompt smoothly
    const delay = user ? 1500 : 4000;
    const timer = setTimeout(() => {
      if (!isDeviceAlreadySubscribed()) {
        setShowPrompt(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [user]);

  const handleSubscribe = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await subscribeToPush(user?.userId);
      if (res.success) {
        setSubscribed(true);
        setTimeout(() => {
          setShowPrompt(false);
        }, 1800);
      } else {
        setShowPrompt(false);
      }
    } catch (err) {
      console.warn("Notification prompt subscribe error:", err);
      setShowPrompt(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      fetch("/api/pwa/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "push_dismissed", userId: user?.userId || null }),
      }).catch(() => {});
      localStorage.setItem("push_prompt_dismissed_until", (Date.now() + 3 * 86400000).toString());
    } catch { /* silent */ }
  };

  const hideOnRoutes = ["/login", "/register", "/admin", "/owner-panal"];
  const isHiddenRoute = hideOnRoutes.some((route) => pathname?.startsWith(route));

  if (isHiddenRoute || !showPrompt) return null;

  return (
    <div className="fixed top-5 right-4 sm:right-6 z-[99998] max-w-[340px] w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-neutral-950/90 dark:bg-neutral-950/90 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] p-3.5 transition-all">
        {/* Subtle top highlight gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              subscribed
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.15)]"
            }`}
          >
            {subscribed ? (
              <FiCheck className="text-base stroke-[2.5]" />
            ) : (
              <FiBell className="text-[15px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-xs font-semibold text-white tracking-tight leading-snug">
              {subscribed ? "Alerts Activated" : "Instant Order Alerts"}
            </h4>
            <p className="text-[11.5px] text-neutral-400 mt-0.5 leading-relaxed">
              {subscribed
                ? "You'll be notified immediately when your top-up is completed."
                : "Get live order status and completion updates directly on this device."}
            </p>

            {!subscribed && (
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_2px_12px_rgba(56,189,248,0.35)] active:scale-[0.97] transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enabling...
                    </span>
                  ) : (
                    "Enable alerts"
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors font-medium cursor-pointer"
                >
                  Later
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <FiX className="text-sm" />
        </button>
      </div>
    </div>
  );
}
