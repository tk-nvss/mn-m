import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Owner only
    if (decoded.userType !== "owner") {
      return Response.json({ message: "Forbidden" }, { status: 403 });
    }

    /* ================= STATS ================= */
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    /* ================= BASE FILTER ================= */
    let filter = {
      $or: [
        { status: "success" },
        { paymentStatus: { $in: ["success", "completed", "paid"] } }
      ]
    };

    /* ================= SINGLE OPTIMIZED AGGREGATION ================= */
    const [statsResult, totalTx] = await Promise.all([
      Order.aggregate([
        {
          $facet: {
            "day": [
              { $match: { ...filter, createdAt: { $gte: last24h } } },
              { $group: { _id: null, count: { $sum: 1 }, volume: { $sum: "$price" } } }
            ],
            "week": [
              { $match: { ...filter, createdAt: { $gte: last7d } } },
              { $group: { _id: null, count: { $sum: 1 }, volume: { $sum: "$price" } } }
            ],
            "month": [
              { $match: { ...filter, createdAt: { $gte: last30d } } },
              { $group: { _id: null, count: { $sum: 1 }, volume: { $sum: "$price" } } }
            ]
          }
        }
      ]),
      Order.countDocuments(filter)
    ]);

    const statsResultData = statsResult[0];

    return Response.json({
      success: true,
      total: totalTx,
      stats: {
        counts: {
          day: statsResultData.day[0]?.count || 0,
          week: statsResultData.week[0]?.count || 0,
          month: statsResultData.month[0]?.count || 0,
        },
        volume: {
          day: statsResultData.day[0]?.volume || 0,
          week: statsResultData.week[0]?.volume || 0,
          month: statsResultData.month[0]?.volume || 0,
        }
      }
    });
  } catch (err) {
    console.error("Transaction API Error:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
