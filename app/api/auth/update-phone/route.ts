import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone).trim();
    const digitsOnly = cleanPhone.replace(/\D/g, "");

    // If Indian number (+91), ensure local number is strictly 10 digits
    if (cleanPhone.startsWith("+91")) {
      const localDigits = cleanPhone.slice(3).replace(/\D/g, "");
      if (localDigits.length !== 10) {
        return NextResponse.json(
          { success: false, message: "India (+91) phone number must be exactly 10 digits" },
          { status: 400 }
        );
      }
    } else if (digitsOnly.length < 6 || digitsOnly.length > 15) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid phone number (6-15 digits)" },
        { status: 400 }
      );
    }

    // Safely drop old unique index if it exists in MongoDB
    try {
      await User.collection.dropIndex("phone_1");
    } catch (e) {
      // ignore if index doesn't exist
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { phone: cleanPhone },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Phone number updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        userId: updatedUser.userId,
        userType: updatedUser.userType,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error("Update Phone Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update phone number" },
      { status: 500 }
    );
  }
}
