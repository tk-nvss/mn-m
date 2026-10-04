import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import CoinTask from "@/models/CoinTask";
import CoinTaskClaim from "@/models/CoinTaskClaim";
import { verifyHmac } from "@/lib/hmac";
import { generateTxId } from "@/utils/formatters";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const rawBody = await req.text();
    
    if (!verifyHmac(req, rawBody, authHeader)) {
      return NextResponse.json({ success: false, message: "Forbidden: Invalid Signature" }, { status: 403 });
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const objectId = decoded.userId; // MongoDB _id from JWT
    
    let bodyData: any = {};
    try {
      if (rawBody) bodyData = JSON.parse(rawBody);
    } catch {}
    
    const { taskId, code, proofUrl } = bodyData;

    if (!taskId) {
      return NextResponse.json({ success: false, message: "taskId is required" }, { status: 400 });
    }

    // Resolve user to get string userId and display info
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ _id: objectId }).select("userId name email");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    const userId = user.userId; // custom string field used in CoinTaskClaim

    const now = new Date();

    // Find the task — include verificationCode for server-side check
    const task = await CoinTask.findOne({ taskId });
    if (!task) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    // Validations
    if (!task.active) {
      return NextResponse.json({ success: false, message: "This task is no longer active" });
    }
    if (task.expiresAt && now > task.expiresAt) {
      return NextResponse.json({ success: false, message: "This task has expired" });
    }
    if (task.maxCompletions !== null && task.completedBy.length >= task.maxCompletions) {
      return NextResponse.json({ success: false, message: "This task has reached its maximum completions" });
    }

    // ── VERIFICATION CODE CHECK ───────────────────────────────────────────
    if (task.verificationCode) {
      if (!code || !code.trim()) {
        return NextResponse.json({
          success: false,
          message: "This task requires a verification code. Find it in the task content!",
          requiresCode: true,
        });
      }
      const enteredCode = code.trim().toLowerCase();
      const correctCode = task.verificationCode.trim().toLowerCase();
      if (enteredCode !== correctCode) {
        return NextResponse.json({
          success: false,
          message: "Wrong code! Look more carefully in the video/post. 🔍",
          requiresCode: true,
        });
      }
    }

    // Check if user already has a PENDING or APPROVED claim for this task
    const existingClaim = await CoinTaskClaim.findOne({
      userId,
      taskId,
      status: { $in: ["pending", "approved"] },
    });

    if (existingClaim) {
      if (existingClaim.status === "approved") {
        return NextResponse.json({ success: false, message: "You already completed this task" });
      }
      return NextResponse.json({
        success: false,
        message: "Your claim is already under review. Please wait for admin approval.",
        claimId: existingClaim.claimId,
      });
    }

    // Create a PENDING claim — awaits admin approval
    const claimId = generateTxId("CLAIM");
    await CoinTaskClaim.create({
      claimId,
      userId,
      userName: user.name || "Unknown",
      userEmail: user.email || "",
      taskId,
      taskTitle: task.title,
      coins: task.reward,
      status: "pending",
      proofUrl: proofUrl || null,
    });


    return NextResponse.json({
      success: true,
      message: "✅ Code verified! Claim submitted for review. Coins will be added after admin approval.",
      claimId,
      coins: task.reward,
      status: "pending",
    });
  } catch (error) {
    console.error("[coins/complete-task] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
