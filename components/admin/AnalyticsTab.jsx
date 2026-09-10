"use client";

// Analytics & Insights Tab
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FiRefreshCw, FiCalendar, FiArrowRight } from "react-icons/fi";
import { 
  ArrowUp, ArrowDown, Wallet, 
  Users, Smartphone, Trophy, Gamepad2, CreditCard, Clock, Crown, 
  Moon, Sun, Sunrise,
  Sparkles, MessageSquare, BarChart3, Coins, Bell, ChevronRight,
  UserPlus, UserCheck, Zap, Activity
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/utils";

const PERIODS = [
  { id: "today", days: 1, key: "day", label: "Today" },
  { id: "yesterday", days: 1, key: "yesterday", label: "Yesterday" },
  { id: "week", days: 7, key: "week", label: "7 Days" },
  { id: "month", days: 30, key: "month", label: "30 Days" },
  { id: "this_month", days: 30, key: "this_month", label: "This Month" },
  { id: "custom", days: 0, key: "custom", label: "Custom Range" },
];

function PeriodToggle({ periodId, onSelect, onOpenCustom }) {
  return (
    <div className="flex flex-wrap items-center p-0.5 bg-[var(--foreground)]/[0.04] border border-[var(--border)]/80 rounded-lg gap-0.5">
      {PERIODS.map((period) => (
        <button
          aria-label={period.label}
          key={period.id}
          onClick={() => {
            if (period.id === "custom") {
              onOpenCustom();
            } else {
              onSelect(period.id);
            }
          }}
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
            periodId === period.id
              ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
              : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
          }`}
        >
          {period.id === "custom" && <FiCalendar size={10} />}
          <span>{period.label}</span>
        </button>
      ))}
    </div>
  );
}

function getPeriodValue(stats, periodKey) {
  if (!stats) return 0;
  if (periodKey === "selected" && stats.selected !== undefined) return stats.selected;
  return stats[periodKey] || stats.day || 0;
}

function PercentBadge({ value, suffix = "%", label, invert = false, showNeutral = true }) {
  if (value === undefined || value === null || (value === 0 && !showNeutral)) return null;
  const num = typeof value === "number" ? value : parseFloat(value) || 0;
  const isPositive = invert ? num < 0 : num > 0;
  const isZero = num === 0;
  
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight ${
        isZero
          ? "bg-[var(--foreground)]/[0.05] text-[var(--muted)]"
          : isPositive
          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
      }`}
    >
      {!isZero && (isPositive ? <ArrowUp size={9} strokeWidth={2.5} /> : <ArrowDown size={9} strokeWidth={2.5} />)}
      <span>{isPositive && !isZero ? "+" : ""}{num}{suffix}</span>
      {label && <span className="opacity-70 font-normal ml-0.5">{label}</span>}
    </span>
  );
}

export default function AnalyticsTab({ onNavigate }) {
  const [periodId, setPeriodId] = useState("today");
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempDates, setTempDates] = useState({ startDate: "", endDate: "" });

  const [loading, setLoading] = useState(false);
  const selectedPeriod = PERIODS.find((p) => p.id === periodId) || PERIODS[0];
  const { key: periodKey, label: timeframeLabel, days } = selectedPeriod;
  
  const [orderStats, setOrderStats] = useState({
    revenue: { day: 0, week: 0, month: 0, selected: 0 },
    counts: { day: 0, week: 0, month: 0, selected: 0 },
    health: { day: { success: 0, failed: 0, pending: 0 }, selected: { success: 0, failed: 0, pending: 0 } }
  });
  
  const [buyerSplit, setBuyerSplit] = useState({
    newBuyers: { count: 0, orders: 0, revenue: 0, sharePct: 0 },
    returningBuyers: { count: 0, orders: 0, revenue: 0, sharePct: 0 },
    totalBuyers: 0,
    repeatRate: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [totalActivityCount, setTotalActivityCount] = useState(0);

  const [topProducts, setTopProducts] = useState([]);
  const [topGames, setTopGames] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loyalty, setLoyalty] = useState({ totalBuyers: 0, repeatBuyers: 0, repeatRate: 0 });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState(null);
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
    totalPushSubscribers: 0,
    periodPush: 0,
    byOS: [],
    byDevice: []
  });

  const [platformStats, setPlatformStats] = useState({
    pwa: { revenue: 0, orders: 0, success: 0, failed: 0, pending: 0, aov: 0, revenueShare: 0, orderShare: 0, successRate: 0 },
    web: { revenue: 0, orders: 0, success: 0, failed: 0, pending: 0, aov: 0, revenueShare: 0, orderShare: 0, successRate: 0 },
    allTime: { pwaRevenue: 0, pwaOrders: 0, pwaSuccess: 0, webRevenue: 0, webOrders: 0, webSuccess: 0 }
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

  const cacheRef = useRef({});
  const initialLoadedRef = useRef(false);

  // 1. Fetch Global / Platform-wide stats (users, support, wallet, coins, activity)
  const fetchGlobalStats = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || "") : "";
      const adminPin = typeof window !== "undefined" ? (sessionStorage.getItem("adminPin") || "") : "";
      const authHeaders = { Authorization: `Bearer ${token}`, "x-admin-pin": adminPin };

      const [txRes, walletRes, coinsRes, supportRes, usersRes, activityRes] = await Promise.all([
        fetch(`/api/admin/transactions`, { headers: authHeaders }),
        fetch(`/api/admin/stats`, { headers: authHeaders }),
        fetch(`/api/admin/coins/history?limit=1`, { headers: authHeaders }),
        fetch(`/api/admin/support-queries`, { headers: authHeaders }),
        fetch(`/api/admin/users`, { headers: authHeaders }),
        fetch(`/api/admin/activity?limit=10`, { headers: authHeaders }),
      ]);

      const txData = await txRes.json().catch(() => ({}));
      const walletData = await walletRes.json().catch(() => ({}));
      const coinsData = await coinsRes.json().catch(() => ({}));
      const supportData = await supportRes.json().catch(() => ({}));
      const usersData = await usersRes.json().catch(() => ({}));
      const activityData = await activityRes.json().catch(() => ({}));

      if (activityData && activityData.success) {
        setRecentActivity(activityData.events || []);
        setTotalActivityCount(activityData.total || 0);
      }

      if (txData && txData.success) {
        setTxStats(txData.stats || txData.txStats || { counts: { day: 0, week: 0, month: 0 }, volume: { day: 0, week: 0, month: 0 } });
      }

      if (walletData && walletData.success) {
        const wInfo = walletData.walletStats || walletData.data || {};
        setWalletStats({
          totalBalance: wInfo.totalBalance || 0,
          activeWallets: wInfo.activeWallets || 0,
          deposits: wInfo.deposits || { day: 0, week: 0, month: 0 },
          usage: wInfo.usage || { day: 0, week: 0, month: 0 }
        });
      }

      if (coinsData && coinsData.success) {
        setCoinStats(coinsData.coinStats || { totalEarned: 0, totalSpent: 0, todayEarned: 0, todaySpent: 0, totalAvailable: 0 });
      }

      if (supportData && supportData.success) {
        setSupportStats(supportData.supportStats || { total: 0, open: 0, resolved: 0, resolutionRate: 100, periodStats: { day: 0, week: 0, month: 0 }, today: 0 });
      }

      if (usersData && usersData.success) {
        setUserStats({
          total: usersData.total || 0,
          payingStats: usersData.payingStats || { day: 0, week: 0, month: 0, allTime: 0 },
          conversionStats: usersData.conversionStats || { day: 0, week: 0, month: 0, allTime: 0 },
          activeStats: usersData.activeStats || { day: 0, week: 0, month: 0 },
          newStats: usersData.newStats || { day: 0, week: 0, month: 0 }
        });
      }
    } catch (err) {
      console.error("Global stats fetch failed", err);
    }
  }, []);

  // 2. Fetch Period-Specific stats (Orders & PWA by timeframe) with instant cache
  const fetchPeriodStats = useCallback(async (force = false) => {
    const cacheKey = `${periodId}_${customRange.startDate}_${customRange.endDate}`;
    
    // Check if we have cached data for instantaneous display
    if (!force && cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      if (cached.orderStats) setOrderStats(cached.orderStats);
      if (cached.buyerSplit) setBuyerSplit(cached.buyerSplit);
      setTopProducts(cached.topProducts || []);
      setTopGames(cached.topGames || []);
      setPaymentMethods(cached.paymentMethods || []);
      setRevenueTrend(cached.revenueTrend || []);
      setPeakHours(cached.peakHours || []);
      setTopSpenders(cached.topSpenders || []);
      if (cached.aovMetrics) setAovMetrics(cached.aovMetrics);
      if (cached.loyalty) setLoyalty(cached.loyalty);
      if (cached.platformStats) setPlatformStats(cached.platformStats);
      if (cached.pwaStats) setPwaStats(cached.pwaStats);
      return;
    }

    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? (localStorage.getItem("token") || "") : "";
      const adminPin = typeof window !== "undefined" ? (sessionStorage.getItem("adminPin") || "") : "";
      const authHeaders = { Authorization: `Bearer ${token}`, "x-admin-pin": adminPin };

      const ordersParams = new URLSearchParams({
        period: periodId,
        days: (days || 1).toString(),
      });
      if (periodId === "custom" && customRange.startDate && customRange.endDate) {
        ordersParams.append("startDate", customRange.startDate);
        ordersParams.append("endDate", customRange.endDate);
      }

      const pwaDays = days || 1;

      const [ordersRes, pwaRes] = await Promise.all([
        fetch(`/api/admin/orders?${ordersParams.toString()}`, { headers: authHeaders }),
        fetch(`/api/pwa/track?days=${pwaDays}`, { headers: authHeaders }),
      ]);

      const ordersData = await ordersRes.json().catch(() => ({}));
      const pwaData = await pwaRes.json().catch(() => ({}));

      let pwaState = null;
      if (pwaData) {
        pwaState = {
          totalInstalls: pwaData.totalInstalls || pwaData.pwaStats?.totalInstalls || 0,
          activeDevices: pwaData.totalActive || pwaData.pwaStats?.activeDevices || 0,
          dismissCount: pwaData.dismissCount || pwaData.pwaStats?.dismissCount || 0,
          totalPushSubscribers: pwaData.totalPushSubscribers || pwaData.pwaStats?.totalPushSubscribers || 0,
          periodPush: pwaData.periodPush || pwaData.pwaStats?.periodPush || 0,
          byOS: pwaData.byOS || pwaData.pwaStats?.byOS || [],
          byDevice: pwaData.byDevice || pwaData.pwaStats?.byDevice || []
        };
        setPwaStats(pwaState);
      }

      if (ordersData && ordersData.success) {
        if (ordersData.orderStats) setOrderStats(ordersData.orderStats);
        if (ordersData.buyerSplit) setBuyerSplit(ordersData.buyerSplit);
        setTopProducts(ordersData.topProducts || []);
        setTopGames(ordersData.topGames || []);
        setPaymentMethods(ordersData.paymentMethods || []);
        setRevenueTrend(ordersData.revenueTrend || []);
        setPeakHours(ordersData.peakHours || []);
        setTopSpenders(ordersData.topSpenders || []);
        if (ordersData.aovMetrics) setAovMetrics(ordersData.aovMetrics);
        if (ordersData.loyalty) setLoyalty(ordersData.loyalty);
        if (ordersData.platformStats) setPlatformStats(ordersData.platformStats);

        // Store into memory cache
        cacheRef.current[cacheKey] = {
          orderStats: ordersData.orderStats,
          buyerSplit: ordersData.buyerSplit,
          topProducts: ordersData.topProducts,
          topGames: ordersData.topGames,
          paymentMethods: ordersData.paymentMethods,
          revenueTrend: ordersData.revenueTrend,
          peakHours: ordersData.peakHours,
          topSpenders: ordersData.topSpenders,
          aovMetrics: ordersData.aovMetrics,
          loyalty: ordersData.loyalty,
          platformStats: ordersData.platformStats,
          pwaStats: pwaState
        };
      }
    } catch (err) {
      console.error("Fetch period stats failed", err);
    } finally {
      setLoading(false);
    }
  }, [periodId, days, customRange]);

  // Initial load
  useEffect(() => {
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      fetchGlobalStats();
    }
    fetchPeriodStats();
  }, [fetchGlobalStats, fetchPeriodStats]);

  // Full manual refresh
  const handleFullRefresh = useCallback(() => {
    cacheRef.current = {};
    fetchGlobalStats();
    fetchPeriodStats(true);
  }, [fetchGlobalStats, fetchPeriodStats]);

  const currentHealth = orderStats.health?.selected || orderStats.health?.[periodKey] || { success: 0, failed: 0, pending: 0 };
  const currentPeriodRevenue = orderStats.revenue?.selected !== undefined ? orderStats.revenue.selected : getPeriodValue(orderStats.revenue, periodKey);
  const currentPeriodOrders = orderStats.counts?.selected !== undefined ? orderStats.counts.selected : (getPeriodValue(orderStats.counts, periodKey) || 0);
  const successCount = currentHealth.success || 0;
  const successRate = currentPeriodOrders > 0 ? Math.round((successCount / currentPeriodOrders) * 100) : 100;
  const totalGamesRevenue = topGames.reduce((acc, g) => acc + (g.revenue || 0), 0) || 1;
  const totalPaymentCount = paymentMethods.reduce((acc, p) => acc + (p.count || 0), 0) || 1;
  const maxTrendRevenue = Math.max(...revenueTrend.map((t) => t.revenue || 0), 1);
  const totalPeakOrders = peakHours.reduce((acc, h) => acc + (h.count || 0), 0) || 1;

  const growthMetrics = useMemo(() => {
    const trendLen = revenueTrend.length;
    let revGrowth = 0;
    let orderGrowth = 0;

    if (trendLen >= 2) {
      const latestRev = revenueTrend[trendLen - 1]?.revenue || 0;
      const prevRev = revenueTrend[trendLen - 2]?.revenue || 0;
      revGrowth = prevRev > 0 ? Math.round(((latestRev - prevRev) / prevRev) * 100) : (latestRev > 0 ? 100 : 0);

      const latestOrd = revenueTrend[trendLen - 1]?.orders || 0;
      const prevOrd = revenueTrend[trendLen - 2]?.orders || 0;
      orderGrowth = prevOrd > 0 ? Math.round(((latestOrd - prevOrd) / prevOrd) * 100) : (latestOrd > 0 ? 100 : 0);
    } else if (days === 1) {
      const avgDayRev = (orderStats.revenue.week || 0) / 7;
      revGrowth = avgDayRev > 0 ? Math.round(((currentPeriodRevenue - avgDayRev) / avgDayRev) * 100) : 0;
      const avgDayOrd = (orderStats.counts.week || 0) / 7;
      orderGrowth = avgDayOrd > 0 ? Math.round(((currentPeriodOrders - avgDayOrd) / avgDayOrd) * 100) : 0;
    } else if (days === 7) {
      const prevWeekRev = (orderStats.revenue.month || 0) / 4.3;
      revGrowth = prevWeekRev > 0 ? Math.round(((currentPeriodRevenue - prevWeekRev) / prevWeekRev) * 100) : 0;
      const prevWeekOrd = (orderStats.counts.month || 0) / 4.3;
      orderGrowth = prevWeekOrd > 0 ? Math.round(((currentPeriodOrders - prevWeekOrd) / prevWeekOrd) * 100) : 0;
    }

    return { revGrowth, orderGrowth };
  }, [revenueTrend, days, orderStats, currentPeriodRevenue, currentPeriodOrders]);

  const trendPoints = useMemo(() => {
    if (!revenueTrend || revenueTrend.length === 0) return [];
    return revenueTrend.map((t, i) => {
      const rev = t.revenue || 0;
      const pct = maxTrendRevenue > 0 ? Math.round((rev / maxTrendRevenue) * 100) : 0;
      const formattedDate = t._id ? (t._id.includes("-") ? t._id.slice(5) : t._id) : `#${i + 1}`;
      return { ...t, index: i, rev, pct, formattedDate };
    });
  }, [revenueTrend, maxTrendRevenue]);

  const activeHoverPoint = hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx] ? trendPoints[hoveredTrendIdx] : null;
  const avgDailyRevenue = revenueTrend.length > 0 ? Math.round(currentPeriodRevenue / revenueTrend.length) : currentPeriodRevenue;

  const timeSlots = [
    { label: "12 AM – 4 AM", name: "Late Night", icon: Moon, start: 0, end: 4 },
    { label: "4 AM – 8 AM", name: "Early Morning", icon: Sunrise, start: 4, end: 8 },
    { label: "8 AM – 12 PM", name: "Morning", icon: Sun, start: 8, end: 12 },
    { label: "12 PM – 4 PM", name: "Afternoon", icon: Sun, start: 12, end: 16 },
    { label: "4 PM – 8 PM", name: "Evening", icon: Sunrise, start: 16, end: 20 },
    { label: "8 PM – 12 AM", name: "Night Prime", icon: Moon, start: 20, end: 24 },
  ];

  const slotStats = timeSlots.map((slot) => {
    let count = 0;
    peakHours.forEach((h) => {
      const hour = Number(h._id);
      if (hour >= slot.start && hour < slot.end) count += h.count;
    });
    const pct = totalPeakOrders > 0 ? Math.round((count / totalPeakOrders) * 100) : 0;
    return { ...slot, count, pct };
  });

  const maxSlotCount = Math.max(...slotStats.map((s) => s.count), 0);
  const peakSlot = slotStats.find((s) => s.count === maxSlotCount && maxSlotCount > 0) || slotStats[4];
  const topItemName = topProducts[0]?._id || "Top Items";

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Header Bar with Extended Time Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)]">
              Sales & Growth Analytics
            </h2>
            <button
              aria-label="Refresh Stats"
              onClick={() => handleFullRefresh()}
              disabled={loading}
              className="p-1.5 rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--muted)] font-normal mt-0.5">
            Live sales, customers, app downloads, and store activity
            {periodId === "custom" && customRange.startDate && customRange.endDate && (
              <span className="ml-1 text-emerald-500 font-bold">
                ({customRange.startDate} to {customRange.endDate})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <PeriodToggle
            periodId={periodId}
            onSelect={(id) => setPeriodId(id)}
            onOpenCustom={() => {
              setTempDates(customRange.startDate ? customRange : {
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                endDate: new Date().toISOString().slice(0, 10)
              });
              setShowCustomModal(true);
            }}
          />
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
                <FiCalendar className="text-emerald-500" /> Choose Custom Date Range
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempDates.startDate}
                  onChange={(e) => setTempDates({ ...tempDates, startDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--muted)] block mb-1">End Date</label>
                <input
                  type="date"
                  value={tempDates.endDate}
                  onChange={(e) => setTempDates({ ...tempDates, endDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]/60">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (tempDates.startDate && tempDates.endDate) {
                    setCustomRange(tempDates);
                    setPeriodId("custom");
                    setShowCustomModal(false);
                  }
                }}
                disabled={!tempDates.startDate || !tempDates.endDate}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Store Summary Strip (Mobile Responsive & Plain English) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.05] via-blue-500/[0.03] to-purple-500/[0.05]">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Store Summary
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                successRate >= 80 
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${successRate >= 80 ? "bg-emerald-500" : "bg-amber-500"}`} />
                {successRate}% Success Rate
              </span>
            </div>
            <p className="text-xs sm:text-[12.5px] font-medium text-[var(--foreground)] leading-relaxed">
              <strong className="text-emerald-500 font-bold">{formatCurrency(currentPeriodRevenue)}</strong> total sales across <strong className="font-bold">{currentPeriodOrders} orders</strong> ({successCount} successful{currentHealth.failed > 0 ? `, ${currentHealth.failed} failed` : ""}) • <strong className="text-blue-400 font-bold">{formatNumber(userStats.activeStats?.[periodKey] || 0)} active users</strong> • <strong className="text-amber-400 font-bold">{formatNumber(userStats.payingStats?.[periodKey] || 0)} buyers</strong> ({userStats.activeStats?.[periodKey] ? Math.round(((userStats.payingStats?.[periodKey] || 0) / userStats.activeStats[periodKey]) * 100) : 0}% converted) • Avg order <strong className="text-[var(--foreground)] font-bold">{formatCurrency(aovMetrics.aov || (currentPeriodOrders > 0 ? Math.round(currentPeriodRevenue / currentPeriodOrders) : 0))}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto pt-1 md:pt-0">
          <PercentBadge value={growthMetrics.revGrowth} label="growth" />
          <span className="text-[10px] font-bold text-[var(--muted)] bg-[var(--foreground)]/[0.04] px-2.5 py-1 rounded-md border border-[var(--border)]">
            {timeframeLabel}
          </span>
        </div>
      </div>

      {/* 4 Clean Hero Cards (Mobile Responsive 1/2/4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Sales & Orders */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 flex flex-col justify-between shadow-xs hover:border-[var(--border)]/90 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
              <span>Sales & Orders</span>
              <PercentBadge value={growthMetrics.revGrowth} />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 tabular-nums my-1">
              {formatCurrency(currentPeriodRevenue)}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-[var(--foreground)] mt-1">
              <span>{currentPeriodOrders} orders</span>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {successCount} successful
              </span>
              {currentHealth.failed > 0 && (
                <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  {currentHealth.failed} failed
                </span>
              )}
            </div>
          </div>
          <div className="pt-2.5 mt-3 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span>Avg Order: <strong className="text-[var(--foreground)]">{formatCurrency(aovMetrics.aov || 0)}</strong></span>
            <span>Total Paid: <strong className="text-[var(--foreground)]">{formatCurrency(getPeriodValue(txStats.volume, periodKey) || currentPeriodRevenue)}</strong></span>
          </div>
        </div>

        {/* Card 2: App & Notifications */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 flex flex-col justify-between shadow-xs hover:border-[var(--border)]/90 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
              <span>App & Alerts</span>
              <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                <Bell size={10} /> {pwaStats.totalPushSubscribers || 0} Push
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 tabular-nums my-1">
              {formatNumber(pwaStats.totalInstalls || 0)} <span className="text-xs font-normal text-[var(--muted)]">Installs</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--foreground)] mt-1">
              <span className="text-[11px] text-purple-400 flex items-center gap-1 font-semibold">
                <Smartphone size={12} /> {formatNumber(pwaStats.activeDevices || 0)} active users
              </span>
              <span className="text-[10px] font-medium text-[var(--muted)]">
                {platformStats.pwa.orders || 0} app orders
              </span>
            </div>
          </div>
          <div className="pt-2.5 mt-3 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span>Push Subscribers: <strong className="text-purple-400">{pwaStats.totalPushSubscribers || 0}</strong></span>
            <span>App Sales: <strong className="text-[var(--foreground)]">{formatCurrency(platformStats.pwa.revenue || 0)}</strong></span>
          </div>
        </div>

        {/* Card 3: Users & Customers */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 flex flex-col justify-between shadow-xs hover:border-[var(--border)]/90 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
              <span>Users & Buyers</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {userStats.conversionStats?.[periodKey] || 0}% Conversion
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tabular-nums my-1">
              {formatNumber(userStats.total || 0)} <span className="text-xs font-bold text-[var(--muted)]">Users</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-1 text-center">
              <div className="p-1 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)]/60">
                <span className="text-[8px] uppercase font-bold text-[var(--muted)] block">Active</span>
                <span className="text-xs font-black text-emerald-500 tabular-nums">{formatNumber(userStats.activeStats?.[periodKey] || 0)}</span>
              </div>
              <div className="p-1 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)]/60">
                <span className="text-[8px] uppercase font-bold text-[var(--muted)] block">Signups</span>
                <span className="text-xs font-black text-purple-400 tabular-nums">+{formatNumber(userStats.newStats?.[periodKey] || 0)}</span>
              </div>
              <div className="p-1 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)]/60">
                <span className="text-[8px] uppercase font-bold text-[var(--muted)] block">Buyers</span>
                <span className="text-xs font-black text-amber-400 tabular-nums">{formatNumber(userStats.payingStats?.[periodKey] || 0)}</span>
              </div>
            </div>
          </div>
          <div className="pt-2.5 mt-3 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span>Total Paying Customers: <strong className="text-[var(--foreground)]">{userStats.payingStats?.allTime || 0}</strong></span>
            <span className="text-amber-400/90 font-medium">{timeframeLabel}</span>
          </div>
        </div>

        {/* Card 4: User Wallets */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 flex flex-col justify-between shadow-xs hover:border-[var(--border)]/90 transition-all">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
              <span>Customer Wallets</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {formatNumber(walletStats.activeWallets || 0)} With Money
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 tabular-nums my-1">
              {formatCurrency(walletStats.totalBalance || 0)}
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)] mt-1">
              <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-bold">
                <Wallet size={12} /> {formatNumber(walletStats.activeWallets || 0)} funded wallets
              </span>
              <span className="text-[10px] text-[var(--muted)] font-medium">Total in Wallets</span>
            </div>
          </div>
          <div className="pt-2.5 mt-3 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span className="text-emerald-500 font-medium">+{formatCurrency(getPeriodValue(walletStats.deposits, periodKey))} Added</span>
            <span className="text-rose-500 font-medium">-{formatCurrency(getPeriodValue(walletStats.usage, periodKey))} Spent</span>
          </div>
        </div>

      </div>

      {/* Operational Mini-Badges Row (Clean Wrap for Mobile) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[var(--muted)]">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <button onClick={() => onNavigate && onNavigate("users")} className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer">
            <Crown size={12} className="text-amber-400" />
            <span>Top Customers: <strong className="text-[var(--foreground)] font-bold">{topSpenders.length}</strong></span>
          </button>
          <button onClick={() => onNavigate && onNavigate("wallet")} className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer">
            <Wallet size={12} className="text-emerald-500" />
            <span>User Wallets: <strong className="text-[var(--foreground)] font-bold">{formatCurrency(walletStats.totalBalance || 0)}</strong> ({walletStats.activeWallets || 0} active)</span>
          </button>
          <button onClick={() => onNavigate && onNavigate("coins")} className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer">
            <Coins size={12} className="text-amber-400" />
            <span>Reward Coins: <strong className="text-[var(--foreground)] font-bold">{formatNumber(coinStats.totalAvailable || 0)}</strong> (+{formatNumber(coinStats.todayEarned || 0)} today)</span>
          </button>
          <button onClick={() => onNavigate && onNavigate("support-queries")} className="flex items-center gap-1.5 hover:text-[var(--foreground)] transition-colors cursor-pointer">
            <MessageSquare size={12} className={supportStats.open > 0 ? "text-rose-500" : "text-emerald-500"} />
            <span>Help Tickets: <strong className={supportStats.open > 0 ? "text-rose-500 font-bold" : "text-[var(--foreground)] font-bold"}>{supportStats.open} open</strong></span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live updates</span>
        </div>
      </div>

      {/* Main Intelligence Grid */}
      <div className="space-y-3.5">
        
        {/* Row 1: Sales Velocity Chart + Basket Economics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Sales Velocity Trend Area & Curve Chart */}
          <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                    <BarChart3 size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                      Sales Trend
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">
                      {activeHoverPoint ? (
                        <span className="text-emerald-500 font-bold">
                          {activeHoverPoint._id}: {formatCurrency(activeHoverPoint.rev)} ({activeHoverPoint.orders || 0} orders)
                        </span>
                      ) : (
                        `Revenue graph for ${timeframeLabel.toLowerCase()}`
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <PercentBadge value={growthMetrics.revGrowth} label="growth" />
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {timeframeLabel}
                  </span>
                </div>
              </div>

              {trendPoints.length > 0 ? (
                <div className="relative pt-2 pb-1 select-none">
                  
                  {/* Top reference stats */}
                  <div className="flex justify-between items-center text-[10px] text-[var(--muted)] font-mono mb-1.5 px-1">
                    <span>Highest: <strong className="text-emerald-500 font-bold">{formatCurrency(maxTrendRevenue)}</strong></span>
                    <span>Daily Avg: <strong className="text-[var(--foreground)] font-bold">{formatCurrency(avgDailyRevenue)}/day</strong></span>
                    <span>Total Sales: <strong className="text-emerald-500 font-bold">{formatCurrency(currentPeriodRevenue)}</strong></span>
                  </div>
                  
                  {/* Main Interactive Bar Chart Container */}
                  <div 
                    className="relative h-36 sm:h-44 w-full rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/60 px-3 pt-3 pb-2 flex flex-col justify-between"
                    onMouseLeave={() => setHoveredTrendIdx(null)}
                  >
                    {/* Horizontal Reference Guide Lines */}
                    <div className="absolute inset-x-3 top-[25%] border-b border-dashed border-[var(--border)]/30 pointer-events-none" />
                    <div className="absolute inset-x-3 top-[55%] border-b border-dashed border-[var(--border)]/25 pointer-events-none" />
                    <div className="absolute inset-x-3 bottom-7 border-b border-[var(--border)]/50 pointer-events-none" />

                    {/* Bars Container */}
                    <div className={`relative z-10 flex-1 flex items-end ${trendPoints.length === 1 ? 'justify-center' : 'justify-between'} gap-1 sm:gap-2 pb-2`}>
                      {trendPoints.map((pt, idx) => {
                        const isHovered = hoveredTrendIdx === idx;
                        const hasRevenue = pt.rev > 0;
                        const isPeak = pt.rev === maxTrendRevenue && maxTrendRevenue > 0;
                        const barHeight = hasRevenue ? Math.max(Math.round((pt.rev / maxTrendRevenue) * 85), 10) : 4;

                        return (
                          <div
                            key={idx}
                            className={`flex-1 ${trendPoints.length === 1 ? 'max-w-[140px]' : 'max-w-[60px]'} h-full flex flex-col items-center justify-end group cursor-pointer relative`}
                            onMouseEnter={() => setHoveredTrendIdx(idx)}
                          >
                            {/* Floating Tooltip above active bar */}
                            {isHovered && (
                              <div className="absolute -top-1 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-2xl whitespace-nowrap z-30 transform -translate-y-full pointer-events-none">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-xs font-mono font-bold text-emerald-500 tabular-nums">{formatCurrency(pt.rev)}</span>
                                </div>
                                <div className="text-[9px] text-[var(--muted)] flex items-center justify-between gap-2 font-medium">
                                  <span>{pt._id || `Day ${idx + 1}`}</span>
                                  <span className="text-[var(--foreground)] font-bold">{pt.orders || 0} orders</span>
                                </div>
                              </div>
                            )}

                            {/* Bar Top Value Label on Single Point */}
                            {trendPoints.length === 1 && (
                              <span className="text-[11px] font-bold text-emerald-500 mb-1 tabular-nums">
                                {formatCurrency(pt.rev)}
                              </span>
                            )}

                            {/* Vertical Bar */}
                            <div
                              className={`w-full rounded-t-md transition-all duration-300 ${
                                isHovered
                                  ? "bg-emerald-400 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/50"
                                  : isPeak
                                  ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-xs"
                                  : hasRevenue
                                  ? "bg-emerald-500/75 hover:bg-emerald-400"
                                  : "bg-[var(--foreground)]/[0.05]"
                              }`}
                              style={{ height: `${barHeight}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* X-Axis Date Labels Bar */}
                    <div className={`relative z-10 h-5 flex ${trendPoints.length === 1 ? 'justify-center' : 'justify-between'} items-center text-[9px] font-mono text-[var(--muted)] border-t border-[var(--border)]/40 px-1 pt-1`}>
                      {trendPoints.length <= 10 ? (
                        trendPoints.map((pt, idx) => (
                          <span 
                            key={idx} 
                            className={`truncate ${hoveredTrendIdx === idx ? "text-emerald-500 font-bold" : ""}`}
                          >
                            {pt.formattedDate}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className={hoveredTrendIdx === 0 ? "text-emerald-500 font-bold" : ""}>{trendPoints[0]?.formattedDate}</span>
                          <span className={hoveredTrendIdx === Math.floor(trendPoints.length / 2) ? "text-emerald-500 font-bold" : ""}>
                            {trendPoints[Math.floor(trendPoints.length / 2)]?.formattedDate}
                          </span>
                          <span className={hoveredTrendIdx === trendPoints.length - 1 ? "text-emerald-500 font-bold" : ""}>
                            {trendPoints[trendPoints.length - 1]?.formattedDate}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-xs text-[var(--muted)]">
                  No sales recorded in this period.
                </div>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
              <span>Total Orders: <strong className="text-[var(--foreground)] font-bold">{currentPeriodOrders}</strong></span>
              <span>Volume Growth: <strong className="text-emerald-500 font-bold">+{growthMetrics.orderGrowth}%</strong></span>
            </div>
          </div>

          {/* Basket Economics & Retention */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-teal-500/20 bg-teal-500/10 text-teal-400">
                    <Users size={14} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Order Value & Loyalty
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Customer Habits
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <div className="p-2.5 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[var(--muted)] block">Average Order Value</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-500 tabular-nums">
                      {formatCurrency(aovMetrics.aov || (currentPeriodOrders > 0 ? Math.round(currentPeriodRevenue / currentPeriodOrders) : 0))}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Avg</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[var(--muted)] block">Avg Items Per Order</span>
                    <span className="text-base sm:text-lg font-bold text-[var(--foreground)] tabular-nums">
                      {aovMetrics.basketSize || "1.0"} <span className="text-xs font-normal text-[var(--muted)]">items</span>
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">Per Order</span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[var(--muted)] block">Repeat Buyer Rate</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-500 tabular-nums">
                      {loyalty.repeatRate}% <span className="text-[10px] font-normal text-[var(--muted)]">repeat</span>
                    </span>
                  </div>
                  <PercentBadge value={loyalty.repeatRate} label="repeat" />
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
              <span>Unique Customers: <strong className="text-[var(--foreground)] font-bold">{aovMetrics.totalBuyers || 0}</strong></span>
              <span>Period: {timeframeLabel}</span>
            </div>
          </div>

        </div>

        {/* Row 2: PWA vs Web Conversion Split & Peak Hours Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          
          {/* PWA vs Web Split */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/[0.02] p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Smartphone size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                      App vs Web Orders & Sales
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">Comparison between mobile app and browser visitors</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {platformStats.pwa.revenueShare || 0}% App Share
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]/80 space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-purple-400 flex items-center gap-1">
                    📱 Mobile App: {formatCurrency(platformStats.pwa.revenue || 0)} 
                    <span className="text-[9px] font-bold bg-purple-500/15 px-1.5 py-0.2 rounded">({platformStats.pwa.revenueShare || 0}%)</span>
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    🌐 Website: {formatCurrency(platformStats.web.revenue || 0)} 
                    <span className="text-[9px] font-bold bg-blue-500/15 px-1.5 py-0.2 rounded">({platformStats.web.revenueShare || 0}%)</span>
                  </span>
                </div>

                <div className="h-2 w-full bg-[var(--foreground)]/[0.06] rounded-full overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    className="h-full bg-purple-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${Math.max(platformStats.pwa.revenueShare || 0, (platformStats.pwa.revenue || 0) > 0 ? 5 : 0)}%` }}
                  />
                  <div
                    className="h-full bg-blue-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${Math.max(platformStats.web.revenueShare || 0, (platformStats.web.revenue || 0) > 0 ? 5 : 0)}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-[9.5px] sm:text-[10px] text-[var(--muted)] font-mono pt-1">
                  <span>📱 App: {platformStats.pwa.orders || 0} orders • {platformStats.pwa.successRate || 0}% success • Avg {formatCurrency(platformStats.pwa.aov || 0)}</span>
                  <span>🌐 Web: {platformStats.web.orders || 0} orders • {platformStats.web.successRate || 0}% success • Avg {formatCurrency(platformStats.web.aov || 0)}</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex flex-wrap items-center justify-between gap-1 text-[10px] text-[var(--muted)]">
              <span>All-time App Orders: <strong className="text-[var(--foreground)] font-bold">{platformStats.allTime?.pwaOrders || 0}</strong></span>
              <span>All-time Web Orders: <strong className="text-[var(--foreground)] font-bold">{platformStats.allTime?.webOrders || 0}</strong></span>
            </div>
          </div>

          {/* Peak Hours Heatmap (Mobile Responsive: 2 cols on xs, 3 cols on sm, 6 cols on md/lg) */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-purple-500/20 bg-purple-500/10 text-purple-400">
                    <Clock size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                      Busiest Shopping Hours
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[var(--muted)]">When customers order the most</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Peak: {peakSlot.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {slotStats.map((slot, idx) => {
                  const isPeak = slot.count === maxSlotCount && maxSlotCount > 0;
                  return (
                    <div key={idx} className="p-2 sm:p-2.5 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[var(--foreground)] truncate">{slot.name}</span>
                        {isPeak ? (
                          <span className="text-[8px] bg-purple-500/20 text-purple-400 px-1 rounded font-bold">TOP</span>
                        ) : (
                          <span className="text-[9px] text-[var(--muted)]">{slot.pct}%</span>
                        )}
                      </div>
                      <div className="h-1.5 w-full bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPeak ? "bg-purple-500" : slot.pct > 0 ? "bg-blue-500" : "bg-[var(--foreground)]/[0.05]"
                          }`}
                          style={{ width: `${Math.max(slot.pct, slot.pct > 0 ? 5 : 0)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-[var(--muted)] font-mono">
                        <span>{slot.label.split("–")[0]}</span>
                        <span className="font-bold text-[var(--foreground)]">{slot.count} ord</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 text-[10px] text-[var(--muted)] flex flex-wrap items-center justify-between gap-1">
              <span className="flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400 shrink-0" />
                <span>Best time for promotions: <strong className="text-[var(--foreground)] font-bold">{peakSlot.label} ({peakSlot.name})</strong></span>
              </span>
              <span className="font-bold">{timeframeLabel}</span>
            </div>
          </div>

        </div>

        {/* Row 3: New vs Returning Buyers + Best Selling Products + Game Share + Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* New vs Returning Buyers Card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <UserCheck size={14} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Buyer Loyalty
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {buyerSplit.repeatRate || 0}% Repeat
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)]/80 space-y-2 mt-1">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <UserPlus size={11} /> New: {formatCurrency(buyerSplit.newBuyers?.revenue || 0)}
                    <span className="text-[8.5px] bg-emerald-500/15 text-emerald-400 px-1 py-0.2 rounded">({buyerSplit.newBuyers?.sharePct || 0}%)</span>
                  </span>
                  <span className="text-blue-400 flex items-center gap-1">
                    <UserCheck size={11} /> Regular: {formatCurrency(buyerSplit.returningBuyers?.revenue || 0)}
                    <span className="text-[8.5px] bg-blue-500/15 text-blue-400 px-1 py-0.2 rounded">({buyerSplit.returningBuyers?.sharePct || 0}%)</span>
                  </span>
                </div>

                <div className="h-2 w-full bg-[var(--foreground)]/[0.06] rounded-full overflow-hidden flex p-0.5 gap-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${Math.max(buyerSplit.newBuyers?.sharePct || 0, (buyerSplit.newBuyers?.revenue || 0) > 0 ? 5 : 0)}%` }}
                  />
                  <div
                    className="h-full bg-blue-500 rounded-r-full transition-all duration-500"
                    style={{ width: `${Math.max(buyerSplit.returningBuyers?.sharePct || 0, (buyerSplit.returningBuyers?.revenue || 0) > 0 ? 5 : 0)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[9px] text-[var(--muted)] font-mono pt-0.5">
                  <span>{buyerSplit.newBuyers?.orders || 0} ord ({buyerSplit.newBuyers?.count || 0} users)</span>
                  <span>{buyerSplit.returningBuyers?.orders || 0} ord ({buyerSplit.returningBuyers?.count || 0} regulars)</span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
              <span>Total Unique Buyers: <strong className="text-[var(--foreground)] font-bold">{buyerSplit.totalBuyers || 0}</strong></span>
              <span className="font-bold">{timeframeLabel}</span>
            </div>
          </div>

          {/* Top Packages */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-400">
                    <Trophy size={14} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Best-Selling
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {timeframeLabel}
                </span>
              </div>

              {topProducts.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {topProducts.slice(0, 3).map((prod, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 hover:bg-[var(--foreground)]/[0.03] transition-all">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                        <span className={`text-[10px] font-mono font-bold shrink-0 w-4 text-center py-0.5 rounded flex items-center justify-center ${
                          idx === 0 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-[var(--muted)]"
                        }`}>
                          {idx === 0 ? <Crown size={10} className="text-amber-400" /> : `0${idx + 1}`}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[var(--foreground)] truncate">{prod._id || "Unknown Item"}</span>
                          <span className="text-[8.5px] text-[var(--muted)] uppercase font-medium">{prod.gameSlug || "Game"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-xs font-bold text-emerald-500 tabular-nums">{formatCurrency(prod.revenue)}</span>
                        <span className="text-[8.5px] text-[var(--muted)]">{prod.count} sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[var(--muted)] font-medium">
                  No products sold in this period.
                </div>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
              <span>Top: <strong className="text-[var(--foreground)] font-bold truncate max-w-[100px] inline-block align-bottom">{topItemName}</strong></span>
              <span>{topProducts.reduce((sum, p) => sum + (p.count || 0), 0)} sold</span>
            </div>
          </div>

          {/* Game Catalog Revenue Share */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Gamepad2 size={14} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Sales by Game
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Game Share
                </span>
              </div>

              {topGames.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {topGames.slice(0, 3).map((game, idx) => {
                    const sharePct = Math.round(((game.revenue || 0) / totalGamesRevenue) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[var(--foreground)] uppercase text-[10.5px] truncate">{game._id}</span>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-emerald-500 tabular-nums">{formatCurrency(game.revenue)}</span>
                            <span className="text-[9px] text-[var(--muted)] font-medium">({sharePct}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(sharePct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[var(--muted)] font-medium">
                  No game sales recorded yet.
                </div>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
              <span>Catalog Games: <strong className="text-[var(--foreground)] font-bold">{topGames.length}</strong></span>
              <span>{formatCurrency(totalGamesRevenue)} total</span>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                    <CreditCard size={14} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Payment Gateways
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Methods
                </span>
              </div>

              {paymentMethods.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {paymentMethods.map((pm, idx) => {
                    const share = Math.round(((pm.count || 0) / totalPaymentCount) * 100);
                    return (
                      <div key={idx} className="p-2 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 flex flex-col justify-between">
                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--foreground)] truncate mb-0.5">
                          {pm._id || "UPI"}
                        </span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-emerald-500">{share}%</span>
                          <span className="text-[8.5px] text-[var(--muted)]">{pm.count} txns</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[var(--muted)] font-medium">
                  No payment data recorded.
                </div>
              )}
            </div>

            <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
              <span>Methods Used: <strong className="text-[var(--foreground)] font-bold">{paymentMethods.length}</strong></span>
              <span>{totalPaymentCount} total txns</span>
            </div>
          </div>

        </div>

        {/* Row 4: VIP Customers Leaderboard */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <Crown size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                    Top Spending Customers
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--muted)]">Customers who spent the most on your store</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate && onNavigate("users")}
                className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View Users <ChevronRight size={11} />
              </button>
            </div>

            {topSpenders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {topSpenders.slice(0, 4).map((spender, idx) => {
                  const maskedEmail = spender._id ? spender._id.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length)) : "User";
                  return (
                    <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-[var(--foreground)]/[0.015] border border-[var(--border)]/70 hover:bg-[var(--foreground)]/[0.03] transition-all">
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                        <span className={`text-[10px] font-mono font-bold shrink-0 w-5 text-center py-0.5 rounded flex items-center justify-center ${
                          idx === 0 ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" : "text-[var(--muted)]"
                        }`}>
                          {idx === 0 ? <Crown size={11} className="text-amber-400" /> : `0${idx + 1}`}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate">{spender.playerName ? `${spender.playerName} (${maskedEmail})` : maskedEmail}</span>
                          <span className="text-[9px] text-[var(--muted)] uppercase font-medium">{spender.ordersCount} orders • {spender.gameSlug || "Gaming"}</span>
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-amber-400 tabular-nums shrink-0">
                        {formatCurrency(spender.totalSpent)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[var(--muted)] font-medium">
                No customer spending data recorded yet.
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
            <span>Total Paying Customers: <strong className="text-[var(--foreground)] font-bold">{userStats.payingStats?.allTime || 0}</strong></span>
            <span className="font-bold">{timeframeLabel}</span>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-3.5 sm:p-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                  <Activity size={14} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Store Activity Feed
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[var(--muted)]">Recent orders, wallet deposits, signups, and app downloads</p>
                </div>
              </div>
              
              <button
                onClick={() => onNavigate && onNavigate("activity")}
                className="px-3 py-1.5 rounded-lg bg-[var(--foreground)]/[0.04] hover:bg-[var(--foreground)]/[0.08] border border-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>View Full Activity Log ({totalActivityCount})</span>
                <ChevronRight size={12} />
              </button>
            </div>

            {recentActivity.length > 0 ? (
              <div className="divide-y divide-[var(--border)]/40 pt-1">
                {recentActivity.slice(0, 10).map((event) => {
                  const isSuccess = event.status === "success";
                  const isFailed = event.status === "failed";
                  const timeAgo = (() => {
                    if (!event.timestamp) return "Just now";
                    const diff = Math.floor((Date.now() - new Date(event.timestamp).getTime()) / 1000);
                    if (diff < 60) return "Just now";
                    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                    return new Date(event.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
                  })();

                  return (
                    <div key={event.id} className="py-2.5 flex items-center justify-between gap-2.5 hover:bg-[var(--foreground)]/[0.015] px-1 rounded-lg transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`p-1.5 rounded-lg shrink-0 ${
                          event.type === "order" ? "bg-emerald-500/10 text-emerald-500" :
                          event.type === "wallet" ? "bg-amber-500/10 text-amber-400" :
                          event.type === "user" ? "bg-purple-500/10 text-purple-400" :
                          event.type === "pwa" ? "bg-cyan-500/10 text-cyan-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {event.type === "order" ? <Trophy size={12} /> :
                           event.type === "wallet" ? <Wallet size={12} /> :
                           event.type === "user" ? <Users size={12} /> :
                           event.type === "pwa" ? <Smartphone size={12} /> : <MessageSquare size={12} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[var(--foreground)] truncate">{event.title}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              isSuccess ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              isFailed ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}>
                              {event.statusText || event.status}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[var(--muted)] truncate mt-0.5">{event.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        {event.amount !== null && event.amount !== undefined && (
                          <span className={`text-xs sm:text-sm font-black tabular-nums ${isFailed ? "text-rose-500" : "text-emerald-500"}`}>
                            {formatCurrency(event.amount)}
                          </span>
                        )}
                        <span className="text-[9.5px] text-[var(--muted)] font-mono">{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[var(--muted)] font-medium">
                No recent activity events recorded.
              </div>
            )}
          </div>

          <div className="mt-2.5 pt-2 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live store webhook stream active
            </span>
            <button onClick={() => onNavigate && onNavigate("activity")} className="text-blue-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer">
              Open Full Activity Screen <ChevronRight size={11} />
            </button>
          </div>
        </div>

      </div>

      {/* Clean Quick Action Footer */}
      <div className="pt-2 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-xs">Live store data connected.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate && onNavigate("orders")}
            className="px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] text-xs font-bold text-[var(--foreground)] transition-all cursor-pointer"
          >
            Go to Orders →
          </button>
          <button
            onClick={() => onNavigate && onNavigate("activity")}
            className="px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
          >
            Live Activity →
          </button>
          <button
            onClick={() => onNavigate && onNavigate("pwa-stats")}
            className="px-3 py-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-xs font-bold transition-all cursor-pointer"
          >
            App Analytics →
          </button>
        </div>
      </div>
    </div>
  );
}
