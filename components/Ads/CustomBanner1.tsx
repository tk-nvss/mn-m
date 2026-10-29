"use client";

import { ADSTERRA_CONFIG } from "./AdConfig";

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
  showBadge = true,
  badgeLabel = "Ad",
  badgePosition = "right"
}: CustomBannerProps) {
  const badgePositionClass = badgePosition === "left" ? "left-3" : "right-3";

  if (!ADSTERRA_CONFIG.enableAds) {
    return (
      <div className={`flex justify-center items-center py-2 ${className}`}>
        <div 
          className="relative border border-dashed border-[var(--border)] rounded-xl bg-[var(--foreground)]/[0.02] flex items-center justify-center text-xs text-[var(--muted)]" 
          style={{ width: '300px', height: '250px' }}
        >
          {showBadge && (
            <div className={`absolute -top-2 ${badgePositionClass} z-20 px-1.5 py-0.2 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-xs flex items-center gap-1 pointer-events-none select-none`}>
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-70"></span>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                {badgeLabel}
              </span>
            </div>
          )}
          <span>Advertisement Space</span>
        </div>
      </div>
    );
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
            'key' : '12769ff4f11c1254fd7310aea93f838d',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/12769ff4f11c1254fd7310aea93f838d/invoke.js"></script>
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
        {showBadge && (
          <div className={`absolute -top-2 ${badgePositionClass} z-20 px-1.5 py-0.2 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-xs flex items-center gap-1 pointer-events-none select-none`}>
            <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-70"></span>
            <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]">
              {badgeLabel}
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
