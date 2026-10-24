"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { FiArrowRight, FiZap, FiShield } from "react-icons/fi";

export default function GameCardList({ game, isOutOfStock, index = 0 }) {
  const disabled = isOutOfStock(game.gameName);

  let displayTagName = game?.tagId?.tagName;
  let tagBg = game?.tagId?.tagBackground;
  let tagColor = game?.tagId?.tagColor;

  if (game?.gameSlug === "mobile-legends-philippines888") {
    displayTagName = "MLBB Small India";
    tagBg = "#991b1b";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "bgmi226") {
    displayTagName = "Indian";
    tagBg = "#1e3a8a";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "mobile-legends-united-states41" || game?.gameSlug?.includes("united-states")) {
    displayTagName = "US";
    tagBg = "#1e3a8a";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "mlbbbr178" || game?.gameSlug?.includes("br178")) {
    displayTagName = "Brazil";
    tagBg = "#15803d";
    tagColor = "#ffffff";
  } else if (game?.gameSlug === "mlbbtr112" || game?.gameSlug?.includes("tr112")) {
    displayTagName = "Turkey";
    tagBg = "#b91c1c";
    tagColor = "#ffffff";
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

        {/* AVATAR SYSTEM with tactical SVG frame */}
        <div className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 ml-2 mr-2 p-1.5 flex items-center justify-center overflow-hidden">
          
          {/* Decorative Tactical SVG Background */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/[0.08] via-transparent to-purple-500/[0.05] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Corner Tech Brackets SVG */}
            <svg
              className="absolute inset-0.5 w-[calc(100%-4px)] h-[calc(100%-4px)] text-[var(--accent)] opacity-40 group-hover:opacity-80 transition-opacity duration-300"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 0 14 L 0 0 L 14 0" stroke="currentColor" strokeWidth="2" />
              <path d="M 86 0 L 100 0 L 100 14" stroke="currentColor" strokeWidth="2" />
              <path d="M 0 86 L 0 100 L 14 100" stroke="currentColor" strokeWidth="2" />
              <path d="M 86 100 L 100 100 L 100 86" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Center main image */}
          <div className={`
            relative w-[90%] h-[90%] rounded-none border z-10 bg-[var(--background)] shadow-xs group-hover:scale-[1.03] transition-transform duration-300
            ${disabled
              ? "border-white/10"
              : "border-white/10"
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
              ${disabled ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}
            >
              {game.gameName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!disabled && (displayTagName || game.tagId) && (
              <span
                className="text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm flex items-center gap-1 leading-none"
                style={{
                  background: tagBg || game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.2)",
                  color: tagColor || game?.tagId?.tagColor || "#ffffff",
                  borderColor: tagBg ? `${tagBg}80` : (game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.3)"),
                }}
              >
                {displayTagName === "Manual" && <FiZap size={10} fill="currentColor" />}
                {displayTagName || game?.tagId?.tagName}
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
      </Link>
    </div>
  );
}

