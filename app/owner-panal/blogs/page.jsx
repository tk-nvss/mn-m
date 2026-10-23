"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Filter } from "lucide-react";
import { SearchInput, SectionTitle } from "@/components/common";

export default function AdminBlogsPage() {
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
        setBlogs(res.data.blogs);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
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

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] p-3 sm:p-4 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-3">
          {/* Top Header */}
          <div className="pb-2.5 border-b border-[var(--border)]/70">
            <SectionTitle
              as="h1"
              size="sm"
              accentColor="purple"
              subtitle="Content Management"
              title="Manage"
              highlight="Blogs"
              icon={
                <Link
                  href="/owner-panal"
                  className="w-7 h-7 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] inline-flex items-center justify-center hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all shadow-2xs mr-1"
                >
                  <FaArrowLeft size={10} />
                </Link>
              }
              action={
                <Link
                  href="/owner-panal/blogs/new"
                  className="h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <FaPlus size={9} className="text-white shrink-0" />
                  <span className="text-white font-black whitespace-nowrap">New Blog</span>
                </Link>
              }
            />
          </div>

          {/* Search Bar + Filter Trigger (Matching OrdersTab style) */}
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
            <button
              aria-label="Filter Blogs"
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`h-9 w-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 ${
                showFilters || gameFilter !== "all" || typeFilter !== "all"
                  ? "bg-purple-600 text-white border-transparent"
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30"
              }`}
            >
              <Filter size={13} />
            </button>
          </div>

          {/* Filters Bar (Collapsible) */}
          {showFilters && (
            <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-[var(--muted)] uppercase tracking-wider">Filter By</span>
                {(gameFilter !== "all" || typeFilter !== "all" || searchQuery) && (
                  <button
                    onClick={() => {
                      setGameFilter("all");
                      setTypeFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-[var(--muted)] hover:text-rose-400 cursor-pointer font-bold transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Game Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[9px] uppercase font-bold text-[var(--muted)] shrink-0">Game:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "mlbb", label: "MLBB" },
                  { id: "esports", label: "Esports" },
                  { id: "freefire", label: "Free Fire" },
                  { id: "pubg", label: "PUBG" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGameFilter(g.id)}
                    className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      gameFilter === g.id
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)]/60"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Blog Cards List */}
          {loading ? (
            <div className="py-12 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-2xs">
              <p className="text-[var(--muted)] text-xs">No blogs found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {blogs.map((blog) => (
                <div 
                  key={blog._id} 
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 hover:border-[var(--accent)]/40 transition-all flex items-center justify-between gap-3 shadow-2xs group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Thumbnail */}
                    <div className="w-14 h-10 sm:w-16 sm:h-11 shrink-0 rounded-lg overflow-hidden bg-[var(--foreground)]/[0.05] border border-[var(--border)]/60 relative hidden xs:block">
                      <img 
                        src={blog.image || "/placeholder.jpg"} 
                        alt={blog.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    {/* Blog Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <Link href={`/blog/${blog.game}/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <h2 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                          {blog.title}
                        </h2>
                      </Link>
                      <div className="flex items-center gap-2 flex-wrap text-[10px] text-[var(--muted)]">
                        <span className="uppercase font-bold text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.2 rounded border border-purple-500/20">{blog.game}</span>
                        <span className="font-medium text-[var(--foreground)]/80">{blog.type}</span>
                        <span>•</span>
                        <span>{new Date(blog.createdAt || blog.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Borderless Icons Only) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/blog/${blog.game}/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[var(--muted)] hover:text-emerald-400 transition-colors flex items-center justify-center"
                      title="View live blog"
                    >
                      <FaExternalLinkAlt size={12} />
                    </Link>
                    <Link
                      href={`/owner-panal/blogs/${blog.slug}`}
                      className="p-1 text-[var(--muted)] hover:text-purple-400 transition-colors flex items-center justify-center"
                      title="Edit blog"
                    >
                      <FaEdit size={13} />
                    </Link>
                    <button
                      onClick={() => deleteBlog(blog.slug)}
                      className="p-1 text-[var(--muted)] hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer"
                      title="Delete blog"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="px-3 py-2 flex items-center justify-between text-[11px] text-[var(--muted)]">
                  <span>Page <strong className="text-[var(--foreground)]">{currentPage}</strong> of <strong className="text-[var(--foreground)]">{totalPages}</strong></span>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]"
                    >
                      <FaChevronLeft size={8} /> Prev
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]"
                    >
                      Next <FaChevronRight size={8} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </AuthGuard>
  );
}
