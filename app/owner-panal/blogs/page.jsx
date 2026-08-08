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
      <section className="min-h-screen bg-[var(--background)] p-4 flex flex-col items-center pt-6">
        <div className="w-full max-w-[1600px] space-y-6">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <Link href="/owner-panal" className="w-8 h-8 rounded-full bg-[var(--foreground)]/[0.05] text-[var(--muted)] flex items-center justify-center hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.1] transition-all">
                <FaArrowLeft size={12} />
              </Link>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[var(--foreground)]">Manage Blogs</h1>
            </div>
            <Link
              href="/owner-panal/blogs/new"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-bold uppercase tracking-wider text-[10px] transition-all active:scale-95 shadow-sm shadow-transparent hover:shadow-[var(--accent)]/20"
            >
              <FaPlus size={10} /> New Blog
            </Link>
          </div>

          <div className="relative w-full max-w-md mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-[var(--muted)]/70" size={14} />
            </div>
            <input
              type="text"
              placeholder="Search by title, game, or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-sm rounded-full pl-10 pr-4 outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/40 hover:bg-[var(--foreground)]/[0.01]"
            />
          </div>

          <div className="space-y-3">
            {blogs.length === 0 ? (
              <p className="text-[var(--muted)] text-center text-sm italic py-10">No blogs found.</p>
            ) : (
              blogs.map((blog) => (
                <div key={blog._id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)]/30 rounded-[1.25rem] transition-all active:bg-[var(--foreground)]/[0.02] gap-4">
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    {/* Blog Thumbnail */}
                    <div className="w-16 h-10 sm:w-20 sm:h-12 shrink-0 rounded-xl overflow-hidden bg-[var(--foreground)]/[0.05] relative hidden sm:block shadow-sm">
                      <img 
                        src={blog.image || "/placeholder.jpg"} 
                        alt={blog.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    
                    {/* Blog Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/blog/${blog.game}/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="block w-full">
                        <h2 className="text-[var(--foreground)] font-bold text-sm md:text-base leading-tight truncate group-hover:text-[var(--accent)] transition-colors">
                          {blog.title}
                        </h2>
                      </Link>
                      <p className="text-[var(--muted)] text-[10px] md:text-xs mt-1 truncate">
                        <span className="uppercase text-[9px] md:text-[10px] font-black text-[var(--accent)] tracking-widest mr-2">{blog.game}</span>
                        {blog.type} <span className="opacity-50 mx-1">•</span> Created: {new Date(blog.createdAt || blog.publishedAt).toLocaleDateString()} <span className="opacity-50 mx-1 hidden sm:inline">• Updated: {new Date(blog.updatedAt || blog.publishedAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t border-[var(--border)] sm:border-0 pt-3 sm:pt-0">
                    <Link
                      href={`/blog/${blog.game}/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-transparent hover:shadow-emerald-500/20"
                      title="View live blog"
                    >
                      <FaExternalLinkAlt size={12} />
                    </Link>
                    <Link
                      href={`/owner-panal/blogs/${blog.slug}`}
                      className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-sm shadow-transparent hover:shadow-[var(--accent)]/20"
                      title="Edit blog"
                    >
                      <FaEdit size={12} />
                    </Link>
                    <button
                      onClick={() => deleteBlog(blog.slug)}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm shadow-transparent hover:shadow-rose-500/20"
                      title="Delete blog"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] disabled:opacity-50 transition-all"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm font-bold text-[var(--foreground)]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] disabled:opacity-50 transition-all"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </section>
    </AuthGuard>
  );
}
