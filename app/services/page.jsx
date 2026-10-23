"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { SectionTitle } from "@/components/common";

export default function ServicesPage() {
  const whatsappLink = `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`;

  const services = [
    {
      title: "Game Topup APIs",
      desc: "Integrate our seamless top-up APIs to unlock wholesale rates, ensuring lightning-fast delivery and maximum profitability for your business.",
      icon: Icons.package,
      badge: "API ACCESS",
      active: true,
      href: "https://api.bluebuff.in",
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
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-300 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl xl:max-w-[1440px] mx-auto pt-12 md:pt-16 relative z-10">

        {/* HEADER */}
        <SectionTitle
          subtitle="FOR BUSINESSES"
          title="OUR SERVICES"
          description="Scale your business with automated APIs, custom bots, instant gaming, and web solutions"
          icon={<Icons.zap className="text-[var(--accent)]" size={13} />}
          className="mb-8 sm:mb-10"
        />

        {/* SERVICES GRID (2 in a row on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => service.active && window.open(service.href || whatsappLink, "_blank")}
                className={`group relative p-4 sm:p-5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] transition-all duration-300 flex items-center justify-between gap-3 sm:gap-4 h-full ${service.active
                  ? "cursor-pointer hover:border-[var(--accent)]/50 hover:bg-[var(--card)]/70 hover:shadow-lg hover:shadow-[var(--accent)]/5"
                  : "opacity-30 grayscale cursor-not-allowed border-dashed"
                  }`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] group-hover:scale-105 group-hover:bg-[var(--accent)]/20 transition-all flex-shrink-0 mt-0.5">
                    <Icon size={20} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                      <h3 className="text-sm sm:text-base font-black uppercase tracking-tight italic text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-none">
                        {service.title}
                      </h3>
                      <span className="text-[7.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 tracking-widest uppercase">
                        {service.badge}
                      </span>
                    </div>
                    <p className="text-[var(--muted)] text-[10.5px] sm:text-[11.5px] leading-relaxed opacity-80 font-medium">
                      {service.desc}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="w-9 h-9 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/40 group-hover:bg-[var(--accent)]/10 transition-all flex-shrink-0 ml-1">
                  <Icons.arrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]/40 text-center space-y-4"
        >
          <div>
            <h4 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-[var(--foreground)] mb-1">
              Need A Custom <span className="text-[var(--accent)]">Solution?</span>
            </h4>
            <p className="text-[var(--muted)] text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-70 italic">
              Enterprise integrations, custom bots & volume reseller discounts available.
            </p>
          </div>
          <button aria-label="WhatsApp Us"
            onClick={() => window.open(whatsappLink, "_blank")}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-widest text-[10px] italic shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <Icons.whatsapp size={14} />
            <span>Chat on WhatsApp</span>
          </button>
        </motion.div>

      </div>
    </section>
  );
}
