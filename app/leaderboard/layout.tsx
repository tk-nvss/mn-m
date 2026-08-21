import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Gamers & Spenders Leaderboard | mlbbtopup.in",
  description: "View top spenders, tournament champions, and VIP leaderboard rankings on mlbbtopup.in. Compete for monthly reward prizes and badges.",
  keywords: [
    "mlbb top up leaderboard",
    "gaming spending leaderboard india",
    "bluebuff vip leaderboard",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/leaderboard",
  },
  openGraph: {
    title: "Top Gamers Leaderboard | mlbbtopup.in",
    description: "Check the top gamer rankings and rewards on mlbbtopup.in.",
    url: "https://mlbbtopup.in/leaderboard",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Top Gamers Leaderboard | mlbbtopup.in",
    description: "Check top gamer rankings and rewards on mlbbtopup.in.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
