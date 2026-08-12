import mongoose from "mongoose";

const GiveawayEntrySchema = new mongoose.Schema({
  giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: "Giveaway", required: true },
  userId: { type: String, required: true },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  mlbbId: { type: String, default: "" },
  mlbbServer: { type: String, default: "" },
  phone: { type: String, default: "" },
  taskData: { type: mongoose.Schema.Types.Mixed, default: {} },
  isWinner: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

GiveawayEntrySchema.index({ giveawayId: 1, userId: 1 }, { unique: true });

export default mongoose.models.GiveawayEntry || mongoose.model("GiveawayEntry", GiveawayEntrySchema);
