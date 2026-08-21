import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free MLBB Diamond & Weekly Pass Giveaways | mlbbtopup.in",
  description: "Enter daily and weekly MLBB giveaways. Win free Mobile Legends diamonds, Weekly Diamond Passes, and redeem codes on mlbbtopup.in.",
  keywords: [
    "free mlbb diamonds giveaway",
    "mlbb weekly pass giveaway",
    "mobile legends redeem codes india",
    "win mlbb diamonds free",
    "mlbb diamond spin giveaway",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/giveaways",
  },
  openGraph: {
    title: "Free MLBB Diamond & Weekly Pass Giveaways | mlbbtopup.in",
    description: "Enter daily MLBB giveaways and win free diamonds and passes.",
    url: "https://mlbbtopup.in/giveaways",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free MLBB Diamond & Weekly Pass Giveaways",
    description: "Enter daily MLBB giveaways and win free diamonds and passes.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function GiveawaysLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
