import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAdsConfig } from "@/lib/adsConfig";
import { verifyHmac } from "@/lib/hmac";
import { createCoinTx } from "@/lib/coinService";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    
    // HMAC Verification
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

    let bodyData = { adId: "watch_1" };
    try {
      if (rawBody) bodyData = JSON.parse(rawBody);
    } catch {}
    
    const { adId } = bodyData;
    if (!adId) return NextResponse.json({ success: false, message: "Ad ID required" }, { status: 400 });

    const userId = decoded.userId;
    const user = await User.findOne({ _id: userId });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    // Fetch dynamic ads configuration
    const adsConfig = await getAdsConfig();
    if (!adsConfig.enabled) {
      return NextResponse.json({ success: false, message: "Ad rewards are temporarily paused by admin" }, { status: 400 });
    }

    // Find specific channel config
    const channel = adsConfig.channels.find(c => c.id === adId);
    if (channel && channel.enabled === false) {
      return NextResponse.json({ success: false, message: "This ad channel is currently inactive" }, { status: 400 });
    }

    const rewardCoins = channel?.reward ?? adsConfig.defaultRewardCoins;
    const cooldownMs = channel?.cooldownMs ?? adsConfig.cooldownMs;
    const channelName = channel ? channel.title : adId;

    const now = new Date();
    const cutoffTime = new Date(now.getTime() - cooldownMs);

    // Atomic update: Check cooldown AND increment coins simultaneously
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        $or: [
          { [`lastAdTimes.${adId}`]: { $exists: false } },
          { [`lastAdTimes.${adId}`]: null },
          { [`lastAdTimes.${adId}`]: { $lte: cutoffTime } },
        ],
      },
      {
        $set: { [`lastAdTimes.${adId}`]: now },
        $inc: { coins: rewardCoins },
      },
      { new: true }
    );

    if (!updatedUser) {
      // Cooldown hasn't passed (or user deleted)
      const currentUser = await User.findOne({ _id: userId });
      const lastClaim = currentUser?.lastAdTimes?.get(adId);
      
      let message = "Please wait before claiming again.";
      if (lastClaim) {
        const timeSinceLast = Date.now() - new Date(lastClaim).getTime();
        const remainingMinutes = Math.max(1, Math.ceil((cooldownMs - timeSinceLast) / 60000));
        message = `Please wait ${remainingMinutes}m before claiming again.`;
      }
      return NextResponse.json({ success: false, message }, { status: 429 });
    }

    const balanceAfter = updatedUser.coins;
    const balanceBefore = balanceAfter - rewardCoins;

    // Log transaction
    await createCoinTx({
      user,
      type: "earn",
      coins: rewardCoins,
      balanceBefore,
      balanceAfter,
      source: "ad_reward",
      referenceId: adId,
      description: `Adsterra Reward (${channelName})`,
      performedBy: "system",
    });

    return NextResponse.json({
      success: true,
      message: `Success! +${rewardCoins} BBC added.`,
      newBalance: balanceAfter
    });

  } catch (error) {
    console.error("[api/coins/ad-reward] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
