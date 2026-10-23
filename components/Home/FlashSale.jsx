"use client";

import Image from "next/image";
import Link from "next/link";
import { FiZap, FiClock } from "react-icons/fi";
import { useEffect, useState } from "react";
import { ProductCardSkeleton } from "../Skeleton/Skeleton";
import { SectionTitle } from "@/components/common";

const DEFAULT_FLASH_ITEMS = [
  {
    id: "fs_1",
    name: "Weekly Pass",
    game: "MLBB",
    image: "/game-assets/weeklypass.webp",
    price: "₹151",
    originalPrice: "₹170",
    slug: "flash-weekly621",
    badge: "Hot",
  },
  {
    id: "fs_2",
    name: "Blessing Welkin",
    game: "Genshin",
    image: "/game-assets/genshin.webp",
    price: "₹405",
    originalPrice: "₹450",
    slug: "genshin-impact265",
    badge: "Sale",
  },
  {
    id: "fs_3",
    name: "Starlight Card",
    game: "MLBB",
    image: "/game-assets/starkight.webp",
    price: "₹240",
    originalPrice: "₹299",
    slug: "starlight-card-manual",
    badge: "New",
  },
  {
    id: "fs_4",
    name: "Weekly Bundle",
    game: "MLBB",
    image: "/game-assets/weekly-monthly-bundle.webp",
    price: "₹84",
    originalPrice: "₹100",
    slug: "weeklymonthly-bundle646",
    badge: "Value",
  },
  {
    id: "fs_5",
    name: "Weekly Card plus",
    game: "HOK",
    image: "/game-assets/hok.webp",
    price: "₹385",
    originalPrice: "₹450",
    slug: "honor-of-kings57",
    badge: "Best",
  },
];

export default function FlashSale() {
  const [saleConfig, setSaleConfig] = useState({
    title: "Flash Sale",
    enabled: true,
    endTime: null,
    items: DEFAULT_FLASH_ITEMS,
  });

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [loading, setLoading] = useState(true);

  // Fetch dynamic Flash Sale configuration
  useEffect(() => {
    let isMounted = true;
    fetch("/api/flash-sale")
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success && json.data) {
          setSaleConfig({
            title: json.data.title || "Flash Sale",
            enabled: json.data.enabled !== false,
            endTime: json.data.endTime,
            items: json.data.items && json.data.items.length > 0 ? json.data.items : DEFAULT_FLASH_ITEMS,
          });
        }
      })
      .catch((err) => console.error("FlashSale fetch failed", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time countdown against endTime
  useEffect(() => {
    const updateCountdown = () => {
      if (!saleConfig.endTime) {
        // Fallback relative cycle
        setTimeLeft((prev) => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          return { hours: 12, minutes: 0, seconds: 0 };
        });
        return;
      }

      const diff = new Date(saleConfig.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [saleConfig.endTime]);

  if (!saleConfig.enabled || (!loading && saleConfig.items.length === 0)) {
    return null;
  }

  return (
    <section className="relative py-2.5 px-4 overflow-hidden border-b border-[var(--border)] bg-[var(--card)]/20">
      <div className="max-w-7xl mx-auto">
        {/* Header Strip */}
        <div className="mb-2.5">
          <SectionTitle
            size="sm"
            accentColor="amber"
            subtitle="Limited Time Deals"
            icon={<FiZap size={10} className="text-amber-500 fill-amber-500" />}
            title={saleConfig.title.split(" ")[0]}
            highlight={saleConfig.title.split(" ").slice(1).join(" ") || "Sale"}
            action={
              <div className="flex items-center gap-1.5 bg-[var(--foreground)]/5 border border-[var(--border)] px-2.5 py-1 rounded-xl">
                <FiClock className="text-amber-500 hidden sm:block" size={11} />
                <div className="flex items-center gap-1.5 font-bold text-[10px] tabular-nums text-amber-500">
                  <span className="opacity-60 text-[8px] uppercase tracking-widest text-[var(--foreground)] mr-1 hidden md:block">
                    Ends In
                  </span>
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="opacity-30 text-[var(--foreground)]">:</span>
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="opacity-30 text-[var(--foreground)]">:</span>
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>
            }
          />
        </div>

        {/* Horizontal Cards Slider */}
        <div className="overflow-x-auto pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          <div className="flex gap-2.5 sm:gap-3.5 px-0.5 min-w-max md:min-w-0">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[125px] sm:w-[150px] md:w-[185px]">
                  <ProductCardSkeleton />
                </div>
              ))
            ) : (
              saleConfig.items.map((item) => (
                <div key={item.id} className="snap-start">
                  <Link
                    href={`/games/${item.slug}`}
                    className="group relative block w-[122px] sm:w-[145px] md:w-[175px] bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1.5 hover:border-amber-500/50 transition-all duration-200"
                  >
                    {/* Badge & Game Tag */}
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1">
                      <span className="text-[7.5px] md:text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500 text-black shadow-sm">
                        {item.game}
                      </span>
                      {item.badge && item.badge !== "Hot" && (
                        <span className="text-[7px] md:text-[7.5px] font-black uppercase px-1 py-0.5 rounded bg-rose-600 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Image Container */}
                    <div className="relative aspect-[16/13] rounded-xl overflow-hidden mb-1 border border-[var(--border)] bg-[var(--background)]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 140px, 185px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
                    </div>

                    {/* Info */}
                    <div className="space-y-0.5 px-0.5 pt-0.5">
                      <h3 className="text-[11px] md:text-[12.5px] font-black uppercase tracking-tight text-[var(--foreground)] truncate group-hover:text-amber-500 leading-tight">
                        {item.name}
                      </h3>

                      <div className="flex items-baseline justify-between pt-0.5">
                        <span className="text-[12.5px] md:text-[14px] font-black italic text-[var(--foreground)] leading-none">
                          {item.price}
                        </span>
                        <span className="text-[9px] md:text-[10px] font-semibold text-[var(--muted)] line-through decoration-red-500/80">
                          {item.originalPrice}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
