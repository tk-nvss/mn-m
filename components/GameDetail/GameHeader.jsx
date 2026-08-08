"use client";

import Image from "next/image";
import { FiZap, FiShield, FiCheckCircle } from "react-icons/fi";

export default function GameHeader({ game }) {
  if (!game) return null;

  return (
    <div className="relative max-w-6xl mx-auto mb-2 mt-0">
      <div className="relative p-2 md:p-2.5 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex items-center justify-between gap-3">
        {/* LEFT: Game Identity */}
        <div className="relative z-10 flex items-center gap-2.5 md:gap-3">
          {/* Clean Game Icon Container */}
          <div className="relative shrink-0">
            <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-xl overflow-hidden bg-[var(--background)] border border-[var(--border)]">
              <Image
                src={game.gameImageId?.image || "/logo.png"}
                alt={game.gameName}
                fill
                className="object-cover"
              />
            </div>

            {/* Live Indicator Dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--card)] rounded-full flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-emerald-500 rounded-full" />
            </div>
          </div>

          {/* Name & Origin Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-sm md:text-base font-black tracking-tight text-[var(--foreground)] leading-tight line-clamp-2 uppercase">
                {game.gameName}
              </h1>
              <FiCheckCircle className="text-[var(--accent)]" size={12} />
            </div>


            {game.isValidationRequired === false && game.gameDescription && (
              <p className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-tight mt-0.5 opacity-80 italic line-clamp-1">
                {game.gameDescription}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Minimalist Trust Badges */}
        <div className="flex items-center gap-1.5 relative z-10 shrink-0">
          {/* Instant/Manual Delivery Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border
            ${game.isValidationRequired === false
              ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
              : "bg-[var(--accent)]/5 border-[var(--accent)]/10 text-[var(--accent)]"
            }`}>
            <FiZap size={10} fill="currentColor" />
            <span className="hidden sm:inline text-[8px] font-bold uppercase tracking-widest text-[var(--foreground)]">
              {(game.isValidationRequired === false && game.gameSlug !== 'bgmi-manual') ? "Manual" : "Instant"}
            </span>
          </div>

          {/* Secure Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
            <FiShield size={10} />
            <span className="hidden sm:inline text-[8px] font-bold uppercase tracking-widest text-[var(--foreground)]">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
