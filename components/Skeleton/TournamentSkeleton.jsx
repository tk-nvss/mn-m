"use client";

import React from "react";

/**
 * A reusable Shimmer Skeleton component that mimics the tournament cards.
 */
export const TournamentSkeleton = () => {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3.5 shimmer-overlay">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-3/4 bg-[var(--foreground)]/[0.08] rounded-md" />
          <div className="h-2.5 w-1/2 bg-[var(--foreground)]/[0.05] rounded-md" />
        </div>
        <div className="h-5 w-14 bg-[var(--foreground)]/[0.08] rounded-full shrink-0" />
      </div>

      <div className="flex justify-between items-center pt-1">
        <div className="h-3 w-28 bg-[var(--foreground)]/[0.06] rounded-md" />
        <div className="h-2.5 w-14 bg-[var(--foreground)]/[0.05] rounded-md" />
      </div>

      <div className="h-1.5 w-full bg-[var(--foreground)]/[0.04] rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-[var(--foreground)]/[0.08]" />
      </div>

      <div className="h-5 w-20 bg-[var(--foreground)]/[0.06] rounded-md" />
      <div className="h-9 w-full bg-[var(--foreground)]/[0.08] rounded-xl" />
    </div>
  );
};

export const TournamentSkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <TournamentSkeleton key={i} />
      ))}
    </div>
  );
};
