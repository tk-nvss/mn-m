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
    return <Loader />;
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
    <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pt-6 pb-28">
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

      {/* ================= PURCHASE GUIDE ================= */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="max-w-6xl mx-auto mt-6">
        </div>      </div>
    </section>
  );
}
