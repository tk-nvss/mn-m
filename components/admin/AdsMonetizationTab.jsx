"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tv,
  Globe,
  Coins,
  Clock,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Save,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Sliders,
  Check,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Layers,
  Bell,
  MousePointer,
  Tag,
  ChevronDown,
  ChevronUp,
  Code,
  Power,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { LoadingSpinner, InfoTooltip, SectionTitle } from "@/components/common";

export default function AdsMonetizationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form State
  const [adsterraLink, setAdsterraLink] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [defaultRewardCoins, setDefaultRewardCoins] = useState(1);
  const [defaultCooldownMinutes, setDefaultCooldownMinutes] = useState(30);
  const [channels, setChannels] = useState([]);

  // Ad Format Controls
  const [enableBanners, setEnableBanners] = useState(true);
  const [enableSocialBar, setEnableSocialBar] = useState(false);
  const [enablePopunder, setEnablePopunder] = useState(false);
  const [showAdBadge, setShowAdBadge] = useState(true);
  const [adBadgeText, setAdBadgeText] = useState("Ad");

  // Adsterra Keys & Scripts
  const [nativeBannerId, setNativeBannerId] = useState("c755433b5487dae7313fbaa97a482b40");
  const [nativeBannerSrc, setNativeBannerSrc] = useState("https://pl29207483.effectivecpmnetwork.com/c755433b5487dae7313fbaa97a482b40/invoke.js");
  const [socialBarSrc, setSocialBarSrc] = useState("https://pl29247592.effectivecpmnetwork.com/a5/bb/66/a5bb66c93c9892d321190ff4ef0081a4.js");
  const [popunderSrc, setPopunderSrc] = useState("https://pl29813171.effectivecpmnetwork.com/22/23/95/2223956ef92dbcb14085fcaa81bc9718.js");
  const [banner320x50Key, setBanner320x50Key] = useState("183ee4e45520fb7aa8e1d934a0970c31");
  const [banner300x250Key, setBanner300x250Key] = useState("12769ff4f11c1254fd7310aea93f838d");
  const [showAdvancedKeys, setShowAdvancedKeys] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [channelForm, setChannelForm] = useState({
    id: "",
    title: "",
    link: "",
    reward: 1,
    cooldownMinutes: 25,
    enabled: true,
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchAdsConfig();
  }, []);

  const fetchAdsConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/ads-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setAdsterraLink(d.adsterraLink || "");
        setEnabled(d.enabled !== false);
        setEnableBanners(d.enableBanners !== false);
        setEnableSocialBar(d.enableSocialBar === true);
        setEnablePopunder(d.enablePopunder === true);
        setShowAdBadge(d.showAdBadge !== false);
        setAdBadgeText(d.adBadgeText || "Ad");

        if (d.nativeBannerId) setNativeBannerId(d.nativeBannerId);
        if (d.nativeBannerSrc) setNativeBannerSrc(d.nativeBannerSrc);
        if (d.socialBarSrc) setSocialBarSrc(d.socialBarSrc);
        if (d.popunderSrc) setPopunderSrc(d.popunderSrc);
        if (d.banner320x50Key) setBanner320x50Key(d.banner320x50Key);
        if (d.banner300x250Key) setBanner300x250Key(d.banner300x250Key);

        setDefaultRewardCoins(d.defaultRewardCoins ?? 1);
        setDefaultCooldownMinutes(d.defaultCooldownMinutes ?? 30);

        const chs = (d.channels || []).map((c) => ({
          id: c.id,
          title: c.title,
          link: c.link,
          reward: c.reward ?? 1,
          cooldownMinutes: Math.max(1, Math.round((c.cooldownMs || 1500000) / 60000)),
          enabled: c.enabled !== false,
        }));
        setChannels(chs);
      }
    } catch (err) {
      console.error("Failed to load ads config:", err);
      setMessage({ type: "error", text: "Failed to load ads configuration" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async (overrideChannels) => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");

      const channelsToSave = overrideChannels || channels;

      const payload = {
        adsterraLink: adsterraLink.trim(),
        enabled,
        enableBanners,
        enableSocialBar,
        enablePopunder,
        showAdBadge,
        adBadgeText: adBadgeText.trim(),
        nativeBannerId: nativeBannerId.trim(),
        nativeBannerSrc: nativeBannerSrc.trim(),
        socialBarSrc: socialBarSrc.trim(),
        popunderSrc: popunderSrc.trim(),
        banner320x50Key: banner320x50Key.trim(),
        banner300x250Key: banner300x250Key.trim(),
        defaultRewardCoins: Number(defaultRewardCoins),
        defaultCooldownMinutes: Number(defaultCooldownMinutes),
        channels: channelsToSave.map((c) => ({
          id: c.id,
          title: c.title,
          link: c.link,
          reward: Number(c.reward),
          cooldownMinutes: Number(c.cooldownMinutes),
          cooldownMs: Number(c.cooldownMinutes) * 60 * 1000,
          enabled: c.enabled,
        })),
      };

      const res = await fetch("/api/admin/ads-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Ads & Monetization settings updated successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update settings" });
      }
    } catch (err) {
      console.error("Error saving ads config:", err);
      setMessage({ type: "error", text: "Network error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setChannelForm({
      id: `watch_${channels.length + 1}`,
      title: `Channel ${channels.length + 1}`,
      link: "",
      reward: defaultRewardCoins || 1,
      cooldownMinutes: 25,
      enabled: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (index) => {
    setEditingIndex(index);
    const ch = channels[index];
    setChannelForm({ ...ch });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!channelForm.title.trim() || !channelForm.link.trim()) {
      alert("Please provide both channel title and ad link URL.");
      return;
    }

    const updated = [...channels];
    if (editingIndex !== null) {
      updated[editingIndex] = { ...channelForm };
    } else {
      updated.push({
        ...channelForm,
        id: channelForm.id.trim() || `watch_${Date.now()}`,
      });
    }

    setChannels(updated);
    setIsModalOpen(false);
    handleSaveAll(updated);
  };

  const handleDeleteChannel = (index) => {
    if (!confirm(`Are you sure you want to delete ${channels[index].title}?`)) return;
    const updated = channels.filter((_, i) => i !== index);
    setChannels(updated);
    handleSaveAll(updated);
  };

  const handleToggleChannel = (index) => {
    const updated = [...channels];
    updated[index].enabled = !updated[index].enabled;
    setChannels(updated);
    handleSaveAll(updated);
  };

  // Quick Preset Handlers
  const handleApply2xRewards = () => {
    const updated = channels.map((c) => ({
      ...c,
      reward: Math.max(1, c.reward * 2),
    }));
    setChannels(updated);
    handleSaveAll(updated);
    setMessage({ type: "success", text: "Applied 2x Coin Boost to all channels!" });
  };

  const handleApplyQuickCooldown = () => {
    const updated = channels.map((c) => ({
      ...c,
      cooldownMinutes: 15,
    }));
    setChannels(updated);
    handleSaveAll(updated);
    setMessage({ type: "success", text: "Set 15-minute quick cooldown on all channels!" });
  };

  const handleCopyLink = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isAllAdsDisabled = !enabled && !enableBanners && !enableSocialBar && !enablePopunder;

  const handleToggleAllAds = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");

      const willEnable = isAllAdsDisabled;
      const nextEnabled = willEnable;
      const nextEnableBanners = willEnable;
      const nextEnableSocialBar = false;
      const nextEnablePopunder = false;

      setEnabled(nextEnabled);
      setEnableBanners(nextEnableBanners);
      setEnableSocialBar(nextEnableSocialBar);
      setEnablePopunder(nextEnablePopunder);

      const payload = {
        enabled: nextEnabled,
        enableBanners: nextEnableBanners,
        enableSocialBar: nextEnableSocialBar,
        enablePopunder: nextEnablePopunder,
      };

      const res = await fetch("/api/admin/ads-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({
          type: "success",
          text: willEnable
            ? "Ads re-enabled across all locations (Banners active)!"
            : "All ads disabled across all locations site-wide!",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 4000);
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update ads status" });
      }
    } catch (err) {
      console.error("Error toggling all ads:", err);
      setMessage({ type: "error", text: "Network error updating ads status" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" color="accent" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Loading Ads Configuration...</p>
      </div>
    );
  }

  const activeChannelsCount = channels.filter((c) => c.enabled).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[var(--border)]/70">
        <SectionTitle
          size="xs"
          accentColor="amber"
          subtitle="REVENUE & TRAFFIC"
          title="ADS & MONETIZATION"
          highlight="MONETIZATION"
          pulse
        />

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchAdsConfig}
            disabled={saving}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer shrink-0"
            title="Refresh"
          >
            <RefreshCcw size={12} className={saving ? "animate-spin" : ""} />
          </button>

          {/* 1-Click Master Kill / Enable Switch */}
          <button
            type="button"
            onClick={handleToggleAllAds}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 border shadow-xs ${
              isAllAdsDisabled
                ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30"
            }`}
            title={isAllAdsDisabled ? "Enable all ads" : "1-Click Disable all ads across all places"}
          >
            <Power size={13} />
            <span>{isAllAdsDisabled ? "Enable Ads" : "1-Click Disable All"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground,white)] font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ALERT MESSAGE BANNER */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl border ${
            message.type === "success"
              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
              : "text-rose-400 bg-rose-500/10 border-rose-500/20"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* 1-CLICK MASTER KILL SWITCH HERO CARD */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        isAllAdsDisabled
          ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
          : "bg-[var(--card)]/60 border-[var(--border)] text-[var(--foreground)]"
      }`}>
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner ${
            isAllAdsDisabled
              ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          }`}>
            <Power size={22} className={isAllAdsDisabled ? "opacity-70" : "animate-pulse"} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-black uppercase tracking-wider">
                {isAllAdsDisabled ? "All Ads Are Completely Disabled" : "Site-Wide Ad Monetization is Active"}
              </h2>
              <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                isAllAdsDisabled
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              }`}>
                {isAllAdsDisabled ? "ALL ADS OFF" : "ALL ADS ACTIVE"}
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed max-w-xl">
              {isAllAdsDisabled
                ? "Every ad location (sidebar, blog, footer, coins, and popups) is completely muted. No ad scripts or empty placeholders are rendered."
                : "One single click immediately disables and hides every banner ad, popup alert, popunder, and rewarded coin ad site-wide instantly."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAllAds}
          disabled={saving}
          className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all shadow-md active:scale-95 disabled:opacity-50 ${
            isAllAdsDisabled
              ? "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
              : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
          }`}
        >
          <Power size={15} />
          <span>{isAllAdsDisabled ? "Enable All Ads" : "1-Click Disable All Ads"}</span>
        </button>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Monetization Status</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${enabled ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
            <span className="text-sm font-black text-[var(--foreground)]">{enabled ? "ACTIVE" : "PAUSED"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Banner Ads</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${enableBanners ? "bg-emerald-500" : "bg-neutral-600"}`} />
            <span className="text-sm font-black text-[var(--foreground)]">{enableBanners ? "ENABLED" : "MUTED"}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Pop-up & Popunder</span>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${enableSocialBar || enablePopunder ? "bg-amber-500 animate-pulse" : "bg-neutral-600"}`} />
            <span className="text-sm font-black text-[var(--foreground)]">
              {enableSocialBar && enablePopunder ? "BOTH ON" : enableSocialBar ? "POP-UP ON" : enablePopunder ? "POPUNDER ON" : "MUTED"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-1">
          <span className="text-[10px] uppercase font-black text-[var(--muted)] tracking-wider">Active Channels</span>
          <div className="text-sm font-black text-[var(--foreground)] tabular-nums">
            {activeChannelsCount} <span className="text-[11px] text-[var(--muted)] font-normal">/ {channels.length} Total</span>
          </div>
        </div>
      </div>

      {/* SECTION: AD FORMATS & DISPLAY CONTROLS */}
      <div className="p-5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
                Ad Formats & Display Controls
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                Enable or disable banner ads, floating popups, popunders, and customize badges
              </p>
            </div>
          </div>
        </div>

        {/* 4 FORMAT TOGGLES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Banner Ads */}
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Tv size={13} className="text-blue-400" />
                  Banner Ads
                </span>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  enableBanners ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                }`}>
                  {enableBanners ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                320x50, 300x250, native, and footer banners across sidebar, blog, and coins.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEnableBanners(!enableBanners)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                enableBanners ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30" : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              <span>{enableBanners ? "Enabled (Click to Pause)" : "Paused (Click to Enable)"}</span>
            </button>
          </div>

          {/* 2. Pop-up / Notification Ads */}
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Bell size={13} className="text-amber-400" />
                  Pop-up / SocialBar
                </span>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  enableSocialBar ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                }`}>
                  {enableSocialBar ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Floating push alerts & mini alert popups (e.g. VPN alerts).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEnableSocialBar(!enableSocialBar)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                enableSocialBar ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30" : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              <span>{enableSocialBar ? "Enabled (Click to Disable)" : "Disabled (Click to Enable)"}</span>
            </button>
          </div>

          {/* 3. Popunder Redirects */}
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <MousePointer size={13} className="text-purple-400" />
                  Popunder Ads
                </span>
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  enablePopunder ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                }`}>
                  {enablePopunder ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Full-page background tab redirects triggered when users click.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEnablePopunder(!enablePopunder)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                enablePopunder ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30" : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              <span>{enablePopunder ? "Enabled (Click to Disable)" : "Disabled (Click to Enable)"}</span>
            </button>
          </div>

          {/* 4. Overlapping "Ad" Mention Badge */}
          <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
                  <Tag size={13} className="text-emerald-400" />
                  Overlapping Badge
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdBadge(!showAdBadge)}
                  className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider cursor-pointer ${
                    showAdBadge ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                  }`}
                >
                  {showAdBadge ? "Visible" : "Hidden"}
                </button>
              </div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Floating pill tag overlapping top edge of banners.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-[var(--muted)]">Badge Label</label>
              <input
                type="text"
                value={adBadgeText}
                onChange={(e) => setAdBadgeText(e.target.value)}
                placeholder="Ad"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>

        {/* ADVANCED SCRIPT KEYS ACCORDION */}
        <div className="pt-2 border-t border-[var(--border)]/50">
          <button
            type="button"
            onClick={() => setShowAdvancedKeys(!showAdvancedKeys)}
            className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-[var(--card)]/40 hover:bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code size={14} className="text-purple-400" />
              <span>Adsterra Script URLs & Banner Keys (Advanced)</span>
            </div>
            {showAdvancedKeys ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvancedKeys && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 p-4 rounded-xl bg-[var(--background)] border border-[var(--border)] animate-in fade-in duration-200">
              {/* 320x50 Key */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  320x50 Banner Key (Sidebar & Footer)
                </label>
                <input
                  type="text"
                  value={banner320x50Key}
                  onChange={(e) => setBanner320x50Key(e.target.value)}
                  placeholder="183ee4e45520fb7aa8e1d934a0970c31"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* 300x250 Key */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  300x250 Banner Key (Medium Rectangle)
                </label>
                <input
                  type="text"
                  value={banner300x250Key}
                  onChange={(e) => setBanner300x250Key(e.target.value)}
                  placeholder="12769ff4f11c1254fd7310aea93f838d"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Native Banner ID */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Native Banner Container ID
                </label>
                <input
                  type="text"
                  value={nativeBannerId}
                  onChange={(e) => setNativeBannerId(e.target.value)}
                  placeholder="c755433b5487dae7313fbaa97a482b40"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Native Banner Script URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Native Banner Script URL
                </label>
                <input
                  type="text"
                  value={nativeBannerSrc}
                  onChange={(e) => setNativeBannerSrc(e.target.value)}
                  placeholder="https://pl29207483.effectivecpmnetwork.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Social Bar Script URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Social Bar (Pop-up) Script URL
                </label>
                <input
                  type="text"
                  value={socialBarSrc}
                  onChange={(e) => setSocialBarSrc(e.target.value)}
                  placeholder="https://pl29247592.effectivecpmnetwork.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {/* Popunder Script URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Popunder Script URL
                </label>
                <input
                  type="text"
                  value={popunderSrc}
                  onChange={(e) => setPopunderSrc(e.target.value)}
                  placeholder="https://pl29813171.effectivecpmnetwork.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: GLOBAL AD NETWORK & ADSTERRA LINK */}
      <div className="p-5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
                Primary Ad Network (Adsterra Direct Link)
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                Used for Check-in popups, Task gateway unlocks, and high-CPM direct redirects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-[var(--muted)] hidden sm:inline">
              Global Ads:
            </span>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                enabled ? "bg-emerald-500" : "bg-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* URL Input Box */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center justify-between">
            <span>Direct Monetization Destination URL</span>
            {adsterraLink && (
              <span className="text-[9px] font-mono text-emerald-400">✓ Valid URL configured</span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted)]">
                <Link2 size={15} />
              </div>
              <input
                type="url"
                value={adsterraLink}
                onChange={(e) => setAdsterraLink(e.target.value)}
                placeholder="https://www.profitablecpmratenetwork.com/..."
                className="w-full pl-9 pr-24 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)] transition-all"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCopyLink(adsterraLink)}
                  className="px-2 py-1 rounded-lg bg-[var(--card)] hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy Link"
                >
                  {copiedLink ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!adsterraLink) return alert("Please enter an Adsterra URL first");
                window.open(adsterraLink, "_blank", "noopener,noreferrer");
              }}
              className="px-3.5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--foreground)]/5 text-[var(--foreground)] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              title="Test Ad Link in New Tab"
            >
              <span>Test Link</span>
              <ExternalLink size={13} className="text-[var(--muted)]" />
            </button>
          </div>
        </div>

        {/* Global Fallback Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]/50">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
              <span>Default Reward Coins (Fallback)</span>
              <InfoTooltip content="Coins given when a channel does not specify an explicit reward" />
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={defaultRewardCoins}
                onChange={(e) => setDefaultRewardCoins(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[var(--muted)]">BBC</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
              <span>Default Cooldown Period (Minutes)</span>
              <InfoTooltip content="Minimum waiting time before a user can watch the same ad channel again" />
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={defaultCooldownMinutes}
                onChange={(e) => setDefaultCooldownMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[var(--muted)]">Minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: QUICK BOOST PRESETS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-blue-400">
            <Sparkles size={14} />
            <h3 className="text-xs font-black uppercase tracking-wider">Festival / Event Quick Multipliers</h3>
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Quickly boost player engagement with one-click promotional settings
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleApply2xRewards}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Zap size={12} />
            <span>2x Coin Boost</span>
          </button>

          <button
            type="button"
            onClick={handleApplyQuickCooldown}
            className="px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--foreground)]/10 text-[var(--foreground)] border border-[var(--border)] font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Clock size={12} />
            <span>15m Quick Cooldown</span>
          </button>
        </div>
      </div>

      {/* SECTION 3: WATCH & EARN CHANNELS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Watch & Earn Ad Channels ({channels.length})
            </h2>
            <p className="text-[11px] text-[var(--muted)]">
              Individual rewarded video channels shown on the user dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Channel</span>
          </button>
        </div>

        {/* CHANNELS GRID / TABLE */}
        <div className="space-y-2">
          {channels.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[var(--card)]/30 border border-dashed border-[var(--border)]">
              <Tv size={28} className="mx-auto text-[var(--muted)]/40 mb-2" />
              <p className="text-xs font-bold text-[var(--muted)]">No Watch & Earn channels created yet.</p>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="mt-3 text-xs text-[var(--accent)] font-bold hover:underline"
              >
                + Add your first ad channel
              </button>
            </div>
          ) : (
            channels.map((channel, idx) => (
              <motion.div
                key={channel.id || idx}
                layout
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  channel.enabled
                    ? "bg-[var(--card)]/40 border-[var(--border)] hover:border-[var(--accent)]/40"
                    : "bg-[var(--card)]/15 border-[var(--border)]/40 opacity-60"
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      channel.enabled
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-[var(--foreground)]/5 border-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    <Tv size={16} />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black uppercase text-[var(--foreground)] truncate">
                        {channel.title}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[var(--foreground)]/5 text-[var(--muted)] border border-[var(--border)]">
                        {channel.id}
                      </span>
                      {channel.enabled ? (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-neutral-700/50 text-neutral-400">
                          Disabled
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] font-mono text-[var(--muted)] truncate max-w-md">
                      {channel.link || "No URL specified"}
                    </p>
                  </div>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/50">
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center gap-1">
                      <Coins size={11} />
                      <span>+{channel.reward} BBC</span>
                    </div>

                    <div className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center gap-1">
                      <Clock size={11} />
                      <span>{channel.cooldownMinutes}m wait</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {channel.link && (
                      <button
                        type="button"
                        onClick={() => window.open(channel.link, "_blank", "noopener,noreferrer")}
                        className="p-1.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        title="Test Link"
                      >
                        <ExternalLink size={13} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleChannel(idx)}
                      className="p-1.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title={channel.enabled ? "Disable Channel" : "Enable Channel"}
                    >
                      {channel.enabled ? <Eye size={13} className="text-emerald-400" /> : <EyeOff size={13} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(idx)}
                      className="p-1.5 rounded-lg bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Edit Channel"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteChannel(idx)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      title="Delete Channel"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <Tv size={16} className="text-amber-400" />
                  <h3 className="text-sm font-black uppercase text-[var(--foreground)]">
                    {editingIndex !== null ? "Edit Ad Channel" : "Add Watch & Earn Channel"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* ID & Title */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Channel ID
                    </label>
                    <input
                      type="text"
                      value={channelForm.id}
                      onChange={(e) => setChannelForm({ ...channelForm, id: e.target.value })}
                      placeholder="e.g. watch_8"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Channel Title
                    </label>
                    <input
                      type="text"
                      value={channelForm.title}
                      onChange={(e) => setChannelForm({ ...channelForm, title: e.target.value })}
                      placeholder="e.g. Channel 8 - High Payout"
                      className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-bold outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                {/* Ad URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                    Destination Monetization Link (Direct Ad URL)
                  </label>
                  <input
                    type="url"
                    value={channelForm.link}
                    onChange={(e) => setChannelForm({ ...channelForm, link: e.target.value })}
                    placeholder="https://omg10.com/... or partner ad network URL"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Reward & Cooldown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Reward (Coins)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={channelForm.reward}
                        onChange={(e) =>
                          setChannelForm({ ...channelForm, reward: Math.max(0, parseInt(e.target.value) || 0) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] font-bold text-[var(--muted)]">BBC</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      Cooldown (Minutes)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={channelForm.cooldownMinutes}
                        onChange={(e) =>
                          setChannelForm({ ...channelForm, cooldownMinutes: Math.max(1, parseInt(e.target.value) || 1) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                      <span className="absolute right-3 top-2 text-[10px] font-bold text-[var(--muted)]">Min</span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <div>
                    <span className="text-[11px] font-black uppercase text-[var(--foreground)]">Enable Channel</span>
                    <p className="text-[10px] text-[var(--muted)]">Show this channel in the user's Watch & Earn list</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setChannelForm({ ...channelForm, enabled: !channelForm.enabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      channelForm.enabled ? "bg-emerald-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        channelForm.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModal}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-foreground,white)] text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  Save Channel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
