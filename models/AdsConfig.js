import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    link: { type: String, required: true },
    reward: { type: Number, default: 1 },
    cooldownMs: { type: Number, default: 25 * 60 * 1000 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const AdsConfigSchema = new mongoose.Schema(
  {
    adsterraLink: {
      type: String,
      default: "https://www.profitablecpmratenetwork.com/xwgw5tfxdb?key=30e58d6b2ddb7c342e339e0357a148c6",
    },
    defaultRewardCoins: {
      type: Number,
      default: 1,
    },
    defaultCooldownMinutes: {
      type: Number,
      default: 30,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    // Ad format toggles
    enableBanners: {
      type: Boolean,
      default: true,
    },
    enableSocialBar: {
      type: Boolean,
      default: false,
    },
    enablePopunder: {
      type: Boolean,
      default: false,
    },
    showAdBadge: {
      type: Boolean,
      default: true,
    },
    adBadgeText: {
      type: String,
      default: "Ad",
    },
    // Adsterra Keys and Scripts
    nativeBannerId: {
      type: String,
      default: "c755433b5487dae7313fbaa97a482b40",
    },
    nativeBannerSrc: {
      type: String,
      default: "https://pl29207483.effectivecpmnetwork.com/c755433b5487dae7313fbaa97a482b40/invoke.js",
    },
    socialBarSrc: {
      type: String,
      default: "https://pl29247592.effectivecpmnetwork.com/a5/bb/66/a5bb66c93c9892d321190ff4ef0081a4.js",
    },
    popunderSrc: {
      type: String,
      default: "https://pl29813171.effectivecpmnetwork.com/22/23/95/2223956ef92dbcb14085fcaa81bc9718.js",
    },
    banner320x50Key: {
      type: String,
      default: "183ee4e45520fb7aa8e1d934a0970c31",
    },
    banner300x250Key: {
      type: String,
      default: "12769ff4f11c1254fd7310aea93f838d",
    },
    channels: [ChannelSchema],
  },
  { timestamps: true }
);

if (mongoose.models.AdsConfig) {
  delete mongoose.models.AdsConfig;
}

export default mongoose.model("AdsConfig", AdsConfigSchema);
