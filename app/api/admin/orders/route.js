import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

/* =========================
   AUTH HELPER
========================= */
function verifyOwner(req) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw { status: 401, message: "Unauthorized" };
  }

  const token = auth.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw { status: 401, message: "Invalid or expired token" };
  }

  if (decoded.userType !== "owner") {
    throw { status: 403, message: "Forbidden" };
  }

  return decoded;
}

/* =========================
   GET ALL ORDERS (OWNER)
   + Pagination + Search + Filters
========================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyOwner(req);

    /* ================= STATS (ORDERS) ================= */
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");
    const periodParam = searchParams.get("period");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const now = new Date();
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(now.getTime() + istOffsetMs);
    
    // IST Boundaries
    const startOfTodayIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate()) - istOffsetMs);
    const startOfYesterdayIST = new Date(startOfTodayIST.getTime() - 24 * 60 * 60 * 1000);
    const endOfYesterdayIST = new Date(startOfTodayIST.getTime() - 1);
    const startOfThisMonthIST = new Date(Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), 1) - istOffsetMs);

    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let periodStartDate = last24h;
    let periodEndDate = now;
    let days = parseInt(daysParam) || 1;

    if (periodParam === "yesterday" || daysParam === "yesterday") {
      periodStartDate = startOfYesterdayIST;
      periodEndDate = endOfYesterdayIST;
      days = 1;
    } else if (periodParam === "this_month" || daysParam === "this_month") {
      periodStartDate = startOfThisMonthIST;
      periodEndDate = now;
      days = Math.max(Math.ceil((now.getTime() - startOfThisMonthIST.getTime()) / (24 * 60 * 60 * 1000)), 1);
    } else if (periodParam === "custom" || (startDateParam && endDateParam)) {
      periodStartDate = new Date(startDateParam);
      periodEndDate = new Date(endDateParam);
      days = Math.max(Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (24 * 60 * 60 * 1000)), 1);
    } else if (days === 30 || periodParam === "month") {
      periodStartDate = last30d;
      periodEndDate = now;
      days = 30;
    } else if (days === 7 || periodParam === "week") {
      periodStartDate = last7d;
      periodEndDate = now;
      days = 7;
    } else {
      periodStartDate = startOfTodayIST;
      periodEndDate = now;
      days = 1;
    }

    const periodDateMatch = {
      $gte: periodStartDate,
      $lte: periodEndDate
    };

    /* ================= SINGLE OPTIMIZED AGGREGATION ================= */
    const [statsResult, totalOrders, repeatCustomerStats, periodBuyersAgg] = await Promise.all([
      Order.aggregate([
        {
          $facet: {
            "selectedPeriod": [
              { $match: { createdAt: periodDateMatch } },
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
            "day": [
              { $match: { createdAt: { $gte: startOfTodayIST } } },
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
              { $match: { status: "success", createdAt: periodDateMatch } },
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
              { $match: { status: "success", createdAt: periodDateMatch } },
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
              { $match: { createdAt: periodDateMatch } },
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
              { $match: { status: "success", createdAt: periodDateMatch } },
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
              { $match: { status: "success", createdAt: periodDateMatch } },
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
              { $match: { status: "success", createdAt: periodDateMatch, email: { $exists: true, $ne: "" } } },
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
              { $match: { createdAt: periodDateMatch } },
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
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { email: { $exists: true, $ne: "" }, status: "success", createdAt: periodDateMatch } },
        { $group: { _id: { $toLower: "$email" }, orderCount: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            totalBuyers: { $sum: 1 },
            repeatBuyers: { $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] } }
          }
        }
      ]),
      Order.aggregate([
        { 
          $match: { 
            status: "success", 
            createdAt: periodDateMatch,
            email: { $exists: true, $ne: "" } 
          } 
        },
        {
          $group: {
            _id: { $toLower: "$email" },
            revenue: { $sum: "$price" },
            orders: { $sum: 1 }
          }
        }
      ])
    ]);

    const stats = statsResult[0];

    // Compute New vs Returning Buyers
    const distinctEmails = (periodBuyersAgg || []).map(b => b._id).filter(Boolean);
    const priorBuyers = distinctEmails.length > 0 ? await Order.distinct("email", {
      status: "success",
      email: { $in: distinctEmails },
      createdAt: { $lt: periodStartDate }
    }) : [];

    const priorBuyerSet = new Set(priorBuyers.map(e => (e || "").toLowerCase()));

    let newBuyerRev = 0;
    let newBuyerOrders = 0;
    let newBuyerCount = 0;

    let returningBuyerRev = 0;
    let returningBuyerOrders = 0;
    let returningBuyerCount = 0;

    (periodBuyersAgg || []).forEach(b => {
      if (priorBuyerSet.has(b._id)) {
        returningBuyerCount += 1;
        returningBuyerRev += (b.revenue || 0);
        returningBuyerOrders += (b.orders || 0);
      } else {
        newBuyerCount += 1;
        newBuyerRev += (b.revenue || 0);
        newBuyerOrders += (b.orders || 0);
      }
    });

    const totalSplitRev = newBuyerRev + returningBuyerRev;
    const buyerSplit = {
      newBuyers: {
        count: newBuyerCount,
        orders: newBuyerOrders,
        revenue: newBuyerRev,
        sharePct: totalSplitRev > 0 ? Math.round((newBuyerRev / totalSplitRev) * 100) : 0
      },
      returningBuyers: {
        count: returningBuyerCount,
        orders: returningBuyerOrders,
        revenue: returningBuyerRev,
        sharePct: totalSplitRev > 0 ? Math.round((returningBuyerRev / totalSplitRev) * 100) : 0
      },
      totalBuyers: (periodBuyersAgg || []).length,
      repeatRate: (periodBuyersAgg || []).length > 0 ? Math.round((returningBuyerCount / periodBuyersAgg.length) * 100) : 0
    };

    const selEntry = stats.selectedPeriod?.[0] || { revenue: 0, count: 0, successCount: 0, failedCount: 0, pendingCount: 0 };

    const revenue = {
      day: stats.day[0]?.revenue || 0,
      week: stats.week[0]?.revenue || 0,
      month: stats.month[0]?.revenue || 0,
      selected: selEntry.revenue || 0,
    };

    const counts = {
      day: stats.day[0]?.count || 0,
      week: stats.week[0]?.count || 0,
      month: stats.month[0]?.count || 0,
      selected: selEntry.count || 0,
    };

    const health = {
      day: {
        success: stats.day[0]?.successCount || 0,
        failed: stats.day[0]?.failedCount || 0,
        pending: stats.day[0]?.pendingCount || 0,
      },
      week: {
        success: stats.week[0]?.successCount || 0,
        failed: stats.week[0]?.failedCount || 0,
        pending: stats.week[0]?.pendingCount || 0,
      },
      month: {
        success: stats.month[0]?.successCount || 0,
        failed: stats.month[0]?.failedCount || 0,
        pending: stats.month[0]?.pendingCount || 0,
      },
      selected: {
        success: selEntry.successCount || 0,
        failed: selEntry.failedCount || 0,
        pending: selEntry.pendingCount || 0,
      }
    };

    const buyerData = repeatCustomerStats[0] || { totalBuyers: 0, repeatBuyers: 0 };
    const repeatRate = buyerData.totalBuyers > 0 
      ? Math.round((buyerData.repeatBuyers / buyerData.totalBuyers) * 100) 
      : 0;

    const currentPeriodRevenue = days === 30 ? revenue.month : (days === 7 ? revenue.week : revenue.day);
    const currentPeriodSuccessCount = days === 30 ? health.month.success : (days === 7 ? health.week.success : health.day.success);
    
    const aov = currentPeriodSuccessCount > 0 ? Math.round(currentPeriodRevenue / currentPeriodSuccessCount) : 0;
    const basketSize = buyerData.totalBuyers > 0 ? (currentPeriodSuccessCount / buyerData.totalBuyers).toFixed(1) : "1.0";

    // Fill missing dates so the chart timeline is always complete and continuous
    const rawTrend = stats.revenueTrend || [];
    const trendMap = Object.fromEntries(rawTrend.map((t) => [t._id, t]));
    const filledTrend = [];
    const numDays = Math.min(Math.max(days, 1), 60);

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(periodEndDate.getTime() - i * 24 * 60 * 60 * 1000);
      const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
      const dateStr = istDate.toISOString().slice(0, 10);
      filledTrend.push({
        _id: dateStr,
        revenue: trendMap[dateStr]?.revenue || 0,
        orders: trendMap[dateStr]?.orders || 0,
      });
    }

    const platformList = stats.platformStats || [];
    const pwaEntry = platformList.find(p => p._id === "pwa") || { totalOrders: 0, revenue: 0, successOrders: 0, failedOrders: 0, pendingOrders: 0 };
    const webEntry = platformList.find(p => p._id === "web") || { totalOrders: 0, revenue: 0, successOrders: 0, failedOrders: 0, pendingOrders: 0 };

    const allTimePlatformList = stats.allTimePlatform || [];
    const allTimePwa = allTimePlatformList.find(p => p._id === "pwa") || { totalOrders: 0, revenue: 0, successOrders: 0 };
    const allTimeWeb = allTimePlatformList.find(p => p._id === "web") || { totalOrders: 0, revenue: 0, successOrders: 0 };

    const totalPeriodPlatformRevenue = (pwaEntry.revenue || 0) + (webEntry.revenue || 0);
    const totalPeriodPlatformOrders = (pwaEntry.totalOrders || 0) + (webEntry.totalOrders || 0);

    const platformBreakdown = {
      pwa: {
        revenue: pwaEntry.revenue || 0,
        orders: pwaEntry.totalOrders || 0,
        success: pwaEntry.successOrders || 0,
        failed: pwaEntry.failedOrders || 0,
        pending: pwaEntry.pendingOrders || 0,
        aov: pwaEntry.successOrders > 0 ? Math.round(pwaEntry.revenue / pwaEntry.successOrders) : 0,
        revenueShare: totalPeriodPlatformRevenue > 0 ? Math.round((pwaEntry.revenue / totalPeriodPlatformRevenue) * 100) : 0,
        orderShare: totalPeriodPlatformOrders > 0 ? Math.round((pwaEntry.totalOrders / totalPeriodPlatformOrders) * 100) : 0,
        successRate: pwaEntry.totalOrders > 0 ? Math.round((pwaEntry.successOrders / pwaEntry.totalOrders) * 100) : 0,
      },
      web: {
        revenue: webEntry.revenue || 0,
        orders: webEntry.totalOrders || 0,
        success: webEntry.successOrders || 0,
        failed: webEntry.failedOrders || 0,
        pending: webEntry.pendingOrders || 0,
        aov: webEntry.successOrders > 0 ? Math.round(webEntry.revenue / webEntry.successOrders) : 0,
        revenueShare: totalPeriodPlatformRevenue > 0 ? Math.round((webEntry.revenue / totalPeriodPlatformRevenue) * 100) : 0,
        orderShare: totalPeriodPlatformOrders > 0 ? Math.round((webEntry.totalOrders / totalPeriodPlatformOrders) * 100) : 0,
        successRate: webEntry.totalOrders > 0 ? Math.round((webEntry.successOrders / webEntry.totalOrders) * 100) : 0,
      },
      allTime: {
        pwaRevenue: allTimePwa.revenue || 0,
        pwaOrders: allTimePwa.totalOrders || 0,
        pwaSuccess: allTimePwa.successOrders || 0,
        webRevenue: allTimeWeb.revenue || 0,
        webOrders: allTimeWeb.totalOrders || 0,
        webSuccess: allTimeWeb.successOrders || 0,
      }
    };

    return Response.json({
      success: true,
      total: totalOrders,
      orderStats: {
        revenue,
        counts,
        health,
      },
      aovMetrics: {
        aov,
        basketSize,
        totalBuyers: buyerData.totalBuyers,
      },
      buyerSplit,
      platformStats: platformBreakdown,
      topProducts: stats.topProducts || [],
      topGames: stats.topGames || [],
      paymentMethods: stats.paymentMethods || [],
      revenueTrend: filledTrend,
      peakHours: stats.peakHours || [],
      topSpenders: stats.topSpenders || [],
      loyalty: {
        totalBuyers: buyerData.totalBuyers,
        repeatBuyers: buyerData.repeatBuyers,
        repeatRate
      }
    });

  } catch (err) {
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}

/* =========================
   UPDATE ORDER STATUS
   (UNCHANGED)
========================= */
export async function PATCH(req) {
  try {
    await connectDB();
    verifyOwner(req);

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return Response.json(
        { success: false, message: "orderId and status required" },
        { status: 400 }
      );
    }

    const allowedStatus = ["pending", "success", "failed", "processing", "cancelled", "refund", "Refund", "REFUND"];
    if (!allowedStatus.includes(status)) {
      return Response.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const update = {
      status,
      updatedAt: new Date(),
    };

    if (status === "success") {
      update.paymentStatus = "success";
      update.topupStatus = "success";
    }

    if (status === "failed") {
      update.topupStatus = "failed";
    }

    if (status === "processing") {
      update.topupStatus = "processing";
    }

    if (status === "refund" || status === "REFUND" || status === "Refund") {
      update.topupStatus = "refund";
      update.paymentStatus = "refund";
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      update,
      { new: true }
    ).select("-gatewayResponse -externalResponse");

    if (!order) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Trigger push notification to user in background ONLY on SUCCESS
    if (status === "success" && order.userId) {
      import("@/lib/webPush").then(({ broadcastPushNotification }) => {
        broadcastPushNotification(
          {
            title: "🎉 Top-up Successful!",
            body: `Your order #${order.orderId} for ${order.itemName || "Diamonds"} has been delivered successfully.`,
            url: "/dashboard/orders",
            icon: "/logoBB.png",
            tag: `order-${order.orderId}`,
          },
          { userId: order.userId }
        ).catch(() => {});
      }).catch(() => {});
    }

    return Response.json({
      success: true,
      message: "Order status updated",
      data: order,
    });

  } catch (err) {
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
