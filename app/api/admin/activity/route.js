import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import WalletTransaction from "@/models/WalletTransaction";
import User from "@/models/User";
import SupportQuery from "@/models/SupportQuery";
import PwaInstall from "@/models/PwaInstall";
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

export async function GET(req) {
  try {
    await connectDB();
    verifyOwner(req);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 10, 100);
    const page = Math.max(parseInt(searchParams.get("page")) || 1, 1);
    const type = searchParams.get("type") || "all";
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let dateQuery = {};
    if (startDateParam) {
      dateQuery.$gte = new Date(startDateParam);
    }
    if (endDateParam) {
      dateQuery.$lte = new Date(endDateParam);
    }

    const fetchOrders = type === "all" || type === "orders";
    const fetchWallet = type === "all" || type === "wallet";
    const fetchUsers = type === "all" || type === "users";
    const fetchSupport = type === "all" || type === "support";
    const fetchPwa = type === "all" || type === "pwa";

    // Build base queries
    const orderFilter = {
      ...(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {}),
      ...(search ? {
        $or: [
          { orderId: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { itemName: { $regex: search, $options: "i" } },
          { playerName: { $regex: search, $options: "i" } },
          { gameSlug: { $regex: search, $options: "i" } },
        ]
      } : {})
    };

    const walletFilter = {
      ...(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {}),
      ...(search ? {
        $or: [
          { transactionId: { $regex: search, $options: "i" } },
          { userId: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ]
      } : {})
    };

    const userFilter = {
      ...(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {}),
      ...(search ? {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { userId: { $regex: search, $options: "i" } },
        ]
      } : {})
    };

    const supportFilter = {
      ...(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {}),
      ...(search ? {
        $or: [
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { orderId: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
        ]
      } : {})
    };

    const pwaFilter = {
      ...(Object.keys(dateQuery).length ? { createdAt: dateQuery } : {}),
      ...(search ? {
        $or: [
          { os: { $regex: search, $options: "i" } },
          { browser: { $regex: search, $options: "i" } },
          { event: { $regex: search, $options: "i" } },
        ]
      } : {})
    };

    const fetchLimit = limit * page + 20;

    const [orders, walletTxns, newUsers, supportQueries, pwaEvents] = await Promise.all([
      fetchOrders ? Order.find(orderFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean() : [],
      fetchWallet ? WalletTransaction.find(walletFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean() : [],
      fetchUsers ? User.find(userFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean() : [],
      fetchSupport ? SupportQuery.find(supportFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean() : [],
      fetchPwa ? PwaInstall.find(pwaFilter).sort({ createdAt: -1 }).limit(fetchLimit).lean() : [],
    ]);

    const events = [];

    // Format Orders
    orders.forEach((o) => {
      const isSuccess = o.status === "success";
      const isFailed = o.status === "failed" || o.status === "FAILED";
      const maskedEmail = o.email ? o.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length)) : "Customer";
      
      events.push({
        id: `order_${o._id}`,
        type: "order",
        title: `${o.itemName || "Game Top-up"} (${(o.gameSlug || "Game").toUpperCase()})`,
        subtitle: `Order by ${o.playerName ? `${o.playerName} (${maskedEmail})` : maskedEmail}`,
        amount: o.price || 0,
        currency: "₹",
        status: isSuccess ? "success" : (isFailed ? "failed" : "pending"),
        statusText: isSuccess ? "Paid & Delivered" : (isFailed ? "Failed / Cancelled" : "Pending Payment"),
        platform: o.platform || "web",
        timestamp: o.createdAt || new Date(),
        details: {
          orderId: o.orderId,
          paymentMethod: o.paymentMethod || "UPI",
          playerId: o.playerId,
          zoneId: o.zoneId,
        }
      });
    });

    // Format Wallet Transactions
    walletTxns.forEach((w) => {
      const isCredit = w.type === "credit";
      events.push({
        id: `wallet_${w._id}`,
        type: "wallet",
        title: isCredit ? "Wallet Money Added" : "Wallet Balance Spent",
        subtitle: `${w.description || (isCredit ? "Deposit added" : "Payment deducted")} • User: ${w.userId || "Customer"}`,
        amount: w.amount || 0,
        currency: "₹",
        status: w.status === "success" ? "success" : (w.status === "failed" ? "failed" : "pending"),
        statusText: isCredit ? `+₹${w.amount} Added` : `-₹${w.amount} Spent`,
        platform: "wallet",
        timestamp: w.createdAt || new Date(),
        details: {
          transactionId: w.transactionId,
          type: w.type,
          balanceAfter: w.balanceAfter
        }
      });
    });

    // Format New Users
    newUsers.forEach((u) => {
      const maskedEmail = u.email ? u.email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length)) : "New Member";
      events.push({
        id: `user_${u._id}`,
        type: "user",
        title: "New User Registered",
        subtitle: `${u.name ? `${u.name} (${maskedEmail})` : maskedEmail} joined the store`,
        amount: null,
        status: "success",
        statusText: "New Account",
        platform: u.provider || "web",
        timestamp: u.createdAt || new Date(),
        details: {
          userId: u.userId,
          provider: u.provider || "email"
        }
      });
    });

    // Format Support Queries
    supportQueries.forEach((s) => {
      events.push({
        id: `support_${s._id}`,
        type: "support",
        title: `Help Request: ${s.type || "Support Query"}`,
        subtitle: `${s.name || s.email || "Customer"}: "${(s.message || "").slice(0, 60)}${(s.message || "").length > 60 ? "..." : ""}"`,
        amount: null,
        status: s.status === "resolved" ? "success" : (s.status === "open" ? "pending" : "in_progress"),
        statusText: s.status === "resolved" ? "Resolved" : "Open Query",
        platform: "web",
        timestamp: s.createdAt || new Date(),
        details: {
          orderId: s.orderId,
          phone: s.phone || s.phoneNo
        }
      });
    });

    // Format PWA Events
    pwaEvents.forEach((p) => {
      if (p.event === "installed") {
        events.push({
          id: `pwa_${p._id}`,
          type: "pwa",
          title: "New Mobile App Install",
          subtitle: `App installed on ${p.os || "Mobile"} (${p.browser || "Browser"})`,
          amount: null,
          status: "success",
          statusText: "App Installed",
          platform: "pwa",
          timestamp: p.createdAt || new Date(),
          details: {
            os: p.os,
            browser: p.browser,
            deviceType: p.deviceType
          }
        });
      }
    });

    // Sort all unified events newest first
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const totalCount = events.length;
    const startIndex = (page - 1) * limit;
    const paginatedEvents = events.slice(startIndex, startIndex + limit);

    return Response.json({
      success: true,
      events: paginatedEvents,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });

  } catch (err) {
    return Response.json(
      { success: false, message: err.message || "Server error" },
      { status: err.status || 500 }
    );
  }
}
