"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaExternalLinkAlt, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/blogs?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(debouncedSearch)}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // filteredBlogs logic removed since search is server-side

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] p-3 sm:p-4 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-3">
          {/* Top Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]/70">
            <div className="flex items-center gap-2">
              <Link href="/owner-panal" className="w-7 h-7 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all shadow-2xs">
                <FaArrowLeft size={10} />
              </Link>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                <h1 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
                  Manage Blogs
                </h1>
              </div>
            </div>
            
            <Link
              href="/owner-panal/blogs/new"
              className="h-7 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <FaPlus size={9} className="text-white shrink-0" />
              <span className="text-white font-black whitespace-nowrap">New Blog</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-[var(--muted)]" size={11} />
            </div>
            <input
              type="text"
              placeholder="Search by title, game, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-xs rounded-lg outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/50 shadow-2xs"
            />
          </div>

          {/* Blog List */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
            {blogs.length === 0 ? (
              <p className="text-[var(--muted)] text-center text-xs py-10">No blogs found.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]/60">
                {blogs.map((blog) => (
                  <div key={blog._id} className="p-3 sm:px-4 sm:py-3.5 hover:bg-[var(--foreground)]/[0.015] transition-colors flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
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
                          <h2 className="text-xs sm:text-sm font-bold text-[var(--foreground)] leading-snug line-clamp-2 hover:text-[var(--accent)] transition-colors">
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href={`/blog/${blog.game}/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-emerald-500 hover:border-emerald-500/30 flex items-center justify-center transition-all shadow-2xs"
                        title="View live blog"
                      >
                        <FaExternalLinkAlt size={11} />
                      </Link>
                      <Link
                        href={`/owner-panal/blogs/${blog.slug}`}
                        className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-purple-400 hover:border-purple-500/30 flex items-center justify-center transition-all shadow-2xs"
                        title="Edit blog"
                      >
                        <FaEdit size={12} />
                      </Link>
                      <button
                        onClick={() => deleteBlog(blog.slug)}
                        className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-rose-500 hover:border-rose-500/30 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
                        title="Delete blog"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-3.5 py-2 border-t border-[var(--border)]/70 flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Page <strong className="text-[var(--foreground)]">{currentPage}</strong> of <strong className="text-[var(--foreground)]">{totalPages}</strong></span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2 py-0.5 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]"
                  >
                    <FaChevronLeft size={8} /> Prev
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2 py-0.5 rounded-md border border-[var(--border)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]"
                  >
                    Next <FaChevronRight size={8} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}
