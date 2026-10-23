"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { SectionTitle } from "@/components/common";

import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";

const INSTAGRAM_URL = "https://www.instagram.com/mlbbtopup.in";
const TWITTER_URL = "https://x.com/tk_dev_";
const MAPS_EMBED_URL = "https://www.google.com/maps?q=Bengaluru,Karnataka,India&output=embed";

const SOCIAL_LINKS = [
  { icon: Icons.instagram, link: INSTAGRAM_URL, label: "Instagram" },
  { icon: Icons.twitter, link: TWITTER_URL, label: "Twitter" },
];

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@bluebuff.in";
  const whatsappNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello,%20I%20need%20help%20with%20my%20order`;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 pt-20 sm:pt-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">

        {/* HEADER */}
        <SectionTitle
          subtitle="24/7 ASSISTANCE"
          title="CONTACT SUPPORT"
          icon={<Icons.mail className="text-[var(--accent)]" size={13} />}
          description="Need help with a recharge or have a query? Reach out directly and our team will assist you."
        />

        {/* DIRECT ACTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] flex flex-col justify-between gap-3 group hover:border-emerald-500/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <FaWhatsapp size={20} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 block">Instant Chat</span>
                <h3 className="text-sm font-bold text-[var(--foreground)]">WhatsApp Support</h3>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-snug">
              Fastest response for payment status and order issues.
            </p>

            <Link
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 !text-white text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <FaWhatsapp size={14} className="text-white" />
              <span>Chat Now</span>
            </Link>
          </motion.div>

          {/* Email Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] flex flex-col justify-between gap-3 group hover:border-[var(--accent)]/40 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <Icons.mail size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--accent)] block">Email Support</span>
                <h3 className="text-sm font-bold text-[var(--foreground)] truncate">Direct Email</h3>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-snug break-all">
              {supportEmail}
            </p>

            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-xs font-black uppercase tracking-wider transition-all hover:opacity-90 active:scale-95"
            >
              <Icons.mail size={14} />
              <span>Send Email</span>
            </a>
          </motion.div>
        </div>

        {/* SOCIALS & LOCATION ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Socials */}
          <div className="p-4 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-3 flex flex-col justify-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">Social Channels</h4>
            <div className="flex flex-col gap-2">
              {SOCIAL_LINKS.map((s, idx) => (
                <a
                  key={idx}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--foreground)]/5 border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all"
                >
                  <s.icon size={13} />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Location Map */}
          <div className="sm:col-span-2 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)]/30 h-36 relative">
            <iframe
              title="Bangalore Location"
              src={MAPS_EMBED_URL}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(1) opacity(0.55)' }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center text-[10px] text-[var(--muted)]/60 font-semibold uppercase tracking-widest pt-2">
          Responses typically take under 10 minutes during operating hours
        </div>

      </div>
    </main>
  );
}
