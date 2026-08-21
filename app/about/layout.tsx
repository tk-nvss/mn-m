import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - India's Trusted Game Top-Up Platform | mlbbtopup.in",
  description: "Learn more about mlbbtopup.in (an official Blue Buff product). We provide fast, safe, and automated diamond recharges for Indian gamers with 24/7 dedicated support.",
  keywords: [
    "about mlbbtopup.in",
    "blue buff game recharge",
    "trusted mlbb store india",
    "who is mlbbtopup.in",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/about",
  },
  openGraph: {
    title: "About Us - India's Trusted Game Top-Up Platform | mlbbtopup.in",
    description: "Learn about mlbbtopup.in, India's most trusted gaming top-up store.",
    url: "https://mlbbtopup.in/about",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - India's Trusted Game Top-Up Platform",
    description: "Learn about mlbbtopup.in, India's most trusted gaming top-up store.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
