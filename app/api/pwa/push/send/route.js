import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { broadcastPushNotification, sendNotificationToSubscription } from "@/lib/webPush";
import PushSubscription from "@/models/PushSubscription";

function isAuthorized(req, body) {
  // Allow via admin PIN in body
  if (body?.adminPin && process.env.ADMIN_PIN && body.adminPin === process.env.ADMIN_PIN) {
    return true;
  }

  // Or via Bearer JWT token (owner)
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.userType === "owner" || decoded.role === "admin") {
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!isAuthorized(req, body)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to send push notifications" },
        { status: 401 }
      );
    }

    const { title, body: content, icon, badge, image, url, userId, subscription } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, message: "Title and body are required" },
        { status: 400 }
      );
    }

    const payload = {
      title,
      body: content,
      icon: icon || "/logoBB.png",
      badge: badge || "/logoBB.png",
      image: image || undefined,
      url: url || "/",
      id: Date.now().toString(),
    };

    // If a direct subscription object is passed (for test), send to it
    if (subscription) {
      const result = await sendNotificationToSubscription(subscription, payload);
      return NextResponse.json({ success: true, result });
    }

    // Filter by specific user if userId is provided
    const filter = {};
    if (userId) {
      filter.userId = userId;
    }

    const report = await broadcastPushNotification(payload, filter);

    return NextResponse.json({
      success: true,
      message: `Push notification broadcast complete`,
      report,
    });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send push notification" },
      { status: 500 }
    );
  }
}
