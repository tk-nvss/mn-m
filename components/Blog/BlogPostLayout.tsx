"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Icons } from "@/components/icons";
import { CopyButton, SectionTitle } from "@/components/common";
import { ReactNode, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { BLOGS_DATA } from "@/lib/blogData";
import Script from "next/script";
import NativeBanner from "@/components/Ads/NativeBanner";
import { FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const SITE_URL = "https://mlbbtopup.in";

interface FaqItem {
  question: string;
  answer: string;
}

interface BlogPostLayoutProps {
  title: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  imageAlt?: string;
  author?: string;
  game?: string;
  description?: string;
  children: ReactNode;
  backHref?: string;
  faqItems?: FaqItem[];
  dateModified?: string;
}

export default function BlogPostLayout({
  title,
  category,
  readTime,
  date,
  image,
  imageAlt,
  author = "BlueBuff Team",
  game,
  description,
  children,
  backHref = "/blog",
  faqItems,
  dateModified,
}: BlogPostLayoutProps) {
  const pathname = usePathname();

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const relatedArticles = useMemo(() => {
    const parts = pathname.split("/");
    const currentSlug = parts[parts.length - 1];
    
    // Find current article to get its tags
    const currentArticle = BLOGS_DATA.find(b => b.slug === currentSlug || b.slug.endsWith(`/${currentSlug}`));
    const currentTags = currentArticle?.tags || [];
    const currentGame = currentArticle?.game || game;

    const filtered = BLOGS_DATA.filter((b) => b.id !== currentArticle?.id && b.slug !== currentSlug);
    
    // Score each article based on relevance
    const scored = filtered.map(article => {
      let score = 0;
      if (article.game === currentGame) score += 5;
      if (article.tags) {
        const commonTags = article.tags.filter(t => currentTags.includes(t));
        score += commonTags.length * 2;
      }
      // Add random factor for variety
      score += Math.random();
      return { article, score };
    });

    // Sort by score descending and take top 3
    return scored.sort((a, b) => b.score - a.score).slice(0, 3).map(s => s.article);
  }, [pathname, game]);

  const canonicalUrl = `${SITE_URL}${pathname}`;
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  // Parse date string like "March 31, 2026" → ISO format
  const parseDate = (d: string) => {
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return d;
    }
  };

  const isoPubDate = parseDate(date);
  const isoModDate = dateModified ? parseDate(dateModified) : isoPubDate;

  // Article JSON-LD (SSR-safe — uses SITE_URL constant)
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    image: absoluteImage,
    datePublished: isoPubDate,
    dateModified: isoModDate,
    author: {
      "@type": "Person",
      name: author,
      url: SITE_URL,
    },
    description: description || title,
    publisher: {
      "@type": "Organization",
      name: "MLBB Topup",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    url: canonicalUrl,
    inLanguage: "en-IN",
  };

  // FAQ JSON-LD (only if faqItems provided)
  const faqJsonLd = faqItems && faqItems.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      ...(game
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: game.toUpperCase(),
              item: `${SITE_URL}/blog/${game.toLowerCase()}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: title,
              item: canonicalUrl,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: title,
              item: canonicalUrl,
            },
          ]),
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/30 pb-32 transition-colors duration-300">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--accent)] origin-left z-[100] shadow-[0_0_10px_rgba(var(--accent),0.5)]"
        style={{ scaleX }}
      />

      {/* SEO Structured Data */}
      <Script
        id="blog-article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="blog-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <Script
          id="blog-faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Background Lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[10%] w-[50%] h-[30%] bg-[var(--accent)]/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <article
        className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 md:pt-12 relative z-10"
        itemScope
        itemType="https://schema.org/Article"
      >
        {/* Hidden microdata for crawlers */}
        <meta itemProp="headline" content={title} />
        <meta itemProp="description" content={description || title} />
        <meta itemProp="image" content={absoluteImage} />
        <meta itemProp="datePublished" content={isoPubDate} />
        <meta itemProp="dateModified" content={isoModDate} />
        <meta itemProp="author" content={author} />
        <meta itemProp="url" content={canonicalUrl} />

        {/* BREADCRUMB SYSTEM */}
        <nav aria-label="Breadcrumb">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/50"
          >
            <Link
              href="/blog"
              className="inline-flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] transition-all mr-1 group"
              aria-label="Back to Blog"
            >
              <Icons.arrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link href="/blog" className="hover:text-[var(--accent)] transition-colors">
              Insights
            </Link>
            {game && (
              <>
                <span className="opacity-20 text-xs">/</span>
                <Link
                  href={`/blog/${game.toLowerCase()}`}
                  className="text-[var(--accent)] hover:scale-105 transition-all"
                >
                  {game}
                </Link>
              </>
            )}
            <span className="opacity-20 text-xs">/</span>
            <span className="text-[var(--muted)] line-clamp-1 italic truncate max-w-[200px]">
              {title}
            </span>
          </motion.div>
        </nav>

        <header className="mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-2 md:space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[7px] md:text-[9px] font-black uppercase tracking-wider md:tracking-[0.1em]">
              <span className="text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-md italic font-black">
                # {category}
              </span>
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <Icons.user size={10} className="text-[var(--accent)]" /> {author}
              </span>
              <span className="flex items-center gap-1 text-[var(--muted)]">
                <Icons.clock size={10} className="text-[var(--accent)]" /> {readTime}
              </span>
              <time
                dateTime={isoPubDate}
                className="flex items-center gap-1 text-[var(--muted)]"
              >
                <Icons.calendar size={10} className="text-[var(--accent)]" /> {date}
              </time>
            </div>

            <h1 className="text-2xl md:text-4xl font-[1000] italic tracking-tighter uppercase leading-[1.05] text-[var(--foreground)]">
              {title}
            </h1>

          </motion.div>

          {image && (
            <div
              className="relative mt-6 overflow-hidden border border-[var(--border)] aspect-[16/9]"
            >
              <Image
                src={image}
                alt={imageAlt || `Cover graphic for ${title}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 1280px"
              />
            </div>
          )}
        </header>

        {/* Top Ad Banner */}
        <div className="w-full max-w-7xl mx-auto mb-8">
          <NativeBanner />
        </div>

        {/* CONTENT SECTION */}
        <section className="w-full max-w-7xl mx-auto" itemProp="articleBody">
          <div className="prose dark:prose-invert max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-[var(--foreground)]/90 prose-p:font-medium prose-headings:text-[var(--foreground)] prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-[var(--border)] prose-h2:flex prose-h2:items-center prose-h2:gap-4 prose-strong:text-[var(--accent)] prose-strong:font-black prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-ul:list-none prose-ul:pl-0 prose-li:relative prose-li:pl-8 prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.7em] prose-li:before:w-3 prose-li:before:h-[2px] prose-li:before:bg-[var(--accent)] prose-blockquote:border-l-4 prose-blockquote:border-[var(--accent)] prose-blockquote:bg-[var(--accent)]/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic-none prose-table:border prose-table:border-[var(--border)] prose-th:bg-[var(--accent)]/10 prose-th:p-4 prose-td:p-4 prose-img:rounded-[2rem] space-y-8">
            {children}
          </div>
        </section>

        {/* RELATED ARTICLES */}
        <section className="mt-8 w-full max-w-7xl mx-auto" aria-label="Related Articles">
          <div className="mb-6">
            <SectionTitle
              size="lg"
              subtitle="Read More"
              title="More"
              highlight="Guides"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {relatedArticles.map((blog: any) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.game}/${blog.slug}`}
                className="group relative flex flex-row h-[100px] sm:h-[120px] bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)]/50 transition-all duration-300 shadow hover:-translate-y-0.5"
                aria-label={`Read: ${blog.title}`}
              >
                <div className="w-[120px] sm:w-[160px] h-full relative overflow-hidden flex-shrink-0">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={400}
                    height={225}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[6px] font-black uppercase tracking-wider text-[var(--accent)] border border-[var(--accent)]/10">
                      {blog.type}
                    </span>
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1 min-w-0">
                  <h3 className="text-[11px] sm:text-xs font-black uppercase italic tracking-tight leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 mb-2">
                    {blog.title}
                  </h3>

                  <div className="mt-auto pt-2 border-t border-[var(--border)]/20 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[var(--muted)] opacity-50">
                      <Icons.clock size={8} />
                      <span className="text-[7px] font-bold uppercase tracking-tight">
                        {blog.readingTime}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-md bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                      <Icons.arrowRight size={10} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* SHARE SECTION */}
        <footer className="max-w-md mx-auto mt-8 p-3.5 sm:p-4 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-[var(--foreground)]">Share with your squad</h3>
            <p className="text-[10px] text-[var(--muted)]">Send this guide to teammates</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + canonicalUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on WhatsApp"
              className="w-9 h-9 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Share on WhatsApp"
            >
              <FaWhatsapp size={16} />
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share on X"
              className="w-9 h-9 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Share on X (Twitter)"
            >
              <FaXTwitter size={15} />
            </a>

            <CopyButton
              text={canonicalUrl}
              label="Copy"
              variant="subtle"
              size="sm"
              className="h-9 px-3 rounded-xl bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider"
              title="Copy Link"
            />
          </div>
        </footer>
      </article>
    </div>
  );
}
