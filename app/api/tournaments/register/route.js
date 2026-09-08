import { connectDB } from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import TournamentEntry from "@/models/TournamentEntry";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    // 1. Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { tournamentId, contactEmail, contactPhone, gameIds, teamName } = await req.json();

    if (!tournamentId || !gameIds || !gameIds.length) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Tournament & User
    const [tournament, user] = await Promise.all([
      Tournament.findById(tournamentId),
      User.findById(userId)
    ]);

    if (!tournament) return NextResponse.json({ success: false, message: "Tournament not found" }, { status: 404 });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Check Daily Free Limit for non-members
    if (tournament.entryCoins === 0 && user.userType !== "member" && user.userType !== "owner") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const entriesToday = await TournamentEntry.find({
        userId,
        createdAt: { $gte: today },
      }).populate("tournamentId");

      const freeCount = entriesToday.filter(e => e.tournamentId?.entryCoins === 0).length;

      if (freeCount >= 1) {
        return NextResponse.json({ 
          success: false, 
          message: "Daily Limit Reached! Regular users can only join 1 FREE tournament per day. Upgrade to MEMBER for unlimited access!" 
        }, { status: 403 });
      }
    }

    // 3. Validation
    if (tournament.status === "ended") {
      return NextResponse.json({ success: false, message: "This tournament has already ended" }, { status: 400 });
    }
    
    if (tournament.status === "closed") {
      return NextResponse.json({ success: false, message: "Registration is closed for this tournament" }, { status: 400 });
    }

    if (tournament.endsAt && new Date() > new Date(tournament.endsAt)) {
      return NextResponse.json({ success: false, message: "Registration for this tournament has expired" }, { status: 400 });
    }

    if (tournament.status !== "open" && tournament.status !== "upcoming") {
      return NextResponse.json({ success: false, message: "Registration is not open yet" }, { status: 400 });
    }

    if (tournament.slotsFilled >= tournament.slots) {
      return NextResponse.json({ success: false, message: "Tournament is full" }, { status: 400 });
    }

    // Check if user already joined
    const existingEntry = await TournamentEntry.findOne({ tournamentId, userId });
    if (existingEntry) {
      return NextResponse.json({ success: false, message: "You have already joined this tournament" }, { status: 400 });
    }

    // Check coins
    if (user.coins < tournament.entryCoins) {
      return NextResponse.json({ success: false, message: "Insufficient BBC coins" }, { status: 400 });
    }

    // 4. Atomic Transaction for Registration
    const session = await (await connectDB()).startSession();
    session.startTransaction();

    try {
      // Re-verify slot availability and increment atomically within session
      const updatedTournament = await Tournament.findOneAndUpdate(
        { _id: tournamentId, slotsFilled: { $lt: tournament.slots }, status: { $in: ["open", "upcoming"] } },
        { $inc: { slotsFilled: 1 } },
        { session, new: true }
      );

      if (!updatedTournament) {
        throw new Error("Tournament just filled up or registration closed.");
      }

      // Deduct coins atomically
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, coins: { $gte: tournament.entryCoins } },
        { $inc: { coins: -tournament.entryCoins } },
        { session, new: true }
      );

      if (!updatedUser) {
        throw new Error("Insufficient coins for registration.");
      }

      // 5. Create Entry within transaction
      const entry = await TournamentEntry.create([{
        tournamentId,
        userId,
        contactEmail,
        contactPhone,
        gameIds,
        teamName: teamName || "",
        coinsPaid: tournament.entryCoins,
        status: "confirmed"
      }], { session });

      await session.commitTransaction();

      return NextResponse.json({
        success: true,
        message: "Successfully joined tournament!",
        data: entry[0],
        newCoinBalance: updatedUser.coins
      });

    } catch (error) {
      await session.abortTransaction();
      return NextResponse.json({ 
        success: false, 
        message: error.message || "Registration failed due to a server error." 
      }, { status: 400 });
    } finally {
      session.endSession();
    }

  } catch (err) {
    console.error("Tournament registration error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    console.log("Fetching entries for user:", userId);

    const entries = await TournamentEntry.find({ userId })
      .populate("tournamentId")
      .sort({ createdAt: -1 });

    // Filter out any entries where the tournament was deleted
    const validEntries = entries.filter((e) => Boolean(e.tournamentId));

    console.log(`Found ${validEntries.length} valid entries`);

    return NextResponse.json({ success: true, data: validEntries });
  } catch (err) {
    console.error("Fetch joined tournaments error:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
