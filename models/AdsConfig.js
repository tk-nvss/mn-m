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
    channels: [ChannelSchema],
  },
  { timestamps: true }
);

if (mongoose.models.AdsConfig) {
  delete mongoose.models.AdsConfig;
}

export default mongoose.model("AdsConfig", AdsConfigSchema);
