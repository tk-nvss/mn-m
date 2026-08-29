"use client";
// Seasonal theme manager for global effects 

import dynamic from "next/dynamic";
import { useUIStore } from "@/store/useUIStore";

const SnowEffect = dynamic(() => import("@/components/Seasonal/SnowEffect"));
const ValentineEffect = dynamic(() => import("@/components/Seasonal/ValentineEffect"));
const HoliEffect = dynamic(() => import("@/components/Seasonal/HoliEffect"));
const DiwaliEffect = dynamic(() => import("@/components/Seasonal/DiwaliEffect"));
const MonsoonEffect = dynamic(() => import("@/components/Seasonal/MonsoonEffect"));
const EidEffect = dynamic(() => import("@/components/Seasonal/EidEffect"));

export default function SeasonalEffectManager() {
  const activeThemeEffect = useUIStore((state) => state.activeThemeEffect);
  if (!activeThemeEffect) return null;

  switch (activeThemeEffect) {
    case "christmas":
      return <SnowEffect />;
    case "valentine":
      return <ValentineEffect />;
    case "holi":
      return <HoliEffect />;
    case "diwali":
      return <DiwaliEffect />;
    case "monsoon":
      return <MonsoonEffect />;
    case "eid":
      return <EidEffect />;
    default:
      return null;
  }
}
