"use client";

import { useState, useEffect } from "react";
import { FiLayout, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

const UiSettingsTab = () => {
    const [settings, setSettings] = useState({ 
        showTopNoticeBanner: false,
        showHomeEarnPromotion: false,
        showTradeMarketplaceBanner: false,
        showCustomWebBanner: false,
        showGamesWebBanner: false,
        showGiveawayBanner: true,
    });
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <FiLoader className="w-10 h-10 animate-spin text-[var(--accent)]" />
                <p className="text-[var(--muted)]">Loading UI settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <FiLayout className="text-[var(--accent)] text-lg" />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Top Banners</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Manage which promotional banners appear on the homepage.
                </p>
            </div>
        </div>
      </div>

            <div className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] overflow-hidden flex flex-col divide-y divide-[var(--border)]/50 shadow-xl shadow-black/5">
                {['showTopNoticeBanner', 'showHomeEarnPromotion', 'showTradeMarketplaceBanner', 'showCustomWebBanner', 'showGamesWebBanner', 'showGiveawayBanner'].map((bannerKey) => {
                    const toggleBanner = async () => {
                        try {
                            setSaving(true);
                            setMessage({ type: "", text: "" });
                            const token = localStorage.getItem("token");
                            const newValue = !settings[bannerKey];

                            const res = await fetch("/api/admin/settings", {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ [bannerKey]: newValue }),
                            });

                            const data = await res.json();
                            if (data.success) {
                                setSettings(data.data);
                                setMessage({ type: "success", text: `Banner settings updated.` });
                            } else {
                                setMessage({ type: "error", text: data.message || "Could not update settings" });
                            }
                        } catch (err) {
                            console.error("Failed to update banner", err);
                            setMessage({ type: "error", text: "Something went wrong" });
                        } finally {
                            setSaving(false);
                        }
                    };

                    const formatTitle = (key) => {
                        return key.replace('show', '').replace(/([A-Z])/g, ' $1').trim();
                    };

                    return (
                        <div key={bannerKey} className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">{formatTitle(bannerKey)}</h3>
                            </div>
                            <button aria-label="button"
                                onClick={toggleBanner}
                                disabled={saving}
                                className={`
                                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none 
                                  ${settings[bannerKey] ? "bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30" : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"}
                                  ${saving ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                <span
                                    className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out
                                    ${settings[bannerKey] ? "translate-x-5" : "translate-x-0"}
                                  `}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mt-12 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <FiLayout className="text-[var(--accent)] text-lg" />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Community Popups</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Manage which community popup appears on the screen.
                </p>
            </div>
        </div>
      </div>

            <div className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] overflow-hidden flex flex-col divide-y divide-[var(--border)]/50 shadow-xl shadow-black/5">

                {['showTelegramPopup', 'showWhatsappPopup', 'showGamesPopup', 'showJoinUsPopup'].map((bannerKey) => {
                    const toggleBanner = async () => {
                        try {
                            setSaving(true);
                            setMessage({ type: "", text: "" });
                            const token = localStorage.getItem("token");
                            const newValue = !settings[bannerKey];

                            const res = await fetch("/api/admin/settings", {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ [bannerKey]: newValue }),
                            });

                            const data = await res.json();
                            if (data.success) {
                                setSettings(data.data);
                                setMessage({ type: "success", text: `Popup settings updated.` });
                            } else {
                                setMessage({ type: "error", text: data.message || "Could not update settings" });
                            }
                        } catch (err) {
                            console.error("Failed to update popup", err);
                            setMessage({ type: "error", text: "Something went wrong" });
                        } finally {
                            setSaving(false);
                        }
                    };

                    const formatTitle = (key) => {
                        return key.replace('show', '').replace(/([A-Z])/g, ' $1').trim();
                    };

                    return (
                        <div key={bannerKey} className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">{formatTitle(bannerKey)}</h3>
                            </div>
                            <button aria-label="button"
                                onClick={toggleBanner}
                                disabled={saving}
                                className={`
                                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none 
                                  ${settings[bannerKey] ? "bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30" : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"}
                                  ${saving ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                <span
                                    className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out
                                    ${settings[bannerKey] ? "translate-x-5" : "translate-x-0"}
                                  `}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mt-12 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <FiLayout className="text-[var(--accent)] text-lg" />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Homepage Sections</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Manage which main sections appear on the homepage.
                </p>
            </div>
        </div>
      </div>

            <div className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] overflow-hidden flex flex-col divide-y divide-[var(--border)]/50 shadow-xl shadow-black/5">

                {['showGameBannerCarousel', 'showStorySlider', 'showBattleRoyaleSection', 'showFlashSale', 'showHomeQuickActions'].map((bannerKey) => {
                    const toggleBanner = async () => {
                        try {
                            setSaving(true);
                            setMessage({ type: "", text: "" });
                            const token = localStorage.getItem("token");
                            const newValue = !settings[bannerKey];

                            const res = await fetch("/api/admin/settings", {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ [bannerKey]: newValue }),
                            });

                            const data = await res.json();
                            if (data.success) {
                                setSettings(data.data);
                                setMessage({ type: "success", text: `Homepage sections updated.` });
                            } else {
                                setMessage({ type: "error", text: data.message || "Could not update settings" });
                            }
                        } catch (err) {
                            console.error("Failed to update section", err);
                            setMessage({ type: "error", text: "Something went wrong" });
                        } finally {
                            setSaving(false);
                        }
                    };

                    const formatTitle = (key) => {
                        return key.replace('show', '').replace(/([A-Z])/g, ' $1').trim();
                    };

                    return (
                        <div key={bannerKey} className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">{formatTitle(bannerKey)}</h3>
                            </div>
                            <button aria-label="button"
                                onClick={toggleBanner}
                                disabled={saving}
                                className={`
                                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none 
                                  ${settings[bannerKey] ? "bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30" : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"}
                                  ${saving ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                <span
                                    className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out
                                    ${settings[bannerKey] ? "translate-x-5" : "translate-x-0"}
                                  `}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mt-12 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <FiLayout className="text-[var(--accent)] text-lg" />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Global UI Elements</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Manage UI elements that appear across the entire site.
                </p>
            </div>
        </div>
      </div>

            <div className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] overflow-hidden flex flex-col divide-y divide-[var(--border)]/50 shadow-xl shadow-black/5">

                {['showBottomNav'].map((bannerKey) => {
                    const toggleBanner = async () => {
                        try {
                            setSaving(true);
                            setMessage({ type: "", text: "" });
                            const token = localStorage.getItem("token");
                            const newValue = !settings[bannerKey];

                            const res = await fetch("/api/admin/settings", {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ [bannerKey]: newValue }),
                            });

                            const data = await res.json();
                            if (data.success) {
                                setSettings(data.data);
                                setMessage({ type: "success", text: `Global UI settings updated.` });
                            } else {
                                setMessage({ type: "error", text: data.message || "Could not update settings" });
                            }
                        } catch (err) {
                            console.error("Failed to update global UI", err);
                            setMessage({ type: "error", text: "Something went wrong" });
                        } finally {
                            setSaving(false);
                        }
                    };

                    const formatTitle = (key) => {
                        return key.replace('show', '').replace(/([A-Z])/g, ' $1').trim();
                    };

                    return (
                        <div key={bannerKey} className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-[var(--foreground)]/[0.02] transition-colors">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">{formatTitle(bannerKey)}</h3>
                            </div>
                            <button aria-label="button"
                                onClick={toggleBanner}
                                disabled={saving}
                                className={`
                                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none 
                                  ${settings[bannerKey] ? "bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30" : "bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/20"}
                                  ${saving ? "opacity-50 cursor-not-allowed" : ""}
                                `}
                            >
                                <span
                                    className={`
                                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-300 ease-in-out
                                    ${settings[bannerKey] ? "translate-x-5" : "translate-x-0"}
                                  `}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>

            {message.text && (
                <div className={`p-4 md:p-6 mt-6 flex items-center gap-3 text-xs font-bold tracking-wide uppercase rounded-[1.5rem] border ${message.type === "success" ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-rose-500 bg-rose-500/10 border-rose-500/20"}`}>
                    {message.type === "success" ? <FiCheckCircle className="text-sm" /> : <FiAlertCircle className="text-sm" />}
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default UiSettingsTab;
