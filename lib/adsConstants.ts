// Pure client-safe ads configuration constants and types (no server/database dependencies)

export interface AdChannel {
  id: string;
  title: string;
  link: string;
  reward: number;
  cooldownMs: number;
  enabled?: boolean;
}

export interface AdsConfiguration {
  adsterraLink: string;
  defaultRewardCoins: number;
  defaultCooldownMinutes: number;
  cooldownMs: number;
  enabled: boolean;
  enableBanners?: boolean;
  enableSocialBar?: boolean;
  enablePopunder?: boolean;
  showAdBadge?: boolean;
  adBadgeText?: string;
  nativeBannerId?: string;
  nativeBannerSrc?: string;
  socialBarSrc?: string;
  popunderSrc?: string;
  banner320x50Key?: string;
  banner300x250Key?: string;
  channels: AdChannel[];
}

export const DEFAULT_ADS_CONFIG = {
  ADSTERRA_LINK: "https://www.profitablecpmratenetwork.com/xwgw5tfxdb?key=30e58d6b2ddb7c342e339e0357a148c6",
  WATCH_EARN_CHANNELS: [
    { id: "watch_1", title: "Channel 1", link: "https://omg10.com/4/10900401", reward: 1, cooldownMs: 25 * 60 * 1000, enabled: true },
    { id: "watch_2", title: "Channel 2", link: "https://www.profitablecpmratenetwork.com/f1p10c8uc3?key=0d7879fcf35dc241e476f2e895fabdbc", reward: 1, cooldownMs: 25 * 60 * 1000, enabled: true },
    { id: "watch_3", title: "Channel 3", link: "https://www.profitablecpmratenetwork.com/hufhc5xjdq?key=061e505a28e2947339287dabe62e6175", reward: 1, cooldownMs: 20 * 60 * 1000, enabled: true },
    { id: "watch_4", title: "Channel 4", link: "https://omg10.com/4/9869073", reward: 1, cooldownMs: 25 * 60 * 1000, enabled: true },
    { id: "watch_5", title: "Channel 5", link: "https://www.profitablecpmratenetwork.com/na3uf7p2jk?key=88e14dd1c1b8f2d96d5474d1a62b0bec", reward: 1, cooldownMs: 45 * 60 * 1000, enabled: true },
    { id: "watch_6", title: "Channel 6", link: "https://omg10.com/4/10902850", reward: 1, cooldownMs: 25 * 60 * 1000, enabled: true },
    { id: "watch_7", title: "Channel 7", link: "https://omg10.com/4/10902851", reward: 1, cooldownMs: 25 * 60 * 1000, enabled: true },
  ],
  REWARD_COINS: 1,
  COOLDOWN_MS: 30 * 60 * 1000,
  ENABLED: true,
  ENABLE_BANNERS: true,
  ENABLE_SOCIAL_BAR: false,
  ENABLE_POPUNDER: false,
  SHOW_AD_BADGE: true,
  AD_BADGE_TEXT: "Ad",
  NATIVE_BANNER_ID: "c755433b5487dae7313fbaa97a482b40",
  NATIVE_BANNER_SRC: "https://pl29207483.effectivecpmnetwork.com/c755433b5487dae7313fbaa97a482b40/invoke.js",
  SOCIAL_BAR_SRC: "https://pl29247592.effectivecpmnetwork.com/a5/bb/66/a5bb66c93c9892d321190ff4ef0081a4.js",
  POPUNDER_SRC: "https://pl29813171.effectivecpmnetwork.com/22/23/95/2223956ef92dbcb14085fcaa81bc9718.js",
  BANNER_320x50_KEY: "183ee4e45520fb7aa8e1d934a0970c31",
  BANNER_300x250_KEY: "12769ff4f11c1254fd7310aea93f838d",
};

// Static fallback for client & legacy imports
export const ADS_CONFIG = {
  ADSTERRA_LINK: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
  WATCH_EARN_CHANNELS: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
  REWARD_COINS: DEFAULT_ADS_CONFIG.REWARD_COINS,
  COOLDOWN_MS: DEFAULT_ADS_CONFIG.COOLDOWN_MS,
};
