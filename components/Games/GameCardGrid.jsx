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
          
          {/* Left background image */}
          <div className="absolute w-[80%] h-[88%] z-0 transform -rotate-[10deg] -translate-x-3.5 sm:-translate-x-5 scale-95 opacity-40 blur-[2px] shadow-xl transition-all duration-300 group-hover:-rotate-[12deg] group-hover:-translate-x-5 sm:group-hover:-translate-x-7 group-hover:opacity-60">
            <Image
              src={game.gameImageId?.image || logo}
              alt=""
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              quality={60}
              aria-hidden="true"
              className={`object-cover rounded-none border border-white/10
                ${disabled ? "grayscale blur-[2px]" : ""}`}
            />
          </div>

          {/* Right background image */}
          <div className="absolute w-[80%] h-[88%] z-0 transform rotate-[10deg] translate-x-3.5 sm:translate-x-5 scale-95 opacity-40 blur-[2px] shadow-xl transition-all duration-300 group-hover:rotate-[12deg] group-hover:translate-x-5 sm:group-hover:translate-x-7 group-hover:opacity-60">
            <Image
              src={game.gameImageId?.image || logo}
              alt=""
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              quality={60}
              aria-hidden="true"
              className={`object-cover rounded-none border border-white/10
                ${disabled ? "grayscale blur-[2px]" : ""}`}
            />
          </div>

          {/* Main card */}
          <div className="relative w-[92%] h-[98%] z-10 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] border border-white/10 bg-[var(--background)]">
            <Image
              src={game.gameImageId?.image || logo}
              alt={game.gameName}
              fill
              sizes="(max-width: 768px) 33vw, 25vw"
              quality={60}
              className={`object-cover rounded-none
                ${disabled
                  ? "grayscale blur-[2px]"
                  : ""
                }`}
            />

          {/* OVERLAYS */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80" />

          {/* TAG / BADGE */}
          {!disabled && (displayTagName || game.tagId) && (
            <div className="absolute top-1.5 left-1.5 z-20">
              <span
                className="text-[6.5px] sm:text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] shadow-md border flex items-center gap-0.5 leading-none backdrop-blur-sm"
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

          {/* VIEW BUTTON */}
          {!disabled && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
                <FiEye size={16} />
              </div>
            </div>
          )}

          {/* OUT OF STOCK OVERLAY */}
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <span className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-[8px] font-black uppercase tracking-widest italic shadow-2xl text-center leading-tight">
                OUT OF STOCK
              </span>
            </div>
          )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-2 sm:p-2.5 relative flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-1.5">
            <h3
              className={`text-[10px] sm:text-xs font-black uppercase tracking-tight leading-tight flex-1
              ${disabled ? "text-[var(--muted)]" : "text-[var(--foreground)] group-hover:text-[var(--accent)]"}`}
            >
              {game.gameName}
            </h3>
            {!disabled && (
              <FiChevronRight className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0 transition-transform group-hover:translate-x-0.5" size={12} />
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
