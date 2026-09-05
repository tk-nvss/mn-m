"use client";

import { useState, useEffect } from "react";
import { 
  Layout, 
  Layers, 
  Sparkles, 
  Globe, 
  MessageSquare, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from "lucide-react";

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
  const [savingKey, setSavingKey] = useState(null);
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

  const toggleBanner = async (bannerKey) => {
    try {
      setSavingKey(bannerKey);
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
        setMessage({ type: "success", text: `Settings updated.` });
      } else {
        setMessage({ type: "error", text: data.message || "Could not update settings" });
      }
    } catch (err) {
      console.error("Failed to update setting", err);
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSavingKey(null);
    }
  };

  const formatTitle = (key) => {
    return key.replace(/^show/, "").replace(/([A-Z])/g, " $1").trim();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-[var(--accent)]" size={28} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Loading UI settings...</p>
      </div>
    );
  }

  const sections = [
    {
      title: "Top Banners",
      subtitle: "Promotional notices and highlight banners on the homepage",
      icon: <Sparkles size={15} className="text-amber-400" />,
      accent: "#f59e0b",
      keys: [
        "showTopNoticeBanner",
        "showHomeEarnPromotion",
        "showTradeMarketplaceBanner",
        "showCustomWebBanner",
        "showGamesWebBanner",
        "showGiveawayBanner"
      ]
    },
    {
      title: "Community Popups",
      subtitle: "Engagement prompts and social group join popups",
      icon: <MessageSquare size={15} className="text-cyan-400" />,
      accent: "#06b6d4",
      keys: [
        "showTelegramPopup",
        "showWhatsappPopup",
        "showGamesPopup",
        "showJoinUsPopup"
      ]
    },
    {
      title: "Homepage Sections",
      subtitle: "Main product feeds, carousels, and activity widgets",
      icon: <Layout size={15} className="text-purple-400" />,
      accent: "#a855f7",
      keys: [
        "showGameBannerCarousel",
        "showStorySlider",
        "showBattleRoyaleSection",
        "showFlashSale",
        "showHomeQuickActions",
        "showEventsSection"
      ]
    },
    {
      title: "Global UI Elements",
      subtitle: "Persistent site-wide navigation and components",
      icon: <Globe size={15} className="text-emerald-400" />,
      accent: "#10b981",
      keys: [
        "showBottomNav"
      ]
    }
  ];

  return (
    <div className="space-y-5 pb-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Layout size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider leading-tight text-[var(--foreground)]">UI & Display Settings</h2>
            <p className="text-[9px] text-[var(--muted)] font-mono leading-none mt-0.5">
              Control website banners, popups, and layout modules
            </p>
          </div>
        </div>

        <button 
          aria-label="button"
          onClick={fetchSettings}
          className="p-1.5 rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-all active:scale-95 ml-auto"
          title="Refresh settings"
        >
          <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {message.text && (
        <div className={`p-2.5 flex items-center gap-2 text-xs font-bold uppercase rounded-lg border ${
          message.type === "success" 
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
            : "text-rose-400 bg-rose-500/10 border-rose-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((sec) => (
          <div key={sec.title} className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/30">
            <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: sec.accent }} />
            
            <div className="px-3.5 sm:px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]/50 shrink-0">
                {sec.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                  {sec.title}
                </h3>
                <p className="text-[9.5px] text-[var(--muted)] truncate">{sec.subtitle}</p>
              </div>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {sec.keys.map((key) => {
                const isEnabled = !!settings[key];
                const isSaving = savingKey === key;

                return (
                  <div 
                    key={key} 
                    className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-[var(--foreground)]/[0.01] transition-colors"
                  >
                    <span className="text-xs font-bold text-[var(--foreground)] truncate">
                      {formatTitle(key)}
                    </span>

                    <button 
                      aria-label={`Toggle ${formatTitle(key)}`}
                      onClick={() => toggleBanner(key)}
                      disabled={isSaving}
                      className={`relative w-8 h-4 rounded-full transition-colors outline-none flex items-center px-0.5 shrink-0 ${
                        isEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                      } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-all shadow-sm ${
                        isEnabled ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UiSettingsTab;
