"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SectionTitle } from "@/components/common";
import { Icons } from "@/components/icons";

export default function RefundPolicy() {
  const rules = [
    {
      title: "Digital & Instant Delivery",
      desc: "Top-ups are digital goods delivered instantly to your in-game account. Once diamonds or passes are credited, orders are final and non-refundable.",
      icon: <Icons.zap size={16} />
    },
    {
      title: "Eligible Situations",
      desc: "Refunds apply only if payment was deducted but no in-game items were credited after 24 hours due to a technical error.",
      icon: <Icons.alertTriangle size={16} />
    },
    {
      title: "Wrong Player ID / Zone",
      desc: "If incorrect user ID or Zone ID details were provided at checkout, orders cannot be cancelled, credited elsewhere, or refunded.",
      icon: <Icons.shield size={16} />
    },
    {
      title: "Processing Timeline",
      desc: "Approved refunds are credited back to your original payment method (UPI / Bank) within 3 to 5 business days.",
      icon: <Icons.refresh size={16} />
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 pt-20 sm:pt-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-6 relative z-10">

        {/* HEADER */}
        <SectionTitle
          subtitle="SATISFACTION GUARANTEE"
          title="REFUND POLICY"
          highlight="POLICY"
          icon={<Icons.fileText className="text-[var(--accent)]" size={13} />}
          description="Clear, transparent guidelines regarding purchases, digital goods delivery, and refund eligibility."
        />

        {/* POLICY LIST */}
        <div className="space-y-2.5">
          {rules.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.1 }}
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

        {/* SUPPORT ACTION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Need assistance with an order?</h4>
            <p className="text-[11px] text-[var(--muted)]">Our support team is available 24/7 to inspect transaction issues.</p>
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
