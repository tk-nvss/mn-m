import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner With Us - Gaming Influencer & Creator Program | mlbbtopup.in",
  description: "Join the mlbbtopup.in creator and influencer partnership program. Earn high commissions, sponsor giveaways for your viewers, and grow with India's top MLBB store.",
  keywords: [
    "mlbb creator program",
    "gaming sponsorship india",
    "partner with mlbbtopup",
    "gaming influencer affiliate india",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/partner",
  },
  openGraph: {
    title: "Partner With Us - Creator & Influencer Program | mlbbtopup.in",
    description: "Join India's leading gaming top-up creator program and monetize your audience.",
    url: "https://mlbbtopup.in/partner",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Partner With Us - Creator & Influencer Program",
    description: "Join India's leading gaming top-up creator program.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
