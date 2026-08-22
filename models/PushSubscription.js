import mongoose from "mongoose";

const PushSubscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expirationTime: {
      type: Number,
      default: null,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    os: String,
    browser: String,
    userAgent: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

PushSubscriptionSchema.index({ userId: 1, isActive: 1 });
PushSubscriptionSchema.index({ createdAt: -1 });

export default mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", PushSubscriptionSchema);
