import { NextResponse } from "next/server";
import { getAdsConfig } from "@/lib/adsConfig";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getAdsConfig();

    return NextResponse.json({
      success: true,
      data: {
        enableAds: config.enabled,
        enableBanners: config.enableBanners !== false,
        enableSocialBar: config.enableSocialBar === true,
        enablePopunder: config.enablePopunder === true,
        showAdBadge: config.showAdBadge !== false,
        adBadgeText: config.adBadgeText || "Ad",
        nativeBanner: {
          id: config.nativeBannerId,
          src: config.nativeBannerSrc,
        },
        socialBar: {
          src: config.socialBarSrc,
        },
        popunder: {
          src: config.popunderSrc,
        },
        banner320x50Key: config.banner320x50Key,
        banner300x250Key: config.banner300x250Key,
        smartLink: {
          url: config.adsterraLink,
        },
      },
    });
  } catch (error) {
    console.error("[api/ads-config] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load ads config" },
      { status: 500 }
    );
  }
}
