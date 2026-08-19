"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/icons";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Blue Buff";

export default function PrivacyPolicy() {
  const policies = [
    {
      icon: <Icons.database />,
      title: "Data Collection",
      description: "We collect essential account details (Email, Phone, Game ID) and technical data (IP, Browser) exclusively for order delivery and fraud prevention."
    },
    {
      icon: <Icons.lock />,
      title: "Usage Protocol",
      description: "Your data is used solely to process orders and improve platform security. We never sell, trade, or share your personal information with third-party marketers."
    },
    {
      icon: <Icons.server />,
      title: "Security Measures",
      description: "We utilize 256-bit SSL encryption and secure gateways. Logs are retained only as long as legally required for transaction verification and auditing."
    },
    {
      icon: <Icons.globe />,
      title: "Third-Party Integration",
      description: "Our platform integrates with verified payment and analytics providers who operate under their own strict privacy standards and compliance certifications."
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/30 pb-32 transition-colors duration-300 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--accent)]/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto pt-24 md:pt-32 px-6 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 mb-4">
            <Icons.shield size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Data Protection</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-[1000] italic tracking-tighter uppercase leading-none">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60">Policy</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm md:text-base text-[var(--muted)] font-medium leading-relaxed">
            We are committed to protecting your digital footprint. Our protocols ensure your data remains secure, private, and under your control.
          </p>
        </motion.div>

        {/* POLICY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className="group p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--foreground)]/[0.02] transition-all duration-300 shadow-sm hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-[var(--foreground)] pointer-events-none">
                <Icons.fileText size={120} />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[var(--accent)]/20 shadow-[0_0_15px_-3px_var(--accent)]/20">
                  <div className="text-2xl">{item.icon}</div>
                </div>

                <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] mb-3 group-hover:text-[var(--accent)] transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-[var(--muted)] leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* COMPLIANCE CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 relative overflow-hidden rounded-[2.5rem] bg-[var(--card)] border border-[var(--border)] p-8 md:p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--muted)] mb-2">
              <Icons.eye size={32} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Transparency & Control</h3>
              <p className="text-[var(--muted)] text-sm font-medium">
                You have the right to request access to your data or demand its deletion at any time. Our Data Protection Officer is available for any inquiries.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              <Icons.shield className="animate-pulse" />
              Contact Data Officer
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
