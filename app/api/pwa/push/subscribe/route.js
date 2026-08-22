import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

export async function POST(req) {
  try {
    const body = await req.json();
    const { subscription, userId, deviceType, os, browser, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { success: false, message: "Invalid push subscription object" },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert subscription
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime || null,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userId: userId || null,
        deviceType: deviceType || "desktop",
        os: os || "",
        browser: browser || "",
        userAgent: userAgent || "",
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, message: "Push subscription saved" });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save subscription" },
      { status: 500 }
    );
  }
}
