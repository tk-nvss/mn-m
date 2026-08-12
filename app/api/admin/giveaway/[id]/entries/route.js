import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import GiveawayEntry from "@/models/GiveawayEntry";
import jwt from "jsonwebtoken";

export async function GET(req, { params }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false }, { status: 401 });
  try { jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET); } catch { return NextResponse.json({ success: false }, { status: 401 }); }

  await connectDB();
  const { id } = await params;
  const entries = await GiveawayEntry.find({ giveawayId: id }).sort({ createdAt: -1 });
  return NextResponse.json({ success: true, entries });
}

export async function PATCH(req, { params }) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false }, { status: 401 });
  try { jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET); } catch { return NextResponse.json({ success: false }, { status: 401 }); }

  await connectDB();
  const { id } = await params;
  const { entryId, isVerified } = await req.json();

  const entry = await GiveawayEntry.findOneAndUpdate(
    { _id: entryId, giveawayId: id },
    { isVerified },
    { new: true }
  );

  if (!entry) return NextResponse.json({ success: false, message: "Entry not found" }, { status: 404 });

  return NextResponse.json({ success: true, entry });
}
