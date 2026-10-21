import mongoose from "mongoose";

const FlashSaleItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    game: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: String, required: true },
    originalPrice: { type: String, required: true },
    slug: { type: String, required: true },
    badge: { type: String, default: "Hot" },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const FlashSaleConfigSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Flash Sale" },
    enabled: { type: Boolean, default: true },
    endTime: { type: Date },
    items: [FlashSaleItemSchema],
  },
  { timestamps: true }
);

if (mongoose.models.FlashSaleConfig) {
  delete mongoose.models.FlashSaleConfig;
}

export default mongoose.model("FlashSaleConfig", FlashSaleConfigSchema);
