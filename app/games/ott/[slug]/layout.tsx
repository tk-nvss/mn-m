import type { Metadata } from "next";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const OTT_META_MAP: Record<string, { name: string; brand: string; desc: string; lowPrice: string; highPrice: string; keywords: string[] }> = {
  "youtube-premium": {
    name: "YouTube Premium Subscription",
    brand: "Google",
    desc: "Buy YouTube Premium subscription in India at discounted rates. Enjoy ad-free videos, background play, and YouTube Music with instant activation via UPI on mlbbtopup.in.",
    lowPrice: "25",
    highPrice: "199",
    keywords: ["buy youtube premium cheap india", "youtube premium subscription upi", "cheap youtube music premium", "youtube premium discount"],
  },
  "netflix": {
    name: "Netflix Subscription",
    brand: "Netflix",
    desc: "Buy Netflix subscription in India at affordable prices. Enjoy unlimited movies, TV shows, and anime on mobile, TV, and PC with fast delivery on mlbbtopup.in.",
    lowPrice: "110",
    highPrice: "299",
    keywords: ["buy netflix cheap india", "netflix subscription upi", "netflix mobile plan cheap", "netflix discount india"],
  },
  "spotify": {
    name: "Spotify Premium Subscription",
    brand: "Spotify",
    desc: "Buy Spotify Premium in India at the lowest price. Ad-free music, offline downloads, and unlimited skips with instant UPI payment on mlbbtopup.in.",
    lowPrice: "30",
    highPrice: "179",
    keywords: ["buy spotify premium cheap india", "spotify premium upi", "spotify subscription discount", "spotify premium low price"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = OTT_META_MAP[slug] || {
    name: "OTT Subscription Recharge",
    brand: "Streaming",
    desc: "Buy affordable OTT and streaming service subscriptions in India with instant delivery via UPI on mlbbtopup.in.",
    lowPrice: "25",
    highPrice: "299",
    keywords: ["ott subscription buy india", "cheap streaming subscription upi", "ott recharge low price"],
  };

  const canonicalUrl = `https://mlbbtopup.in/games/ott/${slug}`;
  const title = `Buy ${item.name} in India - Cheap & Instant Activation | mlbbtopup.in`;

  return {
    title,
    description: item.desc,
    keywords: item.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: item.desc,
      url: canonicalUrl,
      siteName: "mlbbtopup.in",
      type: "website",
      images: [
        {
          url: "https://mlbbtopup.in/logoBB.png",
          width: 800,
          height: 600,
          alt: `${item.name} - mlbbtopup.in`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: item.desc,
      images: ["https://mlbbtopup.in/logoBB.png"],
    },
  };
}

export default async function OttSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const item = OTT_META_MAP[slug] || {
    name: "OTT Subscription",
    brand: "Streaming",
    desc: "Buy OTT subscription in India at lowest prices.",
    lowPrice: "25",
    highPrice: "299",
  };
  const canonicalUrl = `https://mlbbtopup.in/games/ott/${slug}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.name,
    "image": "https://mlbbtopup.in/logoBB.png",
    "description": item.desc,
    "brand": {
      "@type": "Brand",
      "name": item.brand,
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": canonicalUrl,
      "priceCurrency": "INR",
      "lowPrice": item.lowPrice,
      "highPrice": item.highPrice,
      "offerCount": "1",
      "availability": "https://schema.org/InStock",
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
        "name": "OTT Subscriptions",
        "item": "https://mlbbtopup.in/services",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": item.name,
        "item": canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id={`ott-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id={`ott-breadcrumb-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
