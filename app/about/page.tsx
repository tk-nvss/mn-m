"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { SectionTitle } from "@/components/common";

const BRAND = "mlbbtopup.in";

export default function AboutPage() {
  const highlights = [
    {
      title: "Direct API Delivery",
      desc: "Instant top-ups directly via official Moonton Player ID & Zone ID. Zero game passwords or login credentials ever required.",
      icon: <Icons.zap size={16} />
    },
    {
      title: "Fair & Affordable Rates",
      desc: "We offer some of the most competitive pricing in India—often 10–20% cheaper than in-game stores or Codashop.",
      icon: <Icons.trendingUp size={16} />
    },
    {
      title: "Safe Indian Payments",
      desc: "Full support for seamless UPI, Google Pay, PhonePe, Paytm, and net banking with instant transaction confirmation.",
      icon: <Icons.shield size={16} />
    },
    {
      title: "24/7 Dedicated Support",
      desc: "Dedicated WhatsApp and email support to resolve queries, transaction status checks, or delivery issues quickly.",
      icon: <Icons.check size={16} />
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 pt-20 sm:pt-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">

        {/* HEADER SECTION */}
        <SectionTitle
          subtitle="OUR STORY"
          title={`ABOUT ${BRAND}`}
          highlight={BRAND}
          icon={<Icons.info className="text-[var(--accent)]" size={13} />}
          description="India's dedicated platform for fast, affordable, and secure Mobile Legends: Bang Bang diamond recharges."
        />

        {/* MISSION SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Our Mission
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--muted)] leading-relaxed">
            <strong className="text-[var(--foreground)]">mlbbtopup.in</strong> was created to eliminate high fees, slow delivery, and insecure login-sharing practices for Indian mobile gamers. We make buying diamonds, Weekly Diamond Passes, and Twilight Passes straightforward, instant, and accessible via everyday UPI payments.
          </p>
        </motion.div>

        {/* KEY HIGHLIGHTS LIST */}
        <div className="space-y-2.5">
          {highlights.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 + 0.15 }}
              className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                {item.icon}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CONTACT / CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Have questions or feedback?</h4>
            <p className="text-[11px] text-[var(--muted)]">Our support team is always ready to assist you.</p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wider text-[10px] hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            <Icons.helpCircle size={13} />
            Contact Support
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
