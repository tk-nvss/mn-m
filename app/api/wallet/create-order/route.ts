import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import { generateTxId } from "@/utils/formatters";

export async function POST(req: Request) {
  try {
    await connectDB();

    // ============ AUTHENTICATION ============
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // ============ GET USER INFO ============
    // Try finding by MongoDB _id first, then by custom userId
    let user = await User.findById(userId);
    if (!user) {
      user = await User.findOne({ userId });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: `User not found for ID: ${userId}` },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { success: false, message: "Email not found. Please update your profile." },
        { status: 400 }
      );
    }

    // ============ REQUEST BODY ============
    const { amount } = await req.json();

    // ============ AMOUNT VALIDATION ============
    // Validate amount is provided
    if (!amount) {
      return NextResponse.json(
        { success: false, message: "Amount is required" },
        { status: 400 }
      );
    }

    // Validate amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return NextResponse.json(
        { success: false, message: "Amount must be a valid number" },
        { status: 400 }
      );
    }

    // Validate minimum amount (₹15)
    if (numAmount < 15) {
      return NextResponse.json(
        { success: false, message: "Minimum top-up amount is ₹15" },
        { status: 400 }
      );
    }

    // Validate maximum amount (₹5,000 for security)
    if (numAmount > 5000) {
      return NextResponse.json(
        { success: false, message: "Maximum top-up amount is ₹5,000" },
        { status: 400 }
      );
    }

    // Validate amount is an integer (no decimals)
    if (!Number.isInteger(numAmount)) {
      return NextResponse.json(
        { success: false, message: "Amount must be a whole number" },
        { status: 400 }
      );
    }

    // ============ CREATE ORDER ============
    const orderId = generateTxId("WALLET");

    const formData = new URLSearchParams();
    // Use email instead of phone for payment gateway
    formData.append("customer_mobile", user.email);
    formData.append("user_token", process.env.XTRA_USER_TOKEN!);
    formData.append("amount", numAmount.toString()); // Use validated amount
    formData.append("order_id", orderId);
    formData.append("redirect_url", `${process.env.NEXT_PUBLIC_BASE_URLU}/wallet/payment-complete`);
    formData.append("remark1", `wallet-topup-${userId}`); // Include userId for tracking
    formData.append("remark2", "upi");
    // Explicitly tell gateway where to send webhook for wallet top-ups
    formData.append("webhook_url", `${process.env.NEXT_PUBLIC_BASE_URLU}/api/webhook`);

    const resp = await fetch("https://xyzpay.site/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await resp.json();

    if (!data.status) {
      return NextResponse.json({
        success: false,
        message: data.message || "Failed to create payment order"
      });
    }

    /* ================= CREATE PENDING TRANSACTION ================= */
    const transactionId = `WALLET${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    await WalletTransaction.create({
      transactionId: transactionId,
      userId: user.userId,
      userObjectId: user._id,
      type: "credit",
      amount: numAmount,
      balanceBefore: user.wallet || 0,
      balanceAfter: user.wallet || 0, // Balance hasn't changed yet
      description: "Wallet Top-up Initiated",
      status: "pending",
      referenceId: orderId,
      performedBy: "user",
    });

    return NextResponse.json({
      success: true,
      paymentUrl: data.result.payment_url,
      orderId: orderId,
      amount: numAmount, // Return validated amount
      transactionId: transactionId,
    });
  } catch (error) {
    console.error("Wallet create-order error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
