"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  FiInstagram,
  FiTwitter,
  FiLinkedin,
  FiHeart,
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
    <footer className="relative mt-4 bg-[var(--background)] border-t border-[var(--border)] pt-8 pb-4 overflow-hidden">
      {/* Subtle Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
      <div className="absolute bottom-0 left-[10%] w-[30%] h-[100px] bg-[var(--accent)]/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">

          {/* BRAND BLOCK - REFINED SPACE */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <Link href="/" className="group inline-block">
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter lowercase leading-none bg-gradient-to-r from-[var(--accent)] via-[var(--foreground)] to-[var(--accent)] bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                  {SITE_DOMAIN}
                </h2>
              </Link>
              <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[8.5px] font-black uppercase tracking-widest w-fit">
                <span>A Product From</span>
                <a href={PARENT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent-hover)] font-black">
                  {PARENT_DOMAIN}
                </a>
              </div>
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] opacity-70 italic leading-relaxed max-w-[300px]">
                India's #1 trusted platform for Mobile Legends top-ups. Instant diamond delivery, secure payments, and 24/7 support.
              </p>
            </div>

            {/* Trustpillot Card - Compact High-End */}
            <motion.a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, x: 4 }}
              className="inline-flex w-full sm:w-max items-center gap-3 px-3 py-2 rounded-xl bg-[var(--card)]/30 backdrop-blur-sm border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all border-dashed group"
            >
              <div className="bg-white p-1 rounded-md shadow-sm group-hover:rotate-2 transition-transform">
                <QRCodeCanvas
                  value={TRUSTPILOT_URL}
                  size={32}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-0.5 text-[var(--accent)] mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <FiShield key={i} size={8} fill="currentColor" />
                  ))}
                </div>
                <p className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]">
                  VERIFIED BY TRUSTPILOT <FiExternalLink className="inline mb-0.5 opacity-30" size={8} />
                </p>
              </div>
            </motion.a>
          </div>

          {/* LINKS GRID - SYMMETRICAL */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            {FOOTER_LINKS.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-[1px] bg-[var(--accent)]/40 rounded-full" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)]/80 italic">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="py-2 text-[10px] sm:text-[11px] font-bold uppercase italic tracking-wider text-[var(--muted)] hover:text-[var(--accent)] transition-all leading-none block hover:translate-x-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CONNECT & ACTION BLOCK */}
          <div className="md:col-span-3 flex flex-row md:flex-col justify-between items-end md:justify-start md:items-end gap-4 md:gap-6">
            <div className="space-y-4 md:text-right">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)]/80 italic">
                Connect
              </h3>
              <div className="flex items-center justify-start md:justify-end gap-2.5">
                {SOCIALS.map(({ label, href, icon: Icon }) => (
                  <motion.a
                    key={label}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-[var(--card)]/40 backdrop-blur-sm border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all shadow-sm"
                  >
                    <Icon size={15} />
                  </motion.a>
                ))}
              </div>
            </div>

            <button aria-label="button"
              onClick={scrollToTop}
              className="mt-auto md:mt-auto group flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--accent)] transition-all italic"
            >
              Back to Top
              <div className="w-8 h-8 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] flex items-center justify-center shadow-md group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                <FiChevronUp size={16} />
              </div>
            </button>
          </div>
        </div>

        {/* BOTTOM STRIP - HIGH-END DENSITY */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-3 opacity-70">
          <div className="flex items-center gap-3 group/india cursor-default">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-[#FF9933] rounded-full shadow-[0_0_8px_#FF9933]" />
              <div className="w-1 h-3 bg-white rounded-full shadow-[0_0_8px_white]" />
              <div className="w-1 h-3 bg-[#138808] rounded-full shadow-[0_0_8px_#138808]" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] italic text-[var(--foreground)]">
              MADE IN <span className="text-[#92400e] dark:text-[#fdba74]">IND</span><span className="text-[var(--foreground)]">I</span><span className="text-[#166534] dark:text-[#86efac]">A</span> 🇮🇳
            </span>
          </div>

          <div className="text-center md:text-right opacity-75">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">
              © {new Date().getFullYear()} {PARENT_DOMAIN.toUpperCase()} • ALL RIGHTS RESERVED
            </span>
          </div>
        </div>

        {/* 3RD PARTY SERVICE LEGAL DISCLAIMER */}
        <div className="mt-3 pt-3 border-t border-[var(--border)]/30 text-center opacity-60">
          <p className="text-[8px] font-medium text-[var(--muted)] leading-relaxed max-w-4xl mx-auto">
            {SITE_DOMAIN} is an independent 3rd-party service operated by {PARENT_DOMAIN}. Mobile Legends: Bang Bang and Moonton are registered trademarks of Shanghai Moonton Technology Co., Ltd. All game names, logos, and trademarks belong to their respective owners. We are not officially affiliated with or endorsed by Moonton Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
