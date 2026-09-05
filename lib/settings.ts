import { unstable_cache } from "next/cache";
import { connectDB } from "./mongodb";
import AppSettings from "@/models/AppSettings";

export const getAppSettings = unstable_cache(
    async () => {
        try {
            await connectDB();
            const settings = await AppSettings.findOne({}).lean();
            if (!settings) {
                return { 
                    maintenanceMode: false, 
                    topupProvider: "1game",
                    showTopNoticeBanner: false,
                    showHomeEarnPromotion: false,
                    showTradeMarketplaceBanner: false,
                    showCustomWebBanner: false,
                    showGamesWebBanner: false,
                    showGiveawayBanner: true,
                    showTelegramPopup: false,
                    showWhatsappPopup: false,
                    showGamesPopup: false,
                    showJoinUsPopup: false,
                    showGameBannerCarousel: true,
                    showStorySlider: true,
                    showBattleRoyaleSection: true,
                    showFlashSale: true,
                    showHomeQuickActions: true,
                    showEventsSection: true,
                    showBottomNav: true,
                };
            }
            return {
                maintenanceMode: !!settings.maintenanceMode,
                topupProvider: settings.topupProvider || "1game",
                showTopNoticeBanner: !!settings.showTopNoticeBanner,
                showHomeEarnPromotion: !!settings.showHomeEarnPromotion,
                showTradeMarketplaceBanner: !!settings.showTradeMarketplaceBanner,
                showCustomWebBanner: !!settings.showCustomWebBanner,
                showGamesWebBanner: !!settings.showGamesWebBanner,
                showGiveawayBanner: settings.showGiveawayBanner !== false, // default true
                showTelegramPopup: !!settings.showTelegramPopup,
                showWhatsappPopup: !!settings.showWhatsappPopup,
                showGamesPopup: !!settings.showGamesPopup,
                showJoinUsPopup: !!settings.showJoinUsPopup,
                showGameBannerCarousel: settings.showGameBannerCarousel !== false,
                showStorySlider: settings.showStorySlider !== false,
                showBattleRoyaleSection: settings.showBattleRoyaleSection !== false,
                showFlashSale: settings.showFlashSale !== false,
                showHomeQuickActions: settings.showHomeQuickActions !== false,
                showEventsSection: settings.showEventsSection !== false,
                showBottomNav: settings.showBottomNav !== false,
            };
        } catch (error) {
            console.error("Error fetching app settings:", error);
            return { 
                maintenanceMode: false, 
                topupProvider: "1game",
                showTopNoticeBanner: false,
                showHomeEarnPromotion: false,
                showTradeMarketplaceBanner: false,
                showCustomWebBanner: false,
                showGamesWebBanner: false,
                showGiveawayBanner: true,
                showTelegramPopup: false,
                showWhatsappPopup: false,
                showGamesPopup: false,
                showJoinUsPopup: false,
                showGameBannerCarousel: true,
                showStorySlider: true,
                showBattleRoyaleSection: true,
                showFlashSale: true,
                showHomeQuickActions: true,
                showEventsSection: true,
                showBottomNav: true,
            };
        }
    },
    ["app-settings"],
    {
        tags: ["app-settings"]
    }
);
