"use client";

import Link from "next/link";
import Image from "next/image";


const storyData = [
  // {
  //   id: 5,
  //   title: "BGMI",
  //   badge: "Sale",
  //   color: "#f59e0b", // Orange
  //   image: "/game-assets/bgmi-logo.webp",
  //   link: "/games/bgmi-manual",
  // },
  {
    id: 0,
    title: "Weekly Pass",
    badge: "Best",
    color: "#15803d", // Green
    image: "/game-assets/weeklypass.jpg",
    link: "/games/mobile-legends270?type=weekly-pass",
  },
  {
    id: 1,
    title: "Weekly Bundle",
    badge: "Hot",
    color: "#b91c1c", // Red
    image: "/game-assets/weekly-monthly-bundle.jpg",
    link: "/games/weeklymonthly-bundle261",
  },
  {
    id: 2,
    title: "MLBB India",
    badge: "Live",
    color: "#15803d", // Green
    image: "/game-assets/mlbbindia.jpg",
    link: "/games/mobile-legends270",
  },
  {
    id: 3,
    title: "MLBB Double",
    badge: "New",
    color: "#1d4ed8", // Blue
    image: "/game-assets/double-dias.jpg",
    link: "/games/mlbb-double332",
  },
  {
    id: 4,
    title: "MLBB Small",
    color: "#7e22ce", // Purple
    image: "/game-assets/mlbb-ph-small.jpg",
    link: "/games/mobile-legends-philippines888",
  },

  {
    id: 5,
    title: "Starlight",
    badge: "Hot",
    color: "#0e7490", // Cyan
    image: "/game-assets/starkight.webp",
    link: "/games/starlight-card-manual",
  },
  {
    id: 6,
    title: "Honour of Kings",
    badge: "New",
    color: "#15803d", // Green
    image: "/game-assets/hok.jpg",
    link: "/games/honor-of-kings57",
  },
  {
    id: 7,
    title: "Membership",
    badge: "VIP",
    color: "#db2777", // Pink
    image: "/membership/silver-m.png",
    link: "/games/membership/silver-membership",
  },
  {
    id: 8,
    title: "Reseller",
    badge: "B2B",
    color: "#ca8a04", // Yellow/Gold
    image: "/membership/reseller-m.png",
    link: "/games/membership/reseller-membership",
  },
];

export default function StorySlider() {
  return (
    <section className="relative py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 md:gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory relative z-10">
          {storyData.map((item) => (
            <div
              key={item.id}
              className="opacity-100 translate-y-0"
            >
              <Link
                href={item.link}
                className="group relative flex flex-col items-center min-w-[72px] md:min-w-[82px] snap-center"
              >
                <div className="relative">
                  {/* Clean Colored Ring (No Shadow, No Glow) */}
                  <div
                    className="relative p-[2px] rounded-full transition-transform duration-500 group-hover:scale-105 z-10"
                    style={{
                      background: item.color || 'var(--accent)'
                    }}
                  >
                    <div className="p-0.5 rounded-full bg-[var(--background)]">
                      <div className="relative w-[58px] h-[58px] md:w-[70px] md:h-[70px] rounded-full overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 58px, 70px"
                          priority={item.id <= 2}
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status Badge (Flat Premium - No Shadow) */}
                  {item.badge && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[8px] md:text-[8.5px] font-bold text-white uppercase tracking-wider z-20 border border-[var(--background)]"
                      style={{ backgroundColor: item.color || "var(--accent)" }}
                    >
                      <span className="flex items-center gap-1.5">
                        {item.badge === "Live" && (
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        )}
                        {item.badge}
                      </span>
                    </span>
                  )}
                </div>

                {/* Title - Flat & Clean */}
                <span className="mt-4 text-[9px] md:text-[10px] font-medium text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors duration-300 tracking-wide text-center uppercase">
                  {item.title}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
