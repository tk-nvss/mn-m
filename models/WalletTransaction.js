import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
        },
        userId: {
            type: String, // Custom userId (e.g., USER123)
            required: true,
            index: true,
        },
        userObjectId: {
            type: mongoose.Schema.Types.ObjectId, // MongoDB _id
            ref: "User",
        },
        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        balanceBefore: {
            type: Number,
        },
        balanceAfter: {
            type: Number,
        },
        description: {
            type: String,
            default: "Wallet Transaction",
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed"],
            default: "pending",
        },
        referenceId: {
            type: String, // orderId or admin reference
            index: true,
        },
        performedBy: {
            type: String, // "system", "admin", "user"
            default: "system",
        },
    },
    { timestamps: true }
);

// Optimize Wallet Manager queries
WalletTransactionSchema.index({ createdAt: -1 });
WalletTransactionSchema.index({ type: 1, status: 1, createdAt: -1 });
WalletTransactionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.WalletTransaction ||
    mongoose.model("WalletTransaction", WalletTransactionSchema);
