"use client";

import React, { useEffect, useState } from "react";
import { FiBell, FiCheckCircle } from "react-icons/fi";
import {
  isPushNotificationSupported,
  isDeviceAlreadySubscribed,
  subscribeToPush,
} from "@/lib/pushNotification";
import { LoadingSpinner } from "@/components/common";

export default function OrderDeliveryPushPrompt({ userId }: { userId?: string }) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (isPushNotificationSupported()) {
        setSupported(true);
        if (isDeviceAlreadySubscribed()) {
          setSubscribed(true);
        }
      }
    } catch {
      // Fail-safe: do not impact checkout
    }
  }, []);

  const handleEnableAlert = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await subscribeToPush(userId);
      if (res?.success) {
        setSubscribed(true);
      }
    } catch (err) {
      console.warn("Order push subscribe optional failure:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  return (
    <div className="my-5 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-left shadow-lg">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          subscribed
            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
            : "bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]"
        }`}>
          {subscribed ? <FiCheckCircle size={18} /> : <FiBell size={18} className="animate-bounce" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[var(--foreground)]">
            {subscribed
              ? "Instant Delivery Alert Active"
              : "🔔 Enable Instant Delivery Notification"}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-snug">
            {subscribed
              ? "We'll notify your phone/browser the moment your diamonds are delivered to your account!"
              : "Get a live pop-up notification on this device as soon as your top-up is completed."}
          </p>

          {!subscribed && (
            <button
              onClick={handleEnableAlert}
              disabled={loading}
              type="button"
              className="mt-3 bg-[var(--accent)] text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="xs" color="current" />
                  <span>Enabling...</span>
                </>
              ) : (
                <>
                  <FiBell size={13} />
                  <span>Notify Me on Delivery</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
