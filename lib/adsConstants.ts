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
};

// Static fallback for client & legacy imports
export const ADS_CONFIG = {
  ADSTERRA_LINK: DEFAULT_ADS_CONFIG.ADSTERRA_LINK,
  WATCH_EARN_CHANNELS: DEFAULT_ADS_CONFIG.WATCH_EARN_CHANNELS,
  REWARD_COINS: DEFAULT_ADS_CONFIG.REWARD_COINS,
  COOLDOWN_MS: DEFAULT_ADS_CONFIG.COOLDOWN_MS,
};
