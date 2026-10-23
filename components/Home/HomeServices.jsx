"use client";

import { FiUsers, FiGlobe, FiZap, FiArrowRight, FiMessageCircle } from "react-icons/fi";
import { SectionTitle } from "@/components/common";

const SERVICES = [
  {
    title: "Reseller Program",
    desc: "Get our lowest prices for your business. Fast delivery and big profits.",
    icon: FiUsers,
    badge: "BEST PRICE",
  },
  {
    title: "Whitelabel Site",
    desc: "Start your own brand. Get a full website with your name and automation.",
    icon: FiGlobe,
    badge: "FAST SETUP",
  },
  {
    title: "Custom Portals",
    desc: "We build special top-up websites with the look and features you want.",
    icon: FiZap,
    badge: "CUSTOM",
  },
];

export default function HomeServices() {
  const whatsappLink = `https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`;

  return (
    <section className="py-8 bg-[var(--background)] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[40%] bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 px-6">
        {/* HEADER */}
        <div className="mb-6">
          <SectionTitle
            subtitle="SCALE UP"
            title="GROW YOUR BUSINESS"
            highlight="BUSINESS"
            pulse
          />
        </div>

        {/* SERVICES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {SERVICES.map((service, i) => (
            <div
              key={i}
              onClick={() => window.open(whatsappLink, "_blank")}
              className="group cursor-pointer p-4 sm:p-5 rounded-3xl bg-[var(--card)]/40 border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 flex flex-col items-start"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/[0.05] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--background)] mb-4">
                <service.icon size={18} />
              </div>

              {/* Content */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100">
                  <span className="text-[7px] font-black italic text-[var(--accent)] tracking-widest uppercase">
                    {service.badge}
                  </span>
                </div>
                <h3 className="text-base font-black uppercase tracking-tighter italic text-[var(--foreground)] group-hover:text-[var(--accent)] leading-none">
                  {service.title}
                </h3>
                <p className="text-[10px] text-[var(--muted)] leading-tight italic opacity-40 font-bold uppercase tracking-tight">
                  {service.desc}
                </p>
              </div>

              {/* Action */}
              <div className="mt-auto flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[var(--accent)] italic">
                Contact Us <FiArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM STRIP */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--card)]/20 border border-[var(--border)] border-dashed">
          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/40 italic">
            Need custom deals?
          </p>
          <button aria-label="button"
            onClick={() => window.open(whatsappLink, "_blank")}
            className="flex items-center gap-2 text-[var(--accent)] text-[9px] font-black uppercase tracking-widest italic"
          >
            <FiMessageCircle size={12} /> WhatsApp Us
          </button>
        </div>
      </div>
    </section>
  );
}
