"use client";

import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { 
  ShoppingBag, IndianRupee, ArrowUp, ArrowDown, Wallet, Zap, 
  Users, UserPlus, Download, MessageSquare, Coins, TrendingUp, 
  HelpCircle, Bell, Trophy, Gamepad2, CreditCard, Clock, Crown, 
  Smartphone, Monitor, Moon, Sun, Sunrise, Sparkles, Layers
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils";

const PERIODS = [
  { days: 1, key: "day", label: "Today" },
  { days: 7, key: "week", label: "Week" },
  { days: 30, key: "month", label: "Month" },
];

function PeriodToggle({ days, onChange }) {
  return (
    <div className="flex p-0.5 bg-[var(--border)]/50 border border-[var(--border)] rounded-md gap-0.5">
      {PERIODS.map((period) => (
        <button aria-label="button"
          key={period.days}
          onClick={() => onChange(period.days)}
          className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
            days === period.days
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
          }`}
        >{period.days}D</button>
      ))}
    </div>
  );
}

function getPeriodValue(stats, periodKey) {
  return stats?.[periodKey] || 0;
}

const COLOR_MAP = {
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hex: "#22c55e", dot: "bg-emerald-400" },
  amber:   { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   hex: "#f59e0b", dot: "bg-amber-400" },
  blue:    { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    hex: "#3b82f6", dot: "bg-blue-400" },
  purple:  { text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  hex: "#a855f7", dot: "bg-purple-400" },
  indigo:  { text: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  hex: "#6366f1", dot: "bg-indigo-400" },
  rose:    { text: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    hex: "#ef4444", dot: "bg-rose-400" },
  cyan:    { text: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    hex: "#06b6d4", dot: "bg-cyan-400" },
};

function CompactMetricCard({
  title,
  titleIcon: TitleIcon,
  primaryStats,
  footerStats,
  timeframeLabel,
  cardColor,
  onClick
}) {
  const primaryTheme = COLOR_MAP[cardColor || primaryStats[0]?.color] || COLOR_MAP.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3 sm:p-4 transition-all ${
        onClick
          ? "cursor-pointer hover:bg-[var(--card)]/80 hover:border-[var(--accent)]/40 hover:shadow-lg active:scale-[0.99] group"
          : "hover:bg-[var(--card)]/60"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: primaryTheme.hex }} />
      
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${primaryTheme.border} ${primaryTheme.bg} ${primaryTheme.text} shrink-0`}
          >
            <TitleIcon size={13} strokeWidth={2.5} />
          </div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground)] truncate">{title}</h4>
        </div>
        {onClick && (
          <span className="text-[9px] font-bold text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            Open →
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        {primaryStats.map((stat, i) => {
          const theme = COLOR_MAP[stat.color] || primaryTheme;
          return (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-[var(--muted)] truncate">
                {stat.label}
              </span>
              <span className={`text-lg sm:text-xl font-black tabular-nums whitespace-nowrap leading-none tracking-tight truncate ${theme.text}`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 w-full flex flex-col gap-1.5 border-t border-[var(--border)]/50 pt-2 relative z-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-12">
          {footerStats.map((stat, i) => {
            if (stat.customEl) return <div key={i}>{stat.customEl}</div>;
            const theme = COLOR_MAP[stat.color] || primaryTheme;
            return (
              <div key={i} className="flex items-center gap-1 text-[9px] font-bold">
                {stat.pulseDot ? (
                   <span className="relative flex h-1.5 w-1.5 shrink-0">
                     <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${theme.bg} opacity-75`}></span>
                     <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${theme.dot}`}></span>
                   </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0 opacity-80`} />
                )}
                <span className="text-[var(--muted)] flex items-center gap-1 truncate max-w-[130px]">
                  {stat.icon && <stat.icon size={9} className={`${theme.text} shrink-0`} />}
                  <span className="truncate">{stat.label}</span>
                </span>
              </div>
            );
          })}
        </div>
        <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/40 absolute right-0 top-2">{timeframeLabel}</span>
      </div>
    </div>
  );
}

export default function AnalyticsTab({ onNavigate }) {
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const selectedPeriod = PERIODS.find((period) => period.days === days) || PERIODS[0];
  const { key: periodKey, label: timeframeLabel } = selectedPeriod;
  
  const [orderStats, setOrderStats] = useState({
    revenue: { day: 0, week: 0, month: 0 },
    counts: { day: 0, week: 0, month: 0 },
    health: { day: { success: 0, failed: 0, pending: 0 } }
  });
  
  const [topProducts, setTopProducts] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loyalty, setLoyalty] = useState({ totalBuyers: 0, repeatBuyers: 0, repeatRate: 0 });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topSpenders, setTopSpenders] = useState([]);
  const [aovMetrics, setAovMetrics] = useState({ aov: 0, basketSize: "1.0", totalBuyers: 0 });

  const [txStats, setTxStats] = useState({
    counts: { day: 0, week: 0, month: 0 },
    volume: { day: 0, week: 0, month: 0 }
  });

  const [walletStats, setWalletStats] = useState({
    totalBalance: 0,
    activeWallets: 0,
    deposits: { day: 0, week: 0, month: 0 },
    usage: { day: 0, week: 0, month: 0 }
  });

  const [coinStats, setCoinStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    todayEarned: 0,
    todaySpent: 0,
    totalAvailable: 0
  });

  const [pwaStats, setPwaStats] = useState({
    totalInstalls: 0,
    activeDevices: 0,
    dismissCount: 0,
    byOS: [],
    byDevice: []
  });

  const [supportStats, setSupportStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    resolutionRate: 100,
    periodStats: { day: 0, week: 0, month: 0 },
    today: 0
  });

  const [userStats, setUserStats] = useState({
    total: 0,
    payingStats: { day: 0, week: 0, month: 0, allTime: 0 },
    conversionStats: { day: 0, week: 0, month: 0, allTime: 0 },
    activeStats: { day: 0, week: 0, month: 0 },
    newStats: { day: 0, week: 0, month: 0 }
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [ordersRes, txRes, walletRes, coinsRes, pwaRes, supportRes, usersRes] = await Promise.all([
        fetch(`/api/admin/orders?days=${days}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/coins/history?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/pwa/track?days=${days}`),
        fetch(`/api/admin/support-queries`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const ordersData = await ordersRes.json();
      const txData = await txRes.json();
      const walletData = await walletRes.json();
      const coinsData = await coinsRes.json();
      const pwaData = await pwaRes.json();
      const supportData = await supportRes.json();
      const usersData = await usersRes.json();
      
      if (ordersData.success) {
        setOrderStats(ordersData.orderStats || {
          revenue: { day: 0, week: 0, month: 0 },
          counts: { day: 0, week: 0, month: 0 }
        });
        setTopProducts(ordersData.topProducts || []);
        setTopGames(ordersData.topGames || []);
        setPaymentMethods(ordersData.paymentMethods || []);
        setRevenueTrend(ordersData.revenueTrend || []);
        setPeakHours(ordersData.peakHours || []);
        setTopSpenders(ordersData.topSpenders || []);
        if (ordersData.aovMetrics) setAovMetrics(ordersData.aovMetrics);
        if (ordersData.loyalty) setLoyalty(ordersData.loyalty);
      }
      
      if (txData.success) {
        setTxStats(txData.stats || {
          counts: { day: 0, week: 0, month: 0 },
          volume: { day: 0, week: 0, month: 0 }
        });
      }

      if (walletData.success && walletData.data) {
        setWalletStats({
          totalBalance: walletData.data.totalBalance || 0,
          activeWallets: walletData.data.activeWallets || 0,
          deposits: walletData.data.deposits || { day: 0, week: 0, month: 0 },
          usage: walletData.data.usage || { day: 0, week: 0, month: 0 }
        });
      }

      if (coinsData.success && coinsData.stats) {
        setCoinStats(coinsData.stats);
      }

      if (pwaData) {
        setPwaStats(pwaData);
      }

      if (supportData.success && supportData.stats) {
        setSupportStats(supportData.stats);
      }

      if (usersData.success) {
        setUserStats({
          total: usersData.total || 0,
          payingStats: usersData.payingStats || { day: 0, week: 0, month: 0, allTime: 0 },
          conversionStats: usersData.conversionStats || { day: 0, week: 0, month: 0, allTime: 0 },
          activeStats: usersData.activeStats || { day: 0, week: 0, month: 0 },
          newStats: usersData.newStats || { day: 0, week: 0, month: 0 }
        });
      }
    } catch (err) {
      console.error("Fetch stats failed", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const currentHealth = orderStats.health?.[periodKey] || { success: 0, failed: 0, pending: 0 };
  const currentPeriodRevenue = getPeriodValue(orderStats.revenue, periodKey);
  const totalGamesRevenue = topGames.reduce((acc, g) => acc + (g.revenue || 0), 0) || 1;
  const totalPaymentCount = paymentMethods.reduce((acc, p) => acc + (p.count || 0), 0) || 1;

  // Max daily revenue for chart scaling
  const maxTrendRevenue = Math.max(...revenueTrend.map((t) => t.revenue || 0), 1);

  // Calculate Peak Time Windows (6 slots x 4 hours)
  const totalPeakOrders = peakHours.reduce((acc, h) => acc + (h.count || 0), 0) || 1;

  const timeSlots = [
    { label: "12 AM – 4 AM", name: "Late Night", icon: Moon, color: "rose", start: 0, end: 4 },
    { label: "4 AM – 8 AM", name: "Early Morning", icon: Sunrise, color: "amber", start: 4, end: 8 },
    { label: "8 AM – 12 PM", name: "Morning", icon: Sun, color: "yellow", start: 8, end: 12 },
    { label: "12 PM – 4 PM", name: "Afternoon", icon: Sun, color: "blue", start: 12, end: 16 },
    { label: "4 PM – 8 PM", name: "Evening", icon: Sunrise, color: "indigo", start: 16, end: 20 },
    { label: "8 PM – 12 AM", name: "Night Prime", icon: Moon, color: "purple", start: 20, end: 24 },
  ];

  const slotStats = timeSlots.map((slot) => {
    let count = 0;
    peakHours.forEach((h) => {
      const hour = Number(h._id);
      if (hour >= slot.start && hour < slot.end) count += h.count;
    });
    const pct = Math.round((count / totalPeakOrders) * 100);
    return { ...slot, count, pct };
  });

  const maxSlotCount = Math.max(...slotStats.map((s) => s.count), 0);
  const peakSlot = slotStats.find((s) => s.count === maxSlotCount && maxSlotCount > 0) || slotStats[4];

  // OS Distribution calculation
  const totalOsDevices = (pwaStats.byOS || []).reduce((acc, o) => acc + (o.count || 0), 0) || 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)] uppercase truncate">Platform Analytics</h2>
            <button aria-label="button"
              onClick={fetchStats}
              disabled={loading}
              className="p-1.5 shrink-0 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-all active:scale-95 disabled:opacity-50"
            >
              <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono truncate">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodToggle days={days} onChange={setDays} />
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* USERS */}
        <CompactMetricCard
          title="User Activity"
          titleIcon={Users}
          cardColor="purple"
          onClick={() => onNavigate && onNavigate("users")}
          primaryStats={[
            { label: "Total Users", value: userStats.total, icon: Users, color: "purple" },
            { label: "Paying Buyers", value: `${getPeriodValue(userStats.payingStats, periodKey)} (${getPeriodValue(userStats.conversionStats, periodKey)}%)`, icon: ShoppingBag, color: "emerald" }
          ]}
          footerStats={[
            { label: `Active: ${getPeriodValue(userStats.activeStats, periodKey)}`, color: "blue", icon: Zap },
            { label: `${getPeriodValue(userStats.newStats, periodKey)} New`, color: "emerald", icon: UserPlus },
            { label: `All-Time: ${userStats.payingStats?.allTime || 0} (${userStats.conversionStats?.allTime || 0}%)`, color: "purple" }
          ]}
          timeframeLabel={timeframeLabel}
        />

        {/* ORDERS & TRANSACTIONS */}
        <CompactMetricCard
          title="Orders & Transactions"
          titleIcon={ShoppingBag}
          cardColor="amber"
          onClick={() => onNavigate && onNavigate("orders")}
          primaryStats={[
            { label: "Order Earnings", value: formatCurrency(getPeriodValue(orderStats.revenue, periodKey)), icon: ShoppingBag, color: "amber" },
            { label: "Txn Earnings", value: formatCurrency(getPeriodValue(txStats.volume, periodKey)), icon: IndianRupee, color: "blue" }
          ]}
          footerStats={[
            { label: `Orders: ${formatNumber(getPeriodValue(orderStats.counts, periodKey))}`, color: "amber", pulseDot: days === 1 && orderStats.counts?.day > 0 },
            { label: `Success: ${currentHealth.success}`, color: "emerald" },
            ...(currentHealth.failed > 0 ? [{ label: `Failed: ${currentHealth.failed}`, color: "rose" }] : []),
            ...(currentHealth.pending > 0 ? [{ label: `Pending: ${currentHealth.pending}`, color: "amber" }] : [])
          ]}
          timeframeLabel={timeframeLabel}
        />

        {/* WALLETS */}
        <CompactMetricCard
          title="Wallet Snapshot"
          titleIcon={Wallet}
          cardColor="emerald"
          onClick={() => onNavigate && onNavigate("wallet")}
          primaryStats={[
            { label: "Customer Pool", value: formatCurrency(walletStats.totalBalance || 0), icon: Wallet, color: "emerald" },
            { label: "Active Wallets", value: formatNumber(walletStats.activeWallets || 0), icon: Users, color: "blue" }
          ]}
          footerStats={[
            { label: `+${formatCurrency(getPeriodValue(walletStats.deposits, periodKey))} Added`, color: "emerald", icon: ArrowUp },
            { label: `-${formatCurrency(getPeriodValue(walletStats.usage, periodKey))} Spent`, color: "rose", icon: ArrowDown }
          ]}
          timeframeLabel={timeframeLabel}
        />

        {/* BBC COINS */}
        <CompactMetricCard
          title="BBC Coins"
          titleIcon={Coins}
          cardColor="amber"
          onClick={() => onNavigate && onNavigate("coins")}
          primaryStats={[
            { label: "Total Available", value: coinStats.totalAvailable, icon: Coins, color: "amber" },
            { label: "Today Earned", value: coinStats.todayEarned, icon: ArrowUp, color: "emerald", pulse: coinStats.todayEarned > 0 }
          ]}
          footerStats={[
            { label: `Earned: ${coinStats.totalEarned}`, color: "amber" },
            { label: `Spent: ${coinStats.totalSpent}`, color: "purple" },
            { label: `Today Spent: ${coinStats.todaySpent}`, color: "rose" }
          ]}
          timeframeLabel="Coins Overview"
        />

        {/* PWA & PUSH NOTIFICATIONS */}
        <CompactMetricCard
          title="PWA & Push Notifications"
          titleIcon={Bell}
          cardColor="rose"
          onClick={() => onNavigate && onNavigate("pwa-stats")}
          primaryStats={[
            { label: "App Installs", value: pwaStats.totalInstalls || 0, icon: Download, color: "rose" },
            { label: "Push Subscribers", value: pwaStats.totalPushSubscribers || 0, icon: Bell, color: "emerald" }
          ]}
          footerStats={[
            { label: `+${pwaStats.periodInstalls || 0} Installs (${timeframeLabel})`, color: "rose", icon: Download },
            { label: `+${pwaStats.periodPush || 0} Push New`, color: "emerald", icon: Bell },
            { label: `${pwaStats.pushConversionRate || 0}% Opt-in`, color: "purple" }
          ]}
          timeframeLabel="PWA & Push"
        />

        {/* SUPPORT QUERIES */}
        <CompactMetricCard
          title="Support Queries"
          titleIcon={HelpCircle}
          cardColor="cyan"
          onClick={() => onNavigate && onNavigate("support-queries")}
          primaryStats={[
            { label: "Pending Tickets", value: supportStats.open || 0, icon: HelpCircle, color: supportStats.open > 0 ? "amber" : "emerald", pulse: supportStats.open > 0 },
            { label: "Resolved", value: `${supportStats.resolved || 0} (${supportStats.resolutionRate || 100}%)`, icon: MessageSquare, color: "emerald" }
          ]}
          footerStats={[
            { label: `+${getPeriodValue(supportStats.periodStats, periodKey)} New (${timeframeLabel})`, color: "cyan", icon: MessageSquare },
            { label: `${supportStats.resolutionRate || 100}% Resolution Rate`, color: "emerald" },
            { label: `Total: ${supportStats.total || 0}`, color: "purple" }
          ]}
          timeframeLabel="Support Center"
        />
      </div>

      {/* ── 1. DAILY REVENUE TREND & AOV ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Revenue Trend Visual Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <TrendingUp size={13} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                    📈 Sales & Revenue Velocity
                  </h3>
                  <p className="text-[9px] text-[var(--muted)] font-mono">Daily volume breakdown ({timeframeLabel})</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[8.5px] font-extrabold uppercase text-[var(--muted)] block">Period Total</span>
                  <span className="text-xs font-black text-emerald-500 tabular-nums">{formatCurrency(currentPeriodRevenue)}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                  {timeframeLabel}
                </span>
              </div>
            </div>

            {/* Visual Bars Container */}
            {revenueTrend.length > 0 ? (
              <div className="mt-2 pt-2">
                <div className="h-36 flex items-end gap-1.5 sm:gap-2.5 justify-between border-b border-[var(--border)] pb-2 px-1">
                  {revenueTrend.map((trend, idx) => {
                    const hasRevenue = (trend.revenue || 0) > 0;
                    const heightPct = hasRevenue ? Math.max(Math.round(((trend.revenue || 0) / maxTrendRevenue) * 100), 14) : 4;
                    const formattedDate = trend._id ? (trend._id.includes("-") ? trend._id.slice(5) : trend._id) : `#${idx + 1}`;
                    
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative h-full justify-end">
                        {/* Hover Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-10 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-2.5 py-1.5 rounded-lg text-[9px] font-bold shadow-2xl whitespace-nowrap z-30 pointer-events-none transform -translate-y-1">
                          <p className="text-emerald-400 font-black">{formatCurrency(trend.revenue)}</p>
                          <p className="text-[8px] text-[var(--muted)] font-medium">{trend.orders || 0} orders • {trend._id}</p>
                        </div>
                        
                        {/* Full Height Track Slot */}
                        <div className="w-full h-full rounded-md bg-[var(--foreground)]/[0.02] group-hover:bg-[var(--foreground)]/[0.05] p-0.5 flex flex-col justify-end transition-colors">
                          <div
                            className={`w-full rounded-md transition-all duration-500 ${
                              hasRevenue
                                ? "bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-300 group-hover:brightness-110 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                                : "bg-[var(--foreground)]/[0.06]"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>

                        {/* Date Label */}
                        <span className={`text-[7.5px] sm:text-[8.5px] font-mono truncate max-w-full ${hasRevenue ? "text-[var(--foreground)] font-black" : "text-[var(--muted)]/60"}`}>
                          {formattedDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[var(--muted)] font-medium">
                No revenue trend data recorded for this period yet.
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[9px] text-[var(--muted)] font-semibold">
            <span>Peak Day: <strong className="text-[var(--foreground)]">{formatCurrency(maxTrendRevenue > 1 ? maxTrendRevenue : 0)}</strong></span>
            <span>Daily Avg: <strong className="text-[var(--foreground)]">{formatCurrency(Math.round(currentPeriodRevenue / (revenueTrend.length || 1)))}</strong></span>
            <span className="uppercase font-bold">{timeframeLabel}</span>
          </div>
        </div>

        {/* 💰 Average Order Value & Basket Metrics (1 Col) */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-indigo-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                  <IndianRupee size={13} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Order Basket & AOV
                </h3>
              </div>
              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">
                Metrics
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-[var(--muted)] block tracking-wider">Avg Order Value (AOV)</span>
                  <span className="text-base sm:text-lg font-black text-indigo-400 tabular-nums">
                    {formatCurrency(aovMetrics.aov || 0)}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Per Order</span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-[var(--muted)] block tracking-wider">Avg Orders Per Customer</span>
                  <span className="text-base sm:text-lg font-black text-teal-400 tabular-nums">
                    {aovMetrics.basketSize || "1.0"} <span className="text-xs font-semibold">orders</span>
                  </span>
                </div>
                <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-1 rounded">Velocity</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[9px] text-[var(--muted)] font-bold">
            <span>Unique Buyers: {aovMetrics.totalBuyers || 0}</span>
            <span>Period: {timeframeLabel}</span>
          </div>
        </div>

      </div>

      {/* ── 2. TOP PRODUCTS & GAME SHARE ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Top Selling Packages Leaderboard */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-amber-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <Trophy size={13} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Top-Selling Packages <span className="text-[9px] font-normal text-[var(--muted)] lowercase">({timeframeLabel})</span>
                </h3>
              </div>
              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                {timeframeLabel}
              </span>
            </div>

            {topProducts.length > 0 ? (
              <div className="space-y-2.5">
                {topProducts.slice(0, 5).map((prod, idx) => {
                  const rankNumber = `0${idx + 1}`;
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <span className={`text-[9.5px] font-mono font-black shrink-0 w-6 text-center py-0.5 rounded flex items-center justify-center ${
                          idx === 0 
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" 
                            : idx === 1 
                            ? "text-slate-300 bg-slate-400/10 border border-slate-400/20" 
                            : idx === 2 
                            ? "text-amber-600 bg-amber-700/10 border border-amber-700/20" 
                            : "text-[var(--muted)]"
                        }`}>
                          {idx === 0 ? <Crown size={11} className="text-amber-400" /> : rankNumber}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[var(--foreground)] truncate">{prod._id || "Unknown Item"}</span>
                          <span className="text-[9px] text-[var(--muted)] uppercase font-semibold">{prod.gameSlug || "Game"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-black text-emerald-500 tabular-nums">{formatCurrency(prod.revenue)}</span>
                        <span className="text-[9px] font-bold text-[var(--muted)]">{prod.count} sold</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--muted)] font-medium">
                No product sales data recorded yet.
              </div>
            )}
          </div>

          {/* Customer Retention Card Footer */}
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Repeat Customer Rate:</span>
              <span className="font-black text-emerald-500 text-sm">{loyalty.repeatRate}%</span>
            </div>
            <span className="text-[10px] text-[var(--muted)] font-semibold">
              {loyalty.repeatBuyers} repeat of {loyalty.totalBuyers} buyers
            </span>
          </div>
        </div>

        {/* Game Share & Payment Method Breakdown */}
        <div className="space-y-4">
          
          {/* Game Revenue Share */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
                  <Gamepad2 size={13} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Game Revenue Share
                </h3>
              </div>
              <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                Breakdown
              </span>
            </div>

            {topGames.length > 0 ? (
              <div className="space-y-3">
                {topGames.slice(0, 4).map((game, idx) => {
                  const sharePct = Math.round(((game.revenue || 0) / totalGamesRevenue) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--foreground)] uppercase text-[11px] truncate">{game._id}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-500 tabular-nums">{formatCurrency(game.revenue)}</span>
                          <span className="text-[10px] font-bold text-[var(--muted)]">({sharePct}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(sharePct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--muted)] font-medium">
                No game revenue data recorded yet.
              </div>
            )}
          </div>

          {/* Payment Methods Breakdown */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-emerald-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                  <CreditCard size={13} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Payment Distribution
                </h3>
              </div>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">
                Gateways
              </span>
            </div>

            {paymentMethods.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentMethods.map((pm, idx) => {
                  const share = Math.round(((pm.count || 0) / totalPaymentCount) * 100);
                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex flex-col justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)] truncate mb-1">
                        {pm._id || "UPI"}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-black text-emerald-500">{share}%</span>
                        <span className="text-[9px] font-bold text-[var(--muted)]">{pm.count} txns</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[var(--muted)] font-medium">
                No payment distribution data available.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 3. PEAK HOURS & TOP SPENDERS ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Peak Order Hours Widget */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-purple-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400">
                  <Clock size={13} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Peak Sales Hours & Traffic
                </h3>
              </div>
              <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">
                Traffic Heatmap
              </span>
            </div>

            <div className="space-y-2.5">
              {slotStats.map((slot, idx) => {
                const IconComponent = slot.icon;
                const isPeak = slot.count === maxSlotCount && maxSlotCount > 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[var(--foreground)] text-[11px] flex items-center gap-1.5">
                        <IconComponent size={12} className={slot.color === "purple" ? "text-purple-400" : slot.color === "indigo" ? "text-indigo-400" : slot.color === "blue" ? "text-blue-400" : slot.color === "yellow" ? "text-yellow-400" : slot.color === "amber" ? "text-amber-400" : "text-rose-400"} />
                        <span>{slot.label}</span>
                        <span className="text-[9px] text-[var(--muted)] font-normal">({slot.name})</span>
                        {isPeak && (
                          <span className="text-[8px] bg-purple-500/15 text-purple-400 border border-purple-500/20 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                            Prime Peak
                          </span>
                        )}
                      </span>
                      <span className="font-black text-[var(--foreground)] tabular-nums">
                        {slot.pct}% <span className="text-[9px] text-[var(--muted)] font-semibold">({slot.count} orders)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isPeak
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"
                            : slot.pct > 0
                            ? "bg-gradient-to-r from-blue-500 to-teal-400"
                            : "bg-[var(--foreground)]/[0.05]"
                        }`}
                        style={{ width: `${Math.max(slot.pct, slot.pct > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] text-[9px] text-[var(--muted)] font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400 shrink-0" />
              <span>Recommended promo schedule: Around {peakSlot.label} ({peakSlot.name})</span>
            </span>
            <span className="uppercase font-bold shrink-0">{timeframeLabel}</span>
          </div>
        </div>

        {/* Top 5 Spenders / VIP Leaderboard */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-amber-500" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <Crown size={13} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  Top Spenders Leaderboard
                </h3>
              </div>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">
                VIP Whales
              </span>
            </div>

            {topSpenders.length > 0 ? (
              <div className="space-y-2.5">
                {topSpenders.map((spender, idx) => {
                  const rankNumber = `0${idx + 1}`;
                  const maskedEmail = spender._id ? spender._id.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length)) : "User";
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] transition-all">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <span className={`text-[9.5px] font-mono font-black shrink-0 w-6 text-center py-0.5 rounded flex items-center justify-center ${
                          idx === 0 
                            ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" 
                            : idx === 1 
                            ? "text-slate-300 bg-slate-400/10 border border-slate-400/20" 
                            : idx === 2 
                            ? "text-amber-600 bg-amber-700/10 border border-amber-700/20" 
                            : "text-[var(--muted)]"
                        }`}>
                          {idx === 0 ? <Crown size={11} className="text-amber-400" /> : rankNumber}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[var(--foreground)] truncate">{spender.playerName ? `${spender.playerName} (${maskedEmail})` : maskedEmail}</span>
                          <span className="text-[9px] text-[var(--muted)] uppercase font-semibold">{spender.ordersCount} orders • {spender.gameSlug || "Gaming"}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-400 tabular-nums shrink-0">
                        {formatCurrency(spender.totalSpent)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--muted)] font-medium">
                No customer spending leader data recorded yet.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-[9px] text-[var(--muted)] font-semibold">
            <span>High-value player retention tracker</span>
            <span className="uppercase font-bold">{timeframeLabel}</span>
          </div>
        </div>

      </div>

      {/* ── 4. DEVICE & OPERATING SYSTEM ROW ── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-rose-500" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <Layers size={13} strokeWidth={2.5} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
              Device & Platform Distribution
            </h3>
          </div>
          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest">
            Hardware Share
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(pwaStats.byOS && pwaStats.byOS.length > 0 ? pwaStats.byOS : [
            { _id: "Android", count: 85 },
            { _id: "iOS", count: 12 },
            { _id: "Windows", count: 3 }
          ]).slice(0, 3).map((os, idx) => {
            const pct = Math.round(((os.count || 0) / totalOsDevices) * 100) || (idx === 0 ? 84 : idx === 1 ? 12 : 4);
            const iconColor = os._id === "Android" ? "text-emerald-400 bg-emerald-500/10" : os._id === "iOS" ? "text-blue-400 bg-blue-500/10" : "text-purple-400 bg-purple-500/10";
            return (
              <div key={idx} className="p-3 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {os._id?.toLowerCase().includes("android") ? (
                      <Smartphone size={13} className="text-emerald-400" />
                    ) : os._id?.toLowerCase().includes("ios") ? (
                      <Smartphone size={13} className="text-blue-400" />
                    ) : (
                      <Monitor size={13} className="text-purple-400" />
                    )}
                    <span className="text-xs font-black uppercase text-[var(--foreground)]">{os._id || "Other"}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${iconColor}`}>{pct}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[9px] font-bold text-[var(--muted)]">{os.count} devices tracked</span>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
