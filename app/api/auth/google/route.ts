import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { generateUserId } from "@/lib/generateUserId";
import Blocklist from "@/models/Blocklist";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, access_token } = await req.json();

    let email: string = "";
    let name: string = "";
    let picture: string = "";
    let sub: string = "";

    if (access_token || (token && token.startsWith("ya29."))) {
      const tokenToUse = access_token || token;
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenToUse}` },
      });
      const userInfo = await userRes.json();
      if (!userInfo?.email) {
        return Response.json(
          { success: false, message: "Invalid Google access token" },
          { status: 401 }
        );
      }
      email = userInfo.email;
      name = userInfo.name || "";
      picture = userInfo.picture || "";
      sub = userInfo.sub || "";
    } else {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        return Response.json(
          { success: false, message: "Invalid Google token" },
          { status: 401 }
        );
      }
      email = payload.email;
      name = payload.name || "";
      picture = payload.picture || "";
      sub = payload.sub || "";
    }
    
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return Response.json(
        { success: false, message: "Only @gmail.com accounts are allowed." },
        { status: 403 }
      );
    }

    /* ================= BLOCKLIST CHECK ================= */
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Check if email or IP is blocklisted
    const blocklistItems = await Blocklist.find({
      $or: [
        { type: "email", value: email.toLowerCase().trim() },
        { type: "ip", value: ip }
      ]
    }).lean();

    if (blocklistItems.length > 0) {
      return Response.json(
        { success: false, message: "Something went wrong. Please try again." },
        { status: 403 }
      );
    }

    let user = await User.findOne({ email });

    /* ================= CREATE USER IF NEW ================= */
    if (!user) {
      user = await User.create({
        userId: generateUserId(name || "user", Date.now().toString()),
        name,
        email,
        password: null,         // 🔐 no password
        provider: "google",
        googleId: sub,
        avatar: picture,
        wallet: 0,
        order: 0,
        userType: "user",
      });
    } else {
      /* ================= MEMBERSHIP EXPIRY CHECK ================= */
      if ((user.userType === "member" || user.userType === "admin") && user.membershipExpiry) {
        if (new Date() > new Date(user.membershipExpiry)) {
          user.userType = "user";
          user.membershipExpiry = null;
        }
      }

      /* ================= UPDATE LAST LOGIN ================= */
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      user.lastLogin = new Date();
      user.lastLoginIp = ip;
      await user.save();
    }

    /* ================= JWT ================= */
    const jwtToken = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return Response.json({
      success: true,
      token: jwtToken,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        userId: user.userId,
        userType: user.userType,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return Response.json(
      { success: false, message: "Google authentication failed" },
      { status: 500 }
    );
  }
}
