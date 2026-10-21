import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import FlashSaleConfig from "@/models/FlashSaleConfig";
import { DEFAULT_FLASH_SALE_ITEMS } from "@/app/api/flash-sale/route";

function checkAdminAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!["admin", "owner"].includes(decoded.userType)) {
      return { error: "Forbidden: Admin or Owner access required", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Invalid or expired token", status: 401 };
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const auth = checkAdminAuth(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    let config = await FlashSaleConfig.findOne({}).lean() as any;

    if (!config) {
      const defaultEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      config = await FlashSaleConfig.create({
        title: "Flash Sale",
        enabled: true,
        endTime: defaultEndTime,
        items: DEFAULT_FLASH_SALE_ITEMS,
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("[api/admin/flash-sale] GET Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const auth = checkAdminAuth(req);
    if (auth.error) {
      return NextResponse.json({ success: false, message: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    let config = await FlashSaleConfig.findOne({});

    if (!config) {
      config = new FlashSaleConfig({
        title: "Flash Sale",
        enabled: true,
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: DEFAULT_FLASH_SALE_ITEMS,
      });
    }

    if (typeof body.title === "string") {
      config.title = body.title.trim() || "Flash Sale";
    }

    if (typeof body.enabled === "boolean") {
      config.enabled = body.enabled;
    }

    if (body.endTime) {
      config.endTime = new Date(body.endTime);
    }

    if (Array.isArray(body.items)) {
      config.items = body.items.map((item: any, idx: number) => ({
        id: (item.id || `fs_${idx + 1}`).trim(),
        name: (item.name || `Item ${idx + 1}`).trim(),
        game: (item.game || "Game").trim(),
        image: (item.image || "/game-assets/weeklypass.webp").trim(),
        price: (item.price || "₹0").trim(),
        originalPrice: (item.originalPrice || "₹0").trim(),
        slug: (item.slug || "").trim(),
        badge: (item.badge || "Hot").trim(),
        enabled: item.enabled !== false,
      }));
    }

    await config.save();

    return NextResponse.json({
      success: true,
      message: "Flash Sale configuration updated successfully",
      data: config,
    });
  } catch (error) {
    console.error("[api/admin/flash-sale] PATCH Error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
