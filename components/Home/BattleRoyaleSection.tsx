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
    image: "/game-assets/bgmi_india.png",
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
    image: "/game-assets/bgmi-logo.webp",
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

        {/* Cards Grid - Always Side-by-Side 2 Columns */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {brGames.map((game) => (
            <Link 
              key={game.id} 
              href={game.link}
              className="group relative overflow-hidden rounded-2xl bg-[var(--card)]/50 border border-[var(--border)] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Subtle background glow on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${game.color} transition-opacity duration-500`} />
              
              <div className="p-2.5 sm:p-3.5 flex items-center gap-2 sm:gap-3 relative z-10">
                {/* Logo Box */}
                <div className={`relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl bg-gradient-to-br ${game.color} p-[1px] shadow-sm`}>
                  <div className="w-full h-full bg-[var(--background)] rounded-[11px] overflow-hidden flex items-center justify-center relative">
                    <Image 
                      src={game.image}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0 justify-center">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[10px] sm:text-xs font-black text-[var(--foreground)] truncate uppercase tracking-widest">
                      {game.shortName}
                    </span>
                    <span className={`text-[7px] font-bold px-1.5 py-[0.5px] rounded uppercase tracking-widest text-white bg-gradient-to-r ${game.color} shadow-sm shrink-0`}>
                      {game.tag}
                    </span>
                  </div>
                  <p className="text-[8px] sm:text-[9.5px] text-[var(--muted)] font-medium truncate leading-tight">
                    {game.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
