import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PwaInstall from "@/models/PwaInstall";
import PushSubscription from "@/models/PushSubscription";
import User from "@/models/User";

/* ── helpers ── */
function parseDevice(ua) {
  if (!ua) return { deviceType: "desktop", os: "Unknown", browser: "Unknown" };
  let os = "Unknown";
  if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/opr|opera/i.test(ua)) browser = "Opera";

  let deviceType = "desktop";
  if (/ipad|tablet/i.test(ua)) deviceType = "tablet";
  else if (/mobile|iphone|android(?!.*tablet)/i.test(ua)) deviceType = "mobile";

  return { deviceType, os, browser };
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/* helper: build array of last N days as "YYYY-MM-DD" strings */
function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/* ──────────────────────────────────────────
   POST /api/pwa/track
   Body: { event: "installed"|"active"|"dismissed", userId? }
────────────────────────────────────────── */
export async function POST(req) {
  try {
    const body = await req.json();
    const { event, userId } = body;

    if (!["installed", "active", "dismissed"].includes(event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "0.0.0.0";
    const fingerprint = simpleHash(ip + ua);
    const { deviceType, os, browser } = parseDevice(ua);

    await connectDB();

    // Deduplicate "active" to once per day per fingerprint
    if (event === "active") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await PwaInstall.findOne({
        fingerprint,
        event: "active",
        createdAt: { $gte: today },
      });
      if (existing) return NextResponse.json({ ok: true, skipped: true });
    }

    await PwaInstall.create({
      event,
      deviceType,
      os,
      browser,
      userAgent: ua.slice(0, 300),
      userId: userId || null,
      fingerprint,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PWA track]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ──────────────────────────────────────────
   GET /api/pwa/track?days=7|30
   Returns full stats
────────────────────────────────────────── */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const dayLabels = lastNDays(days);

    const [
      totalInstalls,
      totalActive,
      dismissCount,
      byDevice,
      byOS,
      byBrowser,
      recent,
      dailyInstallsRaw,
      dailyActiveRaw,
      installedUsersRaw,
      totalPushSubscribers,
      pushSubscribersRaw,
      byPushDevice,
    ] = await Promise.all([
      PwaInstall.countDocuments({ event: "installed" }),
      PwaInstall.distinct("fingerprint", { event: "active" }).then((a) => a.length),
      PwaInstall.countDocuments({ event: "dismissed" }),

      PwaInstall.aggregate([
        { $match: { event: "installed" } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PwaInstall.aggregate([
        { $match: { event: "installed" } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      PwaInstall.aggregate([
        { $match: { event: "installed" } },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Last 10 installs
      PwaInstall.find({ event: "installed" })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("deviceType os browser createdAt userId"),

      // Daily installs for last N days
      PwaInstall.aggregate([
        { $match: { event: "installed", createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Daily active (unique fingerprints) for last N days
      PwaInstall.aggregate([
        { $match: { event: "active", createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Users who installed — with userId
      PwaInstall.find({ event: "installed", userId: { $ne: null } })
        .sort({ createdAt: -1 })
        .select("userId deviceType os browser createdAt"),

      // Total Active Push Subscribers
      PushSubscription.countDocuments({ isActive: true }),

      // Recent Push Subscriptions
      PushSubscription.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("endpoint userId deviceType os browser userAgent createdAt"),

      // Push by device
      PushSubscription.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$deviceType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Fill in zeros for missing days
    const installMap = Object.fromEntries(dailyInstallsRaw.map((d) => [d._id, d.count]));
    const activeMap  = Object.fromEntries(dailyActiveRaw.map((d)  => [d._id, d.count]));
    const dailyInstalls = dayLabels.map((d) => ({ date: d, count: installMap[d] || 0 }));
    const dailyActive   = dayLabels.map((d) => ({ date: d, count: activeMap[d]  || 0 }));

    // Lookup user details for installed users and push subscribers
    const userIds = [
      ...new Set([
        ...installedUsersRaw.map((r) => r.userId).filter(Boolean),
        ...pushSubscribersRaw.map((r) => r.userId).filter(Boolean),
      ]),
    ];
    const users = await User.find({ userId: { $in: userIds } })
      .select("userId name email phone avatar userType createdAt");

    const userMap = Object.fromEntries(users.map((u) => [u.userId, u]));
    const installedUsers = installedUsersRaw.map((r) => ({
      ...r.toObject(),
      user: userMap[r.userId] || null,
    }));

    const pushSubscribers = pushSubscribersRaw.map((r) => ({
      ...r.toObject(),
      user: userMap[r.userId] || null,
    }));

    const periodInstalls = dailyInstalls.reduce((sum, d) => sum + d.count, 0);

    return NextResponse.json({
      totalInstalls,
      totalActive,
      dismissCount,
      periodInstalls,
      totalPushSubscribers,
      byDevice,
      byOS,
      byBrowser,
      byPushDevice,
      recent,
      dailyInstalls,
      dailyActive,
      installedUsers,
      pushSubscribers,
      days,
    });
  } catch (err) {
    console.error("[PWA stats]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
