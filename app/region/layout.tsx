import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Game Top-Up Region - India, Global & Regional Servers | mlbbtopup.in",
  description: "Select your server region for instant game top-ups. We support Indian Server, Global Server, SEA, Europe, and America with localized pricing on mlbbtopup.in.",
  keywords: [
    "mlbb server region selector",
    "global game top up india",
    "mlbb zone id region",
    "game recharge regions",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/region",
  },
  openGraph: {
    title: "Select Game Top-Up Region | mlbbtopup.in",
    description: "Select your game server region for instant localized recharge.",
    url: "https://mlbbtopup.in/region",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Select Game Top-Up Region | mlbbtopup.in",
    description: "Select your game server region for instant localized recharge.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function RegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
