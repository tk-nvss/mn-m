"use client";

import Script from "next/script";
import { ADSTERRA_CONFIG } from "./AdConfig";

export default function AdsterraSocialBar() {
  if (!ADSTERRA_CONFIG.enableAds || !ADSTERRA_CONFIG.enableSocialBar || !ADSTERRA_CONFIG.socialBar.enabled) {
    return null;
  }

  return (
    <Script
      src={ADSTERRA_CONFIG.socialBar.src}
      strategy="afterInteractive"
    />
  );
}
