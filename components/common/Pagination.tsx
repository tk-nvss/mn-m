"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Optional total number of items */
  totalItems?: number;
  /** Callback when page is changed */
  onPageChange: (newPage: number) => void;
  /** Sizing variant */
  size?: "sm" | "md";
  /** Visual variant: 'simple' (Prev/Next buttons) or 'numbered' (includes number pills) */
  variant?: "simple" | "numbered" | "compact";
  /** Whether pagination controls are disabled (e.g. during fetch) */
  disabled?: boolean;
  /** Item label for total count (e.g. "Orders", "Users", "Records"). Defaults to "Records" */
  itemLabel?: string;
  /** Whether to hide pagination if totalPages <= 1. Defaults to false */
  hideOnSinglePage?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  size = "sm",
  variant = "simple",
  disabled = false,
  itemLabel = "Records",
  hideOnSinglePage = false,
  className = "",
}: PaginationProps) {
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.min(Math.max(1, page), safeTotalPages);

  const handlePrev = () => {
    if (safeCurrentPage > 1 && !disabled) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < safeTotalPages && !disabled) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  // Helper to generate numbered pills with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (safeTotalPages <= 5) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 2) {
        pages.push(1, "...", safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", safeTotalPages);
      }
    }
    return pages;
  };

  const buttonHeight = size === "sm" ? "h-8 px-3 text-[9px]" : "h-9 px-4 text-xs";
  const iconSize = size === "sm" ? 12 : 14;

  return (
    <div
      className={`flex items-center justify-between gap-4 pt-4 border-t border-[var(--border)] select-none ${className}`}
    >
      {/* ── LEFT: INFO / TOTAL COUNTER ── */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
          Page <b className="text-[var(--foreground)] font-black">{safeCurrentPage}</b> of{" "}
          <b className="text-[var(--foreground)] font-black">{safeTotalPages}</b>
        </span>

        {totalItems !== undefined && (
          <span className="hidden sm:inline-block text-[9px] font-bold text-[var(--muted)]/60 uppercase tracking-widest pl-2 border-l border-[var(--border)]">
            {totalItems.toLocaleString()} {itemLabel}
          </span>
        )}
      </div>

      {/* ── RIGHT: NAVIGATION CONTROLS ── */}
      <div className="flex items-center gap-1.5">
        {/* FIRST PAGE (Only in numbered variant on wide screens) */}
        {variant === "numbered" && safeTotalPages > 3 && (
          <button
            type="button"
            aria-label="First page"
            disabled={safeCurrentPage <= 1 || disabled}
            onClick={() => onPageChange(1)}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]/40 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsLeft size={iconSize} />
          </button>
        )}

        {/* PREV BUTTON */}
        <button
          type="button"
          aria-label="Previous page"
          disabled={safeCurrentPage <= 1 || disabled}
          onClick={handlePrev}
          className={`flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer ${buttonHeight}`}
        >
          <ChevronLeft size={iconSize} />
          <span className="hidden xs:inline">Prev</span>
        </button>

        {/* NUMBERED BUTTONS */}
        {variant === "numbered" && (
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Go to page ${p}`}
                  disabled={disabled}
                  onClick={() => onPageChange(p)}
                  className={`h-8 min-w-8 px-2 rounded-xl text-[10px] font-black tracking-wider transition-all cursor-pointer ${
                    p === safeCurrentPage
                      ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25"
                      : "border border-[var(--border)] bg-[var(--card)]/40 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04]"
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span
                  key={idx}
                  className="px-1 text-[10px] font-bold text-[var(--muted)]/40 select-none"
                >
                  ...
                </span>
              )
            )}
          </div>
        )}

        {/* NEXT BUTTON */}
        <button
          type="button"
          aria-label="Next page"
          disabled={safeCurrentPage >= safeTotalPages || disabled}
          onClick={handleNext}
          className={`flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 font-black uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer ${buttonHeight}`}
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight size={iconSize} />
        </button>

        {/* LAST PAGE (Only in numbered variant on wide screens) */}
        {variant === "numbered" && safeTotalPages > 3 && (
          <button
            type="button"
            aria-label="Last page"
            disabled={safeCurrentPage >= safeTotalPages || disabled}
            onClick={() => onPageChange(safeTotalPages)}
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]/40 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsRight size={iconSize} />
          </button>
        )}
      </div>
    </div>
  );
}
