"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";

const SettingsTab = ({ onProviderChange, providerBalances }) => {
    const [settings, setSettings] = useState({ maintenanceMode: false, topupProvider: "1game" });
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

    const updateProvider = async (newProvider) => {
        if (saving || settings.topupProvider === newProvider) return;
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            const token = localStorage.getItem("token");

            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ topupProvider: newProvider }),
            });

            const data = await res.json();
            if (data.success) {
                setSettings(data.data);
                setMessage({ 
                    type: "success", 
                    text: `Top-up Provider switched to ${newProvider === "bluebuff" ? "Bluebuff API" : "1Game API"}.` 
                });
                if (onProviderChange) onProviderChange();
            } else {
                setMessage({ type: "error", text: data.message || "Could not update provider" });
            }
        } catch (err) {
            console.error("Failed to update provider", err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setSaving(false);
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

    const currentProvider = settings.topupProvider || "1game";

    return (
        <div className="max-w-2xl space-y-4">
            {/* Header Strip */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border)]/70">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                        <Icons.settings size={16} />
                    </div>
                    <div>
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">Main Settings</h2>
                        <p className="text-[10px] text-[var(--muted)] font-medium">
                            Store Controls & API Provider Routing
                        </p>
                    </div>
                </div>

                {message.text && (
                    <div className={`hidden sm:flex items-center gap-2 text-[11px] font-bold px-3 py-1 rounded-lg ${
                        message.type === "success" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border border-rose-500/20"
                    }`}>
                        {message.type === "success" ? <Icons.checkCircle size={13} /> : <Icons.alertCircle size={13} />}
                        <span>{message.text}</span>
                    </div>
                )}
            </div>

            {/* Mobile Alert Banner */}
            {message.text && (
                <div className={`sm:hidden flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-lg ${
                    message.type === "success" ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border border-rose-500/20"
                }`}>
                    {message.type === "success" ? <Icons.checkCircle size={13} /> : <Icons.alertCircle size={13} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Settings List - Compact, Mobile Responsive & Full Width */}
            <div className="divide-y divide-[var(--border)]/70">
                
                {/* 1. Primary Provider */}
                <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                                Primary Top-up Provider
                            </h3>
                        </div>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">
                            Fulfills orders via <span className="font-semibold text-[var(--foreground)]">{currentProvider === "1game" ? "1Game (1gamestopup.com)" : "Bluebuff (api.bluebuff.in)"}</span>
                        </p>
                    </div>

                    <div className="inline-flex items-center self-start sm:self-auto p-1 bg-[var(--card)] border border-[var(--border)] rounded-xl gap-1 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => updateProvider("1game")}
                            disabled={saving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                currentProvider === "1game"
                                    ? "bg-emerald-500 text-white shadow-xs"
                                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
                            }`}
                        >
                            <span>1Game</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                currentProvider === "1game" ? "bg-black/20 text-white" : "bg-[var(--foreground)]/5 text-[var(--muted)]"
                            }`}>
                                {providerBalances?.oneGame?.balance !== undefined ? `$${providerBalances.oneGame.balance.toFixed(2)}` : "---"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => updateProvider("bluebuff")}
                            disabled={saving}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                currentProvider === "bluebuff"
                                    ? "bg-cyan-500 text-white shadow-xs"
                                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
                            }`}
                        >
                            <span>Bluebuff</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                currentProvider === "bluebuff" ? "bg-black/20 text-white" : "bg-[var(--foreground)]/5 text-[var(--muted)]"
                            }`}>
                                {providerBalances?.bluebuff?.balance !== undefined ? `$${providerBalances.bluebuff.balance.toFixed(2)}` : "---"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* 2. Maintenance Mode */}
                <div className="py-3 sm:py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Maintenance Mode</h3>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">
                            Show maintenance screen to visitors while keeping admin panel accessible
                        </p>
                    </div>

                    <button aria-label="Toggle Maintenance Mode"
                        onClick={toggleMaintenance}
                        disabled={saving}
                        className={`
                            relative inline-flex h-5.5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none 
                            ${settings.maintenanceMode ? "bg-amber-500" : "bg-[var(--foreground)]/15 hover:bg-[var(--foreground)]/25"}
                            ${saving ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        <span
                            className={`
                                pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out
                                ${settings.maintenanceMode ? "translate-x-4.5" : "translate-x-0"}
                            `}
                        />
                    </button>
                </div>

                {/* 3. Disable Taking Orders */}
                <div className="py-3 sm:py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Disable Taking Orders</h3>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">
                            Temporarily pause new checkout purchases while catalog remains browsable
                        </p>
                    </div>

                    <button aria-label="Toggle Order Taking"
                        onClick={toggleOrdersDisabled}
                        disabled={saving}
                        className={`
                            relative inline-flex h-5.5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none 
                            ${settings.ordersDisabled ? "bg-rose-500" : "bg-[var(--foreground)]/15 hover:bg-[var(--foreground)]/25"}
                            ${saving ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        <span
                            className={`
                                pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out
                                ${settings.ordersDisabled ? "translate-x-4.5" : "translate-x-0"}
                            `}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
