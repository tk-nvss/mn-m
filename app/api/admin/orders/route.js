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
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    /* ================= SINGLE OPTIMIZED AGGREGATION ================= */
    const [statsResult, totalOrders] = await Promise.all([
      Order.aggregate([
        {
          $facet: {
            "day": [
              { $match: { createdAt: { $gte: last24h } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } }
                }
              }
            ],
            "week": [
              { $match: { createdAt: { $gte: last7d } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } }
                }
              }
            ],
            "month": [
              { $match: { createdAt: { $gte: last30d } } },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  revenue: { $sum: { $cond: [{ $eq: ["$status", "success"] }, "$price", 0] } }
                }
              }
            ]
          }
        }
      ]),
      Order.countDocuments({})
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

    return Response.json({
      success: true,
      total: totalOrders,
      orderStats: {
        revenue,
        counts,
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
