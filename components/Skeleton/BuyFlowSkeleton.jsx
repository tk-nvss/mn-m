"use client";

import React from "react";
import { SkeletonBase, SkeletonText, SkeletonBox } from "./Skeleton";

export const BuyFlowSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Back Button Skeleton */}
      <div className="h-4 w-20 bg-[var(--foreground)]/[0.06] rounded-md" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Product & Variants */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hero Card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--foreground)]/[0.06] rounded-xl shrink-0 shimmer-overlay" />
            <div className="flex-1 space-y-2">
              <SkeletonText width="w-16" height="h-2" className="opacity-50" />
              <SkeletonText width="w-3/4" height="h-4" />
              <SkeletonText width="w-20" height="h-4" />
            </div>
          </div>

          {/* Quick Packs */}
          <div className="space-y-2.5">
            <SkeletonText width="w-28" height="h-3" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-[var(--card)] border border-[var(--border)] rounded-xl shimmer-overlay" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Player Form & Checkout */}
        <div className="lg:col-span-7 space-y-4">
          {/* Player Info */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-3.5">
            <SkeletonText width="w-36" height="h-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="h-10 bg-[var(--background)] border border-[var(--border)] rounded-xl" />
              <div className="h-10 bg-[var(--background)] border border-[var(--border)] rounded-xl" />
            </div>
            
            <div className="pt-3 border-t border-[var(--border)]/40 space-y-2">
              <SkeletonText width="w-24" height="h-2.5" />
              <div className="h-9 bg-[var(--background)] border border-[var(--border)] rounded-xl" />
            </div>
          </div>

          {/* Payment & CTA */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
            <SkeletonText width="w-28" height="h-4" />
            <div className="h-12 bg-[var(--background)] border border-[var(--border)] rounded-xl" />
            
            <div className="pt-3 border-t border-[var(--border)]/40 flex justify-between items-center">
              <div className="space-y-1">
                <SkeletonText width="w-16" height="h-2" />
                <SkeletonText width="w-24" height="h-5" />
              </div>
              <div className="w-36 h-10 rounded-xl bg-[var(--foreground)]/[0.08]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
