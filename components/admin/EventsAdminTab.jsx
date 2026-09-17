"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiImage,
  FiLink,
  FiClock,
  FiTag,
  FiMapPin,
  FiCheck,
  FiX,
  FiSearch,
  FiExternalLink,
  FiStar,
  FiChevronUp,
  FiChevronDown,
  FiGlobe,
  FiLayers,
} from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";

const EVENT_TYPES = [
  "In-Game Event",
  "Tournament",
  "Giveaway",
  "Flash Sale",
  "Update & Patch",
  "Community Scrims",
  "Season Reset",
  "Special Offer",
];

const GAME_OPTIONS = [
  "MLBB",
  "Free Fire",
  "BGMI",
  "Honor of Kings",
  "Genshin Impact",
  "All Games",
  "General",
];

const COLOR_PRESETS = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Cyan", hex: "#06b6d4" },
];

export default function EventsAdminTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    startDate: "",
    endDate: "",
    game: "MLBB",
    eventType: "In-Game Event",
    link: "",
    location: "Online",
    isFeatured: false,
    status: "active",
    color: "#3b82f6",
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const stats = useMemo(() => {
    return {
      total: events.length,
      active: events.filter((e) => e.status === "active").length,
      upcoming: events.filter((e) => e.status === "upcoming").length,
      completed: events.filter((e) => e.status === "completed").length,
      featured: events.filter((e) => e.isFeatured).length,
    };
  }, [events]);

  const resetForm = () => {
    setEditingId(null);
    setIsFormOpen(false);
    setForm({
      title: "",
      description: "",
      image: "",
      startDate: "",
      endDate: "",
      game: "MLBB",
      eventType: "In-Game Event",
      link: "",
      location: "Online",
      isFeatured: false,
      status: "active",
      color: "#3b82f6",
    });
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setIsFormOpen(true);
    setForm({
      title: item.title || "",
      description: item.description || "",
      image: item.image || "",
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 16) : "",
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 16) : "",
      game: item.game || "MLBB",
      eventType: item.eventType || "In-Game Event",
      link: item.link || "",
      location: item.location || "Online",
      isFeatured: !!item.isFeatured,
      status: item.status || "active",
      color: item.color || "#3b82f6",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((ev) => (ev._id === id ? { ...ev, status: newStatus } : ev))
        );
      }
    } catch (err) {
      console.error("Quick status update failed", err);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title || !form.startDate) {
      alert("Title and Start Date are required!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch("/api/admin/events", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: editingId, ...form }),
        });
        const data = await res.json();
        if (data.success) {
          resetForm();
          fetchEvents();
        } else {
          alert(data.message || "Update failed");
        }
      } else {
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.success) {
          resetForm();
          fetchEvents();
        } else {
          alert(data.message || "Creation failed");
        }
      }
    } catch (err) {
      console.error("Error submitting event:", err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete event "${title}"?`)) return;
    try {
      const res = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        if (editingId === id) resetForm();
        fetchEvents();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch =
        !search ||
        ev.title?.toLowerCase().includes(search.toLowerCase()) ||
        ev.game?.toLowerCase().includes(search.toLowerCase()) ||
        ev.eventType?.toLowerCase().includes(search.toLowerCase()) ||
        ev.location?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "featured"
          ? !!ev.isFeatured
          : ev.status === statusFilter;

      const matchesGame = gameFilter === "all" ? true : ev.game === gameFilter;

      return matchesSearch && matchesStatus && matchesGame;
    });
  }, [events, search, statusFilter, gameFilter]);

  const formatRelativeDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-3.5 pb-8">
      {/* ── TOP HEADER & STATS CHIPS ── */}
      <div className="space-y-2.5 pb-3 border-b border-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Title & Count */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <FiCalendar size={14} />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
              Event Calendar
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--foreground)]/5 border border-[var(--border)] text-[var(--muted)]">
              {events.length}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchEvents}
              className="h-7 w-7 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center transition-all"
              title="Refresh"
            >
              <FiRefreshCw size={11} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => {
                if (isFormOpen && !editingId) {
                  setIsFormOpen(false);
                } else {
                  resetForm();
                  setIsFormOpen(true);
                }
              }}
              className={`h-7 px-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 ${
                isFormOpen
                  ? "bg-[var(--foreground)]/10 text-[var(--foreground)] border border-[var(--border)]"
                  : "bg-[var(--accent)] text-black shadow-sm"
              }`}
            >
              {isFormOpen && !editingId ? (
                <>
                  <FiChevronUp size={12} />
                  <span>Close</span>
                </>
              ) : (
                <>
                  <FiPlus size={12} />
                  <span>New Event</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Status Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All", count: stats.total, color: "text-[var(--foreground)]" },
              { id: "active", label: "Active", count: stats.active, color: "text-emerald-400" },
              { id: "upcoming", label: "Upcoming", count: stats.upcoming, color: "text-cyan-400" },
              { id: "completed", label: "Completed", count: stats.completed, color: "text-purple-400" },
              { id: "featured", label: "Featured ⭐", count: stats.featured, color: "text-amber-400" },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`h-6.5 px-2 rounded-md text-[10.5px] font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                    isActive
                      ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                      : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className={isActive ? "" : tab.color}>{tab.label}</span>
                  <span className={`text-[9px] px-1 rounded-full ${isActive ? "bg-[var(--background)]/20 text-[var(--background)]" : "bg-[var(--foreground)]/5 text-[var(--muted)]"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Game select */}
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
            <div className="relative flex-1 sm:w-40">
              <FiSearch size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-6.5 pl-6 pr-2 bg-[var(--card)] border border-[var(--border)] rounded-md text-[11px] text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>

            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="h-6.5 px-1.5 bg-[var(--card)] border border-[var(--border)] rounded-md text-[10.5px] font-medium text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="all">All Games</option>
              {GAME_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── COLLAPSIBLE FORM DRAWER ── */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3.5 sm:p-4 mb-2">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[var(--accent)]/15 text-[var(--accent)]">
                    {editingId ? <FiEdit2 size={12} /> : <FiPlus size={12} />}
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-[var(--foreground)]">
                    {editingId ? "Edit Scheduled Event" : "Add New Event"}
                  </h3>
                </div>

                <button
                  onClick={resetForm}
                  className="p-1 rounded hover:bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <FiX size={13} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Form Fields */}
                <div className="lg:col-span-8 space-y-2.5">
                  {/* Row 1: Title & Game */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-8 space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Event Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MLBB All Star Tournament"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        Game
                      </label>
                      <select
                        value={form.game}
                        onChange={(e) => setForm({ ...form, game: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      >
                        {GAME_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Start & End Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                        <FiClock size={10} className="text-blue-400" /> Start Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                        <FiClock size={10} className="text-purple-400" /> End Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Event Type & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                        <FiTag size={10} className="text-emerald-400" /> Type
                      </label>
                      <select
                        value={form.eventType}
                        onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      >
                        {EVENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                        <FiMapPin size={10} className="text-rose-400" /> Location / Venue
                      </label>
                      <input
                        type="text"
                        placeholder="Online, YouTube Live, etc."
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 4: Poster Image & Redirection Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                        <FiImage size={10} className="text-amber-400" /> Poster Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://... image link"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                        <FiLink size={10} className="text-cyan-400" /> Action / Redirection Link
                      </label>
                      <input
                        type="text"
                        placeholder="/events, /giveaways, https://..."
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        className="w-full h-7.5 bg-[var(--background)] border border-[var(--border)] rounded-md px-2.5 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 5: Description */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Description & Details
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Event schedule, rewards, rules, etc."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md p-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none resize-none"
                    />
                  </div>

                  {/* Row 6: Status, Tag Color & Featured */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border)]">
                    {/* Status picker */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] mr-0.5">Status:</span>
                      {["active", "upcoming", "completed", "cancelled"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, status: s })}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors ${
                            form.status === s
                              ? "bg-[var(--foreground)] text-[var(--background)]"
                              : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {/* Color Presets */}
                    <div className="flex items-center gap-1">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)] mr-0.5">Tag:</span>
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setForm({ ...form, color: c.hex })}
                          className={`w-3.5 h-3.5 rounded-full transition-transform ${
                            form.color === c.hex ? "scale-125 ring-2 ring-white/80" : "opacity-75 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>

                    {/* Featured checkbox */}
                    <label className="flex items-center gap-1 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="rounded accent-[var(--accent)]"
                      />
                      <span className="text-[11px] font-bold text-[var(--foreground)] flex items-center gap-1">
                        <FiStar size={10} className={form.isFeatured ? "text-amber-400 fill-amber-400" : "text-[var(--muted)]"} />
                        Featured
                      </span>
                    </label>
                  </div>

                  {/* Form Submit Row */}
                  <div className="flex items-center justify-end gap-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-2.5 py-1 rounded-md border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3.5 py-1 rounded-md bg-[var(--accent)] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSubmitting ? (
                        <LoadingSpinner size="sm" color="black" />
                      ) : editingId ? (
                        <>
                          <FiCheck size={11} /> Save Changes
                        </>
                      ) : (
                        <>
                          <FiPlus size={11} /> Publish Event
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="lg:col-span-4 flex flex-col space-y-1">
                  <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Live Preview
                  </label>
                  <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--background)] flex flex-col">
                    <div className="relative aspect-[16/9] w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                      {form.image ? (
                        <img
                          src={form.image}
                          alt="Event preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-[var(--muted)]/40 text-center">
                          <FiImage size={18} className="mb-0.5" />
                          <span className="text-[8.5px] font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[7.5px] font-black text-white uppercase shadow"
                          style={{ backgroundColor: form.color || "#3b82f6" }}
                        >
                          {form.eventType}
                        </span>
                        {form.isFeatured && (
                          <span className="px-1 py-0.5 rounded text-[7.5px] font-black bg-amber-500 text-black uppercase shadow flex items-center gap-0.5">
                            <FiStar size={7} className="fill-black" />
                          </span>
                        )}
                      </div>

                      <div className="absolute top-1.5 right-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[7.5px] font-bold text-white uppercase border border-white/10">
                          {form.game}
                        </span>
                      </div>

                      <div className="absolute bottom-1.5 left-1.5 right-1.5">
                        <p className="text-[11px] font-black text-white line-clamp-1">
                          {form.title || "Event Title Preview"}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[9.5px] text-[var(--muted)] font-mono">
                        <span className="flex items-center gap-1 text-[var(--accent)] font-bold">
                          <FiClock size={9} />
                          {form.startDate ? formatRelativeDate(form.startDate) : "Date TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMapPin size={9} />
                          {form.location || "Online"}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-[var(--foreground)]/70 line-clamp-2">
                        {form.description || "Description preview..."}
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EVENTS LIST GRID (2 columns on mobile, up to 4 on desktop) ── */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <LoadingSpinner size="md" color="accent" />
          <p className="text-xs text-[var(--muted)] font-mono">Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <FiCalendar size={24} className="mx-auto text-[var(--muted)]/40 mb-1.5" />
          <p className="text-xs font-bold text-[var(--foreground)]">No events match your filter</p>
          <p className="text-[10.5px] text-[var(--muted)] mt-0.5">
            {search || statusFilter !== "all" || gameFilter !== "all"
              ? "Try resetting filters or search query"
              : "Click '+ New Event' to schedule your first event"}
          </p>
          {!isFormOpen && (
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="mt-2.5 px-3 py-1 rounded-md bg-[var(--accent)] text-black text-xs font-bold inline-flex items-center gap-1"
            >
              <FiPlus size={12} /> Add Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((ev) => {
              const sDate = new Date(ev.startDate);
              return (
                <motion.div
                  key={ev._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`group rounded-xl overflow-hidden border bg-[var(--card)] hover:border-[var(--foreground)]/20 transition-all flex flex-col justify-between ${
                    ev.isFeatured ? "border-amber-500/30" : "border-[var(--border)]"
                  }`}
                >
                  {/* Banner Image (Aspect 16:9) */}
                  <div className="relative aspect-[16/9] w-full bg-neutral-950 overflow-hidden">
                    {ev.image ? (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted)]/20">
                        <FiCalendar size={20} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 flex-wrap">
                      <span
                        className="px-1.5 py-0.5 rounded text-[7.5px] font-black text-white uppercase shadow"
                        style={{ backgroundColor: ev.color || "#3b82f6" }}
                      >
                        {ev.eventType}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[7.5px] font-bold text-white uppercase border border-white/10">
                        {ev.game}
                      </span>
                    </div>

                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      {ev.isFeatured && (
                        <span className="p-0.5 rounded bg-amber-500 text-black shadow" title="Featured Event">
                          <FiStar size={8} className="fill-black" />
                        </span>
                      )}
                      
                      {/* Quick status toggle button */}
                      <button
                        onClick={() => {
                          const nextStatus =
                            ev.status === "active"
                              ? "completed"
                              : ev.status === "completed"
                              ? "upcoming"
                              : "active";
                          handleQuickStatusChange(ev._id, nextStatus);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[7.5px] font-black uppercase border backdrop-blur transition-all active:scale-95 ${
                          ev.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                            : ev.status === "upcoming"
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30"
                            : ev.status === "completed"
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                        title="Click to cycle status"
                      >
                        {ev.status}
                      </button>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-1.5 left-1.5 right-1.5">
                      <h4 className="text-[11px] font-black text-white line-clamp-1">{ev.title}</h4>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[9.5px] text-[var(--muted)] font-mono">
                        <span className="flex items-center gap-1 text-[var(--accent)] font-bold">
                          <FiClock size={9} />
                          {formatRelativeDate(ev.startDate)}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[85px]">
                          <FiMapPin size={8} /> {ev.location || "Online"}
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-[10px] text-[var(--muted)] line-clamp-1 mt-0.5 leading-tight">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-1.5 border-t border-[var(--border)] flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        {ev.link && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors"
                            title="Open link"
                          >
                            <FiExternalLink size={10} />
                          </a>
                        )}
                        <span className="text-[8.5px] font-mono text-[var(--muted)] truncate">
                          {sDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(ev)}
                          className="h-6 w-6 rounded-md border border-[var(--border)] bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center transition-colors"
                          title="Edit Event"
                        >
                          <FiEdit2 size={10} />
                        </button>
                        <button
                          onClick={() => handleDelete(ev._id, ev.title)}
                          className="h-6 w-6 rounded-md border border-[var(--border)] bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-red-400 hover:border-red-500/30 flex items-center justify-center transition-colors"
                          title="Delete Event"
                        >
                          <FiTrash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

