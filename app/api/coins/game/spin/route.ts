import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { verifyHmac } from "@/lib/hmac";
import { createCoinTx } from "@/lib/coinService";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const authHeader = req.headers.get("authorization");
    const rawBody = await req.text();
    
    if (!verifyHmac(req, rawBody, authHeader)) {
      return NextResponse.json({ success: false, message: "Forbidden: Invalid Signature" }, { status: 403 });
    }
    
    let bodyData: any = {};
    try {
      if (rawBody) bodyData = JSON.parse(rawBody);
    } catch {}
    
    const { game, side } = bodyData;

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId; // MongoDB _id
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Cooldown check (25 seconds)
    const now = new Date();
    if (user.lastGameSpin && (now.getTime() - new Date(user.lastGameSpin).getTime() < 25000)) {
      const remaining = 25 - Math.floor((now.getTime() - new Date(user.lastGameSpin).getTime()) / 1000);
      return NextResponse.json({ success: false, message: `Wait ${remaining}s before next spin!` });
    }

    const balanceBefore = user.coins || 0;
    let serverOutcome = 0;
    let extraData: any = {};

    // ── Server-Side Randomness Logic ────────────────────────────────────
    if (game === "roulette") {
      const rouletteOutcomes = [0, 0, 0, 1, -1];
      const randomIndex = Math.floor(Math.random() * rouletteOutcomes.length);
      serverOutcome = rouletteOutcomes[randomIndex];
      extraData.index = randomIndex; // Send back for animation
    }
    else if (game === "coinflip") {
      if (!side) return NextResponse.json({ success: false, message: "No side selected" });
      const sides = ["heads", "tails"];
      const winningSide = sides[Math.floor(Math.random() * 2)];
      serverOutcome = (side === winningSide) ? 2 : -2;
      extraData.winningSide = winningSide;
    }
    else if (game === "treasure") {
      // 1 winner (+1), 1 loser (-1), 4 empty (0)
      const rand = Math.random();
      if (rand < 0.166) serverOutcome = 1;
      else if (rand < 0.333) serverOutcome = -1;
      else serverOutcome = 0;
    }
    else if (game === "slot") {
      // symbols: 0:🍒, 1:🍋, 2:🔔, 3:⭐, 4:💎
      const r1 = Math.floor(Math.random() * 5);
      const r2 = Math.floor(Math.random() * 5);
      const r3 = Math.floor(Math.random() * 5);

      extraData.reels = [r1, r2, r3];

      if (r1 === r2 && r2 === r3) {
        // 3 of a kind
        if (r1 === 4) serverOutcome = 5; // All Dias
        else if (r1 === 3) serverOutcome = 4; // All Stra
        else serverOutcome = 1; // All Same (Others)
      } else {
        // Not same
        serverOutcome = -1;
      }
    }

    // Prevent negative balance
    const actualOutcome = serverOutcome < 0 ? Math.max(-balanceBefore, serverOutcome) : serverOutcome;
    const balanceAfter = balanceBefore + actualOutcome;

    console.log(`[api/coins/game/spin] Processing ${game} for user ${user.userId}: ${balanceBefore} -> ${balanceAfter} (Outcome: ${actualOutcome})`);

    // ── Atomic DB update ─────────────────────────────────────────────────
    try {
      const updateFilter: any = { 
        _id: userId,
        lastGameSpin: user.lastGameSpin // Fails if another concurrent request updated it
      };
      if (actualOutcome < 0) {
        updateFilter.coins = { $gte: Math.abs(actualOutcome) };
      }

      const updatedUser = await User.findOneAndUpdate(
        updateFilter,
        {
          $inc: { coins: actualOutcome },
          $set: { lastGameSpin: now },
        },
        { new: true }
      );
      
      if (!updatedUser) {
         return NextResponse.json({ success: false, message: "Concurrent request detected or insufficient coins." }, { status: 429 });
      }
    } catch (dbErr) {
      console.error("[api/coins/game/spin] DB Update Error:", dbErr);
      throw dbErr;
    }

    if (actualOutcome !== 0) {
      try {
        // ── Log transaction ──────────────────────────────────────────────────
        await createCoinTx({
          user,
          type: actualOutcome > 0 ? "earn" : "spend",
          coins: Math.abs(actualOutcome),
          balanceBefore,
          balanceAfter,
          source: "game",
          description: actualOutcome > 0 ? `Won ${actualOutcome} BBC from ${game || 'Lucky Spin'}!` : `Lost ${Math.abs(actualOutcome)} BBC from ${game || 'Lucky Spin'}! 😢`,
          performedBy: "system",
        });
      } catch (txErr) {
        console.error("[api/coins/game/spin] Transaction Log Error:", txErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: actualOutcome > 0 ? `You won ${actualOutcome} BBC!` : actualOutcome < 0 ? `Unlucky! You lost ${Math.abs(actualOutcome)} BBC.` : "Better luck next time!",
      newBalance: balanceAfter,
      outcome: actualOutcome,
      ...extraData
    });
  } catch (error) {
    console.error("[api/coins/game/spin] Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
