"use client";

import React, { useEffect, useState } from "react";
import { FiBell, FiX, FiCheck } from "react-icons/fi";
import {
  isPushNotificationSupported,
  isDeviceAlreadySubscribed,
  getNotificationPermission,
  subscribeToPush,
} from "@/lib/pushNotification";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationPrompt() {
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

  if (!showPrompt) return null;

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-[99998] max-w-[320px] sm:max-w-xs w-[90%] sm:w-auto animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="bg-[var(--card)]/95 backdrop-blur-xl border border-[var(--border)] text-white p-2.5 sm:p-3 rounded-xl shadow-xl flex items-start gap-2.5 relative">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          subscribed
            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            : "bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]"
        }`}>
          {subscribed ? <FiCheck className="text-base" /> : <FiBell className="text-sm animate-bounce" />}
        </div>

        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-bold text-white tracking-wide">
            {subscribed ? "Notifications Enabled!" : "Instant Order & Alerts"}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
            {subscribed
              ? "You'll receive instant alerts when your top-up completes."
              : "Get instant delivery alerts on this device when top-up is completed."}
          </p>

          {!subscribed && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="bg-[var(--accent)] text-black text-[11px] font-bold px-2.5 py-1 rounded-md hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                {loading ? "Enabling..." : "Enable Alerts"}
              </button>
              <button
                onClick={handleDismiss}
                className="text-[11px] text-gray-400 hover:text-white px-2 py-1 transition-colors"
              >
                Later
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <FiX className="text-xs" />
        </button>
      </div>
    </div>
  );
}
