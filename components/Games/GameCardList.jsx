"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { FiArrowRight, FiZap, FiShield } from "react-icons/fi";

export default function GameCardList({ game, isOutOfStock, index = 0 }) {
  const disabled = isOutOfStock(game.gameName);

  let displayTagName = game?.tagId?.tagName;
  if (game?.gameSlug === "mobile-legends-philippines888") {
    displayTagName = "Mlbb small";
  } else if (game?.gameSlug === "bgmi226") {
    displayTagName = "indian";
  }

  return (
    <div>
      <Link
        href={disabled ? "#" : `/games/${game.gameSlug}`}
        className={`group relative flex items-center gap-6 p-4 rounded-none border overflow-hidden
        ${disabled
            ? "opacity-40 grayscale cursor-not-allowed border-[var(--border)] bg-[var(--card)]/50"
            : "border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-2xl hover:border-[var(--accent)]/40 hover:bg-[var(--card)]/80 shadow-sm"
          }`}
      >
        {/* LIGHT SWEEP EFFECT REMOVED */}

        {/* AVATAR SYSTEM with 3-stacked effect */}
        <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 ml-2 mr-2">
          
          {/* Left background image */}
          <div className="absolute inset-0 z-0 transform -rotate-[15deg] -translate-x-4 sm:-translate-x-5 scale-90 opacity-50 blur-[2px] transition-transform duration-300 group-hover:-rotate-[20deg] group-hover:-translate-x-6">
            <Image
              src={game.gameImageId?.image || logo}
              alt=""
              fill
              sizes="120px"
              quality={60}
              aria-hidden="true"
              className="object-cover rounded-none border border-white/5"
            />
          </div>

          {/* Right background image */}
          <div className="absolute inset-0 z-0 transform rotate-[15deg] translate-x-4 sm:translate-x-5 scale-90 opacity-50 blur-[2px] transition-transform duration-300 group-hover:rotate-[20deg] group-hover:translate-x-6">
            <Image
              src={game.gameImageId?.image || logo}
              alt=""
              fill
              sizes="120px"
              quality={60}
              aria-hidden="true"
              className="object-cover rounded-none border border-white/5"
            />
          </div>

          {/* Center main image */}
          <div className={`
            relative w-full h-full rounded-none border z-10 transition-transform duration-300 group-hover:scale-105 shadow-lg bg-[var(--background)]
            ${disabled
              ? "border-white/10"
              : "border-white/10 group-hover:border-[var(--accent)]/30"
            }
          `}>
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              sizes="120px"
              quality={60}
              className={`object-cover rounded-none
                ${disabled ? "" : ""}
              `}
            />
            {/* INNER GLOW */}
            {!disabled && (
              <div className="absolute inset-0 rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
            )}
          </div>
        </div>

        {/* INFO SYSTEM */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex flex-col mb-1.5 sm:mb-2">
            <h3
              className={`text-base sm:text-lg font-[1000] uppercase italic tracking-tighter leading-tight
              ${disabled ? "text-[var(--muted)]" : "text-[var(--foreground)] group-hover:text-[var(--accent)]"}`}
            >
              {game.gameName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!disabled && game.tagId && (
              <span
                className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-[0.12em] px-3 py-1 rounded-lg border shadow-sm flex items-center gap-1.5"
                style={{
                  background: game.tagId.tagBackground,
                  color: game.tagId.tagColor,
                  borderColor: game.tagId.tagBackground,
                }}
              >
                {displayTagName === "Manual" && <FiZap size={12} fill="currentColor" />}
                {displayTagName}
              </span>
            )}
            {disabled && (
              <span className="px-3 py-1 rounded-lg bg-red-400/10 border border-red-400/20 text-red-500/60 text-[7.5px] sm:text-[8px] font-black uppercase tracking-widest italic">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* ACTION SYSTEM */}
        {!disabled && (
          <div className="relative shrink-0 pr-3 sm:pr-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:text-[var(--background)] group-hover:bg-[var(--accent)]">
              <FiArrowRight size={20} />
            </div>
          </div>
        )}

        {/* HOVER ACCENT LINE */}
        {!disabled && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--accent)] opacity-0 group-hover:opacity-100 rounded-r-full shadow-[0_0_15px_var(--accent)]" />
        )}
      </Link>
    </div>
  );
}

