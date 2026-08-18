"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Icons } from "@/components/icons";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Blue Buff";

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/30 pb-32 transition-colors duration-300 px-6">

      {/* Background Lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[70%] h-[50%] bg-[var(--accent)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto pt-16 md:pt-28 relative z-10">

        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center md:text-left"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/10 mb-6">
            <span className="text-[var(--accent)] text-[10px] font-black uppercase tracking-widest italic">Who We Are</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-[1000] italic tracking-tighter uppercase leading-[0.85] mb-6">
            ABOUT <span className="text-[var(--accent)]">{BRAND.toUpperCase()}</span>
          </h1>
          <p className="text-[var(--muted)] text-[10px] md:text-xs font-[900] uppercase tracking-[0.4em] opacity-60 italic leading-relaxed max-w-xl">
            FAST AND SAFE GAME TOP-UPS
          </p>
        </motion.div>

        {/* MISSION SECTION */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-32"
        >
          <motion.div variants={itemVariants} className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[40px] p-8 md:p-12 relative overflow-hidden mb-12">
            <h2 className="text-2xl md:text-4xl font-[900] italic uppercase tracking-tighter text-[var(--foreground)] mb-6">
              OUR <span className="text-[var(--accent)]">MISSION</span>
            </h2>
            <p className="text-[var(--muted)] text-base md:text-lg leading-relaxed opacity-70 mb-10 italic">
              {BRAND} is built to make game top-ups easy and fast. Getting diamonds, passes, and credits should be simple and safe.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Fast automatic delivery",
                "24/7 reliable service",
                "Secure Indian payment integrations",
                "Clear and fair pricing"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0 md:last:border-b">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <Icons.check size={12} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* FEATURES GRID */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-32"
        >
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="h-[1px] flex-1 bg-[var(--border)]" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted)] opacity-40 italic whitespace-nowrap">WHY CHOOSE US</h2>
            <div className="h-[1px] flex-1 bg-[var(--border)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Speed",
                icon: Icons.zap,
                desc: "Credits are added to your ID quickly after payment confirmation."
              },
              {
                title: "Safety",
                icon: Icons.shield,
                desc: "Strong security and verified gateways protect every payment."
              },
              {
                title: "Best Prices",
                icon: Icons.trendingUp,
                desc: "We keep prices low so you get better value for each rupee."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-8 rounded-[32px] bg-[var(--card)]/20 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-black transition-all mb-6">
                  <feature.icon size={20} />
                </div>
                <h3 className="text-xl font-[900] italic uppercase tracking-tighter text-[var(--foreground)] mb-3">{feature.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed opacity-50">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>


      </div>
    </main>
  );
}
