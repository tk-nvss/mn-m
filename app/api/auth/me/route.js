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

    // 👤 Update activity and fetch user
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        lastLogin: new Date(),
        lastLoginIp: ip
      },
      { new: true }
    ).select("-password -__v");

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
    if ((user.userType === "member" || user.userType === "admin") && user.membershipExpiry) {
      if (new Date() > new Date(user.membershipExpiry)) {
        user.userType = "user";
        user.membershipExpiry = null;
        await user.save();
      }
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
