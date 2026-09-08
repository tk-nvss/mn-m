import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/apiKeyAuth";

export async function POST(req) {
    try {
        const auth = await validateApiKey(req);
        if (!auth.success) {
            return NextResponse.json({ success: false, message: auth.message }, { status: 401 });
        }

        const body = await req.json();

        // Forward to the external region check API as requested
        const response = await fetch("https://game-off-ten.vercel.app/api/v1/check-region", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.API_SECRET_KEY,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const { gameSlug } = body;

        if (data.success === 200 && data.data?.valid === false) {
            return NextResponse.json({
                success: false,
                message: "Validation failed: Invalid Player ID or Server ID."
            }, { status: 400 });
        }

        // ⚡ REGION RESTRICTION CHECK for mobile-legends114 via Service API
        if ((gameSlug === "mobile-legends114" || gameSlug === "mlbb-double332" || gameSlug === "weeklymonthly-bundle646") && data.success === 200) {
            const playerRegion = data.data?.region?.toUpperCase();
            const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];

            if (restrictedRegions.includes(playerRegion)) {
                return NextResponse.json({
                    success: false,
                    message: `Validation failed: Orders from ${playerRegion} region are not allowed for this product.`
                }, { status: 400 });
            }
        }

        // Forward the external API response directly
        return NextResponse.json(data);

    } catch (error) {
        console.error("Service Region Check API Error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}
