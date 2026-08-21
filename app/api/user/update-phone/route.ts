import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (err) {
      return NextResponse.json({ success: false, message: "Invalid Token" }, { status: 401 });
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 });
    }

    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { userId: decoded.userId },
      { phone },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Phone number updated successfully",
      phone: user.phone
    });
  } catch (error: any) {
    console.error("Update Phone Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
