import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import CoinTransaction from "@/models/CoinTransaction";
import { verifyHmac } from "@/lib/hmac";
import { generateTxId } from "@/utils/formatters";

/**
 * 7-Day Streak Reward Table
 * Day 1 & 2 → small reward (ease user in)
 * Day 3–5    → medium reward
 * Day 6      → large
 * Day 7      → big celebration reward → then streak resets to 0
 */
const STREAK_REWARDS = [2, 3, 5, 7, 10, 12, 15]; // index 0 = Day 1, index 6 = Day 7

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const rawBody = await req.text();
    
    if (!verifyHmac(req, rawBody, authHeader)) {
      return NextResponse.json({ success: false, message: "Forbidden: Invalid Signature" }, { status: 403 });
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId; // MongoDB _id stored in JWT
    const user = await User.findOne({ _id: userId });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });


    // ── IST-aware "today" check ──────────────────────────────────────────
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000);
    const todayIST = nowIST.toISOString().slice(0, 10); // "YYYY-MM-DD"

    let lastCheckinIST: string | null = null;
    let yesterdayIST: string | null = null;

    if (user.lastCheckin) {
      const lc = new Date(user.lastCheckin.getTime() + 5.5 * 60 * 60 * 1000);
      lastCheckinIST = lc.toISOString().slice(0, 10);

      // Calculate yesterday in IST
      const yest = new Date(nowIST);
      yest.setDate(yest.getDate() - 1);
      yesterdayIST = yest.toISOString().slice(0, 10);
    }

    // Already checked in today
    if (lastCheckinIST === todayIST) {
      return NextResponse.json({
        success: false,
        message: "Already checked in today! Come back tomorrow 🌙",
        coins: user.coins || 0,
        streak: user.checkinStreak || 0,
        nextReward: STREAK_REWARDS[Math.min((user.checkinStreak || 0), 6)],
        checkedInToday: true,
      });
    }

    // ── Determine new streak ─────────────────────────────────────────────
    let currentStreak = user.checkinStreak || 0;
    let newStreak: number;

    if (!lastCheckinIST) {
      // First ever check-in
      newStreak = 1;
    } else if (lastCheckinIST === yesterdayIST) {
      // Consecutive day — increment streak, cap then reset after 7
      newStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
    } else {
      // Streak broken (missed a day) — restart from day 1
      newStreak = 1;
    }

    // Reward = based on the DAY they're completing (newStreak)
    const rewardIndex = Math.min(newStreak - 1, 6); // 0-indexed, max Day 7
    const coinsToAward = STREAK_REWARDS[rewardIndex];

    const balanceBefore = user.coins || 0;
    const balanceAfter = balanceBefore + coinsToAward;

    // ── Atomic DB update (Optimistic Concurrency Control) ────────────────
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId,
        lastCheckin: user.lastCheckin // Fails if another concurrent request updated it
      },
      {
        $inc: { coins: coinsToAward },
        $set: {
          lastCheckin: nowUTC,
          checkinStreak: newStreak,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ 
        success: false, 
        message: "Already checked in or concurrent request detected. Please refresh." 
      }, { status: 429 });
    }

    // ── Log transaction ──────────────────────────────────────────────────
    const transactionId = generateTxId("CHECKIN");
    await CoinTransaction.create({
      transactionId,
      userId: user.userId,
      userObjectId: user._id,
      type: "earn",
      coins: coinsToAward,
      balanceBefore,
      balanceAfter,
      source: "checkin",
      description: `Day ${newStreak} Check-in${newStreak === 7 ? " 🎉 Week Complete!" : ""}`,
      performedBy: "system",
    });

    // Is the streak about to reset next time?
    const streakCompleted = newStreak === 7;
    // Next reward (preview for UI)
    const nextStreakDay = streakCompleted ? 1 : newStreak + 1;
    const nextReward = STREAK_REWARDS[Math.min(nextStreakDay - 1, 6)];

    return NextResponse.json({
      success: true,
      message: streakCompleted
        ? `🎉 Week complete! You earned ${coinsToAward} BBC!`
        : `Day ${newStreak} ✓  +${coinsToAward} BBC earned!`,
      coinsEarned: coinsToAward,
      newBalance: balanceAfter,
      streak: newStreak,
      streakCompleted,
      nextReward,
      rewards: STREAK_REWARDS, // send full table to UI
    });
  } catch (error) {
    console.error("[coins/checkin] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
