import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WalletTransaction from "@/models/WalletTransaction";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        const { email, amount, action, description } = await req.json();

        if (!email || !amount || !action) {
            return Response.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return Response.json(
                { success: false, message: "Amount must be positive" },
                { status: 400 }
            );
        }

        await connectDB();

        /* ================= AUTH ================= */
        const auth = req.headers.get("authorization");
        if (!auth?.startsWith("Bearer "))
            return Response.json({ message: "Unauthorized" }, { status: 401 });

        const token = auth.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            return Response.json({ message: "Invalid or expired token" }, { status: 401 });
        }

        if (decoded.userType !== "owner")
            return Response.json({ message: "Forbidden" }, { status: 403 });

        /* ================= FIND USER ================= */
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return Response.json(
                { success: false, message: "User not found with this email" },
                { status: 404 }
            );
        }

        const currentBalance = user.wallet || 0;
        const updateAmount = action === "add" ? numAmount : -numAmount;

        // Prevent negative balance if removing
        if (action === "remove" && currentBalance < numAmount) {
            return Response.json(
                { success: false, message: "Insufficient balance to remove" },
                { status: 400 }
            );
        }

        /* ================= UPDATE WALLET ================= */
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $inc: { wallet: updateAmount } },
            { new: true }
        );

        /* ================= CREATE TRANSACTION ================= */
        await WalletTransaction.create({
            transactionId: `ADM_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId: user.userId,
            userObjectId: user._id,
            type: action === "add" ? "credit" : "debit",
            amount: numAmount,
            balanceBefore: currentBalance,
            balanceAfter: updatedUser.wallet,
            description: description || `Admin ${action === "add" ? "Credit" : "Debit"} Adjustment`,
            status: "success",
            referenceId: decoded.userId, // Admin ID as reference
            performedBy: "admin",
        });

        /* ================= RESPONSE ================= */
        return Response.json({
            success: true,
            message: `Successfully ${action === "add" ? "added" : "removed"} ${numAmount} credits`,
            data: updatedUser,
        });
    } catch (err) {
        console.error("Wallet update failed", err);
        return Response.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
