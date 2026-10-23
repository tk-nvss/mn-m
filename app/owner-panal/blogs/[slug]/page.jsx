"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { SectionTitle } from "@/components/common";

export default function EditBlogPage({ params }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
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

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/api/blogs/${slug}`);
        if (res.data?.success) {
          const b = res.data.blog;
          setFormData({
            title: b.title || "",
            slug: b.slug || "",
            excerpt: b.excerpt || "",
            content: b.content || "",
            game: b.game || "mlbb",
            type: b.type || "Guides",
            tags: b.tags?.join(", ") || "",
            image: b.image || "",
            seoTitle: b.seo?.title || "",
            seoDescription: b.seo?.description || "",
            seoKeywords: b.seo?.keywords?.join(", ") || "",
          });
        }
      } catch (error) {
        console.error("Error fetching blog", error);
        alert("Blog not found");
        router.push("/owner-panal/blogs");
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [slug, router]);

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
      const res = await api.put(`/api/blogs/${slug}`, payload);
      if (res.data?.success) {
        router.push("/owner-panal/blogs");
      }
    } catch (error) {
      console.error("Error updating blog", error);
      alert(error.response?.data?.message || "Error updating blog");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] p-4 flex flex-col items-center pt-6 pb-20">
        <div className="w-full max-w-[1600px] bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl">
          <div className="pb-4 mb-6 border-b border-[var(--border)]">
            <SectionTitle
              as="h1"
              size="lg"
              subtitle="Content Management"
              icon={
                <Link
                  href="/owner-panal/blogs"
                  className="w-8 h-8 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] inline-flex items-center justify-center hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all shadow-2xs mr-1.5"
                >
                  <FaArrowLeft size={12} />
                </Link>
              }
              title="Edit"
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
                <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Slug</label>
                <input type="text" name="slug" value={formData.slug} disabled className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--muted)] opacity-50 outline-none cursor-not-allowed" />
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
                <input required type="text" name="type" value={formData.type} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Image URL</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
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
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] outline-none" />
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
              {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><FaSave /> Update Blog</>}
            </button>
          </form>
        </div>
      </section>
    </AuthGuard>
  );
}
