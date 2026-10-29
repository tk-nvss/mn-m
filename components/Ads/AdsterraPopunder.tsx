"use client";

import Script from "next/script";
import { ADSTERRA_CONFIG, useDynamicAdConfig } from "./AdConfig";

export default function AdsterraPopunder() {
  const config = useDynamicAdConfig();

  if (!config.enableAds || !config.enablePopunder) {
    return null;
  }

  const src = config.popunder?.src || ADSTERRA_CONFIG.popunder.src;

  return (
    <Script
      src={src}
      strategy="afterInteractive"
    />
  );
}
