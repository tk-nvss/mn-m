"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Columns,
  Smartphone,
  Monitor,
  Tablet,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code,
  Heading2,
  Heading3,
  Bold,
  Link2,
  Image as ImageIcon,
  List,
  Quote,
  Sparkles,
  RotateCw
} from "lucide-react";

export default function EditBlogPage({ params }) {
  const router = useRouter();
  const { slug } = use(params);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [saveToast, setSaveToast] = useState("");

  // View state: "split" | "edit" | "preview"
  const [viewMode, setViewMode] = useState("split");
  // Device simulation for preview: "desktop" | "tablet" | "mobile"
  const [deviceMode, setDeviceMode] = useState("desktop");
  // SEO accordion toggle
  const [seoExpanded, setSeoExpanded] = useState(false);

  const contentTextareaRef = useRef(null);

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
        router.push("/owner-panal?tab=blogs");
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [slug, router]);

  // Quick keyboard shortcut Ctrl/Cmd + S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveBlog(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formData, slug]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopySlug = () => {
    if (!formData.slug) return;
    navigator.clipboard.writeText(formData.slug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  // Quick insertion helpers for HTML/Markdown tags
  const insertTag = (tagType) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = "";

    switch (tagType) {
      case "h2":
        replacement = selectedText ? `<h2>${selectedText}</h2>\n` : `<h2>Heading 2</h2>\n`;
        break;
      case "h3":
        replacement = selectedText ? `<h3>${selectedText}</h3>\n` : `<h3>Heading 3</h3>\n`;
        break;
      case "p":
        replacement = selectedText ? `<p>${selectedText}</p>\n` : `<p>Your paragraph text here.</p>\n`;
        break;
      case "bold":
        replacement = selectedText ? `<strong>${selectedText}</strong>` : `<strong>bold text</strong>`;
        break;
      case "link":
        replacement = `<a href="https://example.com" class="text-[var(--accent)] underline">${selectedText || "link text"}</a>`;
        break;
      case "img":
        replacement = `<img src="/blog/placeholder.png" alt="${selectedText || "Description"}" class="rounded-xl my-4 w-full" />\n`;
        break;
      case "list":
        replacement = `<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>\n`;
        break;
      case "quote":
        replacement = `<blockquote>${selectedText || "Notable quote or key takeaway"}</blockquote>\n`;
        break;
      case "card":
        replacement = `<div class="p-4 my-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">\n  <h4 class="font-bold text-[var(--accent)] mb-1">Key Tip</h4>\n  <p class="text-sm">${selectedText || "Important strategy advice or note."}</p>\n</div>\n`;
        break;
      default:
        return;
    }

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const saveBlog = async (redirectAfterSave = false) => {
    if (!formData.title?.trim()) {
      alert("Please provide a Title");
      return;
    }

    setLoading(true);
    setSaveToast("");

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      seo: {
        title: formData.seoTitle,
        description: formData.seoDescription,
        keywords: formData.seoKeywords ? formData.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
      },
    };

    try {
      const res = await api.put(`/api/blogs/${slug}`, payload);
      if (res.data?.success) {
        if (redirectAfterSave) {
          router.push("/owner-panal?tab=blogs");
        } else {
          setSaveToast("Blog updated successfully!");
          setTimeout(() => setSaveToast(""), 3500);
        }
      }
    } catch (error) {
      console.error("Error updating blog", error);
      alert(error.response?.data?.message || "Error updating blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveBlog(false);
  };

  // Word count and reading time estimate
  const wordCount = formData.content
    ? formData.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
    : 0;
  const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-3">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[var(--muted)] font-medium">Loading blog details...</span>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
        {/* ── TOP COMPACT HEADER BAR ── */}
        <header className="sticky top-0 z-50 bg-[var(--card)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-2.5">
          <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Left: Back Link & Title */}
            <div className="flex items-center gap-3">
              <Link
                href="/owner-panal?tab=blogs"
                className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/40 transition-all flex items-center justify-center"
                title="Back to Blogs List"
              >
                <ArrowLeft size={14} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)]">
                    Content Management
                  </span>
                  <span className="text-[10px] text-[var(--muted)] font-mono bg-[var(--foreground)]/[0.05] px-1.5 py-0.2 rounded border border-[var(--border)]">
                    /{formData.game || "mlbb"}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <span>Edit Blog</span>
                  {formData.slug && (
                    <span className="text-xs font-normal font-mono text-[var(--muted)] hidden sm:inline truncate max-w-[220px]">
                      ({formData.slug})
                    </span>
                  )}
                </h1>
              </div>
            </div>

            {/* Center: View Switcher (Desktop: Split / Edit / Preview) */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "split"
                    ? "bg-[var(--accent)] text-black shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                title="Split View: Edit & Preview Side-by-Side"
              >
                <Columns size={13} />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "edit"
                    ? "bg-[var(--accent)] text-black shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                title="Form Editor Only"
              >
                <Edit3 size={13} />
                <span>Editor</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-[var(--accent)] text-black shadow-xs"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
                title="Full Preview Only"
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
            </div>

            {/* Right: Quick Stats & Actions */}
            <div className="flex items-center gap-2">
              {/* Word & Read Time Stats */}
              <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-[var(--muted)] bg-[var(--foreground)]/[0.03] px-2.5 py-1.5 rounded-lg border border-[var(--border)]">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{readTime}</span>
              </div>

              {/* View Live Blog Link */}
              {formData.slug && (
                <Link
                  href={`/blog/${formData.game}/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.04] border border-[var(--border)] text-[var(--muted)] hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center justify-center"
                  title="Open live published article in new tab"
                >
                  <ExternalLink size={13} />
                </Link>
              )}

              {/* Save & Continue */}
              <button
                type="button"
                disabled={loading}
                onClick={() => saveBlog(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-black rounded-lg font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                title="Save changes (Ctrl+S)"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                <span>Save</span>
              </button>

              {/* Save & Exit */}
              <button
                type="button"
                disabled={loading}
                onClick={() => saveBlog(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.08] text-[var(--foreground)] border border-[var(--border)] rounded-lg font-bold text-xs transition-all cursor-pointer"
                title="Save and return to blog list"
              >
                Save & Exit
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {saveToast && (
            <div className="mt-2 py-1 px-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Check size={13} /> {saveToast}
              </span>
              <button
                type="button"
                onClick={() => setSaveToast("")}
                className="text-emerald-400/70 hover:text-emerald-400 text-xs ml-2"
              >
                ×
              </button>
            </div>
          )}
        </header>

        {/* ── MAIN WORKSPACE CONTAINER ── */}
        <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-4">
          <div
            className={`grid gap-4 items-start ${
              viewMode === "split"
                ? "grid-cols-1 lg:grid-cols-12"
                : "grid-cols-1"
            }`}
          >
            {/* ── LEFT PANE: COMPACT EDIT FORM ── */}
            <div
              className={`${
                viewMode === "preview"
                  ? "hidden"
                  : viewMode === "split"
                  ? "lg:col-span-6 xl:col-span-6"
                  : "max-w-6xl xl:max-w-7xl mx-auto w-full"
              }`}
            >
              <form
                onSubmit={handleSubmit}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5"
              >
                {/* ── METADATA GRID: Title & Slug ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  <div className="md:col-span-8 space-y-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider flex items-center justify-between">
                      <span>Title *</span>
                      <span className="text-[9px] font-mono text-[var(--muted)]">
                        {formData.title.length} chars
                      </span>
                    </label>
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. How to Carry in Solo Queue MLBB 2026 Guide"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider flex items-center justify-between">
                      <span>Slug</span>
                      <button
                        type="button"
                        onClick={handleCopySlug}
                        className="text-[9px] text-[var(--accent)] hover:underline flex items-center gap-0.5"
                        title="Copy slug"
                      >
                        {copiedSlug ? (
                          <>
                            <Check size={9} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={9} /> Copy
                          </>
                        )}
                      </button>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      disabled
                      className="w-full bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--muted)] opacity-60 outline-none cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                {/* ── METADATA GRID: Game, Type, Tags ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                      Game *
                    </label>
                    <select
                      name="game"
                      value={formData.game}
                      onChange={handleChange}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all"
                    >
                      <option value="mlbb">MLBB</option>
                      <option value="esports">Esports</option>
                      <option value="freefire">Free Fire</option>
                      <option value="pubg">PUBG</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                      Type / Category *
                    </label>
                    <input
                      required
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      placeholder="e.g. Pro Strategy, Guides"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="mlbb, solo queue, guide"
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* ── IMAGE URL WITH INLINE PREVIEW ── */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                      Cover Image URL
                    </label>
                    {formData.image && (
                      <span className="text-[9px] text-emerald-400 font-mono">Image loaded</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="/blog/mlbb/guides/mlbb-solo-carry.png or https://..."
                      className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all font-mono"
                    />
                    {formData.image && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] shrink-0 bg-black/20">
                        <img
                          src={formData.image}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.opacity = "0.2";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* ── EXCERPT ── */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                      Excerpt *
                    </label>
                    <span className="text-[9px] font-mono text-[var(--muted)]">
                      {formData.excerpt.length} chars
                    </span>
                  </div>
                  <textarea
                    required
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Brief description of the blog post for cards and search snippets..."
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-all resize-y"
                  />
                </div>

                {/* ── CONTENT (HTML / MARKDOWN) WITH FORMATTING TOOLBAR ── */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <span>Content (HTML / Markdown) *</span>
                      <span className="text-[9px] font-mono text-[var(--accent)] font-semibold">
                        ({wordCount} words)
                      </span>
                    </label>

                    {/* Quick Formatting Tag Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 bg-[var(--foreground)]/[0.04] p-1 rounded-lg border border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => insertTag("h2")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <h2> heading"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("h3")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <h3> heading"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("p")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <p> paragraph"
                      >
                        P
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("bold")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-black text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <strong> bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("link")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <a> link"
                      >
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("img")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <img>"
                      >
                        Img
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("list")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <ul> list"
                      >
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("quote")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/[0.06] transition-all"
                        title="Insert <blockquote>"
                      >
                        Quote
                      </button>
                      <button
                        type="button"
                        onClick={() => insertTag("card")}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                        title="Insert styled Card box"
                      >
                        Card
                      </button>
                    </div>
                  </div>

                  <textarea
                    ref={contentTextareaRef}
                    required
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={14}
                    placeholder="<h2>The Solo Carry Game Plan</h2>&#10;<p>Write your blog content here...</p>"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 outline-none font-mono leading-relaxed transition-all resize-y min-h-[300px]"
                  />
                </div>

                {/* ── COLLAPSIBLE SEO ACCORDION ── */}
                <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--background)]/50">
                  <button
                    type="button"
                    onClick={() => setSeoExpanded(!seoExpanded)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-[var(--foreground)]/[0.03] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--foreground)]">SEO Metadata</span>
                      {(formData.seoTitle || formData.seoDescription || formData.seoKeywords) && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Configured
                        </span>
                      )}
                    </div>
                    {seoExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {seoExpanded && (
                    <div className="p-3 pt-1 border-t border-[var(--border)] space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            SEO Title
                          </label>
                          <input
                            type="text"
                            name="seoTitle"
                            value={formData.seoTitle}
                            onChange={handleChange}
                            placeholder="Meta title for Google results"
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            SEO Keywords
                          </label>
                          <input
                            type="text"
                            name="seoKeywords"
                            value={formData.seoKeywords}
                            onChange={handleChange}
                            placeholder="keyword1, keyword2"
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                          SEO Description
                        </label>
                        <textarea
                          name="seoDescription"
                          value={formData.seoDescription}
                          onChange={handleChange}
                          rows={2}
                          placeholder="Meta description for search engine ranking (150-160 chars recommended)"
                          className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── FORM FOOTER ACTIONS ── */}
                <div className="flex items-center justify-between pt-1 gap-3">
                  <div className="text-[11px] text-[var(--muted)] font-mono hidden sm:block">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.08] text-[var(--foreground)] font-bold">Ctrl+S</kbd> to quick save
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-black rounded-lg font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 text-xs cursor-pointer shadow-md"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={13} />
                          <span>Update Blog</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ── RIGHT PANE: REAL-TIME LIVE PREVIEW ── */}
            <div
              className={`${
                viewMode === "edit"
                  ? "hidden"
                  : viewMode === "split"
                  ? "lg:col-span-6 xl:col-span-6 lg:sticky lg:top-16 self-start"
                  : "max-w-6xl xl:max-w-7xl mx-auto w-full"
              }`}
            >
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden flex flex-col">
                {/* Preview Header & Device Controls */}
                <div className="px-3.5 py-2.5 bg-[var(--card)] border-b border-[var(--border)] flex items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                      Live Article Preview
                    </span>
                  </div>

                  {/* Device Simulation Buttons */}
                  <div className="flex items-center gap-1 bg-[var(--foreground)]/[0.04] p-0.5 rounded-lg border border-[var(--border)] text-xs">
                    <button
                      type="button"
                      onClick={() => setDeviceMode("desktop")}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        deviceMode === "desktop"
                          ? "bg-[var(--accent)] text-black shadow-2xs"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                      title="Fluid Desktop View"
                    >
                      <Monitor size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceMode("tablet")}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        deviceMode === "tablet"
                          ? "bg-[var(--accent)] text-black shadow-2xs"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                      title="Tablet View (640px)"
                    >
                      <Tablet size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceMode("mobile")}
                      className={`p-1.5 rounded-md transition-all cursor-pointer ${
                        deviceMode === "mobile"
                          ? "bg-[var(--accent)] text-black shadow-2xs"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                      title="Mobile View (375px)"
                    >
                      <Smartphone size={12} />
                    </button>
                  </div>
                </div>

                {/* Preview Scrollable Canvas */}
                <div className="max-h-[calc(100vh-140px)] overflow-y-auto p-3 sm:p-5 bg-[var(--background)] transition-all">
                  <div
                    className={`mx-auto transition-all ${
                      deviceMode === "mobile"
                        ? "max-w-[375px] bg-[var(--card)] p-4 rounded-3xl border-4 border-slate-800 shadow-2xl"
                        : deviceMode === "tablet"
                        ? "max-w-[640px] bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-md"
                        : "w-full max-w-full"
                    }`}
                  >
                    {/* Breadcrumbs & Metadata Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] pb-2.5 border-b border-[var(--border)]/60">
                      <span className="px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] italic font-black">
                        #{formData.type || "Guides"}
                      </span>
                      <span>•</span>
                      <span className="text-[var(--accent)] font-black">
                        {formData.game?.toUpperCase() || "MLBB"}
                      </span>
                      <span>•</span>
                      <span>{readTime}</span>
                      <span>•</span>
                      <span>
                        {new Date().toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Article Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-[1000] italic uppercase tracking-tighter text-[var(--foreground)] leading-tight mt-3">
                      {formData.title || "Untitled Blog Post"}
                    </h1>

                    {/* Featured Cover Image */}
                    {formData.image ? (
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-[var(--border)] bg-black/30 mt-3 shadow-md">
                        <img
                          src={formData.image}
                          alt={formData.title || "Cover"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            if (e.currentTarget.nextElementSibling) {
                              e.currentTarget.nextElementSibling.classList.remove("hidden");
                            }
                          }}
                        />
                        <div className="hidden w-full h-full items-center justify-center text-xs text-[var(--muted)] p-4 text-center">
                          Image could not be loaded from provided URL
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-xl border border-dashed border-[var(--border)] flex items-center justify-center text-[10px] text-[var(--muted)] mt-3">
                        No cover image specified
                      </div>
                    )}

                    {/* Excerpt Lead Box */}
                    {formData.excerpt && (
                      <div className="p-3 my-3 rounded-xl bg-[var(--foreground)]/[0.03] border-l-3 border-[var(--accent)] text-xs text-[var(--foreground)]/90 leading-relaxed italic font-medium">
                        {formData.excerpt}
                      </div>
                    )}

                    {/* Content Section rendered matching blog styling */}
                    <article className="mt-4">
                      {formData.content?.trim() ? (
                        <div
                          className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-[var(--foreground)]/90 
                            prose-headings:text-[var(--foreground)] prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter 
                            prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-1.5 prose-h2:border-b prose-h2:border-[var(--border)] 
                            prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2 
                            prose-strong:text-[var(--accent)] prose-strong:font-black 
                            prose-a:text-[var(--accent)] prose-a:underline hover:opacity-80 
                            prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1 
                            prose-ol:list-decimal prose-ol:pl-5 
                            prose-blockquote:border-l-3 prose-blockquote:border-[var(--accent)] prose-blockquote:bg-[var(--accent)]/5 prose-blockquote:p-3 prose-blockquote:rounded-r-lg 
                            prose-img:rounded-xl prose-img:border prose-img:border-[var(--border)] 
                            prose-table:border prose-table:border-[var(--border)] prose-th:bg-[var(--accent)]/10 prose-th:p-2 prose-td:p-2 
                            space-y-3"
                          dangerouslySetInnerHTML={{ __html: formData.content }}
                        />
                      ) : (
                        <div className="p-8 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl my-4">
                          <Code size={24} className="mx-auto mb-2 opacity-30" />
                          <p className="font-semibold text-[var(--foreground)]/70">No content yet</p>
                          <p className="text-[11px] mt-1">
                            Type or paste your HTML or Markdown content on the left editor to preview it live.
                          </p>
                        </div>
                      )}
                    </article>

                    {/* Tags preview */}
                    {formData.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[var(--border)]/50 mt-6">
                        {formData.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-[var(--foreground)]/[0.05] text-[var(--muted)] border border-[var(--border)]"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
