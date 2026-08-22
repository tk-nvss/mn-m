import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

export async function POST(req) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: "Endpoint required" },
        { status: 400 }
      );
    }

    await connectDB();
    await PushSubscription.deleteOne({ endpoint });

    return NextResponse.json({ success: true, message: "Push subscription removed" });
  } catch (error) {
    console.error("Error removing push subscription:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to remove subscription" },
      { status: 500 }
    );
  }
}
