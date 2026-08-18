/**
 * Unified formatting utilities for currency, numbers, dates, and times.
 */

// ==========================================
// 💰 CURRENCY & NUMBER FORMATTERS
// ==========================================

export interface CurrencyFormatOptions {
  /** Currency code or symbol. Defaults to 'INR' ('₹') */
  currency?: "INR" | "USD" | "USDT" | "BBC" | string;
  /** Number of decimal places. Defaults to 0 for whole numbers, or 2 if decimals exist */
  decimals?: number;
  /** Whether to show the currency symbol or prefix. Defaults to true */
  showSymbol?: boolean;
  /** Compact notation (e.g. 1.2K, 3.5L, 1M). Defaults to false */
  compact?: boolean;
}

/**
 * Format a number or string into Indian / International currency format.
 * Examples:
 *   formatCurrency(150) -> "₹150"
 *   formatCurrency(125000.5, { decimals: 2 }) -> "₹1,25,000.50"
 *   formatCurrency(2500000, { compact: true }) -> "₹2.5M"
 *   formatCurrency(10.5, { currency: "USDT" }) -> "10.50 USDT"
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: CurrencyFormatOptions = {}
): string {
  if (amount === null || amount === undefined || amount === "") {
    return options.showSymbol !== false ? "₹0" : "0";
  }

  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return options.showSymbol !== false ? "₹0" : "0";

  const {
    currency = "INR",
    decimals = num % 1 === 0 ? 0 : 2,
    showSymbol = true,
    compact = false,
  } = options;

  if (compact) {
    const compactFormatted = new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num);

    if (!showSymbol) return compactFormatted;
    if (currency === "INR") return `₹${compactFormatted}`;
    if (currency === "USD") return `$${compactFormatted}`;
    return `${compactFormatted} ${currency}`;
  }

  const formattedNum = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

  if (!showSymbol) return formattedNum;

  switch (currency.toUpperCase()) {
    case "INR":
      return `₹${formattedNum}`;
    case "USD":
      return `$${formattedNum}`;
    case "USDT":
      return `${formattedNum} USDT`;
    case "BBC":
      return `${formattedNum} BBC`;
    default:
      return `${currency} ${formattedNum}`;
  }
}

/**
 * Format a general number with commas according to locale.
 * Example:
 *   formatNumber(150000) -> "1,50,000"
 */
export function formatNumber(
  value: number | string | null | undefined,
  options: { decimals?: number; compact?: boolean; locale?: string } = {}
): string {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  const { decimals, compact = false, locale = "en-IN" } = options;

  return new Intl.NumberFormat(locale, {
    ...(decimals !== undefined
      ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
      : {}),
    ...(compact ? { notation: "compact", maximumFractionDigits: 1 } : {}),
  }).format(num);
}

/**
 * Format Bluebuff Coins (BBC) with formatting and suffix.
 * Example:
 *   formatCoins(5000) -> "5,000 BBC"
 */
export function formatCoins(
  coins: number | string | null | undefined,
  showSuffix = true
): string {
  const formatted = formatNumber(coins);
  return showSuffix ? `${formatted} BBC` : formatted;
}

/**
 * Format percentages (e.g. discounts, margins, changes).
 * Example:
 *   formatPercent(12.5) -> "12.5%"
 *   formatPercent(5, { showSign: true }) -> "+5%"
 */
export function formatPercent(
  value: number | string | null | undefined,
  options: { decimals?: number; showSign?: boolean } = {}
): string {
  if (value === null || value === undefined || value === "") return "0%";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";

  const { decimals = 0, showSign = false } = options;
  const sign = showSign && num > 0 ? "+" : "";
  return `${sign}${num.toFixed(decimals)}%`;
}

// ==========================================
// 📅 DATE & TIME FORMATTERS
// ==========================================

export type DateInput = string | number | Date | null | undefined;

export interface DateFormatOptions {
  /**
   * - 'short': "19 Aug, 2026"
   * - 'medium': "19 Aug 2026, 12:30 AM"
   * - 'long': "August 19, 2026"
   * - 'dateOnly': "19/08/2026"
   * - 'timeOnly': "12:30 AM"
   * - 'monthDay': "Aug 19"
   */
  style?: "short" | "medium" | "long" | "dateOnly" | "timeOnly" | "monthDay";
  /** Fallback string if date is invalid. Default is '--' */
  fallback?: string;
  /** Locale. Defaults to 'en-IN' */
  locale?: string;
}

function parseDate(input: DateInput): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Safely format any date input into a clean localized string.
 * Examples:
 *   formatDate("2026-08-19T00:10:00Z") -> "19 Aug, 2026"
 *   formatDate(new Date(), { style: "medium" }) -> "19 Aug 2026, 12:30 AM"
 *   formatDate(null) -> "--"
 */
export function formatDate(
  input: DateInput,
  options: DateFormatOptions = {}
): string {
  const date = parseDate(input);
  const { style = "short", fallback = "--", locale = "en-IN" } = options;

  if (!date) return fallback;

  switch (style) {
    case "short":
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    case "medium":
      return `${date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}, ${date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;

    case "long":
      return date.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    case "dateOnly":
      return date.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    case "timeOnly":
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    case "monthDay":
      return date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });

    default:
      return date.toLocaleDateString(locale);
  }
}

/**
 * Safely format time string (12-hour format e.g. "02:45 PM").
 * Example:
 *   formatTime(item.createdAt) -> "02:45 PM"
 */
export function formatTime(
  input: DateInput,
  fallback = "--",
  locale = "en-IN"
): string {
  const date = parseDate(input);
  if (!date) return fallback;

  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Convenient shortcut for both date and time (e.g. "19 Aug 2026, 02:45 PM").
 */
export function formatDateTime(input: DateInput, fallback = "--"): string {
  return formatDate(input, { style: "medium", fallback });
}

/**
 * Human-readable relative time (e.g. "Just now", "5m ago", "2h ago", "3d ago").
 * Example:
 *   formatRelativeTime(order.createdAt) -> "12m ago"
 */
export function formatRelativeTime(input: DateInput, fallback = "--"): string {
  const date = parseDate(input);
  if (!date) return fallback;

  const now = Date.now();
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}
