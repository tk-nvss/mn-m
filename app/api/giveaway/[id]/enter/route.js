import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Giveaway from "@/models/Giveaway";
import GiveawayEntry from "@/models/GiveawayEntry";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ success: false, message: "Login required" }, { status: 401 });

    let decoded;
    try {
      decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userIdStr = decoded.userId?.toString();
    let user = null;
    if (userIdStr ) { // Basic ObjectId check
      user = await User.findById(userIdStr).select("name email userId");
    }
    if (!user) {
      user = await User.findOne({ userId: userIdStr }).select("name email userId");
    }

    if (!user) return NextResponse.json({ success: false, message: "User not found or token stale" }, { status: 401 });
    
    // Use the custom userId for the giveaway entry to ensure consistency
    const entryUserId = user.userId || userIdStr;

    const giveaway = await Giveaway.findById(id);
    if (!giveaway || giveaway.status !== "live")
      return NextResponse.json({ success: false, message: "Giveaway not active" }, { status: 400 });

    if (giveaway.maxEntries > 0 && giveaway.entryCount >= giveaway.maxEntries)
      return NextResponse.json({ success: false, message: "Giveaway is full" }, { status: 403 });


    const existing = await GiveawayEntry.findOne({ giveawayId: id, userId: entryUserId });

    const body = await req.json();
    const { mlbbId, mlbbServer, taskData, phone } = body;

    if (!phone)
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });

    if (existing) {
      if (existing.isVerified) {
        return NextResponse.json({ success: false, message: "Entry already verified. Cannot redo tasks." }, { status: 409 });
      }
      
      await GiveawayEntry.findByIdAndUpdate(existing._id, {
        mlbbId, mlbbServer, phone, taskData: taskData || {}, isVerified: false
      });
      return NextResponse.json({ success: true, message: "Entry updated successfully" });
    }

    await GiveawayEntry.create({
      giveawayId: id,
      userId: entryUserId,
      name: user.name || "",
      email: user.email || "",
      mlbbId,
      mlbbServer,
      phone,
      taskData: taskData || {},
    });

    // Increment entry count
    await Giveaway.findByIdAndUpdate(id, { $inc: { entryCount: 1 } });

    return NextResponse.json({ success: true, message: "Entered successfully" });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ success: false, message: "Already entered" }, { status: 409 });
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
