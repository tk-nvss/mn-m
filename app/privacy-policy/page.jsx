"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/icons";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Blue Buff";

export default function PrivacyPolicy() {
  const policies = [
    {
      title: "Data We Collect",
      description: "Only necessary details for order fulfillment (Game ID, Server/Zone, Phone/Email) and basic analytics to safeguard against fraudulent transactions.",
      icon: <Icons.database size={16} />
    },
    {
      title: "How We Use Information",
      description: "Your details are used exclusively to process your top-ups, verify payment success, and deliver customer support. We never sell or share data with advertisers.",
      icon: <Icons.lock size={16} />
    },
    {
      title: "Zero Password Policy",
      description: "We never ask for or store your game passwords or login credentials. All top-up recharges are processed via official Moonton Player ID & Zone ID APIs.",
      icon: <Icons.shield size={16} />
    },
    {
      title: "Payment Security",
      description: "Financial transactions take place over 256-bit SSL encrypted connections directly via licensed payment gateways (UPI, Paytm, Net Banking). No card info is stored.",
      icon: <Icons.server size={16} />
    },
    {
      title: "Your Rights & Deletion",
      description: "You have complete control over your account. You can request deletion of your order records or stored contact info by contacting our support team.",
      icon: <Icons.globe size={16} />
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 pt-20 sm:pt-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-1.5"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 text-[9px] font-black uppercase tracking-widest">
            <Icons.shield size={11} />
            <span>Privacy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">
            Privacy <span className="text-[var(--accent)]">Policy</span>
          </h1>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            How we protect your personal information, handle data, and ensure top-up privacy.
          </p>
        </motion.div>

        {/* POLICY LIST */}
        <div className="space-y-2.5">
          {policies.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
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
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PRIVACY CONTACT */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Data inquiries or account deletion?</h4>
            <p className="text-[11px] text-[var(--muted)]">Reach out directly to request information review or account removal.</p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wider text-[10px] hover:opacity-90 active:scale-95 transition-all shrink-0"
          >
            <Icons.shield size={13} />
            Contact Support
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
