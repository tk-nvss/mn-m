"use client";

import Link from "next/link";
import Image from "next/image";
import { FiChevronRight, FiZap } from "react-icons/fi";

const brGames = [
  {
    id: "bgmi",
    title: "Battlegrounds Mobile India",
    name: "BGMI",
    tag: "INDIA",
    flag: "🇮🇳",
    feature: "Instant UC Top-Up",
    gradient: "from-orange-500/10 to-transparent",
    borderHover: "hover:border-orange-500/40",
    tagBadge: "bg-orange-500/10 text-orange-500 border-orange-500/25",
    image: "/game-assets/bgmi_india.webp",
    link: "/games/bgmi226",
  },
  {
    id: "pubg",
    title: "PUBG Mobile",
    name: "PUBG",
    tag: "GLOBAL",
    flag: "🌐",
    feature: "Direct Fast Delivery",
    gradient: "from-amber-500/10 to-transparent",
    borderHover: "hover:border-amber-500/40",
    tagBadge: "bg-amber-500/10 text-amber-500 border-amber-500/25",
    image: "/game-assets/bgmi-logo.webp",
    link: "/games/pubg-mobile138",
  },
];

export default function BattleRoyaleSection() {
  return (
    <section className="relative py-2 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header - Compact & Premium */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3.5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] italic text-[var(--foreground)] opacity-90">
              Battle Royale
            </h2>
          </div>
          <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)]/70 flex items-center gap-1">
            <FiZap size={10} className="text-amber-500" />
            Instant UC
          </span>
        </div>

        {/* Cards Grid - Compact 2 Columns */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {brGames.map((game) => (
            <Link
              key={game.id}
              href={game.link}
              className={`group relative overflow-hidden rounded-2xl bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] p-2 sm:p-2.5 ${game.borderHover} cursor-pointer`}
            >
              {/* Subtle hover gradient */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${game.gradient} transition-opacity duration-200 pointer-events-none`}
              />

              <div className="flex items-center gap-2 sm:gap-2.5 relative z-10">
                {/* Game Thumbnail - Compact & Sharp */}
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] p-0.5">
                  <div className="relative w-full h-full rounded-[9px] overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      sizes="(max-width: 640px) 44px, 52px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  {/* Row 1: Name + Flag Badge */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                      {game.name}
                    </span>

                    <span
                      className={`text-[7px] sm:text-[7.5px] font-black px-1.5 py-[1px] rounded-md uppercase tracking-wider border ${game.tagBadge} shrink-0`}
                    >
                      {game.flag} {game.tag}
                    </span>
                  </div>

                  {/* Row 2: Feature Text */}
                  <p className="text-[8px] sm:text-[9px] text-[var(--muted)] font-semibold truncate leading-tight">
                    {game.feature}
                  </p>
                </div>

                {/* Micro chevron arrow */}
                <FiChevronRight
                  size={12}
                  className="text-[var(--muted)]/50 group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
