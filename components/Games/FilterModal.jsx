"use client";

import { FiX, FiCheck, FiFilter, FiChevronRight, FiLayers } from "react-icons/fi";
import { GiCrown, GiGamepad, GiTicket, GiStarMedal } from "react-icons/gi";

export default function FilterModal({
  open,
  onClose,
  sort,
  setSort,
  hideOOS,
  setHideOOS,
  activeTab,
  setActiveTab,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <div
        className="relative w-full sm:max-w-md bg-[var(--card)] backdrop-blur-3xl border border-[var(--border)] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(var(--accent-rgb),0.3)]">
                <FiFilter size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest italic text-[var(--foreground)]">
                  Filter & Sort
                </h3>
                <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
                  Pick how to sort
                </p>
              </div>
            </div>
            <button aria-label="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-[var(--background)] hover:bg-[var(--foreground)]/5 border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] shadow-sm transition-all"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* Category Section */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-[var(--accent)] rounded-full" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                Category
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "All", icon: FiLayers },
                { id: "mlbb", label: "MLBB", icon: GiCrown },
                { id: "others", label: "Others", icon: GiGamepad },
                { id: "vouchers", label: "Vouchers", icon: GiTicket },
                { id: "services", label: "Services", icon: GiStarMedal },
              ].map((cat) => (
                <button aria-label="button"
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl font-black uppercase tracking-widest text-[8px] border transition-all duration-300
                    ${activeTab === cat.id
                      ? "border-transparent bg-[var(--accent)] text-white shadow-[0_2px_8px_rgba(var(--accent-rgb),0.3)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                    }`}
                >
                  <cat.icon size={11} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Section */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-[var(--accent)] rounded-full" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                Sort By
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "az", label: "Name: A to Z" },
                { id: "za", label: "Name: Z to A" },
              ].map((option) => (
                <button aria-label="button"
                  key={option.id}
                  onClick={() => setSort(option.id)}
                  className={`relative group flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300
                    ${sort === option.id
                      ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--foreground)]"
                    }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest italic transition-transform">
                    {option.label}
                  </span>
                  {sort === option.id && (
                    <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-[var(--background)] flex items-center justify-center">
                      <FiCheck size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-[var(--accent)] rounded-full" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
                Filter Items
              </p>
            </div>

            <div
              onClick={() => setHideOOS(!hideOOS)}
              className={`flex items-center justify-between p-3 px-4 rounded-xl border cursor-pointer transition-all duration-300
                ${hideOOS
                  ? "border-[var(--accent)]/50 bg-[var(--accent)]/10 shadow-sm"
                  : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/30"
                }`}
            >
              <div className="flex flex-col">
                <span className={`text-[10px] font-black uppercase tracking-widest italic ${hideOOS ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}>
                    Hide sold out items
                </span>
                <span className="text-[9px] font-medium text-[var(--muted)]">
                  Only show items in stock
                </span>
              </div>

              {/* Custom Toggle Switch */}
              <div className={`relative w-10 h-5 rounded-full p-0.5 flex items-center transition-colors duration-300 ${hideOOS ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}>
                <div
                  style={{ transform: hideOOS ? 'translateX(20px)' : 'translateX(0px)' }}
                  className="w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pb-24 sm:pb-6 bg-[var(--foreground)]/[0.02] border-t border-[var(--border)]">
          <button aria-label="button"
            onClick={onClose}
            className="group w-full py-4 rounded-[1.2rem] bg-gradient-to-r from-[var(--accent)] to-indigo-500 text-white font-black uppercase tracking-widest italic text-[11px] shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            Apply Filters
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <FiChevronRight size={14} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
