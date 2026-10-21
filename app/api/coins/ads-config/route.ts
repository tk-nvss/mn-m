import { NextResponse } from "next/server";
import { getAdsConfig } from "@/lib/adsConfig";

export async function GET() {
  try {
    const config = await getAdsConfig();

    // Filter only enabled channels for normal users
    const publicChannels = config.channels
      .filter((ch) => ch.enabled !== false)
      .map((ch) => ({
        id: ch.id,
        title: ch.title,
        link: ch.link,
        reward: ch.reward,
        cooldownMs: ch.cooldownMs,
      }));

    return NextResponse.json({
      success: true,
      data: {
        adsterraLink: config.adsterraLink,
        enabled: config.enabled,
        defaultRewardCoins: config.defaultRewardCoins,
        cooldownMs: config.cooldownMs,
        channels: publicChannels,
      },
    });
  } catch (error) {
    console.error("[api/coins/ads-config] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load ads configuration" },
      { status: 500 }
    );
  }
}
