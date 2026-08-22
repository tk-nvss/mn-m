import webpush from "web-push";
import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

// Configure Web Push with VAPID credentials
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO || "mailto:crew.bluebuff@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send a notification payload to a single subscription.
 * If the subscription is expired or unsubscribed (410/404), remove it from DB.
 */
export async function sendNotificationToSubscription(subDoc, payload) {
  const pushSubscription = {
    endpoint: subDoc.endpoint,
    keys: {
      p256dh: subDoc.keys?.p256dh,
      auth: subDoc.keys?.auth,
    },
  };

  const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);

  try {
    const res = await webpush.sendNotification(pushSubscription, payloadString);
    return { success: true, statusCode: res.statusCode };
  } catch (err) {
    // 404 (Not Found) or 410 (Gone) means the subscription is no longer valid
    if (err.statusCode === 404 || err.statusCode === 410) {
      await connectDB();
      await PushSubscription.deleteOne({ endpoint: subDoc.endpoint }).catch(() => {});
      return { success: false, expired: true, error: "Subscription expired / unsubscribed" };
    }
    return { success: false, error: err.message || "Push error", statusCode: err.statusCode };
  }
}

/**
 * Broadcast notification payload to all active subscriptions (or by user filter)
 */
export async function broadcastPushNotification(payload, filter = {}) {
  await connectDB();
  const subscriptions = await PushSubscription.find({ isActive: true, ...filter }).lean();

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0, total: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendNotificationToSubscription(sub, payload))
  );

  let sent = 0;
  let failed = 0;

  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.success) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed, total: subscriptions.length };
}
