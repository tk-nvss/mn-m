"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiSmartphone, FiMonitor, FiTablet,
  FiDownload, FiActivity, FiRefreshCw,
  FiXCircle, FiUser, FiExternalLink,
  FiBell, FiSend, FiCheckCircle, FiAlertCircle,
  FiImage, FiTag
} from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";
import { formatNumber, formatPercent, formatDateTime } from "@/utils";

const PRESET_IMAGES = [
  { label: "Starlight Pass", url: "/game-assets/starkight.webp" },
  { label: "Weekly Pass", url: "/game-assets/weeklypass.jpg" },
  { label: "Double Diamonds", url: "/game-assets/double-dias.jpg" },
  { label: "Rank Boost", url: "/game-assets/rankboost.jpg" },
  { label: "MLBB India", url: "/game-assets/mlbbindia.jpg" },
];

export default function PwaStatsTab() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays]       = useState(7);

  // Push broadcast state
  const [pushTitle, setPushTitle]   = useState("");
  const [pushBody, setPushBody]     = useState("");
  const [pushUrl, setPushUrl]       = useState("/");
  const [pushImage, setPushImage]   = useState("");
  const [pushTag, setPushTag]       = useState("promo-broadcast");
  const [pushSending, setPushSending] = useState(false);
  const [pushResult, setPushResult] = useState(null);

  const fetchStats = async (d = days) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/pwa/track?days=${d}`);
      const json = await res.json();
      setData(json);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(days); }, [days]);

  const handleSendPush = async (e) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) return;

    setPushSending(true);
    setPushResult(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const res = await fetch("/api/pwa/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: pushTitle,
          body: pushBody,
          url: pushUrl || "/",
          image: pushImage.trim() || undefined,
          tag: pushTag.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPushResult({
          type: "success",
          message: `Broadcast delivered! Sent: ${json.report?.sent || 0}, Failed: ${json.report?.failed || 0} (Total: ${json.report?.total || 0})`,
        });
        setPushTitle("");
        setPushBody("");
        setPushImage("");
        setPushUrl("/");
        fetchStats(days);
      } else {
        setPushResult({ type: "error", message: json.message || "Failed to send broadcast" });
      }
    } catch (err) {
      setPushResult({ type: "error", message: err.message || "Network error sending push" });
    } finally {
      setPushSending(false);
    }
  };

  const deviceIcon = (type) => {
    if (type === "mobile")  return <FiSmartphone size={12} />;
    if (type === "tablet")  return <FiTablet size={12} />;
    return <FiMonitor size={12} />;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner size="xl" color="accent" />
    </div>
  );

  if (!data) return (
    <p className="text-center text-sm text-[var(--muted)] py-10">Failed to load PWA stats.</p>
  );

  const conversionRate = data.totalInstalls + data.dismissCount > 0
    ? Math.round((data.totalInstalls / (data.totalInstalls + data.dismissCount)) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)] uppercase truncate">PWA & Push Notifications Panel</h2>
            <button aria-label="button"
              onClick={() => fetchStats(days)}
              className="p-1.5 shrink-0 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-all active:scale-95"
            >
              <FiRefreshCw size={12} />
            </button>
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono truncate">Real-time install, active devices & push subscriber metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Day toggle */}
          <div className="flex p-0.5 bg-[var(--border)]/50 border border-[var(--border)] rounded-md gap-0.5">
            {[1, 7, 30].map((d) => (
              <button aria-label="button"
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                  days === d
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                }`}
              >{d}D</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-6 md:grid-cols-6 gap-2 sm:gap-3">
        <StatCard className="col-span-3 md:col-span-1" label="Total Installs"  value={data.totalInstalls}  icon={<FiDownload size={16}  />} color="#ef4444" glow="rgba(239,68,68,0.15)"  />
        <StatCard className="col-span-3 md:col-span-1" label={`Installs (${days === 1 ? '1D' : days === 7 ? '7D' : '30D'})`} value={data.periodInstalls || 0} icon={<FiDownload size={16} />} color="#6366f1" glow="rgba(99,102,241,0.15)" />
        <StatCard className="col-span-2 md:col-span-1" label="Active Devices"  value={data.totalActive}    icon={<FiActivity size={16}  />} color="#22c55e" glow="rgba(34,197,94,0.15)"  />
        <StatCard className="col-span-2 md:col-span-1" label="Push Subscribers" value={data.totalPushSubscribers || 0} icon={<FiBell size={16} />} color="#a855f7" glow="rgba(168,85,247,0.2)" />
        <StatCard className="col-span-2 md:col-span-1" label="Dismissed"       value={data.dismissCount}   icon={<FiXCircle size={16}   />} color="#f59e0b" glow="rgba(245,158,11,0.15)" />
        <StatCard className="col-span-2 md:col-span-1" label="Conversion" value={`${conversionRate}%`} icon={<FiUser size={16}     />} color="#60a5fa" glow="rgba(96,165,250,0.15)" />
      </div>

      {/* ── Push Notification Broadcast Form ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
          <div className="p-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <FiBell size={14} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Send Rich Push Broadcast</h3>
            <p className="text-[10px] text-[var(--muted)]">Send rich notifications with full-width banner images to {data.totalPushSubscribers || 0} devices</p>
          </div>
        </div>

        <form onSubmit={handleSendPush} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Notification Title *</label>
              <input
                type="text"
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value)}
                placeholder="e.g. 🎉 Weekend Starlight Diamond Sale!"
                required
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Target Click URL</label>
              <input
                type="text"
                value={pushUrl}
                onChange={(e) => setPushUrl(e.target.value)}
                placeholder="e.g. /games/mlbb or /giveaways"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1">Message Body *</label>
            <textarea
              value={pushBody}
              onChange={(e) => setPushBody(e.target.value)}
              placeholder="e.g. Get extra diamonds on MLBB Weekly Pass. Instant delivery in 60 seconds!"
              required
              rows={2}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          {/* Banner Image & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1 flex items-center gap-1">
                <FiImage size={11} />
                <span>Banner Image URL (Rich Media)</span>
              </label>
              <input
                type="text"
                value={pushImage}
                onChange={(e) => setPushImage(e.target.value)}
                placeholder="e.g. /game-assets/starkight.webp or https://..."
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              />
              {/* Quick Pick Presets */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PRESET_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => setPushImage(img.url)}
                    className="text-[9px] px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/50 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    + {img.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[var(--muted)] mb-1 flex items-center gap-1">
                <FiTag size={11} />
                <span>Notification Tag (Replaces old push cleanly)</span>
              </label>
              <input
                type="text"
                value={pushTag}
                onChange={(e) => setPushTag(e.target.value)}
                placeholder="promo-broadcast"
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
              />
              <p className="text-[9px] text-[var(--muted)] mt-1">Notifications with the same tag overwrite older notifications without stacking.</p>
            </div>
          </div>

          {/* Live Preview Card */}
          {(pushTitle || pushBody || pushImage) && (
            <div className="mt-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50">
              <p className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] mb-2">Live Notification Preview (Android / PC)</p>
              <div className="max-w-sm rounded-xl bg-black border border-white/10 p-3 shadow-xl space-y-2">
                <div className="flex items-center gap-2">
                  <img src="/logoBB.png" alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[10px] font-bold text-gray-300">Blue Buff Topup</span>
                  <span className="text-[9px] text-gray-500 ml-auto">now</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{pushTitle || "Notification Title"}</p>
                  <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{pushBody || "Your message body text goes here..."}</p>
                </div>
                {pushImage && (
                  <div className="rounded-lg overflow-hidden border border-white/10 max-h-32 bg-black/50 flex items-center justify-center">
                    <img src={pushImage} alt="Promo" className="w-full h-auto max-h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
            </div>
          )}

          {pushResult && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${pushResult.type === "success" ? "bg-emerald-950/40 border border-emerald-500/30 text-emerald-400" : "bg-red-950/40 border border-red-500/30 text-red-400"}`}>
              {pushResult.type === "success" ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
              <span>{pushResult.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
              className="bg-[var(--accent)] text-black font-bold text-xs px-4 py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {pushSending ? (
                <>
                  <LoadingSpinner size="sm" color="current" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <FiSend size={12} />
                  <span>Send Broadcast Notification</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LineChart
          title={`Daily Installs — Last ${days} Days`}
          data={data.dailyInstalls}
          color="#ef4444"
          glow="rgba(239,68,68,0.25)"
        />
        <LineChart
          title={`Active Users — Last ${days} Days`}
          data={data.dailyActive}
          color="#22c55e"
          glow="rgba(34,197,94,0.25)"
        />
      </div>

      {/* ── Breakdowns ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BreakdownCard title="By Device"  rows={data.byDevice}  renderIcon={(id) => deviceIcon(id)} />
        <BreakdownCard title="By OS"      rows={data.byOS}      renderIcon={() => null} />
        <BreakdownCard title="By Browser" rows={data.byBrowser} renderIcon={() => null} />
      </div>

      {/* ── Push Subscribers List ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBell size={13} className="text-purple-400" />
            <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
              Active Push Subscribers ({data.pushSubscribers?.length ?? 0})
            </h3>
          </div>
          <span className="text-[10px] text-[var(--muted)]">Recent subscriptions</span>
        </div>
        {!data.pushSubscribers?.length ? (
          <p className="text-center text-[12px] text-[var(--muted)] py-8">No push subscribers yet</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {data.pushSubscribers.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
                    <FiBell size={13} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[var(--foreground)] truncate">
                      {item.user?.name || item.user?.email || (item.userId ? `User: ${item.userId}` : "Anonymous Device")}
                    </p>
                    <p className="text-[10px] text-[var(--muted)] truncate">
                      {deviceIcon(item.deviceType)} {item.os || "OS"} · {item.browser || "Browser"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                    <p className="text-[9px] text-[var(--muted)] mt-1">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {item.userId && (
                    <Link
                      href={`/owner-panal?tab=users&search=${item.userId}`}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors"
                      title="View user"
                    >
                      <FiExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Registered users who installed ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
            Registered Users Who Installed PWA
          </h3>
          <span className="text-[10px] text-[var(--muted)]">{data.installedUsers?.length ?? 0} found</span>
        </div>
        {!data.installedUsers?.length ? (
          <p className="text-center text-[12px] text-[var(--muted)] py-8">No registered users tracked yet</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {data.installedUsers.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0 text-[var(--accent)]">
                    {item.user?.avatar
                      ? <img src={item.user.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                      : <FiUser size={14} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-[var(--foreground)] truncate">
                      {item.user?.name || item.user?.email || item.userId}
                    </p>
                    <p className="text-[10px] text-[var(--muted)] truncate">
                      {item.user?.email || item.user?.phone || "—"} ·{" "}
                      <span className="text-[var(--accent)]">{item.user?.userType || "user"}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-[var(--muted)] flex items-center gap-1">
                      {deviceIcon(item.deviceType)} {item.os} · {item.browser}
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {item.userId && (
                    <Link
                      href={`/owner-panal?tab=users&search=${item.userId}`}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors"
                      title="View user"
                    >
                      <FiExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent installs ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">Recent Installs</h3>
        </div>
        {!data.recent?.length ? (
          <p className="text-center text-[12px] text-[var(--muted)] py-8">No installs yet</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {data.recent.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)]">{deviceIcon(item.deviceType)}</span>
                  <p className="text-[12px] font-bold text-[var(--foreground)]">
                    {item.os} · {item.browser}
                  </p>
                </div>
                <span className="text-[10px] text-[var(--muted)]">
                  {formatDateTime(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

/* ── Stat card ── */
function StatCard({ label, value, icon, color, glow, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] p-2.5 sm:p-4 ${className}`}
      style={{ boxShadow: `0 0 24px ${glow}` }}
    >
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: color }} />
      <div className="flex items-center sm:items-start justify-between gap-1.5 sm:gap-2">
        <div className="min-w-0">
          <p className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] leading-tight line-clamp-2 break-words">{label}</p>
          <p className="text-[15px] sm:text-2xl font-black mt-0.5 sm:mt-1 leading-none" style={{ color }}>{value}</p>
        </div>
        <div className="p-1 sm:p-2 rounded-md sm:rounded-lg shrink-0" style={{ background: glow, color }}>
          <div className="scale-75 sm:scale-100 origin-center">{icon}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Line chart (SVG-based) ── */
function LineChart({ title, data, color, glow }) {
  const max = Math.max(...(data?.map((d) => d.count) || [1]), 1);
  
  const points = (data || []).map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = 100 - (d.count / max) * 100;
    return `${x},${y}`;
  }).join(" ");
  
  const fillPoints = `0,100 ${points} 100,100`;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{title}</h3>
      </div>
      <div className="px-4 pt-4 pb-3">
        <div className="relative h-24 w-full">
          {/* SVG Area & Line */}
          <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={fillPoints} fill={`url(#gradient-${color.replace('#', '')})`} />
            <polyline 
              points={points} 
              fill="none" 
              stroke={color} 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ filter: `drop-shadow(0 2px 4px ${glow})` }} 
            />
          </svg>

          {/* Interactive Overlay for Tooltips */}
          <div className="absolute inset-0 flex items-end">
            {(data || []).map((d, i) => {
              const pct = Math.round((d.count / max) * 100);
              return (
                <div key={i} className="flex-1 h-full flex flex-col items-center justify-end group relative z-10 cursor-crosshair">
                  {/* Tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ color }}>
                    {d.count}
                  </div>
                  {/* Hover Marker Dot */}
                  <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-[var(--background)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none" style={{
                    background: color,
                    bottom: `${pct}%`,
                    transform: 'translateY(50%)',
                    boxShadow: `0 0 8px ${glow}`
                  }} />
                  {/* Hover Vertical Line */}
                  <div className="absolute top-0 bottom-0 w-px opacity-0 group-hover:opacity-10 pointer-events-none" style={{ background: color }} />
                </div>
              );
            })}
          </div>
        </div>
        {/* X-axis labels — show every nth */}
        <div className="flex gap-1.5 mt-2">
          {(data || []).map((d, i) => {
            const show = data.length <= 10 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1;
            return (
              <div key={i} className="flex-1 text-center">
                {show && (
                  <span className="text-[8px] text-[var(--muted)]">{d.date.slice(5)}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Breakdown card ── */
function BreakdownCard({ title, rows, renderIcon }) {
  const total = rows?.reduce((s, r) => s + r.count, 0) || 1;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">{title}</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {!rows?.length && (
          <p className="text-center text-[11px] text-[var(--muted)] py-5">No data</p>
        )}
        {rows?.map((row, i) => {
          const pct = Math.round((row.count / total) * 100);
          return (
            <div key={i} className="px-4 py-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--muted)]">{renderIcon(row._id)}</span>
                  <span className="text-[12px] font-bold text-[var(--foreground)] capitalize">{row._id || "Unknown"}</span>
                </div>
                <span className="text-[11px] font-black text-[var(--accent)]">{row.count}</span>
              </div>
              <div className="h-1 rounded-full bg-[var(--border)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
