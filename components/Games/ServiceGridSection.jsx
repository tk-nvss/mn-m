"use client";

import Image from "next/image";
import Link from "next/link";
import { FiEye, FiZap, FiTv, FiShield, FiChevronRight } from "react-icons/fi";

export default function ServiceGridSection({
  title,
  total,
  items,
  hrefPrefix,
  showCategory = true,
  ctaText = "View Details"
}) {
  if (!items?.length) return null;

  // Determine icon and gradient based on title
  const isOtt = title?.toLowerCase().includes("ott");
  const config = isOtt
    ? { icon: FiTv, gradient: "from-purple-500 to-indigo-600" }
    : { icon: FiShield, gradient: "from-amber-400 to-orange-500" };

  const Icon = config.icon;

  return (
    <section className="relative mb-4 sm:mb-6 px-1">
      {/* HEADER SYSTEM */}
      {title && (
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-2.5 rounded-2xl bg-gradient-to-br ${config.gradient} text-white shadow-lg`}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic">
              {title}
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-[var(--accent)] rounded-full" />
              <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em]">
                {total} Elite Items
              </span>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-[var(--border)] to-transparent" />
        </div>
      )}

      {/* GRID SYSTEM (Responsive Columns) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-6 md:gap-5 px-2 sm:px-0">
        {items.map((item, index) => (
          <div key={item.slug}>
            <Link
              href={`${hrefPrefix}/${item.slug}`}
              className="group relative block rounded-none overflow-hidden border border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-xl hover:border-[var(--accent)]/50 shadow-sm"
            >
              {/* IMAGE CONTAINER */}
              <div className="relative w-full aspect-square p-2 sm:p-3 flex items-center justify-center shrink-0 bg-black/10 overflow-hidden">
                
                {/* Left background image */}
                <div className="absolute w-[75%] h-[85%] z-0 transform -rotate-[6deg] -translate-x-4 sm:-translate-x-6 scale-95 opacity-30 blur-[1px]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 33vw, 25vw"
                    quality={60}
                    aria-hidden="true"
                    className="object-cover rounded-none border border-white/10"
                  />
                </div>

                {/* Right background image */}
                <div className="absolute w-[75%] h-[85%] z-0 transform rotate-[6deg] translate-x-4 sm:translate-x-6 scale-95 opacity-30 blur-[1px]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 33vw, 25vw"
                    quality={60}
                    aria-hidden="true"
                    className="object-cover rounded-none border border-white/10"
                  />
                </div>

                {/* Main card */}
                <div className="relative w-[85%] h-[95%] z-10 border border-white/10 bg-[var(--background)]">
                  <Image
                    src={item.image}
                    alt={item.gameName || item.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 25vw"
                    quality={60}
                    className="object-cover rounded-none"
                  />

                  {/* OVERLAYS */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                  {/* CATEGORY & MANUAL BADGES */}
                  <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start gap-1.5">
                    {showCategory && item.category && (
                      <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white">
                        {item.category}
                      </span>
                    )}
                    {item.isManual && (
                      <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded bg-amber-500/80 backdrop-blur-md border border-amber-400/30 text-white flex items-center gap-1">
                        <FiZap size={8} fill="currentColor" />
                        Manual
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-2 sm:p-2.5 relative">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-tight italic leading-tight line-clamp-2 text-[var(--foreground)]">
                    {item.gameName || item.name}
                  </h3>
                  <FiChevronRight className="text-[var(--muted)]" size={14} />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]/40" />

                  {item.isManual && (
                    <span className="flex-1 text-right text-[7px] font-black text-amber-500 uppercase tracking-widest opacity-80">
                      • Manual
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
