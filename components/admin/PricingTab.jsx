"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Coins,
  Settings2,
  Trash2,
  RefreshCcw,
  Gamepad2,
  Save,
  ChevronDown,
  Info,
  Shield,
  IndianRupee,
  Loader2,
  Package
} from "lucide-react";
import { FiRefreshCw, FiPlus, FiTrash2 } from "react-icons/fi";
import { SearchInput } from "@/components/common";

const API_BASE = "https://game-off-ten.vercel.app/api/v1";

export default function PricingTab({
  pricingType,
  setPricingType,
  slabs,
  setSlabs,
  overrides,
  setOverrides,
  gameConfigs,
  setGameConfigs,
  savingPricing,
  onSave,
}) {
  const [pricingMode, setPricingMode] = useState("percent");
  const [games, setGames] = useState([]);
  const [itemsByGame, setItemsByGame] = useState({});
  const [fixedGameFilter, setFixedGameFilter] = useState("");
  const [gameSearch, setGameSearch] = useState("");
  const [fixedItemFilter, setFixedItemFilter] = useState("");
  const [loadingFixedPrices, setLoadingFixedPrices] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("");
  const [isAutoSaving, setIsAutoSaving] = useState(false);



  const filteredGames = useMemo(() => {
    return games.filter(g => 
      g.gameName.toLowerCase().includes(gameSearch.toLowerCase()) || 
      g.gameSlug.toLowerCase().includes(gameSearch.toLowerCase())
    );
  }, [games, gameSearch]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/games/list`);
        const json = await res.json();
        if (json.success) setGames(json.data.games);
      } catch (e) {
        console.error("Game fetch failed", e);
      }
    })();
  }, []);

  const fetchItemsForGame = async (gameSlug) => {
    if (!gameSlug) return [];
    if (itemsByGame[gameSlug]) return itemsByGame[gameSlug];

    try {
      const res = await fetch(`${API_BASE}/games/${gameSlug}/items`);
      const json = await res.json();
      if (json.success) {
        let items = json.data.items || [];

        /* ================= INJECT COMBO OFFERS (ADMIN) ================= */
        const weeklyPass = items.find((i) => i.itemSlug === "weekly-pass816");
        if (weeklyPass) {
          const combos = [
            { multiplier: 2, label: "2x" },
            { multiplier: 3, label: "3x" },
          ];

          combos.forEach((combo) => {
            const comboSlug = `${weeklyPass.itemSlug}-${combo.multiplier}x`;
            if (!items.find((i) => i.itemSlug === comboSlug)) {
              items.push({
                ...weeklyPass,
                itemName: `${combo.label} ${weeklyPass.itemName}`,
                itemSlug: comboSlug,
                sellingPrice: Number(weeklyPass.sellingPrice) * combo.multiplier,
                index: weeklyPass.index + combo.multiplier * 0.1,
              });
            }
          });
          items.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0));
        }

        setItemsByGame((p) => ({ ...p, [gameSlug]: items }));
        return items;
      }
    } catch (e) {
      console.error("Item fetch failed", e);
    }
    return [];
  };

  const hydrateFixedPricing = async (gameSlug) => {
    if (!gameSlug) return;
    setLoadingFixedPrices(true);
    try {
      await fetchItemsForGame(gameSlug);
      setFixedItemFilter("");
    } finally {
      setLoadingFixedPrices(false);
    }
  };

  useEffect(() => {
    if (pricingMode !== "fixed") return;
    if (!fixedGameFilter) return;
    hydrateFixedPricing(fixedGameFilter);
  }, [pricingMode, pricingType, fixedGameFilter]);

  const visibleOverrides = useMemo(() => {
    if (!fixedGameFilter) return [];
    const items = itemsByGame[fixedGameFilter] || [];
    
    return items.map(item => {
      const override = overrides.find(o => o.gameSlug === fixedGameFilter && o.itemSlug === item.itemSlug);
      return {
        gameSlug: fixedGameFilter,
        itemSlug: item.itemSlug,
        itemName: item.itemName,
        fixedPrice: override?.fixedPrice ?? Number(item.sellingPrice) ?? 0,
        isEnabled: override?.isEnabled ?? false,
        isOutOfStock: override?.isOutOfStock ?? false,
      };
    }).filter(o => {
      if (fixedItemFilter && o.itemSlug !== fixedItemFilter) return false;
      return true;
    });
  }, [overrides, fixedGameFilter, fixedItemFilter, itemsByGame]);

  const updateOverrideState = (itemSlug, updates) => {
    setOverrides(prev => {
      const idx = prev.findIndex(o => o.gameSlug === fixedGameFilter && o.itemSlug === itemSlug);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...updates };
        // Optional: filter out if both are false/default? 
        // But let's keep it simple for now, the user wants to save what they edit.
        return next;
      } else {
        const item = itemsByGame[fixedGameFilter]?.find(i => i.itemSlug === itemSlug);
        return [...prev, {
          gameSlug: fixedGameFilter,
          itemSlug,
          itemName: item?.itemName || itemSlug,
          fixedPrice: updates.fixedPrice ?? Number(item?.sellingPrice) ?? 0,
          isEnabled: updates.isEnabled ?? false,
          isOutOfStock: updates.isOutOfStock ?? false,
        }];
      }
    });
  };

  const updateOverridePrice = (itemSlug, value) => {
    updateOverrideState(itemSlug, { fixedPrice: Math.max(0, Number(value) || 0) });
  };

  const toggleOverrideStatus = (itemSlug) => {
    const current = visibleOverrides.find(o => o.itemSlug === itemSlug);
    updateOverrideState(itemSlug, { isEnabled: !current?.isEnabled });
  };

  const toggleItemStock = (itemSlug) => {
    const current = visibleOverrides.find(o => o.itemSlug === itemSlug);
    updateOverrideState(itemSlug, { isOutOfStock: !current?.isOutOfStock });
  };

  const toggleGameStock = (gameSlug) => {
    setGameConfigs(prev => {
      const existing = prev.find(g => g.gameSlug === gameSlug);
      if (existing) {
        return prev.map(g => g.gameSlug === gameSlug ? { ...g, isOutOfStock: !g.isOutOfStock } : g);
      }
      return [...prev, { gameSlug, isOutOfStock: true }];
    });
  };

  const applyBulkPercentage = () => {
    const percent = Number(bulkPercent);
    if (!Number.isFinite(percent) || percent === 0) return;
    const multiplier = 1 + percent / 100;
    const next = overrides.map((o) => {
      if ((fixedGameFilter && o.gameSlug !== fixedGameFilter) || (fixedItemFilter && o.itemSlug !== fixedItemFilter)) {
        return o;
      }
      return { ...o, fixedPrice: Math.round(o.fixedPrice * multiplier) };
    });
    setOverrides(next);
    setBulkPercent("");
  };

  const updateSlab = (i, key, value) => {
    const next = [...slabs];
    next[i][key] = Math.max(0, Number(value) || 0);
    setSlabs(next);
  };

  const addSlab = () => setSlabs([...slabs, { min: 0, max: 0, percent: 0 }]);
  const deleteSlab = (i) => setSlabs(slabs.filter((_, idx) => idx !== i));
  const canSave = !savingPricing && ((pricingMode === "percent" && slabs.length) || (pricingMode === "fixed" && overrides.length));

  return (
    <div className="space-y-6 pb-20 max-w-full overflow-x-hidden">
      {/* ================= TOP BAR ================= */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <Settings2 className="text-[var(--accent)] text-lg" size={20} />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Pricing Config</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Manage profit margins and fixed item prices
                </p>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          <div className="flex w-full lg:w-auto items-center justify-between lg:justify-end gap-2">
            {/* Mode Switcher */}
            <div className="flex flex-1 lg:flex-none justify-center bg-[var(--foreground)]/[0.03] p-1 rounded-full border border-[var(--border)]/50 shadow-inner">
              {[{ id: "percent", label: "Markup", icon: <Percent size={12} /> }, { id: "fixed", label: "Fixed", icon: <Coins size={12} /> }].map((m) => (
                <button aria-label="button"
                  key={m.id}
                  onClick={() => setPricingMode(m.id)}
                  className={`flex-1 lg:flex-none flex justify-center items-center gap-1 px-1.5 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${pricingMode === m.id
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                    }`}
                >
                  <span className="hidden sm:inline">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            <div className="hidden lg:block h-6 w-px bg-[var(--border)] opacity-30" />

            {/* Role Switcher */}
            <div className="flex flex-1 lg:flex-none justify-center bg-[var(--foreground)]/[0.03] p-1 rounded-full border border-[var(--border)]/50 shadow-inner">
              {["user", "member", "admin"].map((type) => (
                <button aria-label="button"
                  key={type}
                  onClick={() => setPricingType(type)}
                  className={`flex-1 lg:flex-none flex justify-center px-1.5 sm:px-4 py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${pricingType === type
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button aria-label="button"
            onClick={onSave}
            disabled={!canSave || savingPricing}
            className={`w-full lg:w-auto px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center ${
              canSave 
                ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                : "bg-[var(--foreground)]/[0.05] text-[var(--muted)]/40 cursor-not-allowed"
            }`}
          >
            {savingPricing ? (
              <div className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                <span>Saving...</span>
              </div>
            ) : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* ================= LEFT SIDEBAR (GAMES) ================= */}
        {pricingMode === "fixed" && (
          <div className="w-full lg:w-72 flex flex-col gap-4">
            <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Games</h3>
                <Gamepad2 size={14} className="text-[var(--accent)]" />
              </div>
              {/* Search Games */}
              <SearchInput
                placeholder="Search games..."
                value={gameSearch}
                onChange={setGameSearch}
                size="sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-none space-y-1 p-1 rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 custom-scrollbar">
              {filteredGames.map((g) => (
                <button aria-label="button"
                  key={g.gameSlug}
                  onClick={() => setFixedGameFilter(g.gameSlug)}
                  className={`w-full group relative flex items-center justify-between p-3 rounded-xl transition-all ${
                    fixedGameFilter === g.gameSlug
                      ? "bg-[var(--accent)]/10 border border-[var(--accent)]/20 shadow-lg shadow-[var(--accent)]/5"
                      : "hover:bg-[var(--foreground)]/[0.03] border border-transparent"
                  }`}
                >
                  <div className="flex flex-col items-start min-w-0">
                    <span className={`text-xs font-black uppercase tracking-tight truncate ${fixedGameFilter === g.gameSlug ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                      {g.gameName}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--muted)]/40 truncate">{g.gameSlug}</span>
                  </div>

                  {/* GAME STOCK TOGGLE */}
                  <div className="flex flex-col items-center gap-1 ml-2">
                    <button aria-label="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGameStock(g.gameSlug);
                      }}
                      title="Stock Status"
                      className={`w-8 h-4 rounded-full transition-all flex items-center px-0.5 ${
                        gameConfigs.find(gc => gc.gameSlug === g.gameSlug)?.isOutOfStock 
                          ? "bg-rose-500 shadow-sm shadow-rose-500/20" 
                          : "bg-emerald-500/20 border border-emerald-500/30"
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full bg-white transition-all ${
                        gameConfigs.find(gc => gc.gameSlug === g.gameSlug)?.isOutOfStock ? "translate-x-4" : "translate-x-0"
                      }`} />
                    </button>
                    <span className={`text-[6px] font-black uppercase ${gameConfigs.find(gc => gc.gameSlug === g.gameSlug)?.isOutOfStock ? "text-rose-500" : "text-emerald-500/40"}`}>
                      {gameConfigs.find(gc => gc.gameSlug === g.gameSlug)?.isOutOfStock ? "OOS" : "Stock"}
                    </span>
                  </div>
                </button>
              ))}
              {filteredGames.length === 0 && (
                <div className="py-10 text-center opacity-30">
                  <p className="text-[10px] font-bold uppercase tracking-widest">No games found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MAIN CONTENT AREA ================= */}
        <div className="flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {pricingMode === "percent" ? (
              <motion.div
                key="markup-pane"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-6 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)]/40 shadow-xl shadow-black/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner shrink-0">
                        <Percent className="text-[var(--accent)]" size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Profit Markup</h3>
                        <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">Set percentage profit based on price ranges</p>
                      </div>
                    </div>
                    <button aria-label="button"
                      onClick={addSlab}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--accent)] text-white text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                      + Add Range
                    </button>
                  </div>

                <div className="space-y-3">
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-4 text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/60">
                    <div className="col-span-4">Minimum Price (₹)</div>
                    <div className="col-span-4">Maximum Price (₹)</div>
                    <div className="col-span-3">Profit (%)</div>
                    <div className="col-span-1"></div>
                  </div>

                  {slabs.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-3 items-center p-5 sm:p-2 rounded-2xl sm:rounded-xl border sm:border-transparent border-[var(--border)] bg-[var(--background)]/30 sm:bg-transparent hover:bg-[var(--foreground)]/[0.02] transition-colors"
                    >
                      <div className="grid grid-cols-2 sm:contents gap-3">
                        <div className="sm:col-span-4 space-y-2 sm:space-y-0">
                          <label className="sm:hidden text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Min Price (₹)</label>
                          <input
                            type="number"
                            value={s.min}
                            onChange={(e) => updateSlab(i, "min", e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-[var(--background)]/50 sm:bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-mono font-bold text-sm outline-none focus:border-[var(--accent)]/50 transition-all"
                            placeholder="0"
                          />
                        </div>
                        <div className="sm:col-span-4 space-y-2 sm:space-y-0">
                          <label className="sm:hidden text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Max Price (₹)</label>
                          <input
                            type="number"
                            value={s.max}
                            onChange={(e) => updateSlab(i, "max", e.target.value)}
                            className="w-full h-11 px-4 rounded-xl bg-[var(--background)]/50 sm:bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--foreground)] font-mono font-bold text-sm outline-none focus:border-[var(--accent)]/50 transition-all"
                            placeholder="1000"
                          />
                        </div>
                      </div>

                      <div className="flex items-end sm:contents gap-3">
                        <div className="flex-1 sm:col-span-3 space-y-2 sm:space-y-0">
                          <label className="sm:hidden text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Profit (%)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={s.percent}
                              onChange={(e) => updateSlab(i, "percent", e.target.value)}
                              className="w-full h-11 px-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] font-black text-sm outline-none focus:border-[var(--accent)]/40 transition-all placeholder:text-[var(--accent)]/40"
                              placeholder="5"
                            />
                            <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--accent)]/60" />
                          </div>
                        </div>
                        <div className="sm:col-span-1 flex justify-center pb-1 sm:pb-0">
                          <button aria-label="button"
                            onClick={() => deleteSlab(i)}
                            className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[var(--muted)]/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {!slabs.length && (
                    <div className="py-20 text-center border border-dashed border-[var(--border)] bg-[var(--background)]/30 rounded-2xl flex flex-col items-center justify-center">
                      <Percent className="text-[var(--muted)]/20 mb-3" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]/60">No markup ranges defined</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            ) : (
              <motion.div
                key="fixed"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="space-y-4"
              >
                {/* ITEMS GRID */}

                {/* ITEMS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AnimatePresence>
                    {loadingFixedPrices ? (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-40">
                        <Loader2 size={28} className="animate-spin text-[var(--accent)] mb-3" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Fetching Prices...</p>
                      </div>
                    ) : (
                      visibleOverrides.map((o, idx) => (
                        <motion.div
                          key={o.itemSlug}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.01 }}
                          className={`p-4 rounded-2xl border transition-all ${
                            o.isEnabled 
                              ? "border-[var(--accent)]/20 bg-[#1e293b]/40 shadow-xl" 
                              : "border-[var(--border)] bg-[#1e293b]/20 opacity-60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="min-w-0">
                              <p className="text-[11px] font-[900] italic uppercase tracking-tighter text-white truncate">{o.itemName || o.itemSlug}</p>
                              <p className="text-[9px] font-mono text-[var(--muted)]/40 truncate">{o.itemSlug}</p>
                            </div>
                            
                            {/* STOCK TOGGLE */}
                            <div className="flex flex-col items-end gap-1.5 pr-2 border-r border-white/5">
                              <button aria-label="button"
                                onClick={() => toggleItemStock(o.itemSlug)}
                                className={`relative w-11 h-6 rounded-full transition-colors outline-none ${
                                  o.isOutOfStock ? "bg-rose-500 shadow-lg shadow-rose-500/20" : "bg-emerald-500/20 border border-emerald-500/30"
                                }`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                                  o.isOutOfStock ? "left-6" : "left-1"
                                }`} />
                              </button>
                              <span className={`text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${o.isOutOfStock ? "text-rose-500" : "text-emerald-500/40"}`}>
                                {o.isOutOfStock ? "Out of Stock" : "In Stock"}
                              </span>
                            </div>

                            {/* TOGGLE SWITCH */}
                            <div className="flex flex-col items-end gap-1.5 pl-2">
                              <button aria-label="button"
                                onClick={() => toggleOverrideStatus(o.itemSlug)}
                                className={`relative w-11 h-6 rounded-full transition-colors outline-none ${
                                  o.isEnabled ? "bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/20" : "bg-[#334155]"
                                }`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                                  o.isEnabled ? "left-6" : "left-1"
                                }`} />
                              </button>
                              <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40 whitespace-nowrap">Use override</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Selling Price (INR)</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={o.fixedPrice}
                                disabled={!o.isEnabled}
                                onChange={(e) => updateOverridePrice(o.itemSlug, e.target.value)}
                                className={`w-full h-11 px-4 rounded-xl border text-white font-black text-sm tabular-nums outline-none transition-all ${
                                  o.isEnabled 
                                    ? "bg-[#0f172a] border-white/5 focus:border-[var(--accent)]/40 shadow-inner" 
                                    : "bg-black/20 border-white/5 cursor-not-allowed"
                                }`}
                                placeholder="0"
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            {o.isEnabled ? (
                              <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-emerald-500/80 uppercase tracking-tighter">Override Active</span>
                              </div>
                            ) : <div />}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
