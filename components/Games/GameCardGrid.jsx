"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { FiChevronRight, FiEye, FiZap } from "react-icons/fi";

export default function GameCardGrid({ game, isOutOfStock, index = 0 }) {
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
    <div className="h-full">
      <Link
        href={disabled ? "#" : `/games/${game.gameSlug}`}
        className={`group relative flex flex-col h-full rounded-none overflow-hidden border
        ${disabled
            ? "opacity-60 cursor-not-allowed border-[var(--border)] bg-[var(--background)]"
            : "border-[var(--border)] bg-[var(--card)]/40 hover:border-[var(--accent)]/50 shadow-sm transition-all duration-300"
          }`}
      >
        {/* IMAGE CONTAINER */}
        <div className="relative w-full aspect-square p-1.5 sm:p-2 flex items-center justify-center shrink-0 bg-black/10 overflow-hidden">
          
          {/* Decorative Tactical SVG Background */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
            {/* Ambient subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/[0.08] via-transparent to-purple-500/[0.05] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Tactical Dot Matrix Grid SVG */}
            <svg
              className="absolute inset-0 w-full h-full text-[var(--foreground)] opacity-[0.06] dark:opacity-[0.10] group-hover:opacity-[0.15] transition-opacity duration-300"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id={`dot-grid-${game.gameSlug || index}`} width="12" height="12" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="0.75" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#dot-grid-${game.gameSlug || index})`} />
            </svg>

            {/* Corner Tech Brackets SVG */}
            <svg
              className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] text-[var(--accent)] opacity-40 group-hover:opacity-80 transition-opacity duration-300"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 0 12 L 0 0 L 12 0" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 88 0 L 100 0 L 100 12" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 0 88 L 0 100 L 12 100" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 88 100 L 100 100 L 100 88" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Main card */}
          <div className="relative w-[90%] h-[92%] z-10 border border-white/10 bg-[var(--background)] shadow-sm group-hover:scale-[1.03] transition-transform duration-300">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              quality={75}
              className={`object-cover rounded-none
                ${disabled
                  ? "grayscale blur-[2px]"
                  : ""
                }`}
            />

          {/* OVERLAYS */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

          {/* TAG / BADGE */}
          {!disabled && (displayTagName || game.tagId) && (
            <div className="absolute top-1.5 left-1.5 z-20">
              <span
                className="text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] border flex items-center gap-0.5 leading-none"
                style={{
                  background: tagBg || game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.2)",
                  color: tagColor || game?.tagId?.tagColor || "#ffffff",
                  borderColor: tagBg ? `${tagBg}80` : (game?.tagId?.tagBackground || "rgba(var(--accent-rgb), 0.3)"),
                }}
              >
                {displayTagName === "Manual" && <FiZap size={8} fill="currentColor" />}
                {displayTagName || game?.tagId?.tagName}
              </span>
            </div>
          )}

          {/* OUT OF STOCK OVERLAY */}
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-[8px] font-black uppercase tracking-widest italic text-center leading-tight">
                OUT OF STOCK
              </span>
            </div>
          )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-2 sm:p-2.5 relative flex-1 flex flex-col justify-center">
          <div className="flex items-start justify-between gap-1">
            <h3
              className={`text-[10px] sm:text-xs font-black uppercase tracking-tight leading-snug flex-1 line-clamp-2
              ${disabled ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}
            >
              {game.gameName}
            </h3>
            {!disabled && (
              <FiChevronRight className="text-[var(--muted)] shrink-0 mt-0.5" size={12} />
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
