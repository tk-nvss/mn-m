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
      channels: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
    };
  }
}
