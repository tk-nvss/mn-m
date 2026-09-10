import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import PwaInstall from "@/models/PwaInstall";
import PushSubscription from "@/models/PushSubscription";
import SupportQuery from "@/models/SupportQuery";
import CoinTransaction from "@/models/CoinTransaction";
import jwt from "jsonwebtoken";

/* =========================================================
   IN-MEMORY TTL CACHE (30 Seconds)
========================================================= */
const cache = new Map();
const CACHE_TTL_MS = 30 * 1000;

function getCachedData(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCachedData(key, data) {
  cache.set(key, { timestamp: Date.now(), data });
  // Evict old cache keys if size exceeds 50
  if (cache.size > 50) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

/* =========================================================
   AUTH HELPER
========================================================= */
function verifyOwner(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized" };
  }

  const token = auth.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw { status: 401, message: "Invalid or expired token" };
  }

  if (decoded.userType !== "owner" && decoded.userType !== "admin") {
    throw { status: 403, message: "Forbidden" };
  }

  return decoded;
}

/* =========================================================
   GET UNIFIED ANALYTICS
========================================================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyOwner(req);

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days")) || 1;
    const forceRefresh = searchParams.get("refresh") === "true";

    const cacheKey = `analytics_days_${days}`;
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodMatchDate = days === 30 ? last30d : (days === 7 ? last7d : last24h);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    /* ================= CONCURRENT AGGREGATIONS ================= */
    const [
      ordersAggregation,
      repeatCustomerStats,
      totalOrdersCount,
      txAggregation,
      walletBalanceAgg,
      usersStatsAgg,
      totalUsersCount,
      payingUsersFacet,
      pwaInstallsCount,
      pwaActiveCount,
      pwaDismissCount,
      pwaPushCount,
      pwaOsStats,
      pwaDeviceStats,
      periodPushCount,
      coinStatsAgg,
      userCoinsAgg,
      supportStatsFacet
    ] = await Promise.all([
      // 1. Core Orders Facet
      Order.aggregate([
        {
          $facet: {
            "day": [
              { $match: { createdAt: { $gte: last24h } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } },
                  successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                  failedCount: { $sum: { $cond: [{ $in: ["$status", ["failed", "FAILED"]] }, 1, 0] } },
                  pendingCount: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING", "processing"]] }, 1, 0] } },
                }
              }
            ],
            "week": [
              { $match: { createdAt: { $gte: last7d } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } },
                  successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                  failedCount: { $sum: { $cond: [{ $in: ["$status", ["failed", "FAILED"]] }, 1, 0] } },
                  pendingCount: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING", "processing"]] }, 1, 0] } },
                }
              }
            ],
            "month": [
              { $match: { createdAt: { $gte: last30d } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } },
                  successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                  failedCount: { $sum: { $cond: [{ $in: ["$status", ["failed", "FAILED"]] }, 1, 0] } },
                  pendingCount: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING", "processing"]] }, 1, 0] } },
                }
              }
            ],
            "topProducts": [
              { $match: { status: "success", createdAt: { $gte: periodMatchDate } } },
              {
                $group: {
                  _id: "$itemName",
                  gameSlug: { $first: "$gameSlug" },
                  count: { $sum: 1 },
                  revenue: { $sum: "$price" }
                }
              },
              { $sort: { count: -1, revenue: -1 } },
              { $limit: 6 }
            ],
            "topGames": [
              { $match: { status: "success", createdAt: { $gte: periodMatchDate } } },
              {
                $group: {
                  _id: "$gameSlug",
                  count: { $sum: 1 },
                  revenue: { $sum: "$price" }
                }
              },
              { $sort: { revenue: -1, count: -1 } },
              { $limit: 6 }
            ],
            "paymentMethods": [
              { $match: { createdAt: { $gte: periodMatchDate } } },
              {
                $group: {
                  _id: { $ifNull: ["$paymentMethod", "UPI"] },
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 6 }
            ],
            "revenueTrend": [
              { $match: { status: "success", createdAt: { $gte: periodMatchDate } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
                  revenue: { $sum: "$price" },
                  orders: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ],
            "peakHours": [
              { $match: { status: "success", createdAt: { $gte: periodMatchDate } } },
              {
                $group: {
                  _id: { $hour: { date: "$createdAt", timezone: "+05:30" } },
                  count: { $sum: 1 },
                  revenue: { $sum: "$price" }
                }
              },
              { $sort: { count: -1 } }
            ],
            "topSpenders": [
              { $match: { status: "success", createdAt: { $gte: periodMatchDate }, email: { $exists: true, $ne: "" } } },
              {
                $group: {
                  _id: { $toLower: "$email" },
                  playerName: { $first: "$playerName" },
                  gameSlug: { $first: "$gameSlug" },
                  totalSpent: { $sum: "$price" },
                  ordersCount: { $sum: 1 }
                }
              },
              { $sort: { totalSpent: -1 } },
              { $limit: 5 }
            ],
            "platformStats": [
              { $match: { createdAt: { $gte: periodMatchDate } } },
              {
                $group: {
                  _id: { $toLower: { $ifNull: ["$platform", "web"] } },
                  totalOrders: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } },
                  successOrders: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                  failedOrders: { $sum: { $cond: [{ $in: ["$status", ["failed", "FAILED"]] }, 1, 0] } },
                  pendingOrders: { $sum: { $cond: [{ $in: ["$status", ["pending", "PENDING", "processing"]] }, 1, 0] } },
                }
              }
            ],
            "allTimePlatform": [
              {
                $group: {
                  _id: { $toLower: { $ifNull: ["$platform", "web"] } },
                  totalOrders: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } },
                  successOrders: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
                }
              }
            ]
          }
        }
      ]),

      // 2. Repeat Customers
      Order.aggregate([
        { $match: { email: { $exists: true, $ne: "" }, status: "success", createdAt: { $gte: periodMatchDate } } },
        { $group: { _id: { $toLower: "$email" }, orderCount: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            totalBuyers: { $sum: 1 },
            repeatBuyers: { $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] } }
          }
        }
      ]),

      // 3. Total Orders Count
      Order.countDocuments({}),

      // 4. Wallet Transactions Stats (Credits & Debits)
      WalletTransaction.aggregate([
        {
          $facet: {
            "deposits": [
              { $match: { type: "credit", status: "success" } },
              {
                $group: {
                  _id: null,
                  day: { $sum: { $cond: [{ $gte: ["$createdAt", last24h] }, "$amount", 0] } },
                  week: { $sum: { $cond: [{ $gte: ["$createdAt", last7d] }, "$amount", 0] } },
                  month: { $sum: { $cond: [{ $gte: ["$createdAt", last30d] }, "$amount", 0] } }
                }
              }
            ],
            "usage": [
              { $match: { type: "debit", status: "success" } },
              {
                $group: {
                  _id: null,
                  day: { $sum: { $cond: [{ $gte: ["$createdAt", last24h] }, "$amount", 0] } },
                  week: { $sum: { $cond: [{ $gte: ["$createdAt", last7d] }, "$amount", 0] } },
                  month: { $sum: { $cond: [{ $gte: ["$createdAt", last30d] }, "$amount", 0] } }
                }
              }
            ]
          }
        }
      ]),

      // 5. Total Wallet Balances Pool & Active Wallets
      User.aggregate([
        {
          $project: {
            numericWallet: {
              $convert: {
                input: "$wallet",
                to: "double",
                onError: 0,
                onNull: 0
              }
            }
          }
        },
        { $match: { numericWallet: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            totalBalance: { $sum: "$numericWallet" },
            activeWallets: { $sum: 1 }
          }
        }
      ]),

      // 6. User Engagement Facet (Active vs New Signups)
      User.aggregate([
        {
          $facet: {
            "active": [
              {
                $group: {
                  _id: null,
                  day: { $sum: { $cond: [{ $gte: ["$lastLogin", last24h] }, 1, 0] } },
                  week: { $sum: { $cond: [{ $gte: ["$lastLogin", last7d] }, 1, 0] } },
                  month: { $sum: { $cond: [{ $gte: ["$lastLogin", last30d] }, 1, 0] } }
                }
              }
            ],
            "new": [
              {
                $group: {
                  _id: null,
                  day: { $sum: { $cond: [{ $gte: ["$createdAt", last24h] }, 1, 0] } },
                  week: { $sum: { $cond: [{ $gte: ["$createdAt", last7d] }, 1, 0] } },
                  month: { $sum: { $cond: [{ $gte: ["$createdAt", last30d] }, 1, 0] } }
                }
              }
            ]
          }
        }
      ]),

      // 7. Total Users Count
      User.countDocuments({}),

      // 8. Paying Users Facet
      Order.aggregate([
        {
          $match: {
            $or: [
              { status: "success" },
              { paymentStatus: { $in: ["success", "completed", "paid"] } }
            ],
            email: { $exists: true, $ne: "" }
          }
        },
        {
          $facet: {
            "allTime": [
              { $group: { _id: { $toLower: "$email" } } },
              { $count: "count" }
            ],
            "day": [
              { $match: { createdAt: { $gte: last24h } } },
              { $group: { _id: { $toLower: "$email" } } },
              { $count: "count" }
            ],
            "week": [
              { $match: { createdAt: { $gte: last7d } } },
              { $group: { _id: { $toLower: "$email" } } },
              { $count: "count" }
            ],
            "month": [
              { $match: { createdAt: { $gte: last30d } } },
              { $group: { _id: { $toLower: "$email" } } },
              { $count: "count" }
            ]
          }
        }
      ]),

      // 9. PWA Installs Count
      PwaInstall.countDocuments({ event: "installed" }).catch(() => 0),

      // 10. PWA Active Devices (Unique fingerprints)
      PwaInstall.distinct("fingerprint", { event: "active" }).then((a) => a.length).catch(() => 0),

      // 11. PWA Dismissals
      PwaInstall.countDocuments({ event: "dismissed" }).catch(() => 0),

      // 12. Active Push Subscribers
      PushSubscription.countDocuments({ isActive: true }).catch(() => 0),

      // 13. PWA OS breakdown
      PwaInstall.aggregate([
        { $match: { event: "installed" } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).catch(() => []),

      // 14. PWA Device breakdown
      PwaInstall.aggregate([
        { $match: { event: "installed" } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).catch(() => []),

      // 15. Period Push Subscriptions
      PushSubscription.countDocuments({ isActive: true, createdAt: { $gte: periodMatchDate } }).catch(() => 0),

      // 16. Coin Economy Stats
      CoinTransaction.aggregate([
        {
          $facet: {
            overall: [
              { $group: { _id: "$type", total: { $sum: "$coins" } } }
            ],
            today: [
              { $match: { createdAt: { $gte: todayStart } } },
              { $group: { _id: "$type", total: { $sum: "$coins" } } }
            ]
          }
        }
      ]).catch(() => [{ overall: [], today: [] }]),

      // 17. Total Coins Available
      User.aggregate([
        { $group: { _id: null, total: { $sum: "$coins" } } }
      ]).catch(() => []),

      // 18. Support Queries Stats
      SupportQuery.aggregate([
        {
          $facet: {
            "statusCounts": [
              { $group: { _id: "$status", count: { $sum: 1 } } }
            ],
            "period": [
              {
                $group: {
                  _id: null,
                  day: { $sum: { $cond: [{ $gte: ["$createdAt", last24h] }, 1, 0] } },
                  week: { $sum: { $cond: [{ $gte: ["$createdAt", last7d] }, 1, 0] } },
                  month: { $sum: { $cond: [{ $gte: ["$createdAt", last30d] }, 1, 0] } }
                }
              }
            ]
          }
        }
      ]).catch(() => [{ statusCounts: [], period: [] }])
    ]);

    /* ================= FORMATTED RESPONSES ================= */
    const orderData = ordersAggregation[0] || {};

    const revenue = {
      day: orderData.day?.[0]?.revenue || 0,
      week: orderData.week?.[0]?.revenue || 0,
      month: orderData.month?.[0]?.revenue || 0,
    };

    const counts = {
      day: orderData.day?.[0]?.count || 0,
      week: orderData.week?.[0]?.count || 0,
      month: orderData.month?.[0]?.count || 0,
    };

    const health = {
      day: {
        success: orderData.day?.[0]?.successCount || 0,
        failed: orderData.day?.[0]?.failedCount || 0,
        pending: orderData.day?.[0]?.pendingCount || 0,
      },
      week: {
        success: orderData.week?.[0]?.successCount || 0,
        failed: orderData.week?.[0]?.failedCount || 0,
        pending: orderData.week?.[0]?.pendingCount || 0,
      },
      month: {
        success: orderData.month?.[0]?.successCount || 0,
        failed: orderData.month?.[0]?.failedCount || 0,
        pending: orderData.month?.[0]?.pendingCount || 0,
      }
    };

    // Loyalty & Repeat Customer Metrics
    const buyerData = repeatCustomerStats[0] || { totalBuyers: 0, repeatBuyers: 0 };
    const repeatRate = buyerData.totalBuyers > 0 
      ? Math.round((buyerData.repeatBuyers / buyerData.totalBuyers) * 100) 
      : 0;

    // AOV Metrics
    const currentPeriodRev = days === 30 ? revenue.month : (days === 7 ? revenue.week : revenue.day);
    const currentPeriodOrders = days === 30 ? counts.month : (days === 7 ? counts.week : counts.day);
    const overallAov = currentPeriodOrders > 0 ? Math.round(currentPeriodRev / currentPeriodOrders) : 0;

    const aovMetrics = {
      aov: overallAov,
      periodAov: {
        day: counts.day > 0 ? Math.round(revenue.day / counts.day) : 0,
        week: counts.week > 0 ? Math.round(revenue.week / counts.week) : 0,
        month: counts.month > 0 ? Math.round(revenue.month / counts.month) : 0,
      }
    };

    // Platform Split
    const rawPlatformStats = orderData.platformStats || [];
    let pwaOrders = 0;
    let pwaRevenue = 0;
    let pwaSuccess = 0;
    let webOrders = 0;
    let webRevenue = 0;
    let webSuccess = 0;

    rawPlatformStats.forEach((p) => {
      if (p._id === "pwa") {
        pwaOrders = p.totalOrders || 0;
        pwaRevenue = p.revenue || 0;
        pwaSuccess = p.successOrders || 0;
      } else {
        webOrders += p.totalOrders || 0;
        webRevenue += p.revenue || 0;
        webSuccess += p.successOrders || 0;
      }
    });

    const totalPeriodRev = pwaRevenue + webRevenue || 1;
    const platformStats = {
      web: {
        orders: webOrders,
        revenue: webRevenue,
        successRate: webOrders > 0 ? Math.round((webSuccess / webOrders) * 100) : 0,
        revenueShare: Math.round((webRevenue / totalPeriodRev) * 100)
      },
      pwa: {
        orders: pwaOrders,
        revenue: pwaRevenue,
        successRate: pwaOrders > 0 ? Math.round((pwaSuccess / pwaOrders) * 100) : 0,
        revenueShare: Math.round((pwaRevenue / totalPeriodRev) * 100)
      }
    };

    // Wallet & Tx Stats
    const txData = txAggregation[0] || {};
    const walletStats = {
      totalBalance: walletBalanceAgg[0]?.totalBalance || 0,
      activeWallets: walletBalanceAgg[0]?.activeWallets || 0,
      deposits: {
        day: txData.deposits?.[0]?.day || 0,
        week: txData.deposits?.[0]?.week || 0,
        month: txData.deposits?.[0]?.month || 0,
      },
      usage: {
        day: txData.usage?.[0]?.day || 0,
        week: txData.usage?.[0]?.week || 0,
        month: txData.usage?.[0]?.month || 0,
      }
    };

    const txStats = {
      counts: counts,
      volume: revenue
    };

    // Users & Customers Stats
    const userEngagement = usersStatsAgg[0] || {};
    const payingFacet = payingUsersFacet[0] || {};

    const payingStats = {
      allTime: payingFacet.allTime?.[0]?.count || 0,
      day: payingFacet.day?.[0]?.count || 0,
      week: payingFacet.week?.[0]?.count || 0,
      month: payingFacet.month?.[0]?.count || 0,
    };

    const activeStats = {
      day: userEngagement.active?.[0]?.day || 0,
      week: userEngagement.active?.[0]?.week || 0,
      month: userEngagement.active?.[0]?.month || 0,
    };

    const newStats = {
      day: userEngagement.new?.[0]?.day || 0,
      week: userEngagement.new?.[0]?.week || 0,
      month: userEngagement.new?.[0]?.month || 0,
    };

    const conversionStats = {
      allTime: totalUsersCount > 0 ? Math.round((payingStats.allTime / totalUsersCount) * 100) : 0,
      day: totalUsersCount > 0 ? Math.max(Math.round((payingStats.day / totalUsersCount) * 100), payingStats.day > 0 ? 1 : 0) : 0,
      week: totalUsersCount > 0 ? Math.max(Math.round((payingStats.week / totalUsersCount) * 100), payingStats.week > 0 ? 1 : 0) : 0,
      month: totalUsersCount > 0 ? Math.max(Math.round((payingStats.month / totalUsersCount) * 100), payingStats.month > 0 ? 1 : 0) : 0,
    };

    // PWA Stats
    const pwaStats = {
      totalInstalls: pwaInstallsCount,
      activeDevices: pwaActiveCount,
      dismissCount: pwaDismissCount,
      totalPushSubscribers: pwaPushCount,
      periodPush: periodPushCount,
      byOS: pwaOsStats || [],
      byDevice: pwaDeviceStats || []
    };

    // Coin Stats
    const coinOverall = coinStatsAgg[0]?.overall || [];
    const coinToday = coinStatsAgg[0]?.today || [];
    const coinStats = {
      totalEarned: coinOverall.find((s) => s._id === "earn")?.total || 0,
      totalSpent: coinOverall.find((s) => s._id === "spend")?.total || 0,
      todayEarned: coinToday.find((s) => s._id === "earn")?.total || 0,
      todaySpent: coinToday.find((s) => s._id === "spend")?.total || 0,
      totalAvailable: userCoinsAgg[0]?.total || 0,
    };

    // Support Stats
    const supportFacet = supportStatsFacet[0] || {};
    const supportStatusCounts = supportFacet.statusCounts || [];
    const supportTotal = supportStatusCounts.reduce((acc, curr) => acc + curr.count, 0);
    const supportResolved = supportStatusCounts.find((s) => s._id === "resolved")?.count || 0;
    const supportOpen = supportTotal - supportResolved;

    const supportStats = {
      total: supportTotal,
      open: supportOpen,
      resolved: supportResolved,
      resolutionRate: supportTotal > 0 ? Math.round((supportResolved / supportTotal) * 100) : 100,
      periodStats: {
        day: supportFacet.period?.[0]?.day || 0,
        week: supportFacet.period?.[0]?.week || 0,
        month: supportFacet.period?.[0]?.month || 0,
      },
      today: supportFacet.period?.[0]?.day || 0,
    };

    const finalResult = {
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
      orderStats: {
        revenue,
        counts,
        health,
      },
      totalOrders: totalOrdersCount,
      topProducts: orderData.topProducts || [],
      topGames: orderData.topGames || [],
      paymentMethods: orderData.paymentMethods || [],
      revenueTrend: orderData.revenueTrend || [],
      peakHours: orderData.peakHours || [],
      topSpenders: orderData.topSpenders || [],
      aovMetrics,
      loyalty: {
        totalBuyers: buyerData.totalBuyers,
        repeatBuyers: buyerData.repeatBuyers,
        repeatRate,
      },
      platformStats,
      txStats,
      walletStats,
      userStats: {
        total: totalUsersCount,
        payingStats,
        conversionStats,
        activeStats,
        newStats
      },
      pwaStats,
      coinStats,
      supportStats
    };

    // Save to Cache
    setCachedData(cacheKey, finalResult);

    return NextResponse.json(finalResult, {
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=30",
      },
    });

  } catch (error) {
    console.error("[Unified Analytics API Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: error.status || 500 }
    );
  }
}
