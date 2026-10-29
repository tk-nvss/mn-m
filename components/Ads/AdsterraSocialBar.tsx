"use client";

import Script from "next/script";
import { ADSTERRA_CONFIG, useDynamicAdConfig } from "./AdConfig";

export default function AdsterraSocialBar() {
  const config = useDynamicAdConfig();

  if (!config.enableAds || !config.enableSocialBar) {
    return null;
  }

  const src = config.socialBar?.src || ADSTERRA_CONFIG.socialBar.src;

  return (
    <Script
      src={src}
      strategy="afterInteractive"
    />
  );
}
