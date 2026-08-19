"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";

const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME || "Blue Buff";

export default function TermsAndConditions() {
  const sections = [
    {
      id: "01",
      title: "Eligibility",
      content: "You must be at least 18 years old, or have permission from a parent or guardian. Keep your account details private. You are responsible for activity on your account."
    },
    {
      id: "02",
      title: "Platform Use",
      content: `Use ${BRAND} only for legal purposes. Enter correct details (Game ID, Server/Zone). Wrong details can cause a failed order that cannot be reversed.`
    },
    {
      id: "03",
      title: "Digital Delivery",
      content: "All products are digital services and are usually delivered right away. Once processed, orders are final. We are not responsible for wrong user input or unauthorized account use after delivery."
    },
    {
      id: "04",
      title: "Payments",
      content: "Payments are handled by secure third-party gateways. We do not store sensitive payment details. We may review or block suspicious payment activity."
    },
    {
      id: "05",
      title: "Refund Logic",
      content: "Because delivery is instant, successful orders are not refundable. Refunds are only considered for verified technical failures where no credit was given."
    },
    {
      id: "06",
      title: "Prohibited Acts",
      content: "If you exploit system issues, do fraudulent chargebacks, or use unauthorized bots/automation, your account may be suspended permanently."
    },
    {
      id: "07",
      title: "Intellectual Property",
      content: `${BRAND} branding belongs to us. Game trademarks (Mobile Legends, etc.) belong to their publishers. We are an independent service provider.`
    },
    {
      id: "08",
      title: "Liability Limits",
      content: "We are not responsible for losses caused by user errors, game server downtime, developer account restrictions, or indirect damages."
    }
  ];

  return (
    <main className="min-h-screen relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/30 pb-32 transition-colors duration-300 px-6">

      <div className="max-w-4xl mx-auto pt-16 md:pt-24 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center md:text-left"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/10 mb-6 font-sans">
            <span className="text-[var(--accent)] text-[10px] font-black uppercase tracking-widest italic">Legal Agreement</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-[1000] italic tracking-tighter uppercase leading-none mb-2">
            TERMS & <span className="text-[var(--accent)]">CONDITIONS</span>
          </h1>
          <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">
            Service Rules
          </p>
          <div className="flex items-center gap-4 mt-8 text-[9px] font-black uppercase tracking-widest opacity-30 italic justify-center md:justify-start">
            <Icons.fileText size={14} className="text-[var(--accent)]" />
            <span>REVISED: JANUARY 2026</span>
          </div>
        </motion.div>

        {/* SECTIONS GRID-LIST */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 rounded-3xl bg-[var(--card)]/40 border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all flex flex-col md:flex-row gap-6"
            >
              <div className="text-2xl font-black italic text-[var(--accent)] opacity-20 group-hover:opacity-100 transition-opacity leading-none pt-1">
                {section.id}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-[900] italic uppercase tracking-tighter text-[var(--foreground)] mb-3">{section.title}</h2>
                <p className="text-xs md:text-sm text-[var(--muted)] leading-relaxed opacity-60 italic">{section.content}</p>
              </div>
            </motion.section>
          ))}
        </div>

        {/* FINAL NOTES */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 pt-16 border-t border-[var(--border)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-4">
              <Icons.alertCircle className="text-rose-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-2">Suspension Policy</h3>
                <p className="text-[9px] font-bold text-[var(--muted)] opacity-50 uppercase leading-relaxed">If you break these terms, your account can be closed immediately without warning.</p>
              </div>
            </div>
            <div className="p-8 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/10 flex items-start gap-4">
              <Icons.globe className="text-[var(--accent)] mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-[10px] font-black uppercase text-[var(--accent)] tracking-widest mb-2">Governing Law</h3>
                <p className="text-[9px] font-bold text-[var(--muted)] opacity-50 uppercase leading-relaxed">These terms are governed by the local laws where we operate.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center opacity-30 flex items-center justify-center gap-3">
            <Icons.info size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Contact support if you need help.</span>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
