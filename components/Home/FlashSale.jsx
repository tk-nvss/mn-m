"use client";

import Image from "next/image";
import Link from "next/link";
import { FiZap, FiClock, FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import { ProductCardSkeleton } from "../Skeleton/Skeleton";

const flashSaleData = [
    {
        id: 1,
        name: "Weekly Pass",
        game: "MLBB",
        image: "/game-assets/weeklypass.jpg",
        price: "₹150",
        originalPrice: "₹175",
        slug: "mobile-legends270?type=weekly-pass",
        badge: "Hot"
    },
    {
        id: 2,
        name: "Blessing Welkin",
        game: "Genshin",
        image: "/game-assets/genshin.jpg",
        price: "₹405",
        originalPrice: "₹450",
        slug: "genshin-impact742",
        badge: "Sale"
    },
    {
        id: 3,
        name: "Starlight Card",
        game: "MLBB",
        image: "/game-assets/starkight.webp",
        price: "₹240",
        originalPrice: "₹299",
        slug: "starlight-card-manual",
        badge: "New"
    },
    // {
    //     id: 3,
    //     name: "Weekly Card Plus",
    //     game: "HOK",
    //     image: "/game-assets/hok.jpg",
    //     price: "₹240",
    //     originalPrice: "₹299",
    //     slug: "honor-of-kings57",
    //     badge: "Best"
    // },
    {
        id: 5,
        name: "Weekly Bundle",
        game: "MLBB",
        image: "/game-assets/weekly-monthly-bundle.jpg",
        price: "₹85",
        originalPrice: "₹100",
        slug: "weeklymonthly-bundle261",
        badge: "Value"
    },
    {
        id: 6,
        name: "Weekly Card plus",
        game: "HOK",
        image: "/game-assets/hok.jpg",
        price: "₹380",
        originalPrice: "₹450",
        slug: "honor-of-kings57",
        badge: "Best"
    },

];

export default function FlashSale() {
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock loading for premium feel
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative py-1.5 px-4 overflow-hidden border-b border-[var(--border)] bg-[var(--card)]/30">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/5 blur-[80px] pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                {/* Compact Header */}
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                            <FiZap size={12} fill="currentColor" />
                        </div>
                        <h2 className="text-base sm:text-lg font-black uppercase tracking-tighter italic text-[var(--foreground)]">
                            Flash <span className="text-amber-500">Sale</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 bg-[var(--foreground)]/[0.03] backdrop-blur-md border border-[var(--border)] px-3 py-1 rounded-xl">
                        <FiClock className="text-amber-500 hidden sm:block" size={10} />
                        <div className="flex items-center gap-2 font-bold text-[10px] tabular-nums text-amber-500">
                            <span className="opacity-60 text-[8px] uppercase tracking-widest text-[var(--foreground)] mr-1 hidden md:block">Ends In</span>
                            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="opacity-30 text-[var(--foreground)]">:</span>
                            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="opacity-30 text-[var(--foreground)]">:</span>
                            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {/* Compact Horizontal Slider */}
                <div className="overflow-x-auto pb-2 custom-scrollbar-premium snap-x snap-mandatory">
                    <div className="flex gap-3 md:gap-4 px-1 min-w-max md:min-w-0">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="w-[125px] sm:w-[150px] md:w-[200px]">
                                    <ProductCardSkeleton />
                                </div>
                            ))
                        ) : (
                            flashSaleData.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="snap-start"
                                >
                                    <Link
                                        href={`/games/${item.slug}`}
                                        className="group relative block w-[120px] sm:w-[145px] md:w-[185px] bg-[var(--card)]/40 backdrop-blur-lg border border-[var(--border)] rounded-[1rem] p-1.5 shadow-md hover:border-amber-500/30 transition-colors"
                                    >
                                        {/* Game Badge */}
                                        <div className="absolute top-2.5 left-2.5 z-20">
                                            <span className="text-[7px] md:text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-500 text-black shadow-lg">
                                                {item.game}
                                            </span>
                                        </div>

                                        {/* Image Container */}
                                        <div className="relative aspect-[16/13] rounded-[0.8rem] overflow-hidden mb-1 ring-1 ring-[var(--border)] bg-[var(--foreground)]/[0.05]">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 640px) 140px, 185px"
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60" />
                                        </div>

                                        {/* Compact Info */}
                                        <div className="space-y-0.5 px-0.5 pt-0.5">
                                            <h3 className="text-[10.5px] md:text-[13px] font-black uppercase tracking-tight text-[var(--foreground)] truncate group-hover:text-amber-500 leading-tight">
                                                {item.name}
                                            </h3>

                                            <div className="flex items-baseline justify-between pt-0.5">
                                                <span className="text-[13px] md:text-[15px] font-black italic text-[var(--foreground)] leading-none">
                                                    {item.price}
                                                </span>
                                                <span className="text-[8.5px] md:text-[10px] font-semibold text-[var(--muted)] line-through decoration-red-500/80">
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

                <style jsx global>{`
                    .custom-scrollbar-premium::-webkit-scrollbar {
                        height: 3px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-track {
                        background: var(--border);
                        border-radius: 10px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-thumb {
                        background: var(--accent);
                        border-radius: 10px;
                    }
                    .custom-scrollbar-premium::-webkit-scrollbar-thumb:hover {
                        background: rgba(245, 158, 11, 0.4);
                    }
                `}</style>
            </div>
        </section>
    );
}
