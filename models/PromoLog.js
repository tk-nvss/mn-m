import mongoose from "mongoose";

const PromoLogSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    promoTitle: {
      type: String,
      default: null,
    },
    count: {
      type: Number,
      required: true,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    recipients: {
      type: [String],
      default: [],
    },
    sentBy: {
      type: String, // email of the owner who sent it
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PromoLog ||
  mongoose.model("PromoLog", PromoLogSchema);
