"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiX, FiSearch, FiGrid, FiList, FiTrendingUp, FiZap, FiPackage, FiTv, FiLayers } from "react-icons/fi";
import { GiCrown, GiCrossedSwords, GiTicket, GiStarMedal, GiGamepad } from "react-icons/gi";
import GameGrid from "@/components/Games/GameGrid";
import GameList from "@/components/Games/GameList";
import FilterModal from "@/components/Games/FilterModal";
import ServiceGridSection from "@/components/Games/ServiceGridSection";
import { ProductCardSkeleton, ProductListSkeleton } from "@/components/Skeleton/Skeleton";
import api from "@/lib/axios";

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <GamesContent />
    </Suspense>
  );
}

function GamesContent() {
  /* ================= STATE ================= */
  const [category, setCategory] = useState([]);
  const [games, setGames] = useState([]);

  const [mlbbVeriant, setMlbbVeriant] = useState([]);

  const [otts, setOtts] = useState(null);
  const [memberships, setMemberships] = useState(null);
  const [vouchers, setVouchers] = useState(null);
  const [services, setServices] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [sort, setSort] = useState("az");
  const [hideOOS, setHideOOS] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  /* ================= CONFIG ================= */
  const WEEKLY_PASS_SLUG = "mobile-legends270";

  const outOfStockGames = [
    "mobile-legends-backup826"
  ];

  const outOfStockSet = useMemo(() => new Set(outOfStockGames), []);

  const isOutOfStock = useCallback(
    (name) => outOfStockSet.has(name),
    [outOfStockSet]
  );

  /* ================= FETCH ================= */
  useEffect(() => {
    let mounted = true;

    const loadGames = async () => {
      try {
        const { data: json } = await api.get("/api/games");
        if (!mounted) return;

        let fetchedGames = json?.data?.games || [];
        let fetchedMlbbVariant = json?.data?.mlbbVariants || [];

        // Duplicate Weekly Pass (same slug)
        const weeklyPassSource = fetchedGames.find(
          (g) => g.gameSlug === WEEKLY_PASS_SLUG
        );

        if (weeklyPassSource) {
          const alreadyExists = fetchedGames.some(
            (g) =>
              g.gameSlug === WEEKLY_PASS_SLUG &&
              g.gameName === "Weekly Pass",
          );

          if (!alreadyExists) {
            fetchedGames.push({
              ...weeklyPassSource,
              gameName: "Weekly Pass",
              _variant: "weekly-pass",
              gameImageId: {
                image: "/game-assets/weeklypass.jpg",
              },
            });
          }
        }

        setCategory(json?.data?.category || []);
        setGames(fetchedGames);
        setMlbbVeriant(fetchedMlbbVariant);

        setOtts(json?.data?.otts || null);
        setMemberships(json?.data?.memberships || null);
        setVouchers(json?.data?.vouchers || null);
        setServices(json?.data?.services || null);
      } catch (err) {
        console.error("Failed to load games:", err);
      }
    };

    loadGames().finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  /* ================= FILTER COUNT ================= */
  const activeFilterCount =
    (sort !== "az" ? 1 : 0) + (hideOOS ? 1 : 0);

  /* ================= PROCESSING ================= */
  const processList = useCallback((list) => {
    let result = [...list];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => {
        const name = (g.gameName || g.name || "").toLowerCase();
        return name.includes(q);
      });
    }
    if (hideOOS) {
      result = result.filter((g) => !isOutOfStock(g.gameName));
    }
    if (sort === "az") {
      result.sort((a, b) => (a.gameName || "").localeCompare(b.gameName || ""));
    } else if (sort === "za") {
      result.sort((a, b) => (b.gameName || "").localeCompare(a.gameName || ""));
    }
    return result;
  }, [searchQuery, hideOOS, sort, isOutOfStock]);

  const processedGames = useMemo(() => processList(games), [games, processList]);
  const processedMlbbGames = useMemo(() => processList(mlbbVeriant), [mlbbVeriant, processList]);

  const processedOtts = useMemo(() => otts?.items ? processList(otts.items) : [], [otts, processList]);
  const processedMemberships = useMemo(() => memberships?.items ? processList(memberships.items) : [], [memberships, processList]);
  const processedVouchers = useMemo(() => vouchers?.items ? processList(vouchers.items) : [], [vouchers, processList]);
  const processedServices = useMemo(() => services?.items ? processList(services.items) : [], [services, processList]);

  const isEmpty =
    processedGames.length === 0 &&
    processedMlbbGames.length === 0 &&
    processedOtts.length === 0 &&
    processedMemberships.length === 0 &&
    processedVouchers.length === 0 &&
    processedServices.length === 0;

  /* ================= HANDLERS ================= */
  const clearFilters = () => {
    setSort("az");
    setHideOOS(false);
    setSearchQuery("");
  };

  const isMlbbGame = (game) => {
    const slug = game.gameSlug?.toLowerCase() || "";
    const name = game.gameName?.toLowerCase() || "";
    return slug.includes("mlbb") || name.includes("mlbb") || slug.includes("legends988") || slug.includes("weeklymonthly-bundle");
  };

  /* ================= RENDER COMPONENTS ================= */
  const SectionHeader = ({ title, icon: Icon, count, gradient }) => (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[var(--border)]/40 pb-4">
      <div className="flex items-center gap-3">
        {/* Simple elegant icon */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm transition-all duration-300 group-hover:border-[var(--accent)]/40 group-hover:shadow-md">
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-10`} />
          <Icon size={18} className="relative z-10 text-[var(--foreground)] opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[var(--foreground)] leading-tight">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={`w-1 h-1 rounded-full bg-gradient-to-br ${gradient}`} />
            <span className="text-[10px] font-medium text-[var(--muted)] uppercase tracking-widest">
              {count} <span className="opacity-60">Items Found</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:py-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ================= COMPACT SEARCH & CONTROLS ================= */}
        <div className="space-y-3 mb-10">
          <div className="relative bg-[var(--card)] backdrop-blur-3xl border border-[var(--border)] rounded-full p-1 shadow-sm flex items-center gap-1 transition-shadow duration-300 hover:shadow-md focus-within:shadow-[0_4px_15px_rgba(var(--accent-rgb),0.1)] focus-within:border-[var(--accent)]/50">
            {/* Soft inner glow on focus */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent rounded-full opacity-0 focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* SEARCH */}
            <div className="relative flex-1 group/search z-10">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within/search:text-[var(--accent)] transition-colors" size={12} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-7 py-1.5 rounded-full bg-transparent outline-none text-[10px] sm:text-[11px] font-bold tracking-widest placeholder:text-[var(--muted)]/60 text-[var(--foreground)]"
              />
              {searchQuery && (
                <button aria-label="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-colors"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>

            {/* ACTION GRID */}
            <div className="flex items-center gap-1 relative z-10 pr-0.5">
              {/* VIEW TOGGLE */}
              <div className="flex p-0.5 rounded-full bg-[var(--background)] shadow-inner border border-[var(--border)]/50">
                {[
                  { id: "grid", icon: FiGrid },
                  { id: "list", icon: FiList },
                ].map((mode) => (
                  <button aria-label="button"
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === mode.id
                      ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm scale-[1.02]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                      }`}
                  >
                    <mode.icon size={11} />
                  </button>
                ))}
              </div>

              {/* FILTER BUTTON */}
              <button aria-label="button"
                onClick={() => setShowFilter(true)}
                className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${activeFilterCount > 0
                  ? "border-transparent bg-gradient-to-br from-[var(--accent)] to-indigo-500 text-white shadow-[0_2px_8px_rgba(var(--accent-rgb),0.3)] hover:scale-105"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:shadow-sm"
                  }`}
              >
                <FiFilter size={11} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center bg-white text-black rounded-full text-[8px] font-black shadow-md border border-[var(--card)]">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= GAME CONTENT ================= */}
        <div className="space-y-20">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4" : "flex flex-col gap-3"}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                viewMode === "grid" ? <ProductCardSkeleton key={i} /> : <ProductListSkeleton key={i} />
              ))}
            </div>
          ) : isEmpty ? (
            <div key="empty" className="py-20 text-center">
              <div className="w-24 h-24 bg-[var(--card)] border border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-6">
                <FiX size={40} className="text-[var(--muted)]/30" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">No Games Found</h3>
              <p className="text-[var(--muted)] text-sm mb-8">Try adjusting your search or filters to find what you're looking for.</p>
              <button aria-label="button"
                onClick={clearFilters}
                className="px-8 py-4 rounded-2xl bg-[var(--accent)] text-black font-black uppercase tracking-widest text-xs italic"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              {/* 2. MLBB VARIANT */}
              {(activeTab === "all" || activeTab === "mlbb") && processedMlbbGames.length > 0 && (
                <div className="mb-20">
                  <SectionHeader
                    title="MLBB Special"
                    icon={GiCrown}
                    count={processedMlbbGames.length}
                    gradient="from-blue-500 to-indigo-600"
                  />
                  {viewMode === "grid"
                    ? <GameGrid games={processedMlbbGames} isOutOfStock={isOutOfStock} />
                    : <GameList games={processedMlbbGames} isOutOfStock={isOutOfStock} />
                  }
                </div>
              )}

              {/* 3. ALL GAMES */}
              {(activeTab === "all" || activeTab === "others") && (processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g)).length > 0) && (
                <div className="mb-20">
                  <SectionHeader
                    title="Full Armory"
                    icon={GiCrossedSwords}
                    count={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g)).length}
                    gradient="from-[var(--accent)] to-cyan-600"
                  />
                  {viewMode === "grid"
                    ? <GameGrid games={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g))} isOutOfStock={isOutOfStock} />
                    : <GameList games={processedGames.filter(g => activeTab !== "others" || !isMlbbGame(g))} isOutOfStock={isOutOfStock} />
                  }
                </div>
              )}

              {/* 6. VOUCHERS SECTION */}
              {(activeTab === "all" || activeTab === "vouchers") && processedVouchers.length > 0 && (
                <div className="mb-10 border-t border-[var(--border)] pt-10">
                  <SectionHeader
                    title="Premium Vouchers"
                    icon={GiTicket}
                    count={processedVouchers.length}
                    gradient="from-amber-400 to-orange-600"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedVouchers.length}
                    items={processedVouchers}
                    hrefPrefix="/games"
                  />
                </div>
              )}

              {/* 7. SERVICES SECTION */}
              {(activeTab === "all" || activeTab === "services") && processedServices.length > 0 && (
                <div className="mb-10 border-t border-[var(--border)] pt-10">
                  <SectionHeader
                    title="Premium Services"
                    icon={GiStarMedal}
                    count={processedServices.length}
                    gradient="from-blue-400 to-indigo-600"
                  />
                  <ServiceGridSection
                    title={null}
                    total={processedServices.length}
                    items={processedServices}
                    hrefPrefix="/games"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FILTER MODAL */}
      <FilterModal
        open={showFilter}
        onClose={() => setShowFilter(false)}
        sort={sort}
        setSort={setSort}
        hideOOS={hideOOS}
        setHideOOS={setHideOOS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </main>
  );
}
