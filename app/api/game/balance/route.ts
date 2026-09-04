import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getAppSettings();
    const activeProvider = settings.topupProvider || "1game";

    // Concurrently fetch 1Game and Bluebuff balances
    const [oneGameResult, bluebuffResult] = await Promise.allSettled([
      // 1Game Balance Fetch
      (async () => {
        try {
          const url = `${process.env.NEXT_PUBLIC_API_BASE}/api-service/balance?currency=USD`;
          const resp = await fetch(url, {
            method: "GET",
            headers: {
              "x-api-key": process.env.API_SECRET_KEY!,
            },
            cache: "no-store",
          });
          const data = await resp.json();
          let balanceValue = "0.00";
          if (data?.data?.balance) {
            balanceValue = String(data.data.balance).replace(/[^\d.]/g, "");
          } else if (typeof data?.balance === "number" || typeof data?.balance === "string") {
            balanceValue = String(data.balance).replace(/[^\d.]/g, "");
          }
          return {
            success: resp.ok && (data.success !== false),
            balance: parseFloat(balanceValue) || 0,
            currency: "USD",
            raw: data,
          };
        } catch (err: any) {
          console.error("1Game balance fetch error:", err);
          return { success: false, balance: 0, currency: "USD", error: err.message };
        }
      })(),

      // Bluebuff Balance Fetch
      (async () => {
        try {
          const bluebuffBase = process.env.BLUEBUFF_API_BASE || "https://api.bluebuff.in";
          const bluebuffKey = process.env.BLUEBUFF_API_KEY!;
          const resp = await fetch(`${bluebuffBase}/api/service/balance`, {
            method: "GET",
            headers: {
              "x-api-key": bluebuffKey,
            },
            cache: "no-store",
          });
          const data = await resp.json();
          const walletNum = typeof data?.wallet === "number" ? data.wallet : parseFloat(data?.wallet || "0");
          return {
            success: resp.ok && (data?.success === true),
            balance: walletNum || 0,
            wallet: walletNum || 0,
            currency: data?.currency || "USD",
            userType: data?.userType,
            name: data?.name,
            usage: data?.usage,
            raw: data,
          };
        } catch (err: any) {
          console.error("Bluebuff balance fetch error:", err);
          return { success: false, balance: 0, currency: "USD", error: err.message };
        }
      })()
    ]);

    const oneGame = oneGameResult.status === "fulfilled" ? oneGameResult.value : { success: false, balance: 0, currency: "USD" };
    const bluebuff = bluebuffResult.status === "fulfilled" ? bluebuffResult.value : { success: false, balance: 0, currency: "USD" };

    // Active balance based on selected provider for backward compatibility
    const activeBalance = activeProvider === "bluebuff" ? bluebuff.balance : oneGame.balance;

    return NextResponse.json({
      success: true,
      activeProvider,
      oneGame,
      bluebuff,
      balance: activeBalance,
    });
  } catch (error: any) {
    console.error("BALANCE CHECK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Error checking balance", error: error.message },
      { status: 500 }
    );
  }
}
