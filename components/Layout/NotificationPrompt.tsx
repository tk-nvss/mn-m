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
    <div className="fixed top-4 right-3 sm:right-6 z-[99998] max-w-[360px] w-[calc(100%-1.5rem)] sm:w-auto animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl shadow-black/10 dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)] p-2.5 sm:p-3 backdrop-blur-xl transition-all">
        {/* Subtle accent highlight on top */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2.5">
          {/* Status Icon */}
          <div
            className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              subscribed
                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25"
                : "bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20"
            }`}
          >
            {subscribed ? (
              <FiCheck className="text-sm stroke-[2.5]" />
            ) : (
              <FiBell className="text-sm" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-xs font-bold text-[var(--foreground)] tracking-tight leading-snug">
              {subscribed ? "Alerts Activated" : "Instant Order Alerts"}
            </h4>
            <p className="text-[10.5px] text-[var(--muted)] leading-tight truncate mt-0.5">
              {subscribed
                ? "You'll be notified on completion"
                : "Live order updates on this device"}
            </p>
          </div>

          {/* Actions */}
          {!subscribed ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="h-7 px-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 active:scale-95 text-white text-[11px] font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Wait...</span>
                  </span>
                ) : (
                  "Enable"
                )}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                aria-label="Dismiss alert prompt"
                title="Later"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPrompt(false)}
              className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <FiX className="text-xs" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
