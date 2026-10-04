import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import { verifyHmac } from "@/lib/hmac";
import { createCoinTx } from "@/lib/coinService";
import { generateTxId } from "@/utils/formatters";

// Configuration: how many coins = ₹1
const COINS_PER_RUPEE = 100;
const MIN_COINS_TO_CONVERT = 100;

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

    // Temporarily disabled per user request
    return NextResponse.json({ success: false, message: "Coin conversion is temporarily disabled." }, { status: 403 });

    let decoded: any;
    try {
      decoded = jwt.verify((authHeader as string).split(" ")[1], process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId; // MongoDB _id from JWT
    
    let bodyData: any = {};
    try {
      if (rawBody) bodyData = JSON.parse(rawBody);
    } catch {}
    
    const { coins } = bodyData;

    const coinsToConvert = Number(coins);

    // Validations
    if (!coinsToConvert || isNaN(coinsToConvert) || coinsToConvert <= 0) {
      return NextResponse.json({ success: false, message: "Invalid coins amount" }, { status: 400 });
    }
    if (coinsToConvert < MIN_COINS_TO_CONVERT) {
      return NextResponse.json({
        success: false,
        message: `Minimum ${MIN_COINS_TO_CONVERT} coins required to convert`,
      });
    }
    if (!Number.isInteger(coinsToConvert)) {
      return NextResponse.json({ success: false, message: "Coins must be a whole number" });
    }

    // Get user by _id
    const user = await User.findOne({ _id: userId });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    if ((user.coins || 0) < coinsToConvert) {
      return NextResponse.json({
        success: false,
        message: `Insufficient coins. You have ${user.coins || 0} coins.`,
      });
    }

    const rupeeValue = coinsToConvert / COINS_PER_RUPEE;

    const coinBalanceBefore = user.coins || 0;
    const coinBalanceAfter = coinBalanceBefore - coinsToConvert;
    const walletBalanceBefore = user.wallet || 0;
    const walletBalanceAfter = walletBalanceBefore + rupeeValue;

    // Atomic: deduct coins AND credit wallet in one findOneAndUpdate
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        coins: { $gte: coinsToConvert }, // safety check — prevent going negative
      },
      {
        $inc: {
          coins: -coinsToConvert,
          wallet: rupeeValue,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: "Insufficient coins (concurrent update). Please try again.",
      });
    }

    const refId = generateTxId("CONVERT");

    // Log coin spend transaction
    await createCoinTx({
      user,
      type: "spend",
      coins: coinsToConvert,
      balanceBefore: coinBalanceBefore,
      balanceAfter: coinBalanceAfter,
      source: "convert_to_wallet",
      description: `Converted ${coinsToConvert} coins → ₹${rupeeValue.toFixed(2)} wallet`,
      referenceId: refId,
      performedBy: "user",
    });

    // Log wallet credit transaction
    const walletTxId = generateTxId("WALLET");
    await WalletTransaction.create({
      transactionId: walletTxId,
      userId: user.userId,
      userObjectId: user._id,
      type: "credit",
      amount: rupeeValue,
      balanceBefore: walletBalanceBefore,
      balanceAfter: walletBalanceAfter,
      description: `Coins Conversion: ${coinsToConvert} BBC → ₹${rupeeValue.toFixed(2)}`,
      status: "success",
      referenceId: refId,
      performedBy: "user",
    });

    return NextResponse.json({
      success: true,
      message: `${coinsToConvert} coins converted to ₹${rupeeValue.toFixed(2)}!`,
      coinsSpent: coinsToConvert,
      rupeeAdded: rupeeValue,
      newCoinBalance: coinBalanceAfter,
      newWalletBalance: walletBalanceAfter,
    });
  } catch (error) {
    console.error("[coins/convert] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
