import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Game Store - Buy Game Diamonds, UC, Gems & Passes India | mlbbtopup.in",
  description: "Browse all game top-ups including Mobile Legends, BGMI, Clash of Clans, Genshin Impact, and OTT subscriptions. Instant 24/7 delivery via UPI at cheapest rates in India.",
  keywords: [
    "game top up store india",
    "mlbb diamond store",
    "buy game credits upi",
    "bgmi uc shop",
    "clash of clans pass store",
    "instant game recharge india",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/games",
  },
  openGraph: {
    title: "Game Store - Buy Game Diamonds, UC, Gems & Passes India | mlbbtopup.in",
    description: "Browse all game top-ups with instant UPI payments and 24/7 delivery.",
    url: "https://mlbbtopup.in/games",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [
      {
        url: "https://mlbbtopup.in/logoBB.png",
        width: 800,
        height: 600,
        alt: "Game Store - mlbbtopup.in",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Game Store - Buy Game Diamonds, UC & Passes | mlbbtopup.in",
    description: "Browse all game top-ups with instant UPI payments and 24/7 delivery.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

