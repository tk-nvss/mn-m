import GameCatalogSection from "@/components/Games/GameCatalogSection";

export const metadata = {
  title: "Games Catalog | MLBB Top Up India - mlbbtopup.in",
  description: "Browse all games and instant top-up packages. Cheapest MLBB diamonds, passes, vouchers and in-game items in India.",
  alternates: {
    canonical: "https://mlbbtopup.in/games",
  },
};

export default function GamesPage() {
  return <GameCatalogSection />;
}
