"use client";

import { useState, useEffect, useCallback } from "react";
import { FiRefreshCw, FiGift } from "react-icons/fi";
import { ShoppingBag, IndianRupee, ArrowUp, ArrowDown, Wallet, Zap, Users, UserPlus, Download, MessageSquare, Send, Coins, Ticket, TrendingUp, HelpCircle, Mail } from "lucide-react";
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
  cardColor
}) {
  const primaryTheme = COLOR_MAP[cardColor || primaryStats[0]?.color] || COLOR_MAP.indigo;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3 sm:p-4 hover:bg-[var(--card)]/60 transition-colors">
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: primaryTheme.hex }} />
      
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`p-1.5 rounded-lg border ${primaryTheme.border} ${primaryTheme.bg} ${primaryTheme.text} shrink-0`}
        >
          <TitleIcon size={13} strokeWidth={2.5} />
        </div>
        <h4 className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground)] truncate">{title}</h4>
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

export default function AnalyticsTab() {
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const selectedPeriod = PERIODS.find((period) => period.days === days) || PERIODS[0];
  const { key: periodKey, label: timeframeLabel } = selectedPeriod;
  
  const [orderStats, setOrderStats] = useState({
    revenue: { day: 0, week: 0, month: 0 },
    counts: { day: 0, week: 0, month: 0 }
  });
  
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

  const [redeemStats, setRedeemStats] = useState({
    total: 0,
    totalUsed: 0
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
    dismissCount: 0
  });

  const [supportStats, setSupportStats] = useState({
    total: 0,
    open: 0,
    today: 0
  });

  const [userStats, setUserStats] = useState({
    total: 0,
    activeStats: { day: 0, week: 0, month: 0 },
    newStats: { day: 0, week: 0, month: 0 }
  });

  const [promoStats, setPromoStats] = useState({
    todayEmails: 0,
    totalEmails: 0
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [ordersRes, txRes, walletRes, redeemRes, coinsRes, pwaRes, supportRes, usersRes, promoRes] = await Promise.all([
        fetch(`/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/redeem-codes?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/coins/history?limit=1`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/pwa/track?days=${days}`),
        fetch(`/api/admin/support-queries`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/admin/promo-mail/stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const ordersData = await ordersRes.json();
      const txData = await txRes.json();
      const walletData = await walletRes.json();
      const redeemData = await redeemRes.json();
      const coinsData = await coinsRes.json();
      const pwaData = await pwaRes.json();
      const supportData = await supportRes.json();
      const usersData = await usersRes.json();
      const promoData = await promoRes.json();
      
      if (ordersData.success) {
        setOrderStats(ordersData.orderStats || {
          revenue: { day: 0, week: 0, month: 0 },
          counts: { day: 0, week: 0, month: 0 }
        });
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

      if (redeemData.success && redeemData.summary) {
        setRedeemStats(redeemData.summary);
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
          activeStats: usersData.activeStats || { day: 0, week: 0, month: 0 },
          newStats: usersData.newStats || { day: 0, week: 0, month: 0 }
        });
      }

      if (promoData.success && promoData.stats) {
        setPromoStats(promoData.stats);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        
        {/* USERS */}
        <CompactMetricCard
          title="User Activity"
          titleIcon={Users}
          cardColor="purple"
          primaryStats={[
            { label: "Total Users", value: userStats.total, icon: Users, color: "purple" },
            { label: "Active Users", value: getPeriodValue(userStats.activeStats, periodKey), icon: Zap, color: "emerald" }
          ]}
          footerStats={[
            { label: "All Time", color: "purple" },
            { label: `${getPeriodValue(userStats.newStats, periodKey)} New`, color: "emerald", icon: UserPlus }
          ]}
          timeframeLabel={timeframeLabel}
        />

        {/* ORDERS & TRANSACTIONS */}
        <CompactMetricCard
          title="Orders & Transactions"
          titleIcon={ShoppingBag}
          cardColor="amber"
          primaryStats={[
            { label: "Order Earnings", value: formatCurrency(getPeriodValue(orderStats.revenue, periodKey)), icon: ShoppingBag, color: "amber" },
            { label: "Txn Earnings", value: formatCurrency(getPeriodValue(txStats.volume, periodKey)), icon: IndianRupee, color: "blue" }
          ]}
          footerStats={[
            { label: `Orders: ${formatNumber(getPeriodValue(orderStats.counts, periodKey))}`, color: "amber", pulseDot: days === 1 && orderStats.counts?.day > 0 },
            { label: `Txns: ${formatNumber(getPeriodValue(txStats.counts, periodKey))}`, color: "blue", pulseDot: days === 1 && txStats.counts?.day > 0 }
          ]}
          timeframeLabel={timeframeLabel}
        />

        {/* WALLETS */}
        <CompactMetricCard
          title="Wallet Snapshot"
          titleIcon={Wallet}
          cardColor="emerald"
          primaryStats={[
            { label: "Money Added", value: formatCurrency(getPeriodValue(walletStats.deposits, periodKey)), icon: ArrowUp, color: "emerald", pulse: days === 1 && walletStats.deposits?.day > 0 },
            { label: "Money Spent", value: formatCurrency(getPeriodValue(walletStats.usage, periodKey)), icon: ArrowDown, color: "rose", pulse: days === 1 && walletStats.usage?.day > 0 }
          ]}
          footerStats={[
            { label: `Customer Pool: ${formatCurrency(walletStats.totalBalance || 0)}`, color: "blue" },
            { label: `Active Wallets: ${formatNumber(walletStats.activeWallets || 0)}`, color: "amber" }
          ]}
          timeframeLabel={timeframeLabel}
        />

        {/* REDEEM CODES */}
        <CompactMetricCard
          title="Redeem Codes"
          titleIcon={FiGift}
          cardColor="indigo"
          primaryStats={[
            { label: "Total Codes", value: redeemStats.total, icon: Ticket, color: "indigo" },
            { label: "Available Codes", value: redeemStats.total - redeemStats.totalUsed, icon: FiGift, color: "amber" }
          ]}
          footerStats={[
            { label: `Claimed: ${redeemStats.totalUsed}`, color: "emerald" }
          ]}
          timeframeLabel="All Time"
        />

        {/* COINS */}
        <CompactMetricCard
          title="BBC Coins"
          titleIcon={Coins}
          cardColor="amber"
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

        {/* PWA STATS */}
        <CompactMetricCard
          title="PWA Installs"
          titleIcon={Download}
          cardColor="rose"
          primaryStats={[
            { label: "Total Installs", value: pwaStats.totalInstalls || 0, icon: Download, color: "rose" },
            { label: "Conversion Rate", value: `${(pwaStats.totalInstalls || 0) + (pwaStats.dismissCount || 0) > 0 ? Math.round(((pwaStats.totalInstalls || 0) / ((pwaStats.totalInstalls || 0) + (pwaStats.dismissCount || 0))) * 100) : 0}%`, icon: TrendingUp, color: "purple" }
          ]}
          footerStats={[
            { label: `${timeframeLabel}: ${pwaStats.periodInstalls || 0}`, color: "indigo" },
            { label: `Active Devices: ${pwaStats.activeDevices || 0}`, color: "blue" },
            { label: `Dismissed: ${pwaStats.dismissCount || 0}`, color: "amber" }
          ]}
          timeframeLabel="PWA Snapshot"
        />

        {/* SUPPORT QUERIES */}
        <CompactMetricCard
          title="Support Queries"
          titleIcon={HelpCircle}
          cardColor="cyan"
          primaryStats={[
            { label: "Pending Queries", value: supportStats.open || 0, icon: HelpCircle, color: "amber", pulse: supportStats.open > 0 },
            { label: "Today's Queries", value: supportStats.today || 0, icon: MessageSquare, color: "purple", pulse: supportStats.today > 0 }
          ]}
          footerStats={[
            { label: `Total Queries: ${supportStats.total || 0}`, color: "rose" }
          ]}
          timeframeLabel="Support Snapshot"
        />

        {/* PROMO MAIL */}
        <CompactMetricCard
          title="Promo Mail"
          titleIcon={Mail}
          cardColor="blue"
          primaryStats={[
            { label: "Mails Today", value: promoStats.todayEmails || 0, icon: Send, color: "emerald" },
            { label: "Total Reach", value: promoStats.totalEmails || 0, icon: Mail, color: "amber" }
          ]}
          footerStats={[
            { label: `Database: ${userStats.total || 0}`, color: "purple" },
            { label: `External: 0`, color: "blue" }
          ]}
          timeframeLabel="Promo Snapshot"
        />
      </div>
      
    </div>
  );
}
