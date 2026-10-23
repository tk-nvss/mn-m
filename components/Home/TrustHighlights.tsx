"use client";

import {
  FiZap,
  FiShield,
  FiCreditCard,
  FiPhone,
  FiUsers,
  FiCpu
} from "react-icons/fi";
import { SectionTitle } from "@/components/common";

const HIGHLIGHTS = [
  {
    label: "SPEED",
    value: "24/7",
    subtitle: "Instant Delivery",
    icon: FiZap,
    color: "var(--accent)",
  },
  {
    label: "SAFETY",
    value: "100%",
    subtitle: "Safe & Legal",
    icon: FiShield,
    color: "var(--accent)",
  },
  {
    label: "PAYMENT",
    value: "EASY",
    subtitle: "Secure Payments",
    icon: FiCreditCard,
    color: "var(--accent)",
  },
  {
    label: "SUPPORT",
    value: "FAST",
    subtitle: "Quick Help",
    icon: FiPhone,
    color: "var(--accent)",
  },
  {
    label: "PLAYERS",
    value: "10K+",
    subtitle: "Happy Customers",
    icon: FiUsers,
    color: "var(--accent)",
  },
  {
    label: "TOP-UP",
    value: "AUTO",
    subtitle: "Fully Automatic",
    icon: FiCpu,
    color: "var(--accent)",
  },
];

export default function TrustHighlights() {
  return (
    <section className="py-2.5 bg-[var(--background)] px-4 sm:px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-2.5">
          <SectionTitle
            size="sm"
            subtitle="GUARANTEED EXCELLENCE"
            title="WHY US"
            highlight="US"
            pulse
          />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {HIGHLIGHTS.map((item, i) => (
            <div
              key={i}
              className="group relative p-2 sm:p-2.5 rounded-xl bg-[var(--card)]/40 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center text-center space-y-1">
                {/* ICON TAG */}
                <div className="w-8 h-8 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]/60 group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-all shadow-sm">
                  <item.icon size={15} />
                </div>

                {/* LABEL */}
                <div className="text-[7px] font-[1000] uppercase tracking-[0.2em] text-[var(--muted)] opacity-30 italic leading-none">
                  {item.label}
                </div>

                {/* VALUE & SUBTITLE */}
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-black italic uppercase tracking-tighter text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors leading-none">
                    {item.value}
                  </h3>
                  <p className="text-[7.5px] font-black uppercase tracking-wider text-[var(--muted)] opacity-50 italic leading-none">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* SIDE GLOW ON HOVER */}
              <div className="absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
