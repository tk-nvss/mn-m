"use client";

import { ADSTERRA_CONFIG, useDynamicAdConfig } from "./AdConfig";

interface CustomBannerProps {
  className?: string;
  showBadge?: boolean;
  badgeLabel?: string;
  badgePosition?: "left" | "right";
}

/**
 * Reusable Adsterra 300x250 Iframe Banner.
 */
export default function CustomBanner1({ 
  className = "",
  showBadge,
  badgeLabel,
  badgePosition = "right"
}: CustomBannerProps) {
  const config = useDynamicAdConfig();
  const effectiveShowBadge = showBadge !== undefined ? showBadge : config.showAdBadge;
  const effectiveBadgeLabel = badgeLabel || config.adBadgeText || "Ad";
  const badgePositionClass = badgePosition === "left" ? "left-3" : "right-3";
  const adKey = config.banner300x250Key || ADSTERRA_CONFIG.banner300x250Key;

  if (!config.enableAds || !config.enableBanners) {
    return null;
  }

  const iframeHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }</style>
      </head>
      <body>
        <script>
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/${adKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`flex justify-center pt-2 pb-1 ${className}`}>
      <div 
        className="relative border border-[var(--border)] rounded-xl bg-[var(--foreground)]/[0.03] shadow-xs flex items-center justify-center" 
        style={{ width: '300px', height: '250px' }}
      >
        {/* Overlapping Ad Mention Badge */}
        {effectiveShowBadge && (
          <div className={`absolute -top-2 ${badgePositionClass} z-20 px-2 py-0.5 rounded-full bg-[var(--background)]/90 backdrop-blur-sm border border-[var(--border)] shadow-xs flex items-center gap-1.5 pointer-events-none select-none`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-80"></span>
            <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {effectiveBadgeLabel}
            </span>
          </div>
        )}

        <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
          <iframe
            title="Advertisement Banner"
            srcDoc={iframeHtml}
            width="300"
            height="250"
            frameBorder="0"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            style={{ border: 'none', overflow: 'hidden', backgroundColor: 'transparent' }}
          />
        </div>
      </div>
    </div>
  );
}
