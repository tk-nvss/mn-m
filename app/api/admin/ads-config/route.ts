import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import AdsConfig from "@/models/AdsConfig";
import { DEFAULT_ADS_CONFIG } from "@/lib/adsConfig";

function checkAdminAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!["admin", "owner"].includes(decoded.userType)) {
      return { error: "Forbidden: Admin or Owner access required", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Invalid or expired token", status: 401 };
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = checkAdminAuth(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    let config = await AdsConfig.findOne({}).lean() as any;

    if (!config) {
      config = await AdsConfig.create({
        adsterraLink: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
        defaultRewardCoins: DEFAULT_ADS_CONFIG.REWARD_COINS,
        defaultCooldownMinutes: Math.round(DEFAULT_ADS_CONFIG.COOLDOWN_MS / 60000),
        enabled: DEFAULT_ADS_CONFIG.ENABLED,
        channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("[api/admin/ads-config] GET Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const auth = checkAdminAuth(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    let config = await AdsConfig.findOne({});

    if (!config) {
      config = new AdsConfig({
        adsterraLink: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
        defaultRewardCoins: DEFAULT_ADS_CONFIG.REWARD_COINS,
        defaultCooldownMinutes: Math.round(DEFAULT_ADS_CONFIG.COOLDOWN_MS / 60000),
        enabled: DEFAULT_ADS_CONFIG.ENABLED,
        channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
      });
    }

    if (typeof body.adsterraLink === "string") {
      config.adsterraLink = body.adsterraLink.trim();
    }

    if (typeof body.enabled === "boolean") {
      config.enabled = body.enabled;
    }

    if (typeof body.defaultRewardCoins === "number" && body.defaultRewardCoins >= 0) {
      config.defaultRewardCoins = body.defaultRewardCoins;
    }

    if (typeof body.defaultCooldownMinutes === "number" && body.defaultCooldownMinutes >= 1) {
      config.defaultCooldownMinutes = body.defaultCooldownMinutes;
    }

    if (Array.isArray(body.channels)) {
      config.channels = body.channels.map((ch: any, idx: number) => {
        const cooldownMinutes = typeof ch.cooldownMinutes === "number" && ch.cooldownMinutes > 0 
          ? ch.cooldownMinutes 
          : Math.max(1, Math.round((ch.cooldownMs || 1500000) / 60000));

        return {
          id: (ch.id || `watch_${idx + 1}`).trim(),
          title: (ch.title || `Channel ${idx + 1}`).trim(),
          link: (ch.link || "").trim(),
          reward: typeof ch.reward === "number" && ch.reward >= 0 ? ch.reward : 1,
          cooldownMs: cooldownMinutes * 60 * 1000,
          enabled: ch.enabled !== false,
        };
      });
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: "Ads & Monetization settings updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("[api/admin/ads-config] PATCH Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
