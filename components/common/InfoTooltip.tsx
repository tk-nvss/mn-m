"use client";

import React, { useState } from "react";
import { FiInfo } from "react-icons/fi";

interface InfoTooltipProps {
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  iconClassName?: string;
}

export default function InfoTooltip({
  content,
  position = "top",
  className = "",
  iconClassName = "",
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-900 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-900 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-900 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-neutral-900 border-y-transparent border-l-transparent",
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((prev) => !prev)}
    >
      <button
        type="button"
        aria-label="Info"
        className={`inline-flex items-center justify-center text-neutral-400 hover:text-[var(--foreground)] transition-colors focus:outline-none cursor-pointer ${iconClassName}`}
      >
        <FiInfo size={13} />
      </button>

      {open && (
        <div
          role="tooltip"
          className={`absolute z-[99999] pointer-events-none whitespace-normal min-w-[200px] max-w-xs px-2.5 py-1.5 rounded-lg bg-neutral-900/95 text-neutral-200 text-[11px] leading-relaxed shadow-xl border border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute border-4 ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
}
