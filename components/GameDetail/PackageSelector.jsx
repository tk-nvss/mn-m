"use client";

import { FiGrid, FiList, FiCheckCircle } from "react-icons/fi";
import Image from "next/image";

export default function PackageSelector({
  items,
  activeItem,
  setActiveItem,
  viewMode,
  setViewMode,
  sliderRef,
  buyPanelRef,
  calculateDiscount,
  scrollToItem,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0">
      {/* ================= HEADER & VIEW TOGGLE ================= */}
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-[1000] tracking-tighter text-[var(--foreground)] uppercase italic leading-none">
            Pick <span className="text-[var(--accent)]">Your Pack</span>
          </h2>
          <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40 flex items-center gap-2">
            <span className="w-3 h-[1px] bg-[var(--accent)]/30 rounded-full" />
            {items.length} Packs
          </p>
        </div>

        {/* View Toggle */}
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
      </div>

      {/* ================= CONTENT ================= */}
      <div key={viewMode}>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-10">
            {items.map((item) => {
              const discount = calculateDiscount(item.sellingPrice, item.dummyPrice);
              const isActive = activeItem.itemSlug === item.itemSlug;

              return (
                <div
                  key={item.itemSlug}
                  onClick={() => {
                    setActiveItem(item);
                    buyPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`relative group rounded-[1.25rem] p-3 cursor-pointer border-2 transition-all duration-500 flex flex-col justify-between min-h-[5.5rem] bg-[var(--card)]/60 backdrop-blur-sm
                  ${isActive
                      ? "border-[var(--accent)] shadow-lg scale-[1.02] z-10"
                      : "border-[var(--border)] hover:border-[var(--accent)]/40 hover:shadow-md"
                    }`}
                >
                  {/* WRAPPED CORNER BADGE */}
                  {discount > 0 && (
                    <div className="absolute -top-1 -left-1 z-20">
                       <div className="relative scale-[0.75] origin-top-left">
                          <div className="absolute top-5 left-0.5 w-1.2 h-2 bg-[var(--accent)] brightness-[0.4]" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
                          <div className="bg-gradient-to-br from-[var(--accent)] via-[var(--accent)] to-[var(--accent-hover)] text-white text-[8px] font-[1000] uppercase pl-2 pr-3.5 py-1 shadow-md corner-ribbon flex items-center relative overflow-hidden group-hover:pl-2.5 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer-fast pointer-events-none" />
                            {discount}% OFF
                          </div>
                       </div>
                    </div>
                  )}

                  {/* RIBBON (TOP RIGHT) */}
                  <div className={`absolute top-0 right-3 w-9 h-14 transition-all duration-700 ribbon-shape flex items-center justify-center pt-1 shadow-sm
                    ${isActive 
                        ? "bg-gradient-to-b from-[var(--accent)]/30 to-[var(--accent)]/10" 
                        : "bg-gradient-to-b from-[var(--accent)]/[0.08] to-transparent -translate-y-1 group-hover:translate-y-0"
                    }
                  `}>
                    <div className="relative w-5 h-5 transition-all duration-700 group-hover:scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]">
                        <Image
                            src={item?.itemImageId?.image || item?.image || "/logo.png"}
                            alt={`${item.itemName || "Package"} Top Up icon`}
                            fill
                            unoptimized
                            className={`object-contain transition-all duration-500 ${isActive ? "opacity-100 scale-110" : "opacity-40 grayscale-[0.2] group-hover:grayscale-0 group-hover:opacity-100"}`}
                        />
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="relative z-10 flex flex-col h-full pr-10 pt-1">
                    <p className={`text-[10px] font-[1000] tracking-tighter uppercase italic leading-[1.1] mb-1.5 ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`}>
                      {item.itemName}
                    </p>

                    <div className="flex flex-col mt-auto">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-xl font-[1000] tracking-tighter italic leading-none ${isActive ? "text-[var(--accent)] drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.3)]" : "text-[var(--foreground)]"}`}>
                            ₹{item.sellingPrice}
                          </span>
                          {item.dummyPrice > item.sellingPrice && (
                            <span className="text-[8px] font-bold text-[var(--muted)]/30 line-through opacity-40">
                              ₹{item.dummyPrice}
                            </span>
                          )}
                        </div>
                    </div>
                  </div>

                  {/* ACTIVE INDICATOR */}
                  {isActive && (
                    <div className="absolute bottom-2.5 right-2.5 text-[var(--accent)] animate-in zoom-in-50">
                      <FiCheckCircle size={12} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="pb-8">
            <div ref={sliderRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-6 pt-3 px-2 scrollbar-hide no-scrollbar -mx-2">
              {items.map((item) => {
                const isActive = activeItem.itemSlug === item.itemSlug;
                return (
                  <div
                    key={item.itemSlug}
                    onClick={() => scrollToItem(item)}
                    className={`relative snap-center min-w-[150px] rounded-[1.25rem] p-3 cursor-pointer border-2 transition-all duration-500 flex flex-col justify-between min-h-[5.5rem] overflow-hidden bg-[var(--card)]/60
                    ${isActive ? "border-[var(--accent)] bg-[var(--accent)]/[0.08] shadow-lg scale-[1.02]" : "border-[var(--border)] opacity-80 hover:opacity-100 hover:border-[var(--accent)]/40"}
                  `}>
                     <div className={`absolute top-0 right-3 w-9 h-14 transition-all duration-700 ribbon-shape flex items-center justify-center pt-1
                        ${isActive ? "bg-gradient-to-b from-[var(--accent)]/30 to-transparent" : "bg-[var(--accent)]/5"}
                     `}>
                        <div className="relative w-5 h-5">
                          <Image src={item?.itemImageId?.image || item?.image || "/logo.png"} alt={`${item.itemName || "Package"} Top Up icon`} fill unoptimized className={`object-contain transition-all duration-500 ${isActive ? "opacity-100 scale-110" : "opacity-30"}`} />
                        </div>
                     </div>
                    <div className="relative z-10 flex flex-col h-full pr-10 pt-1">
                      <p className={`text-[10px] font-[1000] tracking-tight uppercase italic leading-tight mb-1.5 ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                        {item.itemName}
                      </p>
                      <p className={`text-xl font-[1000] tracking-tighter italic leading-none mt-auto ${isActive ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>₹{item.sellingPrice}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .corner-ribbon {
          clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
          border-top-left-radius: 4px;
        }
        .ribbon-shape {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%);
        }
        @keyframes shimmer-fast {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 1.5s infinite linear;
        }
        .animate-in {
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
