import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & 24/7 Customer Support | mlbbtopup.in",
  description: "Need help with your MLBB diamond top up or order? Contact mlbbtopup.in support via WhatsApp, Telegram, email, or live chat. 24/7 fast assistance guaranteed.",
  keywords: [
    "mlbbtopup support",
    "contact mlbbtopup.in",
    "mlbb top up customer care",
    "mlbb order help",
  ],
  alternates: {
    canonical: "https://mlbbtopup.in/contact",
  },
  openGraph: {
    title: "Contact Us & 24/7 Customer Support | mlbbtopup.in",
    description: "Get 24/7 assistance for your game recharge and top-up orders.",
    url: "https://mlbbtopup.in/contact",
    siteName: "mlbbtopup.in",
    type: "website",
    images: [{ url: "https://mlbbtopup.in/logoBB.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us & 24/7 Support | mlbbtopup.in",
    description: "Get 24/7 assistance for your game recharge and top-up orders.",
    images: ["https://mlbbtopup.in/logoBB.png"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
