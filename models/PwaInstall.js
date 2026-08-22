import mongoose from "mongoose";

const PwaInstallSchema = new mongoose.Schema(
  {
    // Event type
    event: {
      type: String,
      enum: ["installed", "active", "dismissed", "push_denied", "push_dismissed"],
      required: true,
    },

    // Device info
    deviceType: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    os: String,           // e.g. "Android", "iOS", "Windows"
    browser: String,      // e.g. "Chrome", "Safari", "Edge"
    userAgent: String,

    // Optional user linkage
    userId: String,

    // Session fingerprint (hashed IP + UA) to deduplicate
    fingerprint: { type: String, index: true },
  },
  { timestamps: true }
);

PwaInstallSchema.index({ event: 1, createdAt: -1 });
PwaInstallSchema.index({ deviceType: 1 });
PwaInstallSchema.index({ os: 1 });

export default mongoose.models.PwaInstall ||
  mongoose.model("PwaInstall", PwaInstallSchema);
