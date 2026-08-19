"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/30 pb-32 transition-colors duration-300 px-6">

      <div className="max-w-4xl mx-auto pt-16 md:pt-24 relative z-10">

        {/* HEADER - SIMPLER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-[900] italic tracking-tighter uppercase leading-none mb-2">
            CONTACT <span className="text-[var(--accent)]">SUPPORT</span>
          </h1>
          <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">
            Get In Touch
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Info Side */}
          <div className="space-y-4">
            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-3xl bg-[var(--card)]/40 border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]/60 group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-colors">
                  <Icons.mail size={16} />
                </div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60">Direct Email</h2>
              </div>
              <div className="flex items-center gap-3">
                <Icons.mail className="text-xl text-[#0ea5e9]" />
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
                  className="inline-flex items-center gap-2 text-xl md:text-2xl font-[900] italic uppercase tracking-tighter text-[var(--foreground)] hover:text-[#38bdf8] transition-colors break-all"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
                </a>
              </div>
            </motion.div>

            {/* Social Bar */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-3xl bg-[var(--card)]/40 border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all"
            >
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60 mb-6">Find Us On</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Icons.instagram, link: "https://www.instagram.com/mlbbtopup.in", label: "INSTAGRAM" },
                  { icon: Icons.twitter, link: "https://x.com/tk_dev_", label: "TWITTER" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/40 transition-all group/link"
                  >
                    <social.icon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest italic">{social.label}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Map Side - Cleaner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-[32px] overflow-hidden border border-[var(--border)] relative bg-[var(--card)] min-h-[300px]"
          >
            <iframe
              title="Bhubaneswar Location"
              src="https://www.google.com/maps?q=Bhubaneswar,Odisha&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.5)' }}
              allowFullScreen
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Status Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 flex items-center justify-center gap-3 text-[var(--muted)] opacity-30"
        >
          <Icons.info size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">We usually reply within 24 hours</span>
        </motion.div>

      </div>
    </main>
  );
}
