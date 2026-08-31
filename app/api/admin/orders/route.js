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
    const days = parseInt(searchParams.get("days")) || 1;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const periodMatchDate = days === 30 ? last30d : (days === 7 ? last7d : last24h);

    /* ================= SINGLE OPTIMIZED AGGREGATION ================= */
    const [statsResult, totalOrders, repeatCustomerStats] = await Promise.all([
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
            ]
          }
        }
      ]),
      Order.countDocuments({}),
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
      ])
    ]);

    const stats = statsResult[0];

    const revenue = {
      day: stats.day[0]?.revenue || 0,
      week: stats.week[0]?.revenue || 0,
      month: stats.month[0]?.revenue || 0,
    };

    const counts = {
      day: stats.day[0]?.count || 0,
      week: stats.week[0]?.count || 0,
      month: stats.month[0]?.count || 0,
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
    const numDays = days === 30 ? 30 : (days === 7 ? 7 : 7);

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const istDate = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
      const dateStr = istDate.toISOString().slice(0, 10);
      filledTrend.push({
        _id: dateStr,
        revenue: trendMap[dateStr]?.revenue || 0,
        orders: trendMap[dateStr]?.orders || 0,
      });
    }

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
