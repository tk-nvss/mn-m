"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export interface LoadingSpinnerProps {
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Color variant */
  color?: "current" | "white" | "accent" | "muted" | "primary";
  /** Thickness of the spinner ring */
  thickness?: "thin" | "normal" | "thick";
  /** Custom additional classes */
  className?: string;
}

const SIZE_MAP = {
  xs: "w-3 h-3 border-[1.5px]",
  sm: "w-4 h-4 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-7 h-7 border-[2.5px]",
  xl: "w-10 h-10 border-[3px]",
};

const COLOR_MAP = {
  current: "border-current/20 border-t-current",
  white: "border-white/25 border-t-white",
  accent: "border-[var(--accent)]/20 border-t-[var(--accent)]",
  muted: "border-[var(--muted)]/20 border-t-[var(--muted)]",
  primary: "border-[var(--foreground)]/20 border-t-[var(--foreground)]",
};

/**
 * Lightweight, accessible, CSS-powered animated spinner for buttons, inputs, and inline elements.
 */
export function LoadingSpinner({
  size = "md",
  color = "current",
  thickness,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const colorClass = COLOR_MAP[color] || COLOR_MAP.current;
  const thicknessClass =
    thickness === "thin"
      ? "!border-[1.5px]"
      : thickness === "thick"
      ? "!border-[3px]"
      : "";

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded-full animate-spin shrink-0 ${sizeClass} ${colorClass} ${thicknessClass} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface PageLoaderProps {
  /** Text message below the spinner */
  message?: string;
  /** Whether to show a full-screen overlay or fill parent container */
  fullScreen?: boolean;
  /** Whether to show the branded animated logo */
  showLogo?: boolean;
  /** Extra CSS classes */
  className?: string;
}

/**
 * Beautiful full-page or section loading screen with glowing ambient backdrops and logo animation.
 */
export function PageLoader({
  message = "Loading...",
  fullScreen = false,
  showLogo = true,
  className = "",
}: PageLoaderProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-[1200] bg-[var(--background)]/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
    : "min-h-[300px] w-full flex flex-col items-center justify-center p-8";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`${containerClass} ${className}`}
    >
      {/* GLOW AURA */}
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute -inset-4 rounded-full bg-[var(--accent)]/15 blur-xl animate-pulse" />

        {showLogo ? (
          <div className="relative mb-4 group">
            <div className="w-16 h-16 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center p-3 shadow-lg shadow-black/5">
              <Image
                src="/logo.png"
                alt="Loading"
                width={40}
                height={40}
                className="object-contain animate-pulse"
                priority
              />
            </div>
            {/* Orbiting mini spinner */}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--card)] border border-[var(--border)] shadow-sm">
              <LoadingSpinner size="xs" color="accent" />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <LoadingSpinner size="lg" color="accent" />
          </div>
        )}

        {message && (
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">
              {message}
            </p>
            <span className="text-[9px] font-bold text-[var(--muted)]/50 uppercase tracking-widest">
              Please wait a moment
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default LoadingSpinner;
