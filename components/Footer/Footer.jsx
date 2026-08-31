"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiChevronUp,
  FiShield,
  FiExternalLink
} from "react-icons/fi";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "mlbbtopup.in";
const SITE_DOMAIN = "mlbbtopup.in";
const PARENT_DOMAIN = "bluebuff.in";
const PARENT_URL = "https://bluebuff.in";
const TRUSTPILOT_URL = "https://www.trustpilot.com/evaluate/mlbbtopup.in";
const INSTAGRAM_URL = "https://instagram.com/mlbbtopup.in";
const TWITTER_URL = "https://x.com/tk_dev_";
const LINKEDIN_URL = "https://www.linkedin.com/company/bluebuffesports";

const FOOTER_LINKS = [
  {
    title: "Pages",
    links: [
      { label: "Home", href: "/" },
      { label: "Store", href: "/games" },
      { label: "Services", href: "/services" },
      { label: "Region", href: "/region" },
      { label: "Blog", href: "/blog" },
      { label: "Partner With Us", href: "/partner" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms-and-conditions" },
      { label: "Support", href: "/contact" },
      { label: "Refunds", href: "/refund-policy" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: INSTAGRAM_URL, icon: FiInstagram },
  { label: "Twitter", href: TWITTER_URL, icon: FiTwitter },
  { label: "LinkedIn", href: LINKEDIN_URL, icon: FiLinkedin },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative mt-4 bg-[var(--background)] border-t border-[var(--border)] pt-5 pb-3 overflow-hidden">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">

          {/* BRAND BLOCK - COMPACT */}
          <div className="md:col-span-4 space-y-2.5">
            <div>
              <Link href="/" className="group inline-block">
                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter lowercase leading-none bg-gradient-to-r from-[var(--accent)] via-[var(--foreground)] to-[var(--accent)] bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                  {SITE_DOMAIN}
                </h2>
              </Link>
              <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest w-fit">
                <span>A Product From</span>
                <a href={PARENT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent-hover)] font-black">
                  {PARENT_DOMAIN}
                </a>
              </div>
              <p className="mt-2 text-[9.5px] font-semibold opacity-70 leading-relaxed max-w-[280px]">
                India's #1 trusted platform for Mobile Legends top-ups. Instant delivery, secure payments & 24/7 support.
              </p>
            </div>

            {/* Trustpilot Card - Compact */}
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-all group"
            >
              <div className="bg-white p-0.5 rounded-md shrink-0">
                <QRCodeCanvas
                  value={TRUSTPILOT_URL}
                  size={26}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                />
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-[var(--accent)] mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FiShield key={i} size={7.5} fill="currentColor" />
                  ))}
                </div>
                <p className="text-[7.5px] font-black uppercase tracking-wider text-[var(--muted)]">
                  VERIFIED BY TRUSTPILOT <FiExternalLink className="inline mb-0.5 opacity-40" size={7.5} />
                </p>
              </div>
            </a>
          </div>

          {/* LINKS GRID - COMPACT */}
          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-[1.5px] bg-[var(--accent)] rounded-full" />
                  <h3 className="text-[8.5px] font-black uppercase tracking-[0.25em] text-[var(--accent)] italic">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-0.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="py-1 text-[9.5px] sm:text-[10px] font-bold uppercase italic tracking-wider text-[var(--muted)] hover:text-[var(--accent)] transition-all leading-none block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CONNECT & ACTION BLOCK - COMPACT & SHADOW-FREE */}
          <div className="md:col-span-3 flex flex-row md:flex-col justify-between items-end md:justify-start md:items-end gap-3 md:gap-4">
            <div className="space-y-2 md:text-right">
              <h3 className="text-[8.5px] font-black uppercase tracking-[0.25em] text-[var(--accent)] italic">
                Connect
              </h3>
              <div className="flex items-center justify-start md:justify-end gap-1.5">
                {SOCIALS.map(({ label, href, icon: Icon }) => (
                  <motion.a
                    key={label}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-7.5 h-7.5 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-colors"
                  >
                    <Icon size={13} />
                  </motion.a>
                ))}
              </div>
            </div>

            <button aria-label="button"
              onClick={scrollToTop}
              className="mt-auto group flex items-center gap-2 text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)] transition-all italic cursor-pointer"
            >
              Back to Top
              <div className="w-7 h-7 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                <FiChevronUp size={14} />
              </div>
            </button>
          </div>
        </div>

        {/* BOTTOM STRIP - COMPACT */}
        <div className="pt-3 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-2 opacity-70">
          <div className="flex items-center gap-2 group/india cursor-default">
            <div className="flex gap-0.5">
              <div className="w-1 h-2.5 bg-[#FF9933] rounded-full" />
              <div className="w-1 h-2.5 bg-white rounded-full" />
              <div className="w-1 h-2.5 bg-[#138808] rounded-full" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.15em] italic text-[var(--foreground)]">
              MADE IN <span className="text-[#92400e] dark:text-[#fdba74]">IND</span><span className="text-[var(--foreground)]">I</span><span className="text-[#166534] dark:text-[#86efac]">A</span> 🇮🇳
            </span>
          </div>

          <div className="text-center md:text-right opacity-75">
            <span className="text-[7.5px] font-black uppercase tracking-[0.15em] italic">
              © {new Date().getFullYear()} {PARENT_DOMAIN.toUpperCase()} • ALL RIGHTS RESERVED
            </span>
          </div>
        </div>

        {/* 3RD PARTY SERVICE LEGAL DISCLAIMER */}
        <div className="mt-2 pt-2 border-t border-[var(--border)]/20 text-center opacity-50">
          <p className="text-[7.5px] font-medium text-[var(--muted)] leading-relaxed max-w-4xl mx-auto">
            {SITE_DOMAIN} is an independent 3rd-party service operated by {PARENT_DOMAIN}. Mobile Legends: Bang Bang and Moonton are registered trademarks of Shanghai Moonton Technology Co., Ltd. We are not officially affiliated with or endorsed by Moonton Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
