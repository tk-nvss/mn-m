import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: String, // ✅ Links order to user
    gameSlug: String,
    itemSlug: String,
    itemName: String,
    playerId: String,
    playerName: String,
    zoneId: String,
    paymentMethod: String,
    price: Number,
    currency: { type: String, default: "INR" },
    email: String,
    phone: String,
    status: {
      type: String,
      enum: [
        "pending", "success", "failed", "processing", "fraud",
        "PENDING", "SUCCESS", "FAILED", "refund", "REFUND"
      ],
      default: "pending"
    },
    // ✅ NEW: Top-up status
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed", "processing", "refund", "REFUND"],
      default: "pending",
    },

    /* ================= TOP-UP STATUS ================= */
    topupStatus: {
      type: String,
      enum: ["pending", "success", "failed", "processing", "refund", "REFUND"],
      default: "pending",
    },

    /* ================= PLATFORM SOURCE ================= */
    platform: {
      type: String,
      enum: ["pwa", "web", "PWA", "WEB"],
      default: "web",
    },

    /* ================= GATEWAY DATA ================= */
    gatewayOrderId: String, // Order ID from payment gateway
    gatewayResponse: mongoose.Schema.Types.Mixed, // Full gateway response
    externalResponse: mongoose.Schema.Types.Mixed, // Game API fulfillment response

    expiresAt: Date,
  },
  { timestamps: true }
);

// Optimize Admin Dashboard and User history queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
OrderSchema.index({ topupStatus: 1, createdAt: -1 });
OrderSchema.index({ platform: 1, createdAt: -1 });
OrderSchema.index({ platform: 1, status: 1, createdAt: -1 });
OrderSchema.index({ email: 1, status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
