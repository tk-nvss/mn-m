import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
    try {
        await connectDB();
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return Response.json({ success: false, message: "Email and OTP are required" }, { status: 400 });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            resetOtp: otp,
            resetOtpExpiry: { $gt: new Date() }
        });

        if (!user) {
            return Response.json({ success: false, message: "Invalid or expired OTP" }, { status: 401 });
        }

        // Clear OTP after success
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        user.lastLogin = new Date();
        user.lastLoginIp = ip;
        await user.save();

        const token = jwt.sign(
            { userId: user._id, userType: user.userType },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return Response.json({
            success: true,
            token,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                userId: user.userId,
                userType: user.userType,
                avatar: user.avatar,
            }
        });
    } catch (error) {
        console.error("OTP Verify Error:", error);
        return Response.json({ success: false, message: "Encryption failure" }, { status: 500 });
    }
}
