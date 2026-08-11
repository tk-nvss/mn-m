import PricingConfig from "@/models/PricingConfig";

/* ================= STATIC CONFIGS ================= */
export const MEMBERSHIPS = {
    "silver-membership": {
        itemId: [
            { itemSlug: "silver-1m", itemName: "Silver 1 Month", sellingPrice: 99 },
            { itemSlug: "silver-3m", itemName: "Silver 3 Months", sellingPrice: 249 },
            { itemSlug: "silver-6m", itemName: "Silver 6 Months", sellingPrice: 449 },
            { itemSlug: "silver-12m", itemName: "Silver 12 Months", sellingPrice: 799 },
        ],
    },
    "reseller-membership": {
        itemId: [
            { itemSlug: "reseller-1m", itemName: "Reseller 1 Month", sellingPrice: 69 },
            { itemSlug: "reseller-3m", itemName: "Reseller 3 Months", sellingPrice: 179 },
            { itemSlug: "reseller-6m", itemName: "Reseller 6 Months", sellingPrice: 299 },
            { itemSlug: "reseller-12m", itemName: "Reseller 12 Months", sellingPrice: 549 },
        ],
    },
};

export const OTTS = {
    "youtube-premium": {
        itemId: [{ itemSlug: "yt-1m", itemName: "YouTube Premium 1m", sellingPrice: 25 }],
    },
    netflix: {
        itemId: [{ itemSlug: "nf-1m", itemName: "Netflix 1m", sellingPrice: 110 }],
    },
    spotify: {
        itemId: [{ itemSlug: "spot-1m", itemName: "Spotify 1m", sellingPrice: 30 }],
    },
};

export const STARLIGHT_CONFIG = {
    itemId: [
        { itemSlug: "starlight-normal", itemName: "Normal Starlight", sellingPrice: 230 },
        { itemSlug: "starlight-premium", itemName: "Premium Starlight", sellingPrice: 500 },
    ],
};

export const BGMI_CONFIG = {
    itemId: [
        { itemSlug: "bgmi-60", itemName: "60 UC", sellingPrice: 73 },
        { itemSlug: "bgmi-325", itemName: "325 UC", sellingPrice: 365 },
        { itemSlug: "bgmi-660", itemName: "660 UC", sellingPrice: 720 },
        { itemSlug: "bgmi-1800", itemName: "1800 UC", sellingPrice: 1800 },
        { itemSlug: "bgmi-3850", itemName: "3850 UC", sellingPrice: 2650 },
        { itemSlug: "bgmi-8100", itemName: "8100 UC", sellingPrice: 7200 },
    ],
};

const resolvePricingRole = (role) => {
    if (["user", "member", "admin"].includes(role)) return role;
    return null; // owner → base price
};

export async function calculateItemPrice(gameSlug, itemSlug, userType) {
    let baseItem = null;
    let itemName = "";

    // 1. Check local static configs
    if (OTTS[gameSlug]) {
        baseItem = OTTS[gameSlug].itemId.find((i) => i.itemSlug === itemSlug);
    } else if (gameSlug === "starlight-card-manual") {
        baseItem = STARLIGHT_CONFIG.itemId.find((i) => i.itemSlug === itemSlug);
    } else if (gameSlug === "bgmi-manual") {
        baseItem = BGMI_CONFIG.itemId.find((i) => i.itemSlug === itemSlug);
    } else if (MEMBERSHIPS[gameSlug]) {
        baseItem = MEMBERSHIPS[gameSlug].itemId.find((i) => i.itemSlug === itemSlug);
    }

    // 2. If not found locally, fetch from external API
    if (!baseItem) {
        try {
            const response = await fetch(
                `https://game-off-ten.vercel.app/api/v1/game/${gameSlug}`,
                {
                    headers: { "x-api-key": process.env.API_SECRET_KEY },
                }
            );
            const data = await response.json();
            if (data?.success && data.data?.itemId) {
                baseItem = data.data.itemId.find((i) => i.itemSlug === itemSlug);
            }
        } catch (error) {
            console.error("External API Price Fetch Error:", error);
        }
    }

    if (!baseItem) return null;

    itemName = baseItem.itemName || itemSlug;
    const basePrice = Number(baseItem.sellingPrice);

    // 3. Apply Markup/Overrides based on User Type
    const pricingRole = resolvePricingRole(userType);
    if (!pricingRole) return { price: Math.ceil(basePrice), itemName }; // Owner or base

    const pricingConfig = await PricingConfig.findOne({ userType: pricingRole }).lean();

    let finalPrice = basePrice;
    const override = pricingConfig?.overrides?.find(
        (o) => o.gameSlug === gameSlug && o.itemSlug === itemSlug
    );

    const gameConfig = pricingConfig?.gameConfigs?.find(gc => gc.gameSlug === gameSlug);
    const isOutOfStock = gameConfig?.isOutOfStock || override?.isOutOfStock;

    if (override && override.isEnabled !== false && override.fixedPrice != null) {
        finalPrice = override.fixedPrice;
    } else {
        const slab = pricingConfig?.slabs?.find(
            (s) => basePrice >= s.min && basePrice < s.max
        );
        if (slab) {
            finalPrice = basePrice * (1 + slab.percent / 100);
        }
    }

    return { 
        price: Math.ceil(finalPrice), 
        itemName,
        isOutOfStock: !!isOutOfStock 
    };
}

export function applyPricingToItems(items, gameSlug, pricingConfig) {
    return items.map((item) => {
        const basePrice = Number(item.sellingPrice);
        let finalPrice = basePrice;

        const override = pricingConfig?.overrides?.find(
            (o) => o.gameSlug === gameSlug && o.itemSlug === item.itemSlug
        );

        if (override && override.isEnabled !== false && override.fixedPrice != null) {
            finalPrice = override.fixedPrice;
        } else {
            const slab = pricingConfig?.slabs?.find(
                (s) => basePrice >= s.min && basePrice < s.max
            );
            if (slab) {
                finalPrice = basePrice * (1 + slab.percent / 100);
            }
        }

        const gameConfig = pricingConfig?.gameConfigs?.find(gc => gc.gameSlug === gameSlug);
        const isOutOfStock = gameConfig?.isOutOfStock || override?.isOutOfStock;

        return {
            ...item,
            sellingPrice: Math.ceil(finalPrice),
            isOutOfStock: !!isOutOfStock
        };
    });
}
