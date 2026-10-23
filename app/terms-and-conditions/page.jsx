"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Blue Buff";

export default function TermsAndConditions() {
  const sections = [
    {
      id: "01",
      title: "Eligibility",
      content: "You must be at least 18 years old or have guardian permission to use this service. You are responsible for ensuring all order information provided is accurate."
    },
    {
      id: "02",
      title: "Accurate Game Details",
      content: `Always double-check your Player ID and Zone ID before proceeding to payment. Orders delivered to incorrect credentials provided by the user cannot be retrieved or refunded.`
    },
    {
      id: "03",
      title: "Digital Delivery & Finality",
      content: "All top-up items and diamond packages are intangible digital products fulfilled automatically. Once in-game credits are added, transactions are deemed complete and final."
    },
    {
      id: "04",
      title: "Secure Payments",
      content: "Payments are processed securely via verified third-party gateways (UPI, Paytm, Net Banking). We never store sensitive banking or card credentials."
    },
    {
      id: "05",
      title: "Prohibited Conduct",
      content: "Unauthorized automated bots, fraudulent payment reversals, chargeback abuse, or attempting to exploit system flaws may lead to immediate service suspension."
    },
    {
      id: "06",
      title: "Intellectual Property",
      content: `${BRAND} is an independent top-up service provider. All game names, character artwork, and logos belong to their respective publishers (e.g. Moonton).`
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 pt-20 sm:pt-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">

        {/* HEADER */}
        <SectionTitle
          subtitle="LEGAL AGREEMENT"
          title="TERMS & CONDITIONS"
          highlight="CONDITIONS"
          icon={<Icons.fileText className="text-[var(--accent)]" size={13} />}
          description="Please read these terms carefully before placing top-up orders on our platform."
        />

        {/* SECTIONS LIST */}
        <div className="space-y-2.5">
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20 font-black text-xs font-mono">
                {section.id}
              </div>

              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-[var(--foreground)]">
                  {section.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[var(--muted)] leading-relaxed">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FOOTER NOTICE */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/20 text-center">
          <p className="text-[11px] text-[var(--muted)]">
            Questions regarding terms? Feel free to contact our support team at <a href="/contact" className="text-[var(--accent)] font-semibold hover:underline">Support</a>.
          </p>
        </div>

      </div>
    </main>
  );
}
