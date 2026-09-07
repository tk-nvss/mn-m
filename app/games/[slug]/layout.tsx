import type { Metadata } from "next";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

// Known game name maps for fast SEO resolution
const GAME_META_MAP: Record<string, { name: string; brand: string; desc: string; lowPrice: string; highPrice: string; keywords: string[] }> = {
  "mobile-legends114": {
    name: "Mobile Legends: Bang Bang Diamonds",
    brand: "Moonton",
    desc: "Buy Mobile Legends: Bang Bang (MLBB) diamonds in India at the cheapest price. Instant Weekly Diamond Pass, Starlight, and diamond packages delivered in 5 minutes via UPI.",
    lowPrice: "14",
    highPrice: "7500",
    keywords: ["mlbb diamonds india", "buy mlbb diamonds cheap", "mlbb weekly pass india", "mobile legends top up upi", "mlbb starlight card buy", "cheap mlbb topup"],
  },
  "starlight-card-manual": {
    name: "MLBB Starlight Card",
    brand: "Moonton",
    desc: "Buy MLBB Starlight Membership Card instantly in India. Fast processing via UPI, GPay, and PhonePe with 24/7 delivery.",
    lowPrice: "240",
    highPrice: "500",
    keywords: ["mlbb starlight card india", "buy starlight membership mlbb", "mobile legends starlight cheap", "starlight card buy upi"],
  },
  "coc-manual": {
    name: "Clash of Clans Gems & Passes",
    brand: "Supercell",
    desc: "Buy Clash of Clans Gold Pass and Event Passes in India. Instant and 100% safe Supercell game recharge via UPI with fast delivery.",
    lowPrice: "230",
    highPrice: "600",
    keywords: ["coc gold pass buy india", "clash of clans top up india", "coc event pass cheap", "clash of clans gems upi"],
  },
  "bgmi-manual": {
    name: "BGMI Unknown Cash (UC)",
    brand: "Krafton",
    desc: "Buy BGMI UC in India at the lowest price. Instant Unknown Cash recharge for Battlegrounds Mobile India via UPI/Paytm with safe delivery.",
    lowPrice: "73",
    highPrice: "7200",
    keywords: ["buy bgmi uc india", "cheap bgmi uc", "bgmi uc top up upi", "bgmi royal pass buy", "battlegrounds mobile india uc"],
  },
};

async function getGameData(slug: string) {
  if (GAME_META_MAP[slug]) {
    return GAME_META_MAP[slug];
  }

  // Normalize slug to title
  const formattedName = slug
    .replace(/-manual/gi, "")
    .replace(/\d+$/g, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    name: `${formattedName} Top Up`,
    brand: formattedName,
    desc: `Instant and cheap ${formattedName} game top up in India. Fast credit directly to your game ID via secure UPI payment on mlbbtopup.in.`,
    lowPrice: "49",
    highPrice: "4999",
    keywords: [
      `${formattedName.toLowerCase()} top up india`,
      `buy ${formattedName.toLowerCase()} cheap`,
      `${formattedName.toLowerCase()} recharge upi`,
      `cheap ${formattedName.toLowerCase()} diamonds gems`,
    ],
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameData(slug);
  const canonicalUrl = `https://mlbbtopup.in/games/${slug}`;

  const title = `Buy ${game.name} in India - Instant Top Up & Cheap Rates | mlbbtopup.in`;
  const description = game.desc;

  return {
    title,
    description,
    keywords: game.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "mlbbtopup.in",
      type: "website",
      images: [
        {
          url: "https://mlbbtopup.in/logoBB.png",
          width: 800,
          height: 600,
          alt: `${game.name} - mlbbtopup.in`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://mlbbtopup.in/logoBB.png"],
    },
  };
}

export default async function GameSlugLayout({
  children,
  params,
}: Props) {
  const { slug } = await params;
  const game = await getGameData(slug);
  const canonicalUrl = `https://mlbbtopup.in/games/${slug}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": game.name,
    "image": "https://mlbbtopup.in/logoBB.png",
    "description": game.desc,
    "brand": {
      "@type": "Brand",
      "name": game.brand,
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": canonicalUrl,
      "priceCurrency": "INR",
      "lowPrice": game.lowPrice,
      "highPrice": game.highPrice,
      "offerCount": "10",
      "availability": "https://schema.org/InStock",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "8400",
      "reviewCount": "5200",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://mlbbtopup.in",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Games",
        "item": "https://mlbbtopup.in/games",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": game.name,
        "item": canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id={`product-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id={`breadcrumb-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
