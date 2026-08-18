"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import Link from "next/link";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-6 rounded-3xl bg-[var(--card)]/40 border border-[var(--border)] group hover:border-[var(--accent)]/40 transition-all"
  >
    <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-4 group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <h3 className="text-lg font-black uppercase italic mb-2 tracking-tighter">{title}</h3>
    <p className="text-sm text-[var(--muted)]/60 leading-relaxed">{description}</p>
  </motion.div>
);

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-20 px-4 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 mb-6"
          >
            <Icons.zap className="text-[var(--accent)] text-xs animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">Official Partnership</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter mb-6 leading-[0.9]"
          >
            GROW YOUR <span className="text-[var(--accent)]">AUDIENCE</span> <br />
            WITH MLBB Topup COINS
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto text-[var(--muted)] text-base md:text-lg leading-relaxed font-medium opacity-70"
          >
            Promote your YouTube channel, App, or Website to our massive gaming community. 
            Real users, real retention, and high engagement through rewarded tasks.
          </motion.p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <FeatureCard 
            icon={Icons.youtube} 
            title="Channel Growth" 
            description="Get real views and subscribers for your YouTube channel. Users must watch for a set time to earn coins."
          />
          <FeatureCard 
            icon={Icons.smartphone} 
            title="App Installs" 
            description="Drive high-quality installs to your Android or iOS apps. Real users exploring your product features."
          />
          <FeatureCard 
            icon={Icons.globe} 
            title="Web Traffic" 
            description="Send targeted traffic to your website or blog. Perfect for service providers and content creators."
          />
          <FeatureCard 
            icon={Icons.messageCircle} 
            title="Social Join" 
            description="Grow your WhatsApp/Telegram groups or channels. Build a community that stays active."
          />
          <FeatureCard 
            icon={Icons.shield} 
            title="Anti-Bot Tech" 
            description="Our advanced secret code and manual approval system ensures zero bot abuse for your campaign."
          />
          <FeatureCard 
            icon={Icons.trendingUp} 
            title="Scalable ROI" 
            description="Pay only for successful completions. Transparent analytics to track your campaign performance."
          />
        </section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[var(--accent)]/10 to-blue-500/5 border border-[var(--border)] rounded-[40px] p-8 md:p-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-6 tracking-tighter">READY TO SCALE?</h2>
          <p className="text-[var(--muted)] mb-10 max-w-xl mx-auto text-sm opacity-80">
            Join 50+ partners already promoting on MLBB Topup. Contact our support team to get your customized advertising plan.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard/support"
              className="w-full sm:w-auto px-10 py-5 bg-[#3b82f6] rounded-2xl tracking-widest text-[11px] shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
              style={{ color: 'white', fontWeight: '800', textTransform: 'uppercase' }}
            >
              Contact Support <Icons.arrowRight size={14} />
            </Link>
            <Link 
              href="/dashboard/coins"
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white hover:text-[#3b82f6] hover:border-[#3b82f6]/40 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
               View Live Tasks <Icons.users size={14} />
            </Link>
          </div>
        </motion.div>

        <footer className="mt-20 pt-10 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-6 text-[var(--muted)]/40 text-[10px] uppercase font-black tracking-widest">
           <p>© 2026 MLBB Topup. All rights reserved.</p>
           <div className="flex gap-10">
              <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy</Link>
              <Link href="/partner" className="hover:text-[var(--accent)] transition-colors">Partner With Us</Link>
           </div>
        </footer>
      </div>
    </div>
  );
}
