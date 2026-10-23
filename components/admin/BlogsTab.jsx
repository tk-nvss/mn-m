"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  RefreshCcw,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Check
} from "lucide-react";
import { SearchInput, SectionTitle } from "@/components/common";

const GAME_OPTIONS = [
  { id: "all", label: "All Games" },
  { id: "mlbb", label: "MLBB" },
  { id: "esports", label: "Esports" },
  { id: "freefire", label: "Free Fire" },
  { id: "pubg", label: "PUBG" },
];

const TYPE_OPTIONS = [
  { id: "all", label: "All Types" },
  { id: "Guides", label: "Guides" },
  { id: "News", label: "News" },
  { id: "Updates", label: "Updates" },
  { id: "Esports", label: "Esports" },
];

export default function BlogsTab() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const [gameFilter, setGameFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, debouncedSearch, gameFilter, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, gameFilter, typeFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      let url = `/api/blogs?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`;
      if (gameFilter !== "all") url += `&game=${encodeURIComponent(gameFilter)}`;
      if (typeFilter !== "all") url += `&type=${encodeURIComponent(typeFilter)}`;
      const res = await api.get(url);
      if (res.data?.success) {
        setBlogs(res.data.blogs || []);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching blogs", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (slug) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      const res = await api.delete(`/api/blogs/${slug}`);
      if (res.data?.success) {
        setBlogs((prev) => prev.filter((b) => b.slug !== slug));
      }
    } catch (error) {
      console.error("Error deleting blog", error);
    }
  };

  const activeFilterCount = (gameFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || debouncedSearch.trim() !== "";

  /* ── BOTTOM SHEET CONTENT ── */
  const sheetContent = (
    <AnimatePresence>
      {showFilters && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[var(--accent)]" />
                <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Filter Articles</span>
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/20">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setGameFilter("all");
                      setTypeFilter("all");
                    }}
                    className="text-[11px] font-semibold text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer mr-1"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setShowFilters(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter Section 1: Game Filter */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Select Game</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GAME_OPTIONS.map((g) => {
                  const isSelected = gameFilter === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGameFilter(g.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Section 2: Content Type */}
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-2 flex items-center gap-1.5">
                <span>Article Type</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const isSelected = typeFilter === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTypeFilter(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-2xs font-bold"
                          : "bg-[var(--foreground)]/[0.02] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply Action Button */}
            <div className="pt-2 border-t border-[var(--border)]/60">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                style={{ color: "#ffffff" }}
                className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-bold transition-all cursor-pointer text-center shadow-xs"
              >
                Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-3 pb-8 animate-in fade-in duration-300">
      {/* ── HEADER / TOOLBAR (ROW 1) ── */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[var(--border)]/70">
        <SectionTitle
          size="xs"
          subtitle="Content & SEO"
          title="Blogs &"
          highlight="Articles"
          icon={<FileText size={13} className="text-[var(--accent)]" />}
          pulse
        />

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchBlogs}
            disabled={loading}
            className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Refresh blogs"
          >
            <RefreshCcw size={12} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>

          {/* New Blog CTA Button */}
          <button
            type="button"
            onClick={() => router.push("/owner-panal/blogs/new")}
            style={{ color: "#ffffff" }}
            className="h-7 px-2.5 rounded-lg bg-[var(--accent)] hover:brightness-110 text-white font-black uppercase tracking-wider text-[10px] transition-all flex items-center gap-1 shadow-2xs active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus size={12} color="#ffffff" style={{ color: "#ffffff" }} className="shrink-0 stroke-[2.5]" />
            <span style={{ color: "#ffffff" }} className="whitespace-nowrap text-white font-black">
              New Blog
            </span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER ROW (ROW 2 - Filter Side to Search) ── */}
      <div className="flex items-center gap-2 w-full">
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setCurrentPage(1);
            setSearchQuery(val);
          }}
          placeholder="Search by title, game, or slug..."
          loading={loading}
          variant="pill"
          className="flex-1"
        />

        {/* Filter Trigger Button beside search */}
        <button
          type="button"
          aria-label="Filter blogs"
          onClick={() => setShowFilters(true)}
          className={`h-8.5 px-3 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeFilterCount > 0
              ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-2xs"
              : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
          }`}
        >
          <Filter size={13} style={{ color: activeFilterCount > 0 ? "#ffffff" : undefined }} />
          <span className="text-[11px] font-bold" style={{ color: activeFilterCount > 0 ? "#ffffff" : undefined }}>
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-[var(--accent)] text-[9px] font-black flex items-center justify-center shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setGameFilter("all");
              setTypeFilter("all");
              setSearchQuery("");
            }}
            className="px-2 h-8.5 rounded-full text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── BLOGS LIST ── */}
      {loading && blogs.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--muted)] font-medium">Loading articles...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-2xs">
          <FileText size={24} className="mx-auto text-[var(--muted)]/50 mb-2" />
          <p className="text-[var(--foreground)] font-bold text-xs">No blogs found</p>
          <p className="text-[var(--muted)] text-[11px] mt-0.5">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blogs.map((blog) => (
            <div 
              key={blog._id || blog.slug} 
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5 sm:p-3 hover:border-[var(--accent)]/40 transition-all flex items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Thumbnail */}
                <div className="w-14 h-10 sm:w-16 sm:h-11 shrink-0 rounded-lg overflow-hidden bg-[var(--foreground)]/[0.05] border border-[var(--border)]/60 relative hidden xs:block">
                  <img 
                    src={blog.image || "/placeholder.jpg"} 
                    alt={blog.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                </div>
                
                {/* Blog Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <Link 
                    href={`/blog/${blog.game}/${blog.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full"
                  >
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                      {blog.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap text-[10px] text-[var(--muted)]">
                    <span className="uppercase font-bold text-[9px] text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.2 rounded border border-[var(--accent)]/20">
                      {blog.game}
                    </span>
                    <span className="font-medium text-[var(--foreground)]/80">{blog.type}</span>
                    <span>•</span>
                    <span>{new Date(blog.createdAt || blog.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Borderless Icons) */}
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href={`/blog/${blog.game}/${blog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-emerald-400 hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center"
                  title="View live blog"
                >
                  <ExternalLink size={13} />
                </Link>
                <Link
                  href={`/owner-panal/blogs/${blog.slug}`}
                  className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center"
                  title="Edit blog"
                >
                  <Edit3 size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => deleteBlog(blog.slug)}
                  className="w-7 h-7 rounded-lg text-[var(--muted)] hover:text-rose-400 hover:bg-[var(--foreground)]/[0.06] transition-all flex items-center justify-center cursor-pointer"
                  title="Delete blog"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-3 py-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
              <span>
                Page <strong className="text-[var(--foreground)]">{currentPage}</strong> of <strong className="text-[var(--foreground)]">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]"
                >
                  <ChevronLeft size={10} /> Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]"
                >
                  Next <ChevronRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PORTAL MOUNTED BOTTOM SHEET ── */}
      {mounted && typeof document !== "undefined"
        ? createPortal(sheetContent, document.body)
        : null}
    </div>
  );
}
