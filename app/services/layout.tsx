import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gaming Services & OTT Subscriptions India | mlbbtopup.in",
  description: "Explore premium gaming and digital services at mlbbtopup.in: MLBB Rank Boosting, YouTube Premium, Netflix, Spotify, and UniPin game vouchers.",
  keywords: [
    "mlbb rank boost india",
    "cheap ott subscriptions",
    "game recharge services",
    "unipin voucher india",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/services",
  },
  openGraph: {
    title: "Gaming Services & Subscriptions | mlbbtopup.in",
    description: "Explore rank boosting, OTT subscriptions, and digital game vouchers.",
    url: "https://mlbbtopup.in/services",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaming Services & Subscriptions | mlbbtopup.in",
    description: "Explore rank boosting, OTT subscriptions, and digital game vouchers.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
