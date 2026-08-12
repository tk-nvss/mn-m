import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Giveaway from "@/models/Giveaway";
import GiveawayEntry from "@/models/GiveawayEntry";
import jwt from "jsonwebtoken";

export async function POST(req, { params }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false }, { status: 401 });
  try { jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET); } catch { return NextResponse.json({ success: false }, { status: 401 }); }

  await connectDB();
  const { id } = await params;
  const { count = 1, manualUserId, revertUserId } = await req.json();

  if (revertUserId) {
    await GiveawayEntry.findOneAndUpdate(
      { giveawayId: id, userId: revertUserId },
      { isWinner: false }
    );
    await Giveaway.findByIdAndUpdate(id, {
      $pull: { winners: revertUserId }
    });
    return NextResponse.json({ success: true, message: "Winner reverted" });
  }

  let winners = [];
  if (manualUserId) {
    const entry = await GiveawayEntry.findOne({ giveawayId: id, userId: manualUserId });
    if (!entry) return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });
    if (entry.isWinner) return NextResponse.json({ success: false, message: "Already a winner" }, { status: 400 });
    winners = [entry];
  } else {
    const entries = await GiveawayEntry.find({ giveawayId: id, isWinner: false, isVerified: true });
    if (!entries.length) return NextResponse.json({ success: false, message: "No eligible verified entries" }, { status: 400 });

    // Fisher-Yates shuffle and pick N
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    winners = shuffled.slice(0, Math.min(count, shuffled.length));
  }

  const winnerIds = winners.map(w => w.userId);

  // Mark winners in entries
  await GiveawayEntry.updateMany(
    { giveawayId: id, userId: { $in: winnerIds } },
    { isWinner: true }
  );

  // Save winners on giveaway and set ended (only if random pick, or maybe manual should also end?)
  // Actually let's just add the winners. The admin can end it manually if they want, or we can leave status unchanged if manual.
  await Giveaway.findByIdAndUpdate(id, {
    $addToSet: { winners: { $each: winnerIds } },
    ...(manualUserId ? {} : { status: "ended" }),
  });

  return NextResponse.json({ success: true, winners: winners.map(w => ({ userId: w.userId, name: w.name, email: w.email, mlbbId: w.mlbbId })) });
}
