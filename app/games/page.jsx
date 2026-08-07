"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiX, FiSearch, FiGrid, FiList, FiTrendingUp, FiZap, FiPackage, FiTv } from "react-icons/fi";
import { GiCrown, GiCrossedSwords, GiTicket, GiStarMedal } from "react-icons/gi";
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
    <div className="group relative flex items-center gap-4 mb-8">
      {/* Theme-Adaptive Premium Icon Box */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Elegant soft glow matching the gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-[1rem]`} />
        
        {/* Clean, simple theme-adaptive box */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-[1rem] bg-[var(--card)] flex items-center justify-center text-[var(--foreground)] shadow-sm border border-[var(--border)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-[var(--accent)]/50">
          <Icon size={22} className="relative z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col gap-1.5 z-10">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-[var(--foreground)] to-[var(--muted)] leading-none drop-shadow-sm group-hover:translate-x-1 transition-transform duration-500">
          {title}
        </h2>
        
        <div className="flex items-center gap-3">
          {/* Glowing Line */}
          <div className="relative h-1 w-10 overflow-hidden rounded-full bg-[var(--foreground)]/10">
            <div className={`absolute inset-y-0 left-0 w-full bg-gradient-to-r ${gradient} shadow-[0_0_10px_currentColor]`} />
          </div>
          
          <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] group-hover:text-[var(--foreground)] transition-colors duration-500">
            {count} <span className="opacity-50">Items Found</span>
          </span>
        </div>
      </div>

      {/* Decorative trailing line */}
      <div className="flex-1 flex items-center ml-4 opacity-30 group-hover:opacity-100 transition-opacity duration-700">
        <div className={`w-1.5 h-1.5 rotate-45 bg-gradient-to-br ${gradient} shadow-[0_0_8px_currentColor]`} />
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--border)] to-transparent ml-[2px]" />
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button aria-label="button"
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex items-center justify-center gap-1.5 px-1.5 py-2 rounded-lg font-black uppercase tracking-tight text-[8px] sm:text-[9px] italic border
        ${activeTab === id
          ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/40 shadow-[0_0_10px_rgba(var(--accent-rgb),0.1)]"
          : "bg-[var(--foreground)]/5 text-[var(--muted)] border-[var(--border)] hover:bg-[var(--foreground)]/10"
        }`}
    >
      <Icon size={12} className={`shrink-0 ${activeTab === id ? "fill-current" : ""}`} />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 sm:py-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ================= COMPACT SEARCH & CONTROLS ================= */}
        <div className="space-y-4 mb-16">
          <div className="bg-[var(--card)]/90 backdrop-blur-3xl border border-[var(--border)] rounded-[1.8rem] p-1.5 sm:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-2">
            {/* SEARCH */}
            <div className="relative flex-1 group/search">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within/search:text-[var(--accent)]" size={15} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-11 pr-10 py-3 rounded-[1.2rem] bg-[var(--background)] border border-[var(--border)] focus:bg-[var(--card)] focus:border-[var(--accent)]/30 outline-none text-[10px] sm:text-xs font-black tracking-widest placeholder:text-[var(--muted)]/50 uppercase italic text-[var(--foreground)]"
              />
              {searchQuery && (
                <button aria-label="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-red-500/10 text-red-500/60 hover:text-red-500"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* ACTION GRID - COMPACT */}
            <div className="flex items-center gap-2">
              {/* VIEW TOGGLE */}
              <div className="flex p-1 rounded-xl bg-[var(--border)]/30 border border-[var(--border)]">
                {[
                  { id: "grid", icon: FiGrid },
                  { id: "list", icon: FiList },
                ].map((mode) => (
                  <button aria-label="button"
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-2 rounded-lg ${viewMode === mode.id
                      ? "bg-[var(--accent)] text-[var(--background)] shadow-lg"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                  >
                    <mode.icon size={14} />
                  </button>
                ))}
              </div>

              {/* FILTER BUTTON */}
              <button aria-label="button"
                onClick={() => setShowFilter(true)}
                className={`relative flex items-center gap-2 px-3 py-3 rounded-xl font-black uppercase tracking-tight text-[9px] italic border ${activeFilterCount > 0
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                  }`}
              >
                <FiFilter size={13} />
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center bg-[var(--accent)] text-black rounded-md text-[8px] font-black">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* CATEGORY TABS - ULTRA COMPACT SINGLE ROW */}
          <div className="flex items-center gap-1.5 w-full">
            <TabButton id="all" label="All" icon={FiGrid} />
            <TabButton id="mlbb" label="MLBB" icon={FiZap} />
            <TabButton id="others" label="Others" icon={FiPackage} />
            <TabButton id="vouchers" label="Vouchers" icon={FiPackage} />
            <TabButton id="services" label="Services" icon={FiZap} />
          </div>
        </div>

        {/* ================= GAME CONTENT ================= */}
        <div className="space-y-20">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-3"}>
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
      />
    </main>
  );
}
