import type { Metadata } from "next";
import AdsterraSocialBar from "@/components/Ads/AdsterraSocialBar";
import AdsterraPopunder from "@/components/Ads/AdsterraPopunder";
import FooterBanner from "@/components/Ads/FooterBanner";

export const metadata: Metadata = {
  title: {
    default: "MLBB Insights & Guides - Tips for Safe & Cheap Top Up | Blue Buff",
    template: "%s | MLBB Topup Blog",
  },
  description:
    "Stay updated with the latest Mobile Legends: Bang Bang guides, diamond price breakdowns, and safety tips for recharge in India. Your source for elite MLBB insights from MLBB Topup.",
  keywords: [
    "mlbb guides india",
    "mobile legends tips 2026",
    "mlbb diamond price india",
    "mlbb top up guide india",
    "MLBB Topup blog",
    "mobile legends rank up tips",
    "mlbb weekly pass india",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/blog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "mlbbtopup.in",
    locale: "en_IN",
    url: "https://mlbbtopup.in/blog",
    title: "MLBB Insights & Guides - MLBB Topup Blog",
    description:
      "Expert Mobile Legends guides, diamond price breakdowns, and India-specific top-up safety tips. Trusted by Indian MLBB players.",
    images: [
      {
        url: "https://mlbbtopup.in/og-blog.png",
        width: 1200,
        height: 630,
        alt: "MLBB Topup - MLBB Blog & Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mlbbtopupin",
    title: "MLBB Insights & Guides - MLBB Topup Blog",
    description:
      "Expert Mobile Legends guides, diamond price breakdowns, and India top-up safety tips.",
    images: ["https://mlbbtopup.in/og-blog.png"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Adsterra Social Bar */}
      <AdsterraSocialBar />

      {/* Adsterra Popunder */}
      {/* <AdsterraPopunder /> */}
      
      {children}
      
      {/* Blog specific Footer Banner */}
      <FooterBanner />
    </>
  );
}
