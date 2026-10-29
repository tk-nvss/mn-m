"use client";

import { ADSTERRA_CONFIG } from "./AdConfig";

interface CustomBannerProps {
  className?: string;
}

/**
 * Reusable Adsterra 320x50 Mobile Banner.
 */
export default function CustomBanner2({ className = "" }: CustomBannerProps) {
  if (!ADSTERRA_CONFIG.enableAds) {
    return (
      <div className={`flex justify-center items-center overflow-hidden py-1 ${className}`}>
        <div 
          className="relative border border-dashed border-[var(--border)] rounded-lg bg-[var(--foreground)]/[0.02] flex items-center justify-center text-[10px] text-[var(--muted)]" 
          style={{ width: '320px', height: '50px' }}
        >
          <span>Advertisement</span>
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
            'key' : '183ee4e45520fb7aa8e1d934a0970c31',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/183ee4e45520fb7aa8e1d934a0970c31/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className={`flex justify-center overflow-hidden py-1 ${className}`}>
      <div 
        className="relative border border-[var(--border)] rounded-lg bg-[var(--foreground)]/[0.03] overflow-hidden shadow-xs flex items-center justify-center" 
        style={{ width: '320px', height: '50px' }}
      >
        <iframe
          title="Advertisement Banner"
          srcDoc={iframeHtml}
          width="320"
          height="50"
          frameBorder="0"
          scrolling="no"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          style={{ border: 'none', overflow: 'hidden', backgroundColor: 'transparent' }}
        />
      </div>
    </div>
  );
}
