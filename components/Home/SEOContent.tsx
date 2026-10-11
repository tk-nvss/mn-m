"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  FiChevronDown, 
  FiGrid, 
  FiUserCheck, 
  FiCreditCard, 
  FiZap,
  FiHelpCircle
} from "react-icons/fi";

const FAQS = [
  {
    q: "How do I buy MLBB diamonds in India?",
    a: "Visit mlbbtopup.in, select your diamond package or Weekly Pass, enter your Player ID and Zone ID, choose your preferred payment method (UPI, GPay, PhonePe, Paytm), and complete payment. Diamonds are credited directly to your Moonton account within 1 to 5 minutes.",
  },
  {
    q: "Is mlbbtopup.in safe and legit?",
    a: "Yes, 100% safe. We process all top-ups official Moonton API integrations using your Player ID and Zone ID only. We NEVER ask for your Moonton password or game login credentials, ensuring zero risk of account ban or security breach.",
  },
  {
    q: "What is the cheapest way to buy MLBB diamonds?",
    a: "Our diamond pricing is consistently 10–20% lower than Codashop and in-game rates. For maximum value, the Weekly Diamond Pass (starting at ₹89) offers the best diamond-to-rupee ratio for regular players.",
  },
  {
    q: "How fast is the diamond delivery?",
    a: "Top-up delivery is fully automated 24×7. Once your UPI payment is confirmed, your diamonds or Weekly Pass will be credited to your MLBB account within 1 to 5 minutes.",
  },
  {
    q: "Which payment methods are supported?",
    a: "We support all major Indian UPI payment apps including PhonePe, Google Pay, Paytm, BHIM, and net banking transfers. No credit card or international payment required.",
  },
  {
    q: "Is the MLBB Weekly Diamond Pass worth buying?",
    a: "Absolutely! The Weekly Diamond Pass grants 100 diamonds instantly plus 20 bonus diamonds daily for 7 days (total 240 diamonds), plus Starlight points and choice chests. At ₹89, it is the highest-value MLBB pack available.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export default function SEOContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First open by default
  const [showInfo, setShowInfo] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className="py-10 relative overflow-hidden bg-[var(--background)]">
      {/* Subtle Ambient Background Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
        
        {/* ── Section 1: About Header with Info (i) Component ────────────── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={containerVariants}
          className="max-w-4xl space-y-2.5"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[9px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                <span>India's #1 MLBB Store</span>
              </div>

              {/* Info Button */}
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                aria-label="More Information"
                className="w-5 h-5 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer"
              >
                i
              </button>

              {/* Responsive Modal / Drawer for Info */}
              <AnimatePresence>
                {showInfo && (
                  <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowInfo(false)}
                      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Content Box */}
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 10 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative z-10 w-full max-w-md p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl text-[12px] sm:text-xs leading-relaxed text-[var(--muted)]"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">About mlbbtopup.in</h4>
                        </div>
                        <button
                          onClick={() => setShowInfo(false)}
                          className="w-6 h-6 rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] flex items-center justify-center text-xs font-bold transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-3">
                        <p>
                          <strong className="text-[var(--foreground)]">mlbbtopup.in</strong> (an official product from <a href="https://bluebuff.in" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline font-bold">bluebuff.in</a>) is India's most trusted and affordable Mobile Legends: Bang Bang top-up platform. Enjoy instant recharges via UPI, PhonePe, Google Pay, and Paytm without ever sharing your login credentials.
                        </p>
                        <p>
                          Whether you're renewing your <strong className="text-[var(--foreground)]">Weekly Diamond Pass</strong> or preparing for Starlight events, our prices remain <strong className="text-[var(--accent)] font-bold">10–20% cheaper than Codashop</strong>. Trusted by over 100,000+ Indian gamers.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--foreground)] leading-tight">
              Cheapest <span className="text-[var(--accent)]">MLBB Diamond</span> Top Up In India
            </h2>
            
            <p className="text-[11px] sm:text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
              <strong className="text-[var(--foreground)]">mlbbtopup.in</strong> (official by <a href="https://bluebuff.in" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline font-bold">bluebuff.in</a>) — Instant recharges via UPI, PhonePe, & Paytm. Zero credentials needed.
            </p>
          </motion.div>
        </motion.div>

        {/* ── Section 2: How to Top Up (Simple One Row) ─────────────── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={containerVariants}
          className="space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              How to Buy <span className="text-[var(--accent)]">— Step by Step</span>
            </h2>
          </div>
          
          <motion.div variants={itemVariants} className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-stretch gap-2 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4">
              {[
                { step: "1", title: "Select Package", desc: "Choose pack or pass", icon: FiGrid },
                { step: "2", title: "Enter Details", desc: "Player ID & Zone ID", icon: FiUserCheck },
                { step: "3", title: "Make Payment", desc: "UPI, GPay, Paytm", icon: FiCreditCard },
                { step: "4", title: "Instant Delivery", desc: "Arrives in 1–5 mins", icon: FiZap },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.step} 
                    className="flex-1 min-w-[140px] sm:min-w-0 px-2.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 flex items-center gap-2"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-black text-[10px]">
                      {item.step}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[11px] font-black uppercase text-[var(--foreground)] leading-none truncate">{item.title}</h3>
                      <p className="text-[9px] text-[var(--muted)] leading-tight mt-0.5 truncate">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* ── Section 3: FAQ (Interactive Accordion UX) ────────────────────── */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={containerVariants}
          className="space-y-5"
        >
          <div className="flex items-center gap-2">
            <FiHelpCircle className="text-[var(--accent)] size-5" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[var(--foreground)]">
              Frequently Asked <span className="text-[var(--accent)]">Questions</span>
            </h2>
          </div>
          
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div 
                  key={i} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "border-[var(--accent)]/40 bg-[var(--card)] shadow-md" 
                      : "border-[var(--border)] bg-[var(--card)]/30 hover:border-[var(--accent)]/30 hover:bg-[var(--card)]/60"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full text-left p-4 flex items-center justify-between gap-3 cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-xs sm:text-sm font-bold transition-colors leading-snug ${
                      isOpen ? "text-[var(--accent)]" : "text-[var(--foreground)] group-hover:text-[var(--accent)]"
                    }`}>
                      {faq.q}
                    </span>
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"
                    }`}>
                      <FiChevronDown size={15} />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        <div className="px-4 pb-4 pt-1 text-[11px] sm:text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--border)]/40 mt-1">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
