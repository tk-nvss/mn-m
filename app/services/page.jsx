"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";

export default function ServicesPage() {
  const whatsappLink = `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`;

  const services = [
    {
      title: "Game Topup APIs",
      desc: "Integrate our seamless top-up APIs to unlock wholesale rates, ensuring lightning-fast delivery and maximum profitability for your business.",
      icon: Icons.package,
      badge: "API ACCESS",
      active: true,
      href: "https://bluebuff.in",
    },
    {
      title: "Free Manual Web / Link in Bio",
      desc: "Launch your brand instantly with a fully customizable Link-in-Bio website, complete with integrated payment gateways and your own unique identity.",
      icon: Icons.globe,
      badge: "FAST SETUP",
      active: true,
      href: "https://web.bluebuff.in",
    },
    {
      title: "Free Online Gameplay",
      desc: "Dive into a vast library of instant-play games directly from your browser. No downloads, zero latency, just pure entertainment.",
      icon: Icons.zap,
      badge: "PLAY NOW",
      active: true,
      href: "https://games.bluebuff.in",
    },
    {
      title: "Custom Web Dev",
      desc: "Elevate your online presence with bespoke web development solutions tailored to your brand's unique aesthetics and complex technical requirements.",
      icon: Icons.globe,
      badge: "EXCLUSIVE",
      active: true,
      href: "https://bluebuff.in",
    },
    {
      title: "WhatsApp Bot / Telegram Bot",
      desc: "Streamline operations, automate order processing, and scale customer support effortlessly with custom WhatsApp and Telegram automation bots.",
      icon: Icons.whatsapp,
      badge: "AUTOMATION",
      active: true,
      href: "https://bluebuff.in",
    },
  ];

  return (
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-300 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto pt-12 md:pt-16 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/10 mb-2">
            <Icons.zap className="text-[var(--accent)]" size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent)]">For Businesses</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">
            <span className="text-[var(--accent)]">OUR</span> SERVICES
          </h1>
          <p className="text-[var(--muted)] text-[9px] font-bold uppercase tracking-widest opacity-70 mt-1 italic font-sans">
            Scale your business.
          </p>
        </motion.div>

        {/* SERVICES LIST */}
        <div className="space-y-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => service.active && window.open(service.href || whatsappLink, "_blank")}
                className={`group relative p-4 sm:p-5 rounded-2xl bg-[var(--card)]/30 border border-white/5 transition-all duration-300 flex items-center gap-3 sm:gap-5 ${service.active
                  ? "cursor-pointer hover:border-[var(--accent)]/30 hover:bg-[var(--card)]/50"
                  : "opacity-30 grayscale cursor-not-allowed border-dashed"
                  }`}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[var(--accent)]/60 group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-all flex-shrink-0">
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <h3 className="text-sm md:text-base font-black uppercase tracking-tighter italic text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-none">
                      {service.title}
                    </h3>
                    <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-[var(--accent)]/5 text-[var(--accent)]/40 border border-[var(--accent)]/10 tracking-widest uppercase">
                      {service.badge}
                    </span>
                  </div>
                  <p className="text-[var(--muted)] text-[10px] md:text-[11px] leading-normal opacity-80 font-bold uppercase tracking-tight mt-1">
                    {service.desc}
                  </p>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/30 transition-all flex-shrink-0">
                  <Icons.arrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 rounded-3xl border border-white/5 bg-[var(--card)]/20 text-center space-y-4"
        >
          <div>
            <h4 className="text-base font-black italic uppercase tracking-tighter mb-1">Need more?</h4>
            <p className="text-[var(--muted)] text-[8px] font-black uppercase tracking-widest opacity-70 italic">Contact us for custom deals.</p>
          </div>
          <button aria-label="button"
            onClick={() => window.open(whatsappLink, "_blank")}
            className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-widest text-[9px] italic shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 mx-auto"
          >
            <Icons.whatsapp size={12} />
            WhatsApp Us
          </button>
        </motion.div>

      </div>
    </section>
  );
}
