"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import Link from "next/link";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-3.5 sm:p-4 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] flex items-start gap-3 hover:border-[var(--accent)]/30 transition-all"
  >
    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--accent)]/20">
      <Icon size={16} />
    </div>
    <div className="space-y-0.5 min-w-0">
      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-[var(--foreground)]">{title}</h3>
      <p className="text-[11px] sm:text-xs text-[var(--muted)] leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

export default function PartnershipPage() {
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">
            <Icons.zap size={11} className="animate-pulse" />
            <span>Partnership</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)]">
            Partner With <span className="text-[var(--accent)]">mlbbtopup.in</span>
          </h1>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Promote your YouTube channel, app, or gaming community to over 100,000+ active mobile gamers through rewarded tasks and sponsored events.
          </p>
        </motion.div>

        {/* PROMOTION TYPES */}
        <div className="space-y-2.5">
          <FeatureCard 
            icon={Icons.youtube} 
            title="Channel & Video Promotion" 
            description="Boost YouTube views, watch time, and subscriber growth with rewarded gaming tasks."
          />
          <FeatureCard 
            icon={Icons.smartphone} 
            title="App Installs & Engagement" 
            description="Drive genuine installs and real engagement for your Android or iOS mobile applications."
          />
          <FeatureCard 
            icon={Icons.globe} 
            title="Web & Blog Traffic" 
            description="Send targeted, interested gaming visitors directly to your website, platform, or tournament portal."
          />
          <FeatureCard 
            icon={Icons.messageCircle} 
            title="Community Building" 
            description="Rapidly grow active WhatsApp and Telegram groups or Discord servers with real Indian gamers."
          />
          <FeatureCard 
            icon={Icons.shield} 
            title="Anti-Bot Security" 
            description="Secret verification codes and manual checks prevent bots or fraudulent campaign entries."
          />
          <FeatureCard 
            icon={Icons.trendingUp} 
            title="Transparent Performance" 
            description="Pay purely for verified completions with real-time campaign analytics and delivery tracking."
          />
        </div>

        {/* CTA BOX */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 sm:p-5 rounded-2xl bg-[var(--card)]/30 border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-[var(--foreground)]">
              Ready to launch a campaign?
            </h3>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              Contact our team to get custom advertising slots and volume partnership rates.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link 
              href="/contact"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-bold uppercase tracking-wider text-[10px] hover:opacity-90 active:scale-95 transition-all text-center"
            >
              <span>Contact Us</span>
              <Icons.arrowRight size={12} />
            </Link>
            <Link 
              href="/dashboard/coins"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--foreground)] font-bold uppercase tracking-wider text-[10px] hover:border-[var(--accent)] active:scale-95 transition-all text-center"
            >
              <span>Live Tasks</span>
              <Icons.users size={12} />
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
