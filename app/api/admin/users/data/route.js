import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
    try {
        await connectDB();

        /* ================= AUTH ================= */
        const auth = req.headers.get("authorization");
        if (!auth?.startsWith("Bearer "))
            return Response.json({ message: "Unauthorized" }, { status: 401 });

        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userType !== "owner")
            return Response.json({ message: "Forbidden" }, { status: 403 });

        /* ================= QUERY PARAMS ================= */
        const { searchParams } = new URL(req.url);

        const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 10000);
        const search = searchParams.get("search")?.trim();
        const userType = searchParams.get("userType")?.trim() || searchParams.get("role")?.trim();
        const tag = searchParams.get("tag")?.trim();
        const promoStatus = searchParams.get("promoStatus")?.trim();

        const from = searchParams.get("from");
        const to = searchParams.get("to");

        const skip = (page - 1) * limit;

        /* ================= SORTING ================= */
        const sortBy = searchParams.get("sortBy") || "name";
        const explicitOrder = searchParams.get("order");
        
        // Default to Ascending (1) for name, Descending (-1) for dates/stats
        let order = sortBy === "name" ? 1 : -1;
        if (explicitOrder === "asc") order = 1;
        if (explicitOrder === "desc") order = -1;

        const sortMap = {
            name: { lowerName: order },
            joinDate: { createdAt: order },
            lastLogin: { lastLogin: order },
            totalOrders: { totalOrders: order },
            coins: { coins: order },
            lastPromoSentAt: { lastPromoSentAt: order },
            promo: { lastPromoSentAt: order }
        };

        const currentSort = sortMap[sortBy] || { lowerName: 1 };

        /* ================= FILTER ================= */
        let filter = {};

        // 🔍 Text search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { userId: { $regex: search, $options: "i" } },
            ];
        }

        // 👤 Filter by role
        if (userType && userType !== 'all') {
            filter.userType = userType;
        }

        // 🏷️ Filter by tag
        if (tag) {
            filter.tags = tag;
        }

        // ✉️ Filter by promo status
        if (promoStatus && promoStatus !== 'all') {
            if (promoStatus === 'never') {
                filter.lastPromoSentAt = { $in: [null, undefined] };
            } else if (promoStatus === 'sent') {
                filter.lastPromoSentAt = { $ne: null };
            } else if (promoStatus === 'sent_today') {
                const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
                filter.lastPromoSentAt = { $gte: past24h };
            } else if (promoStatus === 'sent_7d') {
                const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                filter.lastPromoSentAt = { $lte: sevenDaysAgo, $ne: null };
            } else if (promoStatus === 'sent_30d') {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                filter.lastPromoSentAt = { $lte: thirtyDaysAgo, $ne: null };
            }
        }

        // 📅 Filter by createdAt date range
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
        }

        /* ================= QUERYUS ================= */
        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: "orders",
                    let: {
                        customId: "$userId",
                        objectIdStr: { $toString: "$_id" }
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $or: [
                                                { $eq: ["$userId", "$$customId"] },
                                                { $eq: ["$userId", "$$objectIdStr"] }
                                            ]
                                        },
                                        { $in: ["$status", ["success", "SUCCESS"]] }
                                    ]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "orderStats"
                }
            },
            {
                $addFields: {
                    tags: { $ifNull: ["$tags", ["new"]] },
                    totalOrders: { $ifNull: [{ $arrayElemAt: ["$orderStats.count", 0] }, 0] },
                    lowerName: { $toLower: { $ifNull: ["$name", ""] } },
                    lastPromoSentAt: { $ifNull: ["$lastPromoSentAt", null] },
                    promoSentCount: { $ifNull: ["$promoSentCount", 0] }
                }
            },
            // 🔴 Sort first to ensure pagination works across the "all" results
            { $sort: currentSort },
            // 🔵 Paginate after sorting
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    password: 0,
                    orderStats: 0
                }
            }
        ];

        const [users, total] = await Promise.all([
            User.aggregate(pipeline),
            User.countDocuments(filter),
        ]);

        /* ================= RESPONSE ================= */
        return Response.json({
            success: true,
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        return Response.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
