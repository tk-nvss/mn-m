import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import CoinTransaction from "@/models/CoinTransaction";
import { getAppSettings } from "@/lib/settings";
import { placeSmileOrder } from "@/lib/smileOne";

export async function POST(req: Request) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ success: false, message: "Missing orderId" });

    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ success: false, message: "Order not found" });

    if (order.userId && order.userId !== decoded.userId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (order.status === "success" || order.status === "SUCCESS") {
      const sanitizedResponse = Array.isArray(order.externalResponse)
        ? order.externalResponse.map((r: any) => {
          if (r.data?.price) {
            const { price, ...rest } = r.data;
            return { ...r, data: rest };
          }
          return r;
        })
        : order.externalResponse;

      return NextResponse.json({
        success: true,
        message: "Already processed",
        topupResponse: sanitizedResponse
      });
    }

    if (order.expiresAt && Date.now() > order.expiresAt.getTime()) {
      order.status = "failed";
      await order.save();
      return NextResponse.json({ success: false, message: "Order expired" });
    }

    /* ========================================
       WALLET PAYMENT HANDLING
       Wallet payments don't go through gateway,
       so we skip gateway verification
    ======================================== */
    if (order.paymentMethod === "wallet") {
      // Wallet payments are already verified and paid
      // Just check if already processed
      if (order.paymentStatus === "success" && order.topupStatus === "success") {
        const sanitizedResponse = Array.isArray(order.externalResponse)
          ? order.externalResponse.map((r: any) => {
            if (r.data?.price) {
              const { price, ...rest } = r.data;
              return { ...r, data: rest };
            }
            return r;
          })
          : order.externalResponse;

        return NextResponse.json({
          success: true,
          message: "Already processed",
          topupResponse: sanitizedResponse
        });
      }

      // If payment is success but topup is pending/processing, continue to fulfillment
      if (order.paymentStatus === "success") {
        // Skip to fulfillment section (after line 125)
        // We'll handle this in the fulfillment logic below
      } else {
        // Wallet payment should have been marked as success during order creation
        return NextResponse.json({
          success: false,
          message: "Wallet payment not completed",
        });
      }
    } else {
      /* ========================================
         GATEWAY PAYMENT VERIFICATION
         For UPI/gateway payments, verify with gateway
      ======================================== */
      // Check Payment Gateway Status
      const formData = new URLSearchParams();
      formData.append("user_token", process.env.XTRA_USER_TOKEN!);
      formData.append("order_id", orderId);

      const resp = await fetch("https://xyzpay.site/api/check-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await resp.json();
      const txnStatus = data?.result?.txnStatus;

      if (txnStatus === "PENDING") {
        return NextResponse.json({
          success: false,
          message: "Payment pending",
          paymentStatus: "pending",
          topupStatus: "pending"
        });
      }

      if (txnStatus !== "SUCCESS" && txnStatus !== "COMPLETED") {
        order.status = "failed";
        order.paymentStatus = "failed";
        order.gatewayResponse = data;
        await order.save();
        return NextResponse.json({
          success: false,
          message: "Payment failed",
          paymentStatus: "failed",
          topupStatus: "pending"
        });
      }

      // Price Check
      const paidAmount = Number(data?.result?.amount || data?.result?.txnAmount || data?.result?.orderAmount);
      if (!paidAmount || paidAmount !== Number(order.price)) {
        order.status = "fraud";
        order.paymentStatus = "failed";
        await order.save();
        return NextResponse.json({
          success: false,
          message: "Amount mismatch detected",
          paymentStatus: "failed",
          topupStatus: "pending"
        });
      }

      // Store gateway response
      order.gatewayResponse = data;
    }

    // Final Confirmation
    // BLACKLIST CHECK (After payment, before delivery)
    const BLACKLIST_EMAILS = [
      "hacker@gmail.com",
      "scammer@gmail.com",
      "anyemchi@gmail.com",
      "knishan777@gmail.com",
      "git67485@gmail.com",
      "athoiningthouja8@gmail.com"
    ];

    const BLACKLIST_PLAYER_IDS = [
      "12345678",
      "87654321",
      "1478544003",
      "1703098323",
      "1223693807",
      "365070273",
      "143252242",
      "472668518",
    ];

    if (
      (order.email && BLACKLIST_EMAILS.includes(order.email)) ||
      BLACKLIST_PLAYER_IDS.includes(String(order.playerId))
    ) {
      order.status = "failed";
      order.paymentStatus = "success";
      order.topupStatus = "failed";
      await order.save();

      return NextResponse.json({
        success: false,
        message: "Order blocked by security policy",
        paymentStatus: "success",
        topupStatus: "failed"
      });
    }

    // Check if it's a multiplier/combo order (e.g., weekly-2x)
    const comboMatch = order.itemSlug.match(/(.+)-(\d+)x$/i);
    const isMultiplierOrder = !!comboMatch;

    // Unified Atomic Locking for ALL orders
    // This prevents double-execution if the user refreshes or parallel requests come in.
    const updateFields: any = {
      paymentStatus: "success",
      topupStatus: "processing",
    };

    // Only set gatewayResponse for gateway payments
    if (order.paymentMethod !== "wallet" && order.gatewayResponse) {
      updateFields.gatewayResponse = order.gatewayResponse;
    }

    const lockedOrder = await Order.findOneAndUpdate(
      {
        orderId,
        // CRITICAL: Only pick up orders that are PENDING. 
        // IF success, processing, or ALREADY FAILED, do not touch.
        topupStatus: { $nin: ["success", "processing", "failed", "FAILED", "refund", "REFUND"] },
      },
      {
        $set: updateFields,
      },
      { new: true }
    );

    if (!lockedOrder) {
      // The order is ALREADY 'success', 'processing', or 'failed'.
      const currentOrder = await Order.findOne({ orderId });

      // If it's already success, return success
      if (currentOrder?.status === "success" || currentOrder?.topupStatus === "success") {
        return NextResponse.json({
          success: true,
          message: "Topup already completed",
          paymentStatus: currentOrder.paymentStatus,
          topupStatus: currentOrder.topupStatus,
          topupResponse: currentOrder.externalResponse,
        });
      }

      // If it's processing, just tell the client to keep waiting
      if (currentOrder?.topupStatus === "processing") {
        return NextResponse.json({
          success: false,
          message: "Topup processing",
          paymentStatus: currentOrder.paymentStatus,
          topupStatus: "processing",
        });
      }

      // If it's failed, return failed (don't retry automatically!)
      return NextResponse.json({
        success: false,
        message: "Topup failed. Please contact support.",
        paymentStatus: currentOrder?.paymentStatus || "success",
        topupStatus: currentOrder?.topupStatus || "failed",
        topupResponse: currentOrder?.externalResponse,
      });
    }

    // If we got the lock, we proceed with fulfillment.
    let finalOrder = lockedOrder;

    /* ---------------------------------------------------
       FULFILLMENT LOGIC (Shared or Specific)
       Now we use 'finalOrder' which is either the locked one or the standard one
    --------------------------------------------------- */

    let multiplier = 1;
    let baseItemSlug = finalOrder.itemSlug;

    if (comboMatch) {
      baseItemSlug = comboMatch[1];
      multiplier = parseInt(comboMatch[2]);
    }

    const responses = [];
    let successCount = 0;

    // Fetch App Settings for provider check
    const settings = await getAppSettings();
    const useSmileOne = settings.mlbbWeeklyProvider === "smileone";

    for (let i = 0; i < multiplier; i++) {
      try {
        console.log(`[fulfillment] START | Order: ${orderId} | Game: ${finalOrder.gameSlug} | Item: ${baseItemSlug} | Player: ${finalOrder.playerId} | Zone: ${finalOrder.zoneId}`);
        console.log(`[fulfillment] Attempt ${i + 1}/${multiplier}`);

        let gameData: any;
        let isSuccess = false;


        // Check if we should use Smile One for Weekly Pass
        const isWeeklyPass = finalOrder.gameSlug === "mobile-legends270" && (baseItemSlug.toLowerCase().includes("weekly") || baseItemSlug.includes("pass"));

        if (useSmileOne && isWeeklyPass) {
          console.log(`[fulfillment] Using SmileOne for Weekly Pass`);
          const smileResp = await placeSmileOrder({
            playerId: String(finalOrder.playerId),
            zoneId: String(finalOrder.zoneId),
            gameSlug: finalOrder.gameSlug,
            itemSlug: baseItemSlug,
            orderId: multiplier > 1 ? `${orderId}-${i}` : orderId
          });
          gameData = smileResp.data;
          isSuccess = smileResp.success;
        } else if (finalOrder.gameSlug === "bgmi-manual") {
          const mewjiUrl = `${process.env.MEWJI_API_BASE}/order/create`;
          const mewjiKey = process.env.MEWJI_API_KEY!;
          const mewjiBody = {
            gameSlug: "bgmi-manual",
            itemSlug: baseItemSlug,
            playerId: String(finalOrder.playerId),
          };

          const mewjiHeaders = {
            "Content-Type": "application/json",
            "X-API-KEY": mewjiKey,
          };

          console.log(`[fulfillment] === BGMI MEWJI REQUEST START ===`);
          console.log(`[fulfillment] Order ID: ${orderId}`);
          console.log(`[fulfillment] Method: POST | URL: ${mewjiUrl}`);
          console.log(`[fulfillment] Headers:`, JSON.stringify({ ...mewjiHeaders, "X-API-KEY": mewjiKey ? '***' + mewjiKey.slice(-4) : 'MISSING' }, null, 2));
          console.log(`[fulfillment] Body Payload:`, JSON.stringify(mewjiBody, null, 2));
          console.log(`[fulfillment] ===============================`);

          const gameResp = await fetch(mewjiUrl, {
            method: "POST",
            headers: mewjiHeaders,
            body: JSON.stringify(mewjiBody),
          });

          console.log(`[fulfillment] MEWJI RESPONSE STATUS: ${gameResp.status} ${gameResp.statusText}`);

          const responseText = await gameResp.text();
          console.log(`[fulfillment] MEWJI RAW RESPONSE:`, responseText);

          try {
            gameData = JSON.parse(responseText);
            console.log(`[fulfillment] MEWJI PARSED JSON:`, JSON.stringify(gameData, null, 2));
          } catch (e) {
            console.error(`[fulfillment] Mewji JSON Parse Error:`, e);
            gameData = { success: false, message: "Invalid JSON from Mewji" };
          }

          isSuccess = gameResp.ok && (gameData?.success === true || gameData?.status === "success" || gameData?.order?.status === "success");
          console.log(`[fulfillment] BGMI SUCCESS CHECK -> isSuccess: ${isSuccess}`);
          console.log(`[fulfillment] === BGMI MEWJI REQUEST END ===`);


        } else {
          // Default provider (1game)
          console.log(`[fulfillment] Order ID: ${orderId}`);
          console.log(`[fulfillment] Method: POST | URL: ${process.env.NEXT_PUBLIC_API_BASE}/api-service/order`);
          console.log(`[fulfillment] Body Payload:`, JSON.stringify({ playerId: String(finalOrder.playerId), zoneId: String(finalOrder.zoneId), productId: `${finalOrder.gameSlug}_${baseItemSlug}`, currency: "USD" }, null, 2));

          console.log(`[fulfillment] ===============================`);
          const gameResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api-service/order`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.API_SECRET_KEY!,
            },
            body: JSON.stringify({
              playerId: String(finalOrder.playerId),
              zoneId: String(finalOrder.zoneId),
              productId: `${finalOrder.gameSlug}_${baseItemSlug}`,
              currency: "USD",
            }),
          });

          gameData = await gameResp.json();
          console.log(`[fulfillment] 1GAME RESPONSE:`, JSON.stringify(gameData));
          isSuccess = gameResp.ok &&
            (gameData?.success === true || gameData?.status === true || gameData?.result?.status === "SUCCESS");
        }

        console.log(`[fulfillment] Response ${i + 1}/${multiplier}:`, JSON.stringify(gameData));

        // Remove price from response before pushing
        if (gameData?.data?.price) {
          delete gameData.data.price;
        }

        responses.push(gameData);

        if (isSuccess) {
          successCount++;
        }
      } catch (err: any) {
        console.error(`[fulfillment] Crash ${i + 1}/${multiplier}:`, err.message);
        responses.push({ error: true, message: err.message });
      }
    }

    finalOrder.externalResponse = responses;
    if (successCount === multiplier) {
      finalOrder.status = "success";
      finalOrder.topupStatus = "success";
    } else if (successCount > 0) {
      finalOrder.status = "success";
      finalOrder.topupStatus = "success";
      finalOrder.itemName = `${finalOrder.itemName} (${successCount}/${multiplier} delivered)`;
    } else {
      finalOrder.status = "failed";
      finalOrder.topupStatus = "failed";
    }

    await finalOrder.save();

    /* ===================================================
       BBC COIN REWARD: Award 1 coin per ₹150 on success
    =================================================== */
    if (finalOrder.status === "success" && finalOrder.userId) {
      try {
        const coinsToAward = Math.floor(Number(finalOrder.price) / 150);
        if (coinsToAward > 0) {
          const purchaseUser = await User.findOneAndUpdate(
            { userId: finalOrder.userId },
            { $inc: { coins: coinsToAward } },
            { new: true }
          );
          if (purchaseUser) {
            const coinTxId = `PURCHASE${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
            await CoinTransaction.create({
              transactionId: coinTxId,
              userId: finalOrder.userId,
              userObjectId: purchaseUser._id,
              type: "earn",
              coins: coinsToAward,
              balanceBefore: (purchaseUser.coins || 0) - coinsToAward,
              balanceAfter: purchaseUser.coins || 0,
              source: "purchase",
              description: `Purchase Reward: ${finalOrder.itemName}`,
              referenceId: finalOrder.orderId,
              performedBy: "system",
            });
            console.log(`[coins] Awarded ${coinsToAward} coins to ${finalOrder.userId} for order ${finalOrder.orderId}`);
          }
        }
      } catch (coinErr) {
        // Non-critical: don't fail the order if coin award fails
        console.error("[coins] Failed to award purchase coins:", coinErr);
      }
    }

    /* ===================================================
       PUSH NOTIFICATION: Instant alert on success
    =================================================== */
    if (finalOrder.status === "success" && finalOrder.userId) {
      import("@/lib/webPush").then(({ broadcastPushNotification }) => {
        broadcastPushNotification(
          {
            title: "🎉 Top-up Successful!",
            body: `Your order #${finalOrder.orderId} for ${finalOrder.itemName || "Diamonds"} has been delivered successfully.`,
            url: "/dashboard/orders",
            icon: "/logoBB.png",
          },
          { userId: finalOrder.userId }
        ).catch(() => {});
      }).catch(() => {});
    }

    return NextResponse.json({
      success: finalOrder.status === "success",
      message: finalOrder.status === "success" ? "Topup successful" : "Topup failed",
      paymentStatus: finalOrder.paymentStatus,
      topupStatus: finalOrder.topupStatus,
      topupResponse: responses,
    });
  } catch (error: any) {
    console.error("VERIFY ERROR:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
