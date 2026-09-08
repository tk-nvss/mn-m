import { connectDB } from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import TournamentEntry from "@/models/TournamentEntry";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const requireOwner = (req) => {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer "))
    return { error: "Unauthorized", status: 401 };
  try {
    const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    if (decoded.userType !== "owner") return { error: "Forbidden", status: 403 };
    return { decoded };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
};

/* ── PATCH /api/tournaments/[id] — update / end a tournament ── */
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const auth = requireOwner(req);
    if (auth.error)
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

    const body = await req.json();
    const updated = await Tournament.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, message: "Tournament not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/tournaments/[id]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

/* ── DELETE /api/tournaments/[id] ── */
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const auth = requireOwner(req);
    if (auth.error)
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });

    await Promise.all([
      Tournament.findByIdAndDelete(id),
      TournamentEntry.deleteMany({ tournamentId: id })
    ]);
    return NextResponse.json({ success: true, message: "Tournament and associated entries deleted" });
  } catch (err) {
    console.error("DELETE /api/tournaments/[id]", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
