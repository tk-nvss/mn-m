"use client";

import Image from "next/image";
import { FiZap, FiShield, FiCheckCircle } from "react-icons/fi";

export default function GameHeader({ game }) {
  if (!game) return null;

  return (
    <div className="relative w-full mb-1.5 mt-0.5">
      <div className="relative py-1 px-0.5 flex items-center justify-between gap-3">
        {/* LEFT: Game Identity */}
        <div className="relative z-10 flex items-center gap-2.5 md:gap-3 min-w-0">
          {/* Clean Game Icon Container */}
          <div className="relative shrink-0">
            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)]">
              <Image
                src={game.gameImageId?.image || "/logo.png"}
                alt={game.gameName}
                fill
                className="object-cover"
              />
            </div>

            {/* Live Indicator Dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--background)] rounded-full flex items-center justify-center p-[2px]">
              <div className="w-full h-full bg-emerald-500 rounded-full" />
            </div>
          </div>

          {/* Name & Origin Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="text-sm md:text-base font-black tracking-tight text-[var(--foreground)] leading-tight truncate uppercase">
                {game.gameName}
              </h1>
              <FiCheckCircle className="text-[var(--accent)] shrink-0" size={13} />
            </div>

            {/* Region / Tag below title */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Boolean(game.tagId?.tagName || game.gameSlug?.includes("india") || game.gameSlug?.includes("all-region")) && (
                <span className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  {game.tagId?.tagName || (game.gameSlug?.includes("all-region") ? "All Region" : "Indian Region")}
                </span>
              )}
              {game.isValidationRequired === false && game.gameDescription && (
                <span className="text-[8px] font-bold text-[var(--muted)]/80 uppercase tracking-tight truncate">
                  {game.gameDescription}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Minimalist Trust Badges */}
        <div className="flex items-center gap-1.5 relative z-10 shrink-0">
          {/* Instant/Manual Delivery Badge */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border
            ${game.isValidationRequired === false
              ? "bg-amber-500/10 border-amber-500/25 text-amber-500"
              : "bg-blue-500/10 border-blue-500/25 text-blue-500"
            }`}>
            <FiZap size={11} fill="currentColor" />
            <span className="hidden sm:inline text-[8px] font-bold uppercase tracking-widest text-[var(--foreground)]">
              {(game.isValidationRequired === false && game.gameSlug !== 'bgmi-manual') ? "Manual" : "Instant"}
            </span>
          </div>

          {/* Secure Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-500">
            <FiShield size={11} />
            <span className="hidden sm:inline text-[8px] font-bold uppercase tracking-widest text-[var(--foreground)]">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
