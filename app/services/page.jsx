"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { SectionTitle } from "@/components/common";

export default function ServicesPage() {
  const whatsappLink = `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`;

  const services = [
    {
      title: "Game Top-Up API",
      desc: "Connect our fast top-up API to get wholesale rates and instant automated delivery for your customers.",
      badge: "API ACCESS",
      active: true,
      href: "https://api.bluebuff.in",
    },
    {
      title: "Free Top-Up Website",
      desc: "Get your own branded gaming store or link-in-bio website with online payment gateways already set up.",
      badge: "FAST SETUP",
      active: true,
      href: "https://web.bluebuff.in",
    },
    {
      title: "Free Online Games",
      desc: "Play fun browser games instantly with zero downloads, zero installation, and no wait time.",
      badge: "PLAY NOW",
      active: true,
      href: "https://games.bluebuff.in",
    },
    {
      title: "Custom Web Development",
      desc: "Need special features or custom tools? We build fast, secure websites tailored to your brand.",
      badge: "EXCLUSIVE",
      active: true,
      href: "https://bluebuff.in",
    },
    {
      title: "WhatsApp & Telegram Bots",
      desc: "Automate your orders, check player IDs, and send top-up updates 24/7 with smart chat bots.",
      badge: "AUTOMATION",
      active: true,
      href: "https://bluebuff.in",
    },
  ];

  return (
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20 transition-colors duration-300 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows & Tech Grid */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[-15%] w-[450px] h-[450px] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_60%,transparent_100%)]" />

      <div className="max-w-7xl xl:max-w-[1440px] mx-auto pt-12 md:pt-16 relative z-10">

        {/* HEADER */}
        <SectionTitle
          as="h1"
          size="md"
          subtitle="FOR BUSINESSES"
          title="OUR SERVICES"
          highlight="SERVICES"
          pulse
          description="Everything you need to grow your gaming business, from APIs to websites and automation."
          icon={<Icons.zap className="text-[var(--accent)]" size={13} />}
          className="mb-8 sm:mb-10"
        />

        {/* SERVICES GRID (2 in a row on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => service.active && window.open(service.href || whatsappLink, "_blank")}
              className={`group relative p-4 sm:p-5 rounded-2xl bg-[var(--card)]/40 border border-[var(--border)] transition-all duration-300 flex items-center justify-between gap-3 h-full overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-[var(--accent)]/[0.04] before:via-transparent before:to-purple-500/[0.03] before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:pointer-events-none ${
                service.active
                  ? "cursor-pointer hover:border-[var(--accent)]/50 hover:bg-[var(--card)]/70 hover:shadow-lg hover:shadow-[var(--accent)]/5"
                  : "opacity-30 grayscale cursor-not-allowed border-dashed"
              }`}
            >
              {/* Subtle Card Watermark Number */}
              <span className="absolute right-3.5 bottom-1 text-2xl font-black font-mono text-[var(--foreground)]/[0.03] select-none pointer-events-none leading-none group-hover:text-[var(--accent)]/[0.08] transition-colors">
                0{i + 1}
              </span>

              <div className="min-w-0 flex-1 relative z-10">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight italic text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-none">
                    {service.title}
                  </h3>
                  <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 tracking-widest uppercase inline-flex items-center gap-1 shadow-[0_0_8px_rgba(56,189,248,0.08)]">
                    <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span>{service.badge}</span>
                  </span>
                </div>
                <p className="text-[var(--muted)] text-[11px] leading-relaxed font-medium">
                  {service.desc}
                </p>
              </div>

              {/* Arrow */}
              <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent)]/40 group-hover:bg-[var(--accent)]/10 transition-all flex-shrink-0 ml-1 relative z-10 shadow-2xs">
                <Icons.arrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="relative mt-12 sm:mt-16 group/cta"
        >
          {/* Ambient Glow behind CTA */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent)]/20 via-purple-500/15 to-blue-500/20 rounded-3xl blur-xl opacity-40 group-hover/cta:opacity-70 transition duration-700 pointer-events-none" />

          <div className="relative p-5 sm:p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-xl text-center space-y-3 overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/25 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span>Direct WhatsApp Assistance</span>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-black italic uppercase tracking-tight text-[var(--foreground)] mb-1">
                Need Something <span className="text-[var(--accent)]">Custom?</span>
              </h4>
              <p className="text-[var(--muted)] text-[11px] font-medium leading-relaxed max-w-lg mx-auto">
                Contact us on WhatsApp for bulk discounts, custom features, or reseller setups.
              </p>
            </div>

            <button aria-label="WhatsApp Us"
              onClick={() => window.open(whatsappLink, "_blank")}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-wider text-[10px] italic shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/30 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Icons.whatsapp size={13} />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
