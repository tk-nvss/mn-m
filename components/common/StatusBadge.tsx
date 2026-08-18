import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  Loader2,
  AlertTriangle,
  Radio,
  Ban,
  ShieldCheck,
} from "lucide-react";

export type StatusType =
  | "success"
  | "completed"
  | "active"
  | "approved"
  | "confirmed"
  | "live"
  | "verified"
  | "pending"
  | "processing"
  | "waiting"
  | "submitted"
  | "checking"
  | "delayed"
  | "failed"
  | "cancelled"
  | "rejected"
  | "banned"
  | "blocked"
  | "expired"
  | "refund"
  | "refunded"
  | "ended"
  | "closed"
  | "draft"
  | "inactive"
  | string;

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  animateIcon?: boolean;
  showDotPulse?: boolean;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // --- SUCCESS / ACTIVE STATES ---
  success: {
    label: "Success",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
    showDotPulse: true,
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: ShieldCheck,
  },
  live: {
    label: "Live",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: Radio,
    showDotPulse: true,
  },
  verified: {
    label: "Verified",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: ShieldCheck,
  },

  // --- PENDING / IN-PROGRESS STATES ---
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    className: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    icon: Loader2,
    animateIcon: true,
  },
  checking: {
    label: "Checking",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Loader2,
    animateIcon: true,
  },
  waiting: {
    label: "Waiting",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  submitted: {
    label: "Submitted",
    className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: Clock,
  },
  delayed: {
    label: "Delayed",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    icon: AlertTriangle,
  },

  // --- FAILED / CANCELLED / BANNED STATES ---
  failed: {
    label: "Failed",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    icon: XCircle,
  },
  banned: {
    label: "Banned",
    className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: Ban,
  },
  blocked: {
    label: "Blocked",
    className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    icon: Ban,
  },
  expired: {
    label: "Expired",
    className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    icon: Clock,
  },

  // --- REFUND / OTHER STATES ---
  refund: {
    label: "Refunded",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: RefreshCcw,
  },
  refunded: {
    label: "Refunded",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: RefreshCcw,
  },
  ended: {
    label: "Ended",
    className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    icon: Clock,
  },
  closed: {
    label: "Closed",
    className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    icon: Ban,
  },
  draft: {
    label: "Draft",
    className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    icon: Clock,
  },
  inactive: {
    label: "Inactive",
    className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    icon: Clock,
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  label: "Unknown",
  className: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  icon: AlertTriangle,
};

export interface StatusBadgeProps {
  status?: StatusType | null;
  label?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "pill" | "rounded" | "dot";
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: "px-1.5 py-0.5 text-[8px] gap-1",
  sm: "px-2 py-0.5 text-[9px] gap-1.5",
  md: "px-2.5 py-1 text-[11px] gap-1.5",
  lg: "px-3 py-1.5 text-xs gap-2",
};

const ICON_SIZES = {
  xs: 10,
  sm: 11,
  md: 13,
  lg: 15,
};

export default function StatusBadge({
  status,
  label,
  size = "sm",
  variant = "pill",
  showIcon = true,
  pulse,
  className = "",
}: StatusBadgeProps) {
  const normalizedKey = (status || "").toLowerCase().trim();
  const config = STATUS_MAP[normalizedKey] || {
    ...DEFAULT_CONFIG,
    label: status ? String(status).toUpperCase() : DEFAULT_CONFIG.label,
  };

  const Icon = config.icon;
  const isPill = variant === "pill";
  const roundedClass = isPill ? "rounded-full" : "rounded-md";
  const isPulseActive = pulse !== undefined ? pulse : !!config.showDotPulse;
  const isSpinning = config.animateIcon;
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center font-black uppercase tracking-wider border shrink-0 transition-colors select-none ${roundedClass} ${SIZE_CLASSES[size]} ${config.className} ${className}`}
    >
      {isPulseActive && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}

      {showIcon && !isPulseActive && (
        <Icon
          size={ICON_SIZES[size]}
          className={`shrink-0 ${isSpinning ? "animate-spin" : ""}`}
        />
      )}

      <span className="leading-none">{displayLabel}</span>
    </span>
  );
}
