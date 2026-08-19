"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";

const SettingsTab = () => {
    const [settings, setSettings] = useState({ maintenanceMode: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch("/api/admin/settings", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleMaintenance = async () => {
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            const token = localStorage.getItem("token");
            const newValue = !settings.maintenanceMode;

            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ maintenanceMode: newValue }),
            });

            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
                setMessage({ type: "success", text: `Maintenance mode ${newValue ? "enabled" : "disabled"}.` });
            } else {
                setMessage({ type: "error", text: data.message || "Could not update settings" });
            }
        } catch (err) {
            console.error("Failed to update settings", err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    const toggleOrdersDisabled = async () => {
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            const token = localStorage.getItem("token");
            const newValue = !settings.ordersDisabled;

            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ordersDisabled: newValue }),
            });

            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
                setMessage({ type: "success", text: `Taking orders is now ${newValue ? "disabled" : "enabled"}.` });
            } else {
                setMessage({ type: "error", text: data.message || "Could not update settings" });
            }
        } catch (err) {
            console.error("Failed to update settings", err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <LoadingSpinner size="lg" color="accent" />
                <p className="text-[var(--muted)]">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <Icons.settings className="text-[var(--accent)] text-lg" />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Main Settings</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Website Status & Rules
                </p>
            </div>
        </div>
      </div>

            <div className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] overflow-hidden flex flex-col divide-y divide-[var(--border)]/50 shadow-xl shadow-black/5">
                <div className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">Maintenance Mode</h3>
                        <p className="text-[10px] text-[var(--muted)]/60 mt-1 leading-relaxed max-w-sm">
                            When enabled, users will see a maintenance message and cannot access the site.
                            You can still access the admin panel.
                        </p>
                    </div>

                    <button aria-label="button"
                        onClick={toggleMaintenance}
                        disabled={saving}
                        className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none 
              ${settings.maintenanceMode ? "bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30" : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"}
              ${saving ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                        <span
                            className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out
                ${settings.maintenanceMode ? "translate-x-5" : "translate-x-0"}
              `}
                        />
                    </button>
                </div>

                <div className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">Disable Taking Orders</h3>
                        <p className="text-[10px] text-[var(--muted)]/60 mt-1 leading-relaxed max-w-sm">
                            When enabled, users will see a message saying "Taking new orders is temporarily paused. Please try again later." when they attempt to checkout.
                        </p>
                    </div>

                    <button aria-label="button"
                        onClick={toggleOrdersDisabled}
                        disabled={saving}
                        className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none 
              ${settings.ordersDisabled ? "bg-rose-500 shadow-lg shadow-rose-500/30" : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"}
              ${saving ? "opacity-50 cursor-not-allowed" : ""}
            `}
                    >
                        <span
                            className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out
                ${settings.ordersDisabled ? "translate-x-5" : "translate-x-0"}
              `}
                        />
                    </button>
                </div>
                {message.text && (
                    <div className={`p-4 md:p-6 flex items-center gap-3 text-xs font-bold tracking-wide uppercase ${message.type === "success" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                        {message.type === "success" ? <Icons.checkCircle size={16} /> : <Icons.alertCircle size={16} />}
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsTab;
