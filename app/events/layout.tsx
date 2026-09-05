import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gaming Event Calendar & Scrims Schedule | mlbbtopup.in",
  description: "Stay updated with upcoming Mobile Legends, Free Fire, and esports tournaments, in-game events, patch resets, and community scrims.",
  alternates: {
    canonical: "https://mlbbtopup.in/events",
  },
  openGraph: {
    title: "Gaming Event Calendar & Scrims Schedule | mlbbtopup.in",
    description: "Explore upcoming gaming tournaments, in-game events, and schedule.",
    url: "https://mlbbtopup.in/events",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
