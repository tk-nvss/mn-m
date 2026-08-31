import { connectDB } from "@/lib/mongodb";
import SupportQuery from "@/models/SupportQuery";
import jwt from "jsonwebtoken";

/* ================= AUTH (ADMIN ONLY) ================= */
function verifyAdmin(req) {
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

  if (decoded.userType !== "admin" && decoded.userType !== "owner") {
    throw { status: 403, message: "Forbidden" };
  }

  return decoded;
}

/* ================= GET ALL QUERIES ================= */
export async function GET(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    /* ================= STATS ================= */
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [statsFacet, totalCount] = await Promise.all([
      SupportQuery.aggregate([
        {
          $facet: {
            "statusCounts": [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            "period": [
              {
                $group: {
                  _id: null,
                  day: { $sum: { $cond: [{ $gte: ["$createdAt", last24h] }, 1, 0] } },
                  week: { $sum: { $cond: [{ $gte: ["$createdAt", last7d] }, 1, 0] } },
                  month: { $sum: { $cond: [{ $gte: ["$createdAt", last30d] }, 1, 0] } },
                }
              }
            ]
          }
        }
      ]),
      SupportQuery.countDocuments({})
    ]);

    const statusCounts = statsFacet[0]?.statusCounts || [];
    const periodData = statsFacet[0]?.period?.[0] || { day: 0, week: 0, month: 0 };

    let openCount = 0;
    let resolvedCount = 0;

    for (const item of statusCounts) {
      if (["open", "in_progress"].includes(item._id)) {
        openCount += item.count;
      } else if (["resolved", "closed"].includes(item._id)) {
        resolvedCount += item.count;
      }
    }

    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

    return Response.json({
      success: true,
      stats: {
        total: totalCount,
        open: openCount,
        resolved: resolvedCount,
        resolutionRate,
        periodStats: periodData,
        today: periodData.day,
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
