import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import PricingConfig from "@/models/PricingConfig";
import AppSettings from "@/models/AppSettings";
import Blocklist from "@/models/Blocklist";
import { autoBlocklist } from "@/lib/autoBlocklist";
import crypto from "crypto";

/* =====================================================
   TYPES
===================================================== */

type MembershipConfig = {
  items: Record<string, number>;
};

type OTTConfig = Record<string, number>;

/* =====================================================
   STATIC PRICING (SERVER TRUSTED)
===================================================== */

const MEMBERSHIPS: Record<string, MembershipConfig> = {
  "silver-membership": {
    items: {
      "silver-1m": 29,
      "silver-3m": 100,
      "silver-6m": 150,
      "silver-12m": 300,
    },
  },
  "reseller-membership": {
    items: {
      "reseller-1m": 29,
      "reseller-3m": 100,
      "reseller-6m": 150,
      "reseller-12m": 300,
    },
  },
};

const OTTS: Record<string, OTTConfig> = {
  "youtube-premium": {
    "yt-1m": 25,
  },
  netflix: {
    "nf-1m": 110,
  },
  spotify: {
    "spot-1m": 30,
  },
};

const MANUAL_GAMES: Record<string, MembershipConfig> = {
  "starlight-card-manual": {
    items: {
      "starlight-normal": 230,
      "starlight-premium": 500,
    },
  },
  "bgmi-manual": {
    items: {
      "bgmi-60": 73,
      "bgmi-325": 365,
      "bgmi-660": 720,
      "bgmi-1800": 1800,
      "bgmi-3850": 2650,
      "bgmi-8100": 7200,
    },
  },
};

/* =====================================================
   PRICE RESOLVER
===================================================== */

async function resolvePrice(
  gameSlug: string,
  itemSlug: string,
  userType: string
): Promise<number> {
  // MEMBERSHIPS
  if (MEMBERSHIPS[gameSlug]) {
    const price = MEMBERSHIPS[gameSlug].items[itemSlug];
    if (!price) throw new Error("Invalid membership item");
    return price;
  }

  // OTTS
  if (OTTS[gameSlug]) {
    const price = OTTS[gameSlug][itemSlug];
    if (!price) throw new Error("Invalid OTT item");
    return price;
  }

  // MANUAL GAMES
  if (MANUAL_GAMES[gameSlug]) {
    const price = MANUAL_GAMES[gameSlug].items[itemSlug];
    if (!price) throw new Error("Invalid manual game item");
    return price;
  }

  // GAMES
  const resp = await fetch(
    `https://game-off-ten.vercel.app/api/v1/game/${gameSlug}`,
    {
      headers: {
        "x-api-key": process.env.API_SECRET_KEY!,
      },
    }
  );

  const data = await resp.json();
  if (!data?.data?.itemId) throw new Error("Game not found");

  let baseItem = data.data.itemId.find(
    (i: any) => i.itemSlug === itemSlug
  );

  let multiplier = 1;
  const ALLOWED_MULTIPLIERS = [2, 3]; // Added 3x support

  if (!baseItem && itemSlug.startsWith("weekly-pass816-")) {
    const match = itemSlug.match(/weekly-pass816-(\d+)x/);
    if (!match) throw new Error("Invalid combo format");

    multiplier = parseInt(match[1]);
    if (!ALLOWED_MULTIPLIERS.includes(multiplier)) {
      throw new Error(`AutoBlock: Combo multiplier ${multiplier}x is not allowed`);
    }

    baseItem = data.data.itemId.find((i: any) => i.itemSlug === "weekly-pass816");
  }

  if (!baseItem) throw new Error("Invalid game item");

  let price = Number(baseItem.sellingPrice) * multiplier;

  // For pricing, treat 'owner' as 'user' so they can test the system
  const effectiveUserType = userType === "owner" ? "user" : userType;

  await connectDB();
  // 1. Resolve Pricing Config (Role-specific or Fallback to User)
  let pricingConfig = await PricingConfig.findOne({ userType: effectiveUserType }).lean();
  let userPricingConfig = await PricingConfig.findOne({ userType: "user" }).lean();

  // If no role config exists at all, use user config
  if (!pricingConfig) {
    pricingConfig = userPricingConfig;
  }

  if (pricingConfig) {
    // A. Check for Override first
    const override = pricingConfig.overrides?.find(
      (o: any) => o.gameSlug === gameSlug && o.itemSlug === itemSlug
    );

    if (override && override.isEnabled !== false && override.fixedPrice != null) {
      price = Number(override.fixedPrice);
    } else {
      // B. Apply Slabs (check role-specific first, then fallback to user global markup)
      let matchedSlab = pricingConfig.slabs?.find(
        (s: any) => price >= Number(s.min) && price < Number(s.max)
      );

      // Fallback to 'user' slabs if role-specific lookup failed
      if (!matchedSlab && pricingConfig.userType !== "user" && userPricingConfig?.slabs?.length) {
        matchedSlab = userPricingConfig.slabs.find(
          (s: any) => price >= Number(s.min) && price < Number(s.max)
        );
      }

      if (matchedSlab) {
        price = price * (1 + Number(matchedSlab.percent) / 100);
      }
    }
  }

  return Math.ceil(price);
}

/* =====================================================
   CREATE ORDER API
===================================================== */

export async function POST(req: Request) {
  try {
    await connectDB();

    /* ---------- SETTINGS CHECK ---------- */
    const settings = await AppSettings.findOne({}).lean();
    if (settings?.ordersDisabled) {
      return NextResponse.json({
        success: false,
        message: "Taking new orders is temporarily paused. Please try again later.",
      });
    }

    /* ---------- AUTH (JWT) ---------- */
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(
        authHeader.split(" ")[1],
        process.env.JWT_SECRET!
      );
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId || null;
    const userType = decoded.userType || "user";

    /* ---------- BODY ---------- */
    const body = await req.json();

    const {
      gameSlug,
      itemSlug,
      itemName,
      playerId,
      playerName,
      zoneId,
      paymentMethod,
      email,
      phone,
      currency = "INR",
    } = body;

    if (
      !gameSlug ||
      !itemSlug ||
      !playerId ||
      !paymentMethod
    ) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required for order confirmation",
      });
    }

    if (!email.toLowerCase().endsWith("@gmail.com")) {
      return NextResponse.json({
        success: false,
        message: "Only @gmail.com addresses are allowed.",
      }, { status: 403 });
    }

    /* ---------- BLOCKLIST CHECK ---------- */
    // Get client IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Build query to check if email, playerId, or IP is blocklisted
    const blocklistItems = await Blocklist.find({
      $or: [
        { type: "email", value: email.toLowerCase().trim() },
        { type: "gameId", value: playerId.trim() },
        { type: "ip", value: ip }
      ]
    }).lean();

    if (blocklistItems.length > 0) {
      // Return a generic error message as requested by the user
      return NextResponse.json({
        success: false,
        message: "Something went wrong. Please try again.",
      }, { status: 403 });
    }

    /* ---------- SERVER PRICE ---------- */
    const price = await resolvePrice(gameSlug, itemSlug, userType);

    /* ---------- ORDER ID ---------- */
    const orderId =
      "TKMLBB" +
      Date.now().toString(36).toUpperCase() +
      crypto.randomBytes(6).toString("hex").toUpperCase();

    const platform = (
      (body.platform || req.headers.get("x-client-platform") || "web") as string
    ).toLowerCase() === "pwa" ? "pwa" : "web";

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    /* ---------- CREATE ORDER ---------- */
    const newOrder = await Order.create({
      orderId,
      userId,
      gameSlug,
      itemSlug,
      itemName,
      playerId,
      playerName,
      zoneId,
      paymentMethod,
      price,
      email: email || null,
      phone: phone || null,
      currency,
      platform,
      status: "pending",
      paymentStatus: "pending",
      topupStatus: "pending",
      expiresAt,
    });

    /* ---------- WALLET PAYMENT ---------- */
    if (paymentMethod === "wallet") {
      // Find user - Try by MongoDB _id first, then by custom userId
      let user = await User.findById(userId);
      if (!user) {
        user = await User.findOne({ userId });
      }

      if (!user) {
        return NextResponse.json({
          success: false,
          message: `User not found for ID: ${userId}`,
        }, { status: 404 });
      }

      // Check wallet balance
      // 🔒 ATOMIC TRANSACTION: Prevent race conditions (Double Spend)
      // Use findOneAndUpdate with $inc to atomically check balance and deduct
      const updatedUser = await User.findOneAndUpdate(
        {
          _id: user._id,
          wallet: { $gte: price } // Condition: Wallet must be >= price
        },
        {
          $inc: {
            wallet: -price,
            order: 1
          }
        },
        { new: true } // Return the updated document
      );

      if (!updatedUser) {
        return NextResponse.json({
          success: false,
          message: "Insufficient wallet balance or transaction failed.",
        }, { status: 400 });
      }

      // 📝 LOG TRANSACTION (Debit)
      // Now we have a record of money leaving the wallet
      const WalletTransaction = require("@/models/WalletTransaction").default;
      await WalletTransaction.create({
        transactionId: `DEBIT${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        userId: user.userId,
        userObjectId: user._id,
        type: "debit",
        amount: price,
        balanceBefore: updatedUser.wallet + price, // Calculate roughly
        balanceAfter: updatedUser.wallet,
        description: `Purchase: ${itemName} (${gameSlug})`,
        status: "success",
        referenceId: orderId,
        performedBy: "user",
      });

      // Update order status
      newOrder.status = "pending";
      newOrder.paymentStatus = "success";
      newOrder.topupStatus = "pending"; // Must be pending so fulfillment system can lock and process it
      await newOrder.save();

      return NextResponse.json({
        success: true,
        orderId,
        paymentMethod: "wallet",
        walletPayment: true,
        newWalletBalance: updatedUser.wallet,
        message: "Order placed successfully using wallet balance",
      });
    }

    /* ---------- PAYMENT GATEWAY ---------- */
    const formData = new URLSearchParams();
    if (phone) formData.append("customer_mobile", phone);
    formData.append("user_token", process.env.XTRA_USER_TOKEN!);
    formData.append("amount", String(price));
    formData.append("order_id", orderId);
    console.log('orderId:', orderId);
    formData.append(
      "redirect_url",
      `${process.env.NEXT_PUBLIC_BASE_URLU}/payment/topup-complete`
    );

    const resp = await fetch("https://xyzpay.site/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const data = await resp.json();

    if (!data?.status) {
      return NextResponse.json({
        success: false,
        message: "Payment gateway error",
      });
    }

    newOrder.gatewayOrderId = data.result.orderId;
    await newOrder.save();

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: data.result.payment_url,
    });
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err);

    // If it's a known rigging attempt
    if (err.message && err.message.startsWith("AutoBlock:")) {
      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
      
      // We parse out email and playerId from body if we can
      // But body is already consumed. However, we can just block the IP.
      await autoBlocklist("ip", ip, err.message);
      
      return NextResponse.json(
        { success: false, message: "Something went wrong. Please try again." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
