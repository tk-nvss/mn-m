import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CoinTask from "@/models/CoinTask";
import CoinTaskClaim from "@/models/CoinTaskClaim";
import { createCoinTx } from "@/lib/coinService";

// ── Auth Helper ──────────────────────────────────────────────────────────────
async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded: any = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    const user = await User.findOne({ _id: decoded.userId }).select("userType userId email");
    if (!user || !["admin", "owner"].includes(user.userType)) {
      if (user) {
        const { autoBlocklist } = await import("@/lib/autoBlocklist");
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        await autoBlocklist("ip", ip, "Unauthorized Admin API Access");
        await autoBlocklist("email", user.email, "Unauthorized Admin API Access");
      }
      return null;
    }
    return { ...decoded, adminUserId: user.userId };
  } catch {
    return null;
  }
}

// ── GET: List all pending claims (admin view) ────────────────────────────────
export async function GET(req: Request) {
  try {
    await connectDB();
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "pending"; // pending | approved | rejected | all
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = status === "all" ? {} : { status };

    const [claims, total] = await Promise.all([
      CoinTaskClaim.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CoinTaskClaim.countDocuments(filter),
    ]);

    // Enrich with user name/email
    const userIds = [...new Set(claims.map((c: any) => c.userId))];
    const users = await User.find({ userId: { $in: userIds } }).select("userId name email");
    const userMap: Record<string, any> = {};
    users.forEach((u: any) => { userMap[u.userId] = u; });

    const enriched = claims.map((c: any) => ({
      ...c.toObject(),
      userName: userMap[c.userId]?.name || "Unknown",
      userEmail: userMap[c.userId]?.email || "",
    }));

    return NextResponse.json({
      success: true,
      claims: enriched,
      total,
      page,
      pages: Math.ceil(total / limit),
      pendingCount: await CoinTaskClaim.countDocuments({ status: "pending" }),
    });
  } catch (error) {
    console.error("[admin/coins/claims GET]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ── POST: Approve or Reject a claim ─────────────────────────────────────────
export async function POST(req: Request) {
  try {
    await connectDB();
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    const { claimId, action, rejectionReason } = await req.json();
    // action: "approve" | "reject"

    if (!claimId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({
        success: false,
        message: "claimId and action (approve|reject) are required",
      }, { status: 400 });
    }

    const claim = await CoinTaskClaim.findOne({ claimId });
    if (!claim) return NextResponse.json({ success: false, message: "Claim not found" }, { status: 404 });

    if (claim.status !== "pending") {
      return NextResponse.json({
        success: false,
        message: `Claim already ${claim.status}. Cannot process again.`,
      });
    }

    const now = new Date();

    if (action === "reject") {
      await CoinTaskClaim.findOneAndUpdate(
        { claimId },
        {
          $set: {
            status: "rejected",
            reviewedBy: admin.adminUserId,
            reviewedAt: now,
            rejectionReason: rejectionReason || "Not approved by admin",
          },
        }
      );
      return NextResponse.json({
        success: true,
        message: `Claim rejected for user ${claim.userId}`,
      });
    }

    // ── APPROVE: Award coins ─────────────────────────────────────────────
    const user = await User.findOne({ userId: claim.userId });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found for this claim" }, { status: 404 });
    }

    const balanceBefore = user.coins || 0;
    const balanceAfter = balanceBefore + claim.coins;

    // Atomic coin award
    await User.findOneAndUpdate(
      { userId: claim.userId },
      { $inc: { coins: claim.coins } }
    );

    // Mark claim approved
    await CoinTaskClaim.findOneAndUpdate(
      { claimId },
      {
        $set: {
          status: "approved",
          reviewedBy: admin.adminUserId,
          reviewedAt: now,
        },
      }
    );

    // Mark task as completed by this user
    await CoinTask.findOneAndUpdate(
      { taskId: claim.taskId },
      { $addToSet: { completedBy: claim.userId } }
    );

    // Log coin transaction
    await createCoinTx({
      user,
      type: "earn",
      coins: claim.coins,
      balanceBefore,
      balanceAfter,
      source: "task",
      description: `Task Approved: ${claim.taskTitle}`,
      referenceId: claim.claimId,
      performedBy: "admin",
    });

    return NextResponse.json({
      success: true,
      message: `Approved! +${claim.coins} coins awarded to ${user.name || claim.userId}`,
      coinsAwarded: claim.coins,
    });
  } catch (error) {
    console.error("[admin/coins/claims POST]", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
