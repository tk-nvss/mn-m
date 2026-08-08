"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Eye,
  EyeOff,
  RefreshCcw,
  Gamepad2,
  Link as LinkIcon,
  Type,
  ImageIcon,
  CheckCircle2,
  XCircle
} from "lucide-react";

export default function BannersTab({ banners, onRefresh }) {
  const [form, setForm] = useState({
    bannerImage: "",
    bannerTitle: "",
    bannerSlug: "",
    bannerLink: "",
    bannerSummary: "",
    gameId: "",
    isShow: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= ADD / UPDATE ================= */

  const addBanner = async () => {
    if (!form.bannerImage || !form.bannerTitle || !form.bannerSlug) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          gameId: form.gameId
            ? form.gameId.split(",").map((g) => g.trim())
            : [],
        }),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setForm({
      bannerImage: b.bannerImage || "",
      bannerTitle: b.bannerTitle || "",
      bannerSlug: b.bannerSlug || "",
      bannerLink: b.bannerLink || "",
      bannerSummary: b.bannerSummary || "",
      gameId: b.gameId?.join(", ") || "",
      isShow: b.isShow ?? true,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateBanner = async () => {
    if (!form.bannerSlug) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners/editbanner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          gameId: form.gameId
            ? form.gameId.split(",").map((g) => g.trim())
            : [],
        }),
      });

      if (res.ok) {
        resetForm();
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShow = async (slug, isShow) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/banners/editbanner", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bannerSlug: slug, isShow: !isShow }),
      });

      if (res.ok) {
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      bannerImage: "",
      bannerTitle: "",
      bannerSlug: "",
      bannerLink: "",
      bannerSummary: "",
      gameId: "",
      isShow: true,
    });
  };

  return (
    <div className="space-y-10 pb-10">

      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)] uppercase truncate">Banners</h2>
            <button aria-label="button"
              onClick={onRefresh}
              className="p-1.5 shrink-0 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-all active:scale-95"
              title="Refresh List"
            >
              <RefreshCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= FORM CARD ================= */}
      <div className={`relative rounded-xl overflow-hidden border bg-[var(--background)] ${editingId ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded ${editingId ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20" : "bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-[var(--muted)]"}`}>
              {editingId ? <Edit3 size={14} /> : <Plus size={14} />}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">
                {editingId ? "Edit Banner" : "Add New Banner"}
              </h3>
              <p className="text-[10px] font-mono text-[var(--muted)] mt-0.5">
                {editingId ? "Updating existing banner content" : "Enter details for the new banner"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* FORM FIELDS */}
          <div className="lg:col-span-7 space-y-4">

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Title</label>
                <input
                  value={form.bannerTitle}
                  onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                  className="w-full h-9 bg-[var(--background)] border border-[var(--border)] rounded px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
                  placeholder="Banner Title"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Slug</label>
                <input
                  value={form.bannerSlug}
                  onChange={(e) => setForm({ ...form, bannerSlug: e.target.value })}
                  disabled={!!editingId}
                  className="w-full h-9 bg-[var(--background)] border border-[var(--border)] rounded px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none disabled:opacity-50 placeholder:text-[var(--muted)]/40"
                  placeholder="banner-slug"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Image URL</label>
              <input
                value={form.bannerImage}
                onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                className="w-full h-9 bg-[var(--background)] border border-[var(--border)] rounded px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
                placeholder="https://..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Banner Link</label>
                <input
                  value={form.bannerLink}
                  onChange={(e) => setForm({ ...form, bannerLink: e.target.value })}
                  className="w-full h-9 bg-[var(--background)] border border-[var(--border)] rounded px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
                  placeholder="/games/..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Associated Games</label>
                <input
                  value={form.gameId}
                  onChange={(e) => setForm({ ...form, gameId: e.target.value })}
                  className="w-full h-9 bg-[var(--background)] border border-[var(--border)] rounded px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
                  placeholder="mlbb, bgmi"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Summary</label>
              <textarea
                value={form.bannerSummary}
                onChange={(e) => setForm({ ...form, bannerSummary: e.target.value })}
                className="w-full min-h-[80px] bg-[var(--background)] border border-[var(--border)] rounded p-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none resize-none placeholder:text-[var(--muted)]/40"
                placeholder="Short description..."
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex bg-[var(--background)] p-1 rounded border border-[var(--border)] self-start">
                <button aria-label="button"
                  onClick={() => setForm({ ...form, isShow: true })}
                  className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    form.isShow ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                  }`}
                >
                  Visible
                </button>
                <button aria-label="button"
                  onClick={() => setForm({ ...form, isShow: false })}
                  className={`px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    !form.isShow ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                  }`}
                >
                  Hidden
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {editingId && (
                  <button aria-label="button"
                    onClick={resetForm}
                    className="flex-1 sm:flex-none px-4 py-2 rounded border border-[var(--border)] text-[10px] font-bold uppercase tracking-widest transition-colors text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                  >
                    Cancel
                  </button>
                )}
                <button aria-label="button"
                  onClick={editingId ? updateBanner : addBanner}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (editingId ? "Update Banner" : "Add Banner")}
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW PANEL */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <label className="text-[10px] font-bold text-[var(--muted)] mb-4 ml-1">Preview</label>

            <div className="flex-1 relative rounded-2xl overflow-hidden border border-[var(--border)] bg-black min-h-[200px]">
              {form.bannerImage ? (
                <>
                  <img
                    src={form.bannerImage}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 group">
                    <h4 className="text-white text-lg font-bold leading-tight">
                      {form.bannerTitle || "Title Preview"}
                    </h4>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 text-[var(--muted)]/20">
                  <ImageIcon size={32} className="mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No Image</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= LIST SECTION ================= */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold ml-1 text-[var(--foreground)]">Banner List ({banners.length})</h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {banners.map((b, idx) => (
              <motion.div
                key={b._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={b.bannerImage}
                    alt={b.bannerTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute top-3 right-3">
                    {b.isShow ? (
                      <span className="px-2 py-1 rounded-md bg-green-500/20 text-[8px] font-black text-green-500 uppercase border border-green-500/20 backdrop-blur-md">Visible</span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-red-500/20 text-[8px] font-black text-red-500 uppercase border border-red-500/20 backdrop-blur-md">Hidden</span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-bold text-white truncate">{b.bannerTitle}</p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between gap-3 bg-[var(--card)]">
                  <p className="text-[10px] font-black text-[var(--accent)] truncate uppercase italic">/{b.bannerSlug}</p>

                  <div className="flex items-center gap-2">
                    <button aria-label="button"
                      onClick={() => toggleShow(b.bannerSlug, b.isShow)}
                      disabled={isSubmitting}
                      className="p-2 rounded-lg bg-[var(--foreground)]/[0.05] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50"
                    >
                      {b.isShow ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button aria-label="button"
                      onClick={() => startEdit(b)}
                      className="p-2 rounded-lg bg-[var(--foreground)]/[0.05] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div >
  );
}
