import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Blocklist from "@/models/Blocklist";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { user, password } = body; // email or phone

    /* ================= BASIC VALIDATION ================= */
    if (!user || !password) {
      return Response.json(
        { success: false, message: "Missing credentials" },
        { status: 400 }
      );
    }

    /* ================= FIND USER ================= */
    const foundUser = await User.findOne({
      $or: [{ email: user }, { phone: user }],
    });

    /* ================= BLOCKLIST CHECK ================= */
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    
    // Check if email or IP is blocklisted
    const blocklistItems = await Blocklist.find({
      $or: [
        { type: "email", value: user.toLowerCase().trim() },
        { type: "ip", value: ip }
      ]
    }).lean();

    if (blocklistItems.length > 0) {
      return Response.json(
        { success: false, message: "Something went wrong. Please try again." },
        { status: 403 }
      );
    }

    if (!foundUser) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= GOOGLE ACCOUNT BLOCK ================= */
    if (foundUser.provider === "google") {
      return Response.json(
        {
          success: false,
          message: "This account uses Google login",
        },
        { status: 400 }
      );
    }

    /* ================= PASSWORD EXISTS CHECK ================= */
    if (!foundUser.password) {
      return Response.json(
        {
          success: false,
          message: "Password login not available for this account",
        },
        { status: 400 }
      );
    }

    /* ================= PASSWORD CHECK ================= */
    const isMatch = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isMatch) {
      return Response.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= MEMBERSHIP EXPIRY CHECK ================= */
    if ((foundUser.userType === "member" || foundUser.userType === "admin") && foundUser.membershipExpiry) {
      if (new Date() > new Date(foundUser.membershipExpiry)) {
        foundUser.userType = "user";
        foundUser.membershipExpiry = null;
      }
    }

    /* ================= UPDATE LAST LOGIN ================= */
    foundUser.lastLogin = new Date();
    foundUser.lastLoginIp = ip;
    await foundUser.save();

    /* ================= JWT GENERATION ================= */
    const token = jwt.sign(
      {
        userId: foundUser._id,
        userType: foundUser.userType,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    /* ================= RESPONSE ================= */
    return Response.json(
      {
        success: true,
        message: "Login success",
        token,
        user: {
          name: foundUser.name,
          email: foundUser.email,
          phone: foundUser.phone,
          userId: foundUser.userId,
          userType: foundUser.userType,
          avatar: foundUser.avatar,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
