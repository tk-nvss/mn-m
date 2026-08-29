"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, ChevronDown, Check, Zap, Layers, Cpu } from "lucide-react";

interface ThemeItem {
  id: string;
  icon: string;
  label: string;
  color?: string; // Optional color preview
}

const themes: ThemeItem[] = [
  { id: "light", icon: "☀️", label: "Light" },
  { id: "dark", icon: "🌙", label: "Dark" },
  { id: "sakura", icon: "🌸", label: "Sakura" },
  { id: "ocean", icon: "🌊", label: "Ocean" },
  { id: "forest", icon: "🍃", label: "Forest" },
    { id: "cyber", icon: "💠", label: "Cyber" },

  { id: "tropical", icon: "🌺", label: "Tropical" },
  { id: "ice", icon: "❄️", label: "Ice" },
  { id: "steel", icon: "🔩", label: "Steel" },
  { id: "gunmetal", icon: "🛠️", label: "Gunmetal" },
  { id: "royalblue", icon: "👑", label: "Royal" },
  { id: "warzone", icon: "⚔️", label: "Warzone" },
  { id: "carbon", icon: "🏴", label: "Carbon" },
  { id: "rose", icon: "🌹", label: "Rose" },
  { id: "lavender", icon: "💜", label: "Lavender" },
  { id: "peach", icon: "🍑", label: "Peach" },
  { id: "cotton", icon: "🍬", label: "Cotton" },
  { id: "bubblegum", icon: "🎀", label: "Bubblegum" },
  { id: "cherry", icon: "🍒", label: "Cherry" },
  { id: "vanilla", icon: "🍦", label: "Vanilla" },
  { id: "violet", icon: "💜", label: "Violet" },
  { id: "plasma", icon: "🧬", label: "Plasma" },
  { id: "ember", icon: "🔥", label: "Ember" },
  { id: "solar", icon: "🟡", label: "Solar" },
  { id: "retro", icon: "👾", label: "Retro" },
  { id: "arctic", icon: "🧊", label: "Arctic" },
  { id: "monochrome", icon: "🎭", label: "Classic" },
  { id: "coffee", icon: "☕", label: "Coffee" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");

  // Load stored theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") || document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(stored);
  }, []);

  // Change theme handler
  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const currentTheme = themes.find((t) => t.id === theme) || themes[0];

  const handleToggleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === theme);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex].id);
  };

  return (
    <div className="relative z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleTheme}
        className={`relative flex items-center gap-1 px-1 py-1 rounded-full transition-all duration-300 group border bg-[var(--background)]/50 border-[var(--border)]/30 hover:border-[var(--border)] hover:bg-[var(--background)]/80 backdrop-blur-md`}
        title="Cycle Interface Theme"
      >
        {/* ICON CONTAINER */}
        <div className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden transition-all duration-300 bg-[var(--foreground)]/5 text-[var(--foreground)]`}>
          <motion.div
            key={theme}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="text-sm"
          >
            {currentTheme.icon}
          </motion.div>

          {/* SPINNING RING */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute inset-0 rounded-full border border-dashed border-[var(--foreground)]/20`}
          />
        </div>

        {/* EXPANDABLE LABEL (Only on Desktop/Large) */}
        <AnimatePresence mode="wait">
          <div className="hidden md:block overflow-hidden">
            <motion.span
              key={theme}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={`text-[10px] font-black uppercase tracking-widest italic pr-3 whitespace-nowrap text-[var(--foreground)]/60`}
            >
              {currentTheme.label}
            </motion.span>
          </div>
        </AnimatePresence>

        {/* INDICATOR */}
        <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--background)] transition-colors duration-300 bg-emerald-500`} />
      </motion.button>
    </div>
  );
}
