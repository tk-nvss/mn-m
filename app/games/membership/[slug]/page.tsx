"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/Loader/Loader";
import MLBBPurchaseGuide from "@/components/HelpImage/MLBBPurchaseGuide";

import GameHeader from "@/components/GameDetail/GameHeader";
import PackageSelector from "@/components/GameDetail/PackageSelector";
import BuyPanel from "@/components/GameDetail/BuyPanel";


export default function GameDetailPage() {
  const { slug } = useParams();
  const router = useRouter();

  const sliderRef = useRef<HTMLDivElement | null>(null);
  const buyPanelRef = useRef<HTMLDivElement | null>(null);

  const [game, setGame] = useState<any>(null);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [viewMode, setViewMode] = useState<"slider" | "grid">("grid");
  const isBGMI =
    game?.gameName?.toLowerCase() === "pubg mobile";

  /* ================= FETCH GAME ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`/api/games/${slug}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const sortedItems = [...data.data.itemId].sort(
          (a, b) => a.sellingPrice - b.sellingPrice
        );

        setGame({
          ...data.data,
          allItems: sortedItems,
        });

        setActiveItem(sortedItems[0]);
      });
  }, [slug]);

  if (!game || !activeItem) {
    return (
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-[var(--card)]/50 rounded-3xl p-6 md:p-8 flex items-center gap-6 mb-8 border border-[var(--border)]">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-[var(--border)] shrink-0" />
            <div className="space-y-3 w-full">
              <div className="h-6 md:h-8 bg-[var(--border)] rounded-full w-1/2 md:w-1/3" />
              <div className="h-3 md:h-4 bg-[var(--border)]/50 rounded-full w-3/4 md:w-1/2" />
            </div>
          </div>

          {/* Controls Skeleton */}
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-2">
              <div className="h-5 bg-[var(--border)] rounded-full w-32" />
              <div className="h-3 bg-[var(--border)]/50 rounded-full w-20" />
            </div>
            <div className="h-10 w-20 bg-[var(--border)] rounded-xl" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-[var(--card)]/50 rounded-2xl h-28 border border-[var(--border)] p-4 flex flex-col justify-between">
                <div className="h-4 bg-[var(--border)] rounded-full w-1/2" />
                <div className="h-6 bg-[var(--border)] rounded-full w-3/4" />
              </div>
            ))}
          </div>

          {/* Buy Panel Skeleton */}
          <div className="bg-[var(--card)]/50 rounded-3xl p-6 border border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-xl bg-[var(--border)] shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-3 bg-[var(--border)]/50 rounded-full w-20" />
                <div className="h-5 bg-[var(--border)] rounded-full w-32" />
              </div>
            </div>
            <div className="h-12 w-full md:w-48 bg-[var(--border)] rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  /* ================= HELPERS ================= */
  const items = game.allItems;

  const calculateDiscount = (selling: number, dummy: number) => {
    if (!dummy || dummy <= selling) return null;
    return Math.round(((dummy - selling) / dummy) * 100);
  };

  const scrollToItem = (item: any) => {
    setActiveItem(item);

    const index = items.findIndex(
      (i: any) => i.itemSlug === item.itemSlug
    );

    const el = sliderRef.current?.children[index] as HTMLElement;
    el?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    buyPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const goBuy = (item: any) => {
    if (redirecting) return;
    setRedirecting(true);

    const query = new URLSearchParams({
      name: item.itemName,
      price: item.sellingPrice.toString(),
      dummy: item.dummyPrice?.toString() || "",
      image: item.itemImageId?.image || "",
    });

    const isBGMI =
      game?.gameName?.toLowerCase() === "pubg mobile";

    const basePath = isBGMI
      ? `/games/pubg/${slug}/buy`
      : `/games/ott/${slug}/buy`;

    router.push(
      `${basePath}/${item.itemSlug}?${query.toString()}`
    );
  };

  return (
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-6">
      {/* ================= HEADER ================= */}
      <GameHeader game={game} />

      {/* ================= PACKAGE SELECTOR ================= */}
      <PackageSelector
        items={items}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sliderRef={sliderRef}
        buyPanelRef={buyPanelRef}
        calculateDiscount={calculateDiscount}
        scrollToItem={scrollToItem}
      />


      {/* ================= BUY PANEL ================= */}
      <BuyPanel
        activeItem={activeItem}
        gameAvailablity={game.gameAvailablity}
        redirecting={redirecting}
        goBuy={goBuy}
        calculateDiscount={calculateDiscount}
        buyPanelRef={buyPanelRef}
      />

      {/* ================= MEMBERSHIP BENEFITS ================= */}
      <div className="max-w-6xl mx-auto mt-12 mb-12">
        <div className="flex items-center gap-4 mb-8 px-2">
          <div className="h-[1px] flex-1 bg-[var(--border)]" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted)] opacity-40 italic whitespace-nowrap">Member Protocol Benefits</h2>
          <div className="h-[1px] flex-1 bg-[var(--border)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
          {[
            {
              title: "Priority Support",
              desc: "Get help quickly from our top team whenever you have questions or problems.",
              comingSoon: false
            },

            {
              title: "Best Prices",
              desc: "Get the lowest and best rates in the market to help you save more.",
              comingSoon: false
            },
            {
              title: "Fast Delivery",
              desc: "Your orders are moved to the front of the line to make sure they reach you fast.",
              comingSoon: false
            },
            {
              title: "Profile Maker",
              desc: "Create cool game profile pictures and collages with our easy tool.",
              comingSoon: true
            },
            {
              title: "ID Renting",
              desc: "Get first choice and fast access to rent premium game IDs.",
              comingSoon: true
            }
          ].map((benefit, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-[var(--card)]/30 border border-[var(--border)] group hover:border-[var(--accent)]/30 transition-all relative overflow-hidden">
              {benefit.comingSoon && (
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                  <span className="text-[7px] font-black uppercase tracking-widest text-[var(--accent)]">Coming Soon</span>
                </div>
              )}
              <div className="h-1.5 w-8 bg-[var(--accent)]/20 rounded-full mb-6 group-hover:w-16 transition-all duration-500" />
              <h4 className="text-[11px] font-[1000] uppercase tracking-widest text-[var(--foreground)] mb-3 italic">{benefit.title}</h4>
              <p className="text-[10px] font-black text-[var(--muted)] uppercase leading-relaxed italic opacity-40">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PURCHASE GUIDE ================= */}
      <div className="max-w-6xl mx-auto mt-6">
      </div>
    </section>
  );
}
