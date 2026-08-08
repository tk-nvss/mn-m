"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import api from "@/lib/axios";
import {
  FiSearch,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiList,
  FiPlay,
  FiShare2,
  FiMoreHorizontal,
  FiFilter
} from "react-icons/fi";

/* ================= SETTINGS ================= */
const POSTS_PER_PAGE = 20;

export default function BlogListing({ initialGame = "all" }) {
  const [blogsData, setBlogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGame, setSelectedGame] = useState(initialGame);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    return ["all", ...new Set(blogsData.map((b) => b.type))];
  }, [blogsData]);

  const games = useMemo(() => {
    return ["all", ...new Set(blogsData.map((b) => b.game))];
  }, [blogsData]);

  const filteredBlogs = useMemo(() => {
    let blogs = [...blogsData];
    if (search) {
      blogs = blogs.filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedType !== "all") {
      blogs = blogs.filter((b) => b.type === selectedType);
    }
    if (selectedGame !== "all") {
      blogs = blogs.filter((b) => b.game === selectedGame);
    }
    blogs.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
    return blogs;
  }, [search, selectedType, selectedGame, blogsData]);

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);

  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get("/api/blogs");
        if (res.data?.success) {
          setBlogsData(res.data.blogs);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedGame]);

  return (
    <main className="min-h-screen bg-[var(--background)] relative pb-32 transition-colors duration-300 px-6">

      <div className="max-w-6xl mx-auto pt-8 md:pt-12 relative z-10">

        <motion.header
          className="mb-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-[1px] bg-[var(--accent)]" />
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-[var(--accent)] italic">
                <Link href="/blog" className="hover:opacity-60 transition-opacity whitespace-nowrap">News & Blogs</Link>
                {initialGame !== "all" && (
                    <>
                        <span className="opacity-20 translate-y-[1px]">/</span>
                        <span className="text-[var(--muted)] opacity-50 whitespace-nowrap">{initialGame}</span>
                    </>
                )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
            <h2 className="text-2xl md:text-5xl font-[1000] italic tracking-tighter uppercase leading-none">
              {initialGame === "all" ? "Latest" : initialGame} <span className="text-[var(--accent)]">News</span>
            </h2>
            
            {/* 🔍 SEARCH & FILTER */}
            <div className="flex items-center gap-2 w-full md:w-auto relative z-20">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <FiSearch className="text-[var(--muted)] opacity-50" size={14} />
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH..."
                  className="w-full h-9 pl-9 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] outline-none text-[10px] font-bold tracking-widest uppercase focus:border-[var(--accent)]/50 transition-colors font-sans"
                />
              </div>
              
              <button aria-label="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-9 w-9 flex items-center justify-center rounded-2xl border transition-colors ${showFilters ? 'bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'}`}
              >
                <FiFilter size={14} />
              </button>

              {/* 🔖 FILTER DROPDOWN */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-full md:w-80 bg-[var(--background)] border border-[var(--border)] rounded p-5 shadow-2xl z-30"
                  >
                    <div className="space-y-6">
                        {/* 🎮 GAME FILTER */}
                        {initialGame === "all" && (
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] italic">
                                    SELECT SOURCE
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {games.map((game) => (
                                        <Link
                                            key={game}
                                            href={game === "all" ? "/blog" : `/blog/${game}`}
                                            className={`text-[10px] font-bold uppercase tracking-widest transition-colors px-3 py-1.5 rounded border ${
                                                selectedGame === game
                                                    ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                                                    : "bg-transparent border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)]"
                                            }`}
                                        >
                                            {game === "all" ? "ALL ARTICLES" : game}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 🏷️ CATEGORY FILTER */}
                        <div className="space-y-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] italic">
                                TOPICS
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((type) => (
                                    <button aria-label="button"
                                        key={type}
                                        onClick={() => {
                                          setSelectedType(type);
                                          setShowFilters(false);
                                        }}
                                        className={`text-[10px] font-bold uppercase tracking-widest transition-colors px-3 py-1.5 rounded border ${
                                            selectedType === type
                                                ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                                                : "bg-transparent border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)]"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {/* 📄 BLOG GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog, index) => (
                  <BlogCard key={blog._id || blog.slug} blog={blog} index={index} />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 text-[var(--muted)] text-[10px] font-black uppercase tracking-[0.3em] italic opacity-20"
                >
                  No Articles Discovered
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* 🔢 PAGINATION - NUMBERED */}
        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex justify-center items-center gap-2 mt-12 mb-20">
            <button aria-label="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] disabled:opacity-20 transition-all hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
            >
              <FiChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button aria-label="button"
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${
                    currentPage === num 
                      ? "bg-[var(--accent)] border-[var(--accent)] text-black scale-110 shadow-lg shadow-[var(--accent)]/20" 
                      : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button aria-label="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] disabled:opacity-20 transition-all hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
            >
              <FiChevronRight size={16} />
            </button>
          </nav>
        )}

        {/* 🏔️ SEO FOOTER */}
        <motion.footer 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-32 pt-16 border-t border-[var(--border)]/30"
        >
            <h1 className="text-4xl md:text-6xl font-[1000] italic tracking-tighter uppercase leading-none mb-6 opacity-20">
                {initialGame === "all" ? "MLBB" : initialGame.toUpperCase()} <span className="text-[var(--accent)]">NEWS & BLOGS</span>
            </h1>
            <p className="text-sm md:text-base text-[var(--muted)] leading-relaxed italic max-w-2xl opacity-40">
                Your definitive collection of <strong className="text-[var(--foreground)]">{initialGame === "all" ? "game" : initialGame} top up guides</strong>, pricing analysis, and safety protocols. Stay updated with the latest <strong className="text-[var(--foreground)]">mobile legends recharge india fast</strong> tips and diamond bundle value comparisons. We provide the most accurate information for <strong>Mobile Legends players in India</strong> to ensure safe and cheap diamond top-ups.
            </p>
        </motion.footer>
      </div>
    </main>
  );
}

/* ================= BLOG CARD ================= */
function BlogCard({ blog, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/blog/${blog.game}/${blog.slug}`}
        className="group block relative rounded-2xl bg-[var(--card)] border border-[var(--border)] p-1.5 hover:border-[var(--accent)]/40 hover:shadow-lg hover:shadow-[var(--accent)]/5 transition-all duration-300"
      >
        <div className="flex flex-row h-[90px] sm:h-[110px]">
          {/* Image Section */}
          <div className="relative w-[130px] sm:w-[160px] h-full rounded-xl overflow-hidden flex-shrink-0 bg-[var(--background)]">
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Tag Overlay */}
            <div className="absolute top-2 left-2">
              <span className="text-white text-[8px] sm:text-[9px] font-bold bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded tracking-wider">
                #{blog.tags?.[0] || blog.type.toLowerCase().replace(/\s+/g, '')}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-2.5 sm:p-4 flex flex-col min-w-0">
            <div className="flex-1">
              <h2 className="text-xs sm:text-[15px] font-bold text-[var(--foreground)] leading-snug group-hover:text-[var(--accent)] transition-colors mb-0.5 sm:mb-1 line-clamp-2">
                {blog.title}
              </h2>
            </div>
            
            {/* Author Footer */}
            <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-[var(--border)]/30">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center overflow-hidden border border-[var(--accent)]/30 relative">
                  <span className="text-[var(--accent)] font-bold text-[8px] sm:text-[9px]">BB</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[var(--foreground)] leading-none">by BlueBuff</span>
                  <span className="text-[7px] sm:text-[8px] text-[var(--muted)] opacity-70 mt-0.5">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
                  <FiShare2 size={10} className="sm:w-3 sm:h-3" />
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] transition-colors">
                  <FiMoreHorizontal size={10} className="sm:w-3 sm:h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
