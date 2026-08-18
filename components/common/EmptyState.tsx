"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons";
import { motion } from "framer-motion";

export interface EmptyStateProps {
  /** Icon component (Lucide icon or React-icons) */
  icon?: LucideIcon | IconType | React.ComponentType<{ size?: number; className?: string }>;
  /** Primary headline (e.g. "No Orders Found") */
  title: string;
  /** Optional secondary explanatory text */
  description?: string;
  /** Optional action button or element (e.g. "Clear Filters", "Add Item") */
  action?: React.ReactNode;
  /** Size variant controlling padding and scale */
  size?: "sm" | "md" | "lg";
  /** Border & background style */
  variant?: "dashed" | "card" | "plain";
  /** Extra CSS classes */
  className?: string;
  /** Additional custom children content */
  children?: React.ReactNode;
}

const SIZE_STYLES = {
  sm: {
    container: "py-10 px-4",
    iconSize: 32,
    titleClass: "text-[10px] sm:text-xs",
    descClass: "text-[9px]",
  },
  md: {
    container: "py-16 px-6",
    iconSize: 42,
    titleClass: "text-xs sm:text-sm",
    descClass: "text-[10px] sm:text-xs",
  },
  lg: {
    container: "py-20 px-8",
    iconSize: 48,
    titleClass: "text-sm sm:text-base",
    descClass: "text-xs",
  },
};

const VARIANT_STYLES = {
  dashed: "border border-dashed border-[var(--border)] bg-[var(--card)]/10 rounded-3xl",
  card: "border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm rounded-3xl shadow-sm",
  plain: "bg-transparent",
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  variant = "dashed",
  className = "",
  children,
}: EmptyStateProps) {
  const currentSize = SIZE_STYLES[size] || SIZE_STYLES.md;
  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.dashed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex flex-col items-center justify-center text-center select-none ${currentSize.container} ${currentVariant} ${className}`}
    >
      {Icon && (
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--foreground)]/[0.03] border border-[var(--border)]/60 flex items-center justify-center text-[var(--muted)]/40 group-hover:text-[var(--accent)] transition-colors">
            <Icon size={currentSize.iconSize} className="opacity-70" />
          </div>
        </div>
      )}

      <h3 className={`font-black uppercase tracking-widest text-[var(--muted)]/80 ${currentSize.titleClass}`}>
        {title}
      </h3>

      {description && (
        <p className={`font-medium text-[var(--muted)]/60 max-w-sm mt-1 leading-relaxed ${currentSize.descClass}`}>
          {description}
        </p>
      )}

      {action && <div className="mt-4 flex items-center justify-center">{action}</div>}

      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
