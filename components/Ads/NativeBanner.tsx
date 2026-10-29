"use client";

import { useRef } from "react";
import Script from "next/script";
import { ADSTERRA_CONFIG, useDynamicAdConfig } from "./AdConfig";

interface NativeBannerProps {
  className?: string;
  showBadge?: boolean;
  badgeLabel?: string;
  badgePosition?: "left" | "right";
}

/**
 * Reusable Adsterra Banner component.
 */
export default function NativeBanner({
  className = "",
  showBadge,
  badgeLabel,
  badgePosition = "right"
}: NativeBannerProps) {
  const config = useDynamicAdConfig();
  const effectiveShowBadge = showBadge !== undefined ? showBadge : config.showAdBadge;
  const effectiveBadgeLabel = badgeLabel || config.adBadgeText || "Ad";
  const badgePositionClass = badgePosition === "left" ? "left-3" : "right-3";

  if (!config.enableAds || !config.enableBanners) {
    return null;
  }

  const id = config.nativeBanner?.id || ADSTERRA_CONFIG.nativeBanner.id;
  const src = config.nativeBanner?.src || ADSTERRA_CONFIG.nativeBanner.src;

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
        </style>
      </head>
      <body>
        <div id="container-${id}"></div>
        <script type="text/javascript" src="${src}"></script>
      </body>
    </html>
  `;

  return (
    <div className={`relative pt-2 pb-1 ${className}`}>
      <div className="relative rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] min-h-[50px] shadow-xs flex items-center justify-center">
        {/* Overlapping Ad Mention Badge */}
        {effectiveShowBadge && (
          <div className={`absolute -top-2 ${badgePositionClass} z-20 px-1.5 py-0.2 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-xs flex items-center gap-1 pointer-events-none select-none`}>
            <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-70"></span>
            <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]">
              {effectiveBadgeLabel}
            </span>
          </div>
        )}

        <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
          <iframe
            title="Advertisement"
            width="100%"
            height="60"
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-same-origin"
            style={{ border: 'none', overflow: 'hidden', backgroundColor: 'transparent' }}
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
}
