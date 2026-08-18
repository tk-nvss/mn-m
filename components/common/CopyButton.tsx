"use client";

import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export interface CopyButtonProps {
  /** The text to copy to the clipboard */
  text: string;
  /** Optional button label (e.g. "Copy ID", "Copy Code") */
  label?: string;
  /** Optional label override when copied (defaults to "Copied!") */
  copiedLabel?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg";
  /** Visual style variant */
  variant?: "ghost" | "subtle" | "pill" | "outline";
  /** Callback fired after successfully copying */
  onCopy?: () => void;
  /** How long the "Copied" check state stays active in ms. Defaults to 2000 */
  timeout?: number;
  /** Whether to stop event propagation (e.g. inside table row clicks). Defaults to true */
  stopPropagation?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Title / tooltip text */
  title?: string;
}

const SIZE_STYLES = {
  xs: {
    btn: "px-1.5 py-0.5 text-[8px] gap-1",
    icon: 10,
  },
  sm: {
    btn: "px-2 py-1 text-[9px] gap-1.5",
    icon: 12,
  },
  md: {
    btn: "px-3 py-1.5 text-xs gap-2",
    icon: 14,
  },
  lg: {
    btn: "px-4 py-2 text-sm gap-2.5",
    icon: 16,
  },
};

const VARIANT_STYLES = {
  ghost:
    "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]",
  subtle:
    "bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08]",
  pill:
    "rounded-full bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.08]",
  outline:
    "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/40",
};

export default function CopyButton({
  text,
  label,
  copiedLabel = "Copied!",
  size = "sm",
  variant = "ghost",
  onCopy,
  timeout = 2000,
  stopPropagation = true,
  className = "",
  title,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) onCopy();

      setTimeout(() => {
        setCopied(false);
      }, timeout);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const currentSize = SIZE_STYLES[size] || SIZE_STYLES.sm;
  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.ghost;
  const isIconOnly = !label;
  const roundedClass = variant === "pill" ? "rounded-full" : "rounded-lg";

  return (
    <button
      type="button"
      aria-label={title || label || "Copy to clipboard"}
      title={title || (copied ? "Copied!" : "Copy to clipboard")}
      onClick={handleCopy}
      className={`inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 select-none active:scale-95 cursor-pointer shrink-0 ${
        isIconOnly ? "p-1.5" : currentSize.btn
      } ${roundedClass} ${
        copied
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : currentVariant
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 text-emerald-400"
          >
            <FiCheck size={currentSize.icon} className="stroke-[2.5]" />
            {!isIconOnly && (
              <span className="leading-none text-[8.5px] font-black uppercase tracking-widest text-emerald-400">
                {copiedLabel}
              </span>
            )}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            <FiCopy size={currentSize.icon} />
            {!isIconOnly && <span className="leading-none">{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
