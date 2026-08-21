import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Game Account & Player ID Checker - Moonton & Game Verification | mlbbtopup.in",
  description: "Verify your Mobile Legends (MLBB) and game Player ID and Server ID online before topping up. Instant account validation utility on mlbbtopup.in.",
  keywords: [
    "mlbb id check online",
    "mobile legends player id finder",
    "mlbb zone id check",
    "game account verification",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/check",
  },
  openGraph: {
    title: "Game Account & Player ID Checker | mlbbtopup.in",
    description: "Verify your game Player ID and Server ID before topping up.",
    url: "https://mlbbtopup.in/check",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
};

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
