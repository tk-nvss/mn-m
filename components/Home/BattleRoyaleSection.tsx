"use client";

import Link from "next/link";
import Image from "next/image";
import { FiTarget, FiZap } from "react-icons/fi";

const brGames = [
  {
    id: "bgmi",
    title: "Battlegrounds Mobile India",
    shortName: "BGMI",
    tag: "Trending",
    desc: "Top up UC instantly with UPI",
    color: "from-orange-500 to-red-600",
    image: "/game-assets/bgmi-logo.webp",
    link: "/games/bgmi226",
    icon: <FiTarget size={14} />
  },
  {
    id: "pubg",
    title: "PUBG Mobile",
    shortName: "PUBG",
    tag: "Global",
    desc: "Global UC recharge fast delivery",
    color: "from-amber-400 to-yellow-600",
    image: "/game-assets/bgmi-logo.webp", // Fallback to BGMI logo until PUBG logo is available
    link: "/games/pubg-mobile138",
    icon: <FiZap size={14} />
  }
];

export default function BattleRoyaleSection() {
  return (
    <section className="relative py-4 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full" />
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-[var(--foreground)]">
              Battle Royale
            </h2>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {brGames.map((game) => (
            <Link 
              key={game.id} 
              href={game.link}
              className="group relative overflow-hidden rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Subtle background glow on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${game.color} transition-opacity duration-500`} />
              
              <div className="p-3 sm:p-4 flex items-center gap-3 relative z-10">
                {/* Logo Box */}
                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-[12px] bg-gradient-to-br ${game.color} p-[1px] shadow-inner`}>
                  <div className="w-full h-full bg-[var(--background)] rounded-[11px] overflow-hidden flex items-center justify-center relative">
                    <Image 
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] sm:text-xs font-black text-[var(--foreground)] truncate uppercase tracking-widest">
                      {game.shortName}
                    </span>
                    <span className={`text-[7px] sm:text-[8px] font-bold px-1.5 py-[1px] rounded uppercase tracking-widest text-white bg-gradient-to-r ${game.color} shadow-sm`}>
                      {game.tag}
                    </span>
                  </div>
                  <h3 className="text-[9px] sm:text-[10px] text-[var(--muted)] font-bold tracking-wide leading-tight mb-1 truncate">
                    {game.title}
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-[var(--foreground)] opacity-60 truncate">
                    {game.desc}
                  </p>
                </div>
                
                {/* Action Icon */}
                <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--foreground)]/50 group-hover:text-[var(--foreground)] group-hover:bg-[var(--accent)]/10 transition-all shrink-0">
                  {game.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
