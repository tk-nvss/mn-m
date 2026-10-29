import { connectDB } from "./mongodb";
import AdsConfig from "@/models/AdsConfig";
import {
  AdChannel,
  AdsConfiguration,
  DEFAULT_ADS_CONFIG,
  ADS_CONFIG
} from "./adsConstants";

export type { AdChannel, AdsConfiguration };
export { DEFAULT_ADS_CONFIG, ADS_CONFIG };

/**
 * Fetch dynamic Ads configuration from DB with automatic fallback and initial seeding.
 */
export async function getAdsConfig(): Promise<AdsConfiguration> {
  try {
    await connectDB();
    let config = await AdsConfig.findOne({}).lean() as any;

    if (!config) {
      // Seed initial default config if database has no entry yet
      config = await AdsConfig.create({
        adsterraLink: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
        defaultRewardCoins: DEFAULT_ADS_CONFIG.REWARD_COINS,
        defaultCooldownMinutes: Math.round(DEFAULT_ADS_CONFIG.COOLDOWN_MS / 60000),
        enabled: DEFAULT_ADS_CONFIG.ENABLED,
        enableBanners: DEFAULT_ADS_CONFIG.ENABLE_BANNERS,
        enableSocialBar: DEFAULT_ADS_CONFIG.ENABLE_SOCIAL_BAR,
        enablePopunder: DEFAULT_ADS_CONFIG.ENABLE_POPUNDER,
        showAdBadge: DEFAULT_ADS_CONFIG.SHOW_AD_BADGE,
        adBadgeText: DEFAULT_ADS_CONFIG.AD_BADGE_TEXT,
        nativeBannerId: DEFAULT_ADS_CONFIG.NATIVE_BANNER_ID,
        nativeBannerSrc: DEFAULT_ADS_CONFIG.NATIVE_BANNER_SRC,
        socialBarSrc: DEFAULT_ADS_CONFIG.SOCIAL_BAR_SRC,
        popunderSrc: DEFAULT_ADS_CONFIG.POPUNDER_SRC,
        banner320x50Key: DEFAULT_ADS_CONFIG.BANNER_320x50_KEY,
        banner300x250Key: DEFAULT_ADS_CONFIG.BANNER_300x250_KEY,
        channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
      });
    }

    const defaultReward = config.defaultRewardCoins ?? DEFAULT_ADS_CONFIG.REWARD_COINS;
    const defaultCooldownMin = config.defaultCooldownMinutes ?? 30;
    const defaultCooldownMs = defaultCooldownMin * 60 * 1000;

    const channels: AdChannel[] = (config.channels || []).map((ch: any) => ({
      id: ch.id,
      title: ch.title,
      link: ch.link,
      reward: typeof ch.reward === "number" ? ch.reward : defaultReward,
      cooldownMs: typeof ch.cooldownMs === "number" ? ch.cooldownMs : defaultCooldownMs,
      enabled: ch.enabled !== false,
    }));

    return {
      adsterraLink: config.adsterraLink || DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
      defaultRewardCoins: defaultReward,
      defaultCooldownMinutes: defaultCooldownMin,
      cooldownMs: defaultCooldownMs,
      enabled: config.enabled !== false,
      enableBanners: config.enableBanners !== false,
      enableSocialBar: config.enableSocialBar === true,
      enablePopunder: config.enablePopunder === true,
      showAdBadge: config.showAdBadge !== false,
      adBadgeText: config.adBadgeText || DEFAULT_ADS_CONFIG.AD_BADGE_TEXT,
      nativeBannerId: config.nativeBannerId || DEFAULT_ADS_CONFIG.NATIVE_BANNER_ID,
      nativeBannerSrc: config.nativeBannerSrc || DEFAULT_ADS_CONFIG.NATIVE_BANNER_SRC,
      socialBarSrc: config.socialBarSrc || DEFAULT_ADS_CONFIG.SOCIAL_BAR_SRC,
      popunderSrc: config.popunderSrc || DEFAULT_ADS_CONFIG.POPUNDER_SRC,
      banner320x50Key: config.banner320x50Key || DEFAULT_ADS_CONFIG.BANNER_320x50_KEY,
      banner300x250Key: config.banner300x250Key || DEFAULT_ADS_CONFIG.BANNER_300x250_KEY,
      channels,
    };
  } catch (error) {
    console.error("[getAdsConfig] Error loading from DB, using fallback:", error);
    return {
      adsterraLink: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
      defaultRewardCoins: DEFAULT_ADS_CONFIG.REWARD_COINS,
      defaultCooldownMinutes: 30,
      cooldownMs: DEFAULT_ADS_CONFIG.COOLDOWN_MS,
      enabled: true,
      enableBanners: DEFAULT_ADS_CONFIG.ENABLE_BANNERS,
      enableSocialBar: DEFAULT_ADS_CONFIG.ENABLE_SOCIAL_BAR,
      enablePopunder: DEFAULT_ADS_CONFIG.ENABLE_POPUNDER,
      showAdBadge: DEFAULT_ADS_CONFIG.SHOW_AD_BADGE,
      adBadgeText: DEFAULT_ADS_CONFIG.AD_BADGE_TEXT,
      nativeBannerId: DEFAULT_ADS_CONFIG.NATIVE_BANNER_ID,
      nativeBannerSrc: DEFAULT_ADS_CONFIG.NATIVE_BANNER_SRC,
      socialBarSrc: DEFAULT_ADS_CONFIG.SOCIAL_BAR_SRC,
      popunderSrc: DEFAULT_ADS_CONFIG.POPUNDER_SRC,
      banner320x50Key: DEFAULT_ADS_CONFIG.BANNER_320x50_KEY,
      banner300x250Key: DEFAULT_ADS_CONFIG.BANNER_300x250_KEY,
      channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
    };
  }
}
