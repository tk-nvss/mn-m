import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const isAdmin = async (req) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return false;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userType !== "admin" && decoded.userType !== "owner") return false;
    return decoded;
  } catch {
    return false;
  }
};

const isOwner = async (req) => {
  try {
    const decoded = await isAdmin(req);
    if (!decoded || decoded.userType !== "owner") return false;
    return decoded;
  } catch {
    return false;
  }
};

export async function GET(req) {
  try {
    if (!(await isOwner(req))) {
      return NextResponse.json({ success: false, message: "Unauthorized. Owner access required." }, { status: 401 });
    }

    await connectDB();

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    const query = {
      userType: { $in: ["member", "admin"] }
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } }
      ];
    }

    const memberships = await User.find(query)
      .select("userId name email userType membershipExpiry avatar")
      .sort({ createdAt: -1 });

    // Clean up expired ones just in case
    const now = new Date();
    const validMemberships = [];
    
    for (const user of memberships) {
      if (user.membershipExpiry && new Date(user.membershipExpiry) < now) {
        // Expired, revert them
        await User.updateOne(
          { _id: user._id },
          { $set: { userType: "user", membershipExpiry: null } }
        );
      } else {
        validMemberships.push(user);
      }
    }

    return NextResponse.json({ success: true, data: validMemberships });
  } catch (error) {
    console.error("Memberships GET Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    if (!(await isOwner(req))) {
      return NextResponse.json({ success: false, message: "Unauthorized. Owner access required." }, { status: 401 });
    }

    const { userId, userType, expiryDate } = await req.json();

    if (!userId || !userType || !["admin", "member"].includes(userType)) {
      return NextResponse.json({ success: false, message: "Invalid parameters" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ 
      $or: [ { userId: userId }, { email: userId } ]
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.userType === "owner") {
      return NextResponse.json({ success: false, message: "Cannot modify owner's role" }, { status: 403 });
    }

    let expiry = null;
    if (expiryDate) {
      expiry = new Date(expiryDate);
    } else {
      return NextResponse.json({ success: false, message: "Expiry date is required for memberships" }, { status: 400 });
    }

    user.userType = userType;
    user.membershipExpiry = expiry;
    await user.save();

    return NextResponse.json({ success: true, message: "Membership updated successfully", data: user });
  } catch (error) {
    console.error("Memberships POST Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    if (!(await isOwner(req))) {
      return NextResponse.json({ success: false, message: "Unauthorized. Owner access required." }, { status: 401 });
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ userId });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (user.userType === "owner") {
      return NextResponse.json({ success: false, message: "Cannot modify owner's role" }, { status: 403 });
    }

    user.userType = "user";
    user.membershipExpiry = null;
    await user.save();

    return NextResponse.json({ success: true, message: "Membership revoked successfully" });
  } catch (error) {
    console.error("Memberships DELETE Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
