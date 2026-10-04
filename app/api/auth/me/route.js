import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    // 🔐 Read Authorization header
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 🔎 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👤 Read user efficiently without unconditional write
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const user = await User.findById(decoded.userId).select("-password -__v");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.forceLogout) {
      user.forceLogout = false;
      await user.save();
      return NextResponse.json(
        { success: false, message: "Admin forced logout" },
        { status: 401 }
      );
    }

    // Check membership expiry
    let needsSave = false;
    if ((user.userType === "member" || user.userType === "admin") && user.membershipExpiry) {
      if (new Date() > new Date(user.membershipExpiry)) {
        user.userType = "user";
        user.membershipExpiry = null;
        needsSave = true;
      }
    }

    // Throttle lastLogin update: only update if older than 5 minutes (or never set)
    const now = new Date();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    if (!user.lastLogin || (now.getTime() - new Date(user.lastLogin).getTime() > FIVE_MINUTES_MS)) {
      user.lastLogin = now;
      user.lastLoginIp = ip;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        wallet: user.wallet,
        order: user.order,
        userType: user.userType,
        avatar: user.avatar,
        userId: user.userId,
        referralUsed: user.referralUsed || false,
        referralCount: user.referralCount || 0,
        createdAt: user.createdAt,
      },
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
