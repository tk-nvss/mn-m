"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Sparkles, RotateCcw, ChevronDown, X, Hash, Lock } from "lucide-react";
import { useUIStore, ThemeEffect } from "@/store/useUIStore";

interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "cyan", name: "Cyber Cyan", hex: "#00e5ff", hoverHex: "#00b4d8" },
  { id: "sky", name: "Sky Blue", hex: "#38bdf8", hoverHex: "#0284c7" },
  { id: "blue", name: "Electric Blue", hex: "#3b82f6", hoverHex: "#2563eb" },
  { id: "indigo", name: "Deep Indigo", hex: "#6366f1", hoverHex: "#4f46e5" },
  { id: "purple", name: "Neon Purple", hex: "#a855f7", hoverHex: "#9333ea" },
  { id: "pink", name: "Hot Pink", hex: "#ec4899", hoverHex: "#db2777" },
  { id: "rose", name: "Rose Ruby", hex: "#f43f5e", hoverHex: "#e11d48" },
  { id: "red", name: "Crimson Red", hex: "#ef4444", hoverHex: "#dc2626" },
  { id: "orange", name: "Sunset Orange", hex: "#f97316", hoverHex: "#ea580c" },
  { id: "amber", name: "Solar Gold", hex: "#f59e0b", hoverHex: "#d97706" },
  { id: "lime", name: "Toxic Lime", hex: "#84cc16", hoverHex: "#65a30d" },
  { id: "emerald", name: "Mint Emerald", hex: "#10b981", hoverHex: "#059669" },
];

const SEASONS: { id: ThemeEffect; name: string; icon: string }[] = [
  { id: "none", name: "None", icon: "🚫" },
  { id: "christmas", name: "Christmas", icon: "🎄" },
  { id: "valentine", name: "Valentine", icon: "💖" },
  { id: "holi", name: "Holi", icon: "🎨" },
  { id: "diwali", name: "Diwali", icon: "🪔" },
  { id: "monsoon", name: "Monsoon", icon: "☔" },
  { id: "eid", name: "Eid", icon: "🌙" },
];

function hexToRgb(hex: string): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return "59, 130, 246";
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
}

function getHoverColor(hex: string): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;
  const r = Math.max(0, Math.min(255, ((num >> 16) & 255) - 25));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) - 25));
  const b = Math.max(0, Math.min(255, (num & 255) - 25));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState<string>("");
  const [hexInput, setHexInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const { activeThemeEffect, setActiveThemeEffect } = useUIStore();

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme");
    const validTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(validTheme);
    document.documentElement.setAttribute("data-theme", validTheme);

    const storedAccent = localStorage.getItem("theme-accent");
    if (storedAccent) {
      setAccentColor(storedAccent);
      setHexInput(storedAccent);
      applyAccent(storedAccent, localStorage.getItem("theme-accent-hover") || getHoverColor(storedAccent));
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const applyAccent = (hex: string, hoverHex?: string) => {
    const hover = hoverHex || getHoverColor(hex);
    const rgb = hexToRgb(hex);
    document.documentElement.style.setProperty("--accent", hex);
    document.documentElement.style.setProperty("--accent-hover", hover);
    document.documentElement.style.setProperty("--accent-rgb", rgb);
  };

  const clearCustomAccent = () => {
    document.documentElement.style.removeProperty("--accent");
    document.documentElement.style.removeProperty("--accent-hover");
    document.documentElement.style.removeProperty("--accent-rgb");
    localStorage.removeItem("theme-accent");
    localStorage.removeItem("theme-accent-hover");
    localStorage.removeItem("theme-accent-rgb");
    setAccentColor("");
    setHexInput("");
  };

  const handleModeChange = (newMode: "dark" | "light") => {
    setTheme(newMode);
    localStorage.setItem("theme", newMode);
    document.documentElement.setAttribute("data-theme", newMode);
  };

  const handleColorSelect = (hex: string, hoverHex?: string) => {
    const formattedHex = hex.startsWith("#") ? hex : `#${hex}`;
    setAccentColor(formattedHex);
    setHexInput(formattedHex);
    const hover = hoverHex || getHoverColor(formattedHex);
    const rgb = hexToRgb(formattedHex);
    localStorage.setItem("theme-accent", formattedHex);
    localStorage.setItem("theme-accent-hover", hover);
    localStorage.setItem("theme-accent-rgb", rgb);
    applyAccent(formattedHex, hover);
  };

  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith("#") && val.length > 0) {
      val = `#${val}`;
    }
    setHexInput(val);
    if (isValidHex(val)) {
      handleColorSelect(val);
    }
  };

  const currentAccentDisplay = accentColor || (theme === "dark" ? "#7dd3fc" : "#3b82f6");

  return (
    <>
      {/* Header Pill Button - Clean, no text label, no shadow on dot */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-full transition-all duration-300 group border bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border-[var(--border)] cursor-pointer"
        title="Appearance & Theme"
        aria-label="Theme Settings"
        aria-expanded={isOpen}
      >
        {/* ICON CONTAINER */}
        <div className="relative flex items-center justify-center w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full overflow-hidden transition-all duration-300 bg-[var(--foreground)]/5 text-[var(--foreground)]">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center justify-center text-xs"
          >
            {theme === "light" ? "☀️" : "🌙"}
          </motion.div>

          {/* DASHED ACCENT RING */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[var(--foreground)]/20 pointer-events-none" />
        </div>

        {/* CHEVRON */}
        <ChevronDown
          size={11}
          className={`text-[var(--foreground)]/60 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[var(--accent)]" : "group-hover:translate-y-0.5"
          }`}
        />

        {/* ACCENT COLOR INDICATOR DOT - NO SHADOW */}
        <div
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--background)] transition-colors duration-300"
          style={{ backgroundColor: currentAccentDisplay }}
        />
      </motion.button>

      {/* POPUP / MODAL CUSTOMIZATION STUDIO - PORTAL DIRECTLY TO BODY (COMPACT & SMOOTH) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div 
                className="fixed inset-0 flex items-center justify-center p-3 sm:p-4"
                style={{ zIndex: 2147483647 }}
              >
                {/* BACKDROP */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsOpen(false)}
                  className="fixed inset-0 bg-black/80 backdrop-blur-xl cursor-pointer"
                  style={{ zIndex: 2147483646 }}
                />

                {/* COMPACT FLAT PREMIUM MODAL CARD */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="relative w-full max-w-[275px] sm:max-w-[285px] rounded-2xl border border-[var(--border)] p-3 text-[var(--foreground)] select-none max-h-[92vh] overflow-y-auto"
                  style={{
                    backgroundColor: theme === "dark" ? "#0c0c0f" : "#ffffff",
                    zIndex: 2147483647,
                    opacity: 1,
                    transition: "background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease",
                  }}
                >
                  {/* STUDIO HEADER */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border)] mb-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-5.5 h-5.5 rounded-md flex items-center justify-center transition-colors duration-300"
                        style={{ backgroundColor: `rgba(var(--accent-rgb), 0.12)`, color: currentAccentDisplay }}
                      >
                        <Palette size={12} />
                      </div>
                      <div>
                        <h3 className="text-[10.5px] font-black uppercase tracking-wider italic leading-none">
                          Appearance
                        </h3>
                        <p className="text-[8px] text-[var(--muted)] mt-0.5 leading-none">Mode & Accent</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-5.5 h-5.5 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      aria-label="Close"
                    >
                      <X size={11} />
                    </button>
                  </div>

                  {/* SECTION 1: THEME MODE */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                        Mode
                      </span>
                      <span className="text-[7.5px] font-bold uppercase tracking-wider" style={{ color: currentAccentDisplay }}>
                        {theme === "dark" ? "Dark Active" : "Light Active"}
                      </span>
                    </div>

                    {/* Ultra-compact Mode Selector */}
                    <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)]">
                      {/* Light Button */}
                      <button
                        onClick={() => handleModeChange("light")}
                        className={`relative z-10 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md font-bold text-[10px] transition-all duration-200 cursor-pointer ${
                          theme === "light"
                            ? "text-[var(--foreground)] font-extrabold bg-[var(--card)] border border-[var(--border)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                        style={theme === "light" ? { borderColor: currentAccentDisplay } : {}}
                      >
                        <span className="text-[11px] leading-none">☀️</span>
                        <span className="uppercase text-[9px] tracking-wide">Light</span>
                        {theme === "light" && (
                          <Check size={9.5} strokeWidth={3} className="ml-auto" style={{ color: currentAccentDisplay }} />
                        )}
                      </button>

                      {/* Dark Button */}
                      <button
                        onClick={() => handleModeChange("dark")}
                        className={`relative z-10 flex items-center justify-center gap-1 py-1 px-1.5 rounded-md font-bold text-[10px] transition-all duration-200 cursor-pointer ${
                          theme === "dark"
                            ? "text-[var(--foreground)] font-extrabold bg-[var(--card)] border border-[var(--border)]"
                            : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                        style={theme === "dark" ? { borderColor: currentAccentDisplay } : {}}
                      >
                        <span className="text-[11px] leading-none">🌙</span>
                        <span className="uppercase text-[9px] tracking-wide">Dark</span>
                        {theme === "dark" && (
                          <Check size={9.5} strokeWidth={3} className="ml-auto" style={{ color: currentAccentDisplay }} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SECTION 2: ACCENT COLOR */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                        Accent Color
                      </span>
                      {accentColor && (
                        <button
                          onClick={clearCustomAccent}
                          className="flex items-center gap-0.5 text-[7.5px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                          title="Reset to default theme color"
                        >
                          <RotateCcw size={7.5} />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    {/* Ultra-compact Interactive Color Input Bar */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] mb-1">
                      <div
                        onClick={() => colorInputRef.current?.click()}
                        className="relative w-5.5 h-5.5 rounded flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 border border-white/20 overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: currentAccentDisplay }}
                        title="Click to open color picker wheel"
                      >
                        <Palette size={10} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={currentAccentDisplay}
                          onChange={(e) => handleColorSelect(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>

                      <div 
                        className="flex-1 flex items-center gap-1 px-1.5 py-0.5 rounded border border-[var(--border)] transition-colors duration-200"
                        style={{ backgroundColor: theme === "dark" ? "#141419" : "#f1f5f9" }}
                      >
                        <Hash size={8.5} className="text-[var(--muted)]" />
                        <input
                          type="text"
                          maxLength={7}
                          value={hexInput || currentAccentDisplay}
                          onChange={handleHexInputChange}
                          placeholder="#38BDF8"
                          className="w-full bg-transparent text-[9px] font-mono font-bold uppercase text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/50"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[var(--foreground)]/10 hover:bg-[var(--foreground)]/15 text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        Custom
                      </button>
                    </div>

                    {/* Compact Square Preset Swatches */}
                    <div className="grid grid-cols-6 gap-1.5 place-items-center">
                      {COLOR_PRESETS.map((color) => {
                        const isSelected = currentAccentDisplay.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.id}
                            onClick={() => handleColorSelect(color.hex, color.hoverHex)}
                            className={`group relative w-6.5 h-6.5 rounded-md flex items-center justify-center transition-all duration-150 cursor-pointer border ${
                              isSelected
                                ? "ring-2 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--background)] scale-105 border-white/50 z-10"
                                : "border-black/10 dark:border-white/10 opacity-80 hover:opacity-100 hover:scale-105"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {isSelected && (
                              <Check size={10} strokeWidth={3} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 3: SEASONAL EFFECTS (DISABLED) */}
                  <div className="pt-1.5 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Sparkles size={9.5} className="text-[var(--muted)]" />
                        <span className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]">
                          Seasonal Effects
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[7px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        <Lock size={7} />
                        Disabled
                      </span>
                    </div>

                    {/* Disabled Seasonal Grid */}
                    <div className="p-1 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]/50 opacity-40 pointer-events-none select-none">
                      <div className="grid grid-cols-4 gap-0.5">
                        {SEASONS.map((season) => (
                          <div
                            key={season.id}
                            className="flex flex-col items-center justify-center gap-0.5 py-0.5 px-0.5 rounded bg-[var(--foreground)]/5 text-[var(--muted)]"
                          >
                            <span className="text-[10px] leading-none">{season.icon}</span>
                            <span className="text-[7px] uppercase tracking-tight truncate max-w-full">
                              {season.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[6.5px] text-[var(--muted)]/80 text-center mt-0.5 italic">
                        Holiday themes activate automatically during seasonal periods.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
