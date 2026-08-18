import type { Metadata } from "next";
import Script from "next/script";
import nextDynamic from "next/dynamic";

import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Poppins } from "next/font/google";

import MaintenanceWrapper from "@/components/Layout/MaintenanceWrapper";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { getAppSettings } from "@/lib/settings";

const SeasonalEffectManager = nextDynamic(() => import("@/components/Seasonal/SeasonalEffectManager"));
const PWAInstallBanner = nextDynamic(() => import("@/components/Layout/PWAInstallBanner"));
const BottomNav = nextDynamic(() => import("@/components/Layout/BottomNav"));





export const metadata: Metadata = {
  title: {
    default: "MLBB Top Up India â€“ Buy Cheapest Diamonds Instantly | mlbbtopup.in",
    template: "%s | MLBB Top Up India â€“ Buy Cheapest Diamonds Instantly",
  },
  description:
    "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery. Trusted by thousands.",


  metadataBase: new URL("https://mlbbtopup.in"),
  openGraph: {
    title: "MLBB Top Up India â€“ Buy Cheapest Diamonds Instantly | mlbbtopup.in",
    description:
      "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery. Trusted by thousands.",
    url: "https://mlbbtopup.in",
    siteName: "mlbbtopup.in",
    images: [
      {
        url: "/logoBB.png",
        width: 800,
        height: 600,
        alt: "mlbbtopup.in - MLBB Topup India",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MLBB Top Up India - Cheap & Fast Diamonds",
    description: "Safe & instant MLBB diamond top up in India. Cheapest rates for Weekly Pass, Starlight & skins. Secure UPI/Paytm payments with 5-minute delivery. Trusted by thousands.",
    images: ["/logoBB.png"],
    creator: "@mlbbtopupin",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAppSettings();

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        {/* Capture beforeinstallprompt BEFORE React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.__pwaPrompt = null;
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaPrompt = e;
          });
        `}} />
      </head>
      <body className="bg-black text-white">
        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Blue Buff",
              "url": "https://mlbbtopup.in",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://mlbbtopup.in/games?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Script
          id="organization-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Blue Buff",
              "url": "https://mlbbtopup.in",
              "logo": "https://mlbbtopup.in/logoBB.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": `+91-${process.env.NEXT_PUBLIC_SUPPORT_PHONE}`,
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": "en"
              },
              "sameAs": [
                "https://instagram.com/mlbbtopup.in",
                "https://x.com/tk_dev_"
              ]
            })
          }}
        />
        <GoogleAnalytics gaId="G-CKCKWLGJ9N" />

          <Header />

          <SeasonalEffectManager />

          <MaintenanceWrapper maintenanceMode={settings.maintenanceMode} />
          <main className="pt-14 pb-24 md:pb-0">{children}</main>




          <Footer />
          {settings.showBottomNav !== false && <BottomNav />}
          <PWAInstallBanner />
          <div />




      </body>
    </html>
  );
}


