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

function CompactMetricCard({
  title,
  titleIcon: TitleIcon,
  primaryStats,
  footerStats,
  timeframeLabel
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:p-4 hover:bg-[var(--foreground)]/[0.01] transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] shrink-0">
          <TitleIcon size={12} strokeWidth={2.5} />
        </div>
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)] truncate">{title}</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        {primaryStats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded border border-[var(--border)] bg-[var(--background)] shrink-0 text-[var(--muted)]">
                <stat.icon size={10} strokeWidth={2.5} />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)] truncate">{stat.label}</span>
            </div>
            <span className="text-lg font-black tabular-nums whitespace-nowrap text-[var(--foreground)] leading-none truncate">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 w-full flex flex-col gap-1.5 border-t border-[var(--border)]/50 pt-2 relative z-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pr-10">
          {footerStats.map((stat, i) => {
            if (stat.customEl) return <div key={i}>{stat.customEl}</div>;
            return (
              <div key={i} className="flex items-center gap-1 text-[9px] font-bold">
                {stat.pulseDot ? (
                   <span className="relative flex h-1.5 w-1.5 shrink-0">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--foreground)] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--foreground)]"></span>
                   </span>
                ) : (
                  <span className="w-1 h-1 rounded-sm bg-[var(--muted)] shrink-0" />
                )}
                <span className="text-[var(--muted)] flex items-center gap-1 truncate max-w-[120px]">
                  {stat.icon && <stat.icon size={8} className="shrink-0" />}
                  <span className="truncate">{stat.label}</span>
                </span>
              </div>
            );
          })}
        </div>
        <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/30 absolute right-0 top-2">{timeframeLabel}</span>
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
          primaryStats={[
            { label: "Total Users", value: userStats.total, icon: Users, color: "purple" },
            { label: "Active Users", value: getPeriodValue(userStats.activeStats, periodKey), icon: Zap, color: "blue" }
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
          primaryStats={[
            { label: "Money Added", value: formatCurrency(getPeriodValue(walletStats.deposits, periodKey)), icon: ArrowUp, color: "emerald", pulse: days === 1 && walletStats.deposits?.day > 0 },
            { label: "Money Spent", value: formatCurrency(getPeriodValue(walletStats.usage, periodKey)), icon: ArrowDown, color: "purple", pulse: days === 1 && walletStats.usage?.day > 0 }
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
          primaryStats={[
            { label: "Total Available", value: coinStats.totalAvailable, icon: Coins, color: "blue" },
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
          primaryStats={[
            { label: "Total Installs", value: pwaStats.totalInstalls || 0, icon: Download, color: "emerald" },
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
