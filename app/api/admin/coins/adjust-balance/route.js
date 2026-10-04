import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { createCoinTx } from "@/lib/coinService";

export async function POST(req) {
    try {
        const { userId, amount, action } = await req.json();

        if (!userId || !amount || !action) {
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
        } catch (e) {
            return Response.json({ message: "Invalid token" }, { status: 401 });
        }

        if (decoded.userType !== "owner")
            return Response.json({ message: "Forbidden" }, { status: 403 });

        /* ================= FIND USER ================= */
        const user = await User.findOne({ userId });
        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const currentBalance = user.coins || 0;
        const updateAmount = action === "add" ? numAmount : -numAmount;

        /* ================= UPDATE COINS ATOMICALLY ================= */
        const queryFilter = { _id: user._id };
        if (action === "remove") {
            queryFilter.coins = { $gte: numAmount };
        }

        const updatedUser = await User.findOneAndUpdate(
            queryFilter,
            { $inc: { coins: updateAmount } },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                { success: false, message: "Insufficient coins to remove (concurrent modification)" },
                { status: 400 }
            );
        }

        /* ================= CREATE TRANSACTION ================= */
        await createCoinTx({
            user,
            type: action === "add" ? "earn" : "spend",
            coins: numAmount,
            balanceBefore: currentBalance,
            balanceAfter: updatedUser.coins,
            source: "admin",
            description: `Admin ${action === "add" ? "Credit" : "Debit"} Adjustment`,
            performedBy: "admin",
            referenceId: decoded.userId
        });

        /* ================= RESPONSE ================= */
        return Response.json({
            success: true,
            message: `Successfully ${action === "add" ? "added" : "removed"} ${numAmount} BBC Coins`,
            coins: updatedUser.coins,
        });
    } catch (err) {
        console.error("Coin adjustment failed", err);
        return Response.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
