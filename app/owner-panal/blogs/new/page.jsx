"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";
import { FaArrowLeft, FaSave, FaPlus } from "react-icons/fa";
import { SectionTitle } from "@/components/common";

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    game: "mlbb",
    type: "Guides",
    tags: "",
    image: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(t => t),
      seo: {
        title: formData.seoTitle,
        description: formData.seoDescription,
        keywords: formData.seoKeywords.split(",").map(k => k.trim()).filter(k => k),
      }
    };

    try {
      const res = await api.post("/api/blogs", payload);
      if (res.data?.success) {
        router.push("/owner-panal?tab=blogs");
      }
    } catch (error) {
      console.error("Error creating blog", error);
      alert(error.response?.data?.message || "Error creating blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] p-4 flex flex-col items-center pt-6 pb-20">
        <div className="w-full max-w-[1600px] bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl">
          <div className="pb-4 mb-6 border-b border-[var(--border)]">
            <SectionTitle
              as="h1"
              size="lg"
              subtitle="Content Publishing"
              icon={
                <Link
                  href="/owner-panal?tab=blogs"
                  className="w-7 h-7 rounded-lg text-[var(--muted)] inline-flex items-center justify-center hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.06] transition-all mr-1.5 cursor-pointer"
                >
                  <FaArrowLeft size={12} />
                </Link>
              }
              title="Create New"
              highlight="Blog"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Title *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Slug *</label>
                <input required type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="e.g. how-to-play-mlbb" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Game *</label>
                <select name="game" value={formData.game} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none">
                  <option value="mlbb">MLBB</option>
                  <option value="esports">Esports</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Type / Category *</label>
                <input required type="text" name="type" value={formData.type} onChange={handleChange} placeholder="e.g. Guides" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Image URL</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="/blog/game/placeholder.png" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Excerpt *</label>
              <textarea required name="excerpt" value={formData.excerpt} onChange={handleChange} rows={2} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Content (HTML/Markdown) *</label>
              <textarea required name="content" value={formData.content} onChange={handleChange} rows={12} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] focus:border-[var(--accent)] outline-none font-mono text-xs"></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tag1, tag2" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
            </div>

            <div className="border-t border-[var(--border)] pt-4 mt-4">
              <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">SEO Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">SEO Title</label>
                  <input type="text" name="seoTitle" value={formData.seoTitle} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">SEO Keywords</label>
                  <input type="text" name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">SEO Description</label>
                <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} rows={2} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none"></textarea>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-black rounded-lg font-black uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50 text-sm mt-2">
              {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><FaPlus /> Publish Blog</>}
            </button>
          </form>
        </div>
      </section>
    </AuthGuard>
  );
}
