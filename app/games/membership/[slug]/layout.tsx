import type { Metadata } from "next";
import Script from "next/script";

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

const MEMBERSHIP_META_MAP: Record<string, { name: string; desc: string; lowPrice: string; highPrice: string; keywords: string[] }> = {
  "silver-membership": {
    name: "Silver VIP Membership",
    desc: "Unlock discounted game top-up rates, priority 24/7 delivery, and special VIP rewards on mlbbtopup.in.",
    lowPrice: "49",
    highPrice: "399",
    keywords: ["silver membership mlbb", "vip top up membership india", "cheap mlbb membership", "game top up discount plan"],
  },
  "reseller-membership": {
    name: "Reseller & Merchant Membership",
    desc: "Get wholesale reseller prices, bulk top-up dashboard access, and exclusive margins on all game credits at mlbbtopup.in.",
    lowPrice: "39",
    highPrice: "299",
    keywords: ["mlbb reseller plan india", "diamond reseller panel", "cheap mlbb wholesale", "game top up reseller program"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = MEMBERSHIP_META_MAP[slug] || {
    name: "VIP Membership Plan",
    desc: "Unlock premium prices, priority queue, and exclusive benefits on mlbbtopup.in.",
    lowPrice: "39",
    highPrice: "399",
    keywords: ["game membership plan india", "vip top up discounts", "reseller game top up"],
  };

  const canonicalUrl = `https://mlbbtopup.in/games/membership/${slug}`;
  const title = `${item.name} - Exclusive Top-Up Discounts & Benefits | mlbbtopup.in`;

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

export default async function MembershipSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const item = MEMBERSHIP_META_MAP[slug] || {
    name: "VIP Membership Plan",
    desc: "Unlock premium prices and exclusive benefits on mlbbtopup.in.",
    lowPrice: "39",
    highPrice: "399",
  };
  const canonicalUrl = `https://mlbbtopup.in/games/membership/${slug}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": item.name,
    "image": "https://mlbbtopup.in/logoBB.png",
    "description": item.desc,
    "brand": {
      "@type": "Brand",
      "name": "Blue Buff",
    },
    "offers": {
      "@type": "AggregateOffer",
      "url": canonicalUrl,
      "priceCurrency": "INR",
      "lowPrice": item.lowPrice,
      "highPrice": item.highPrice,
      "offerCount": "4",
      "availability": "https://schema.org/InStock",
    },
  };

  return (
    <>
      <Script
        id={`membership-schema-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {children}
    </>
  );
}
