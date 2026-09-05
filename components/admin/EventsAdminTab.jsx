"use client";

import { useState, useEffect } from "react";
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
  FiStar
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
  "Special Offer"
];

const GAME_OPTIONS = [
  "MLBB",
  "Free Fire",
  "BGMI",
  "Honor of Kings",
  "Genshin Impact",
  "All Games",
  "General"
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
  const [editingId, setEditingId] = useState(null);

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

  const resetForm = () => {
    setEditingId(null);
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
          alert("Event updated successfully!");
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
          alert("Event created successfully!");
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
    if (!confirm(`Are you sure you want to delete event "${title}"?`)) return;
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

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title?.toLowerCase().includes(search.toLowerCase()) ||
      ev.game?.toLowerCase().includes(search.toLowerCase()) ||
      ev.eventType?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || ev.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FiCalendar size={18} />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--foreground)]">
              Event Calendar Manager
            </h2>
            <p className="text-[10px] text-[var(--muted)] font-mono mt-0.5">
              Publish and schedule events for specific dates shown on the calendar and homepage
            </p>
          </div>
        </div>

        <button
          onClick={fetchEvents}
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all self-start sm:self-auto flex items-center gap-2 text-xs font-bold"
          title="Refresh Events"
        >
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      <div
        className={`relative rounded-2xl overflow-hidden border bg-[var(--background)] transition-all ${
          editingId ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/5" : "border-[var(--border)]"
        }`}
      >
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg ${
                editingId
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                  : "bg-[var(--foreground)]/5 text-[var(--foreground)]"
              }`}
            >
              {editingId ? <FiEdit2 size={14} /> : <FiPlus size={14} />}
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">
              {editingId ? "Edit Scheduled Event" : "Add New Event to Calendar"}
            </h3>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] hover:text-red-400 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT FIELDS (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Title & Game */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  Event Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MLBB 515 All Star Mega Carnival"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Game / Category
                </label>
                <select
                  value={form.game}
                  onChange={(e) => setForm({ ...form, game: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                >
                  {GAME_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <FiClock size={11} className="text-blue-400" /> Start Date & Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <FiClock size={11} className="text-purple-400" /> End Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Event Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <FiTag size={11} className="text-emerald-400" /> Event Type
                </label>
                <select
                  value={form.eventType}
                  onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <FiMapPin size={11} className="text-rose-400" /> Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. In-Game Server / YouTube Live"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Poster URL & Redirection Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <FiImage size={11} className="text-amber-400" /> Event Image / Poster URL
                </label>
                <input
                  type="url"
                  placeholder="https://res.cloudinary.com/... or image link"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <FiLink size={11} className="text-cyan-400" /> Action / Details Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. /giveaways, /games/mlbb, https://..."
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full h-9 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                Event Description & Schedule Details
              </label>
              <textarea
                rows={3}
                placeholder="Provide complete event details, prize pool, tournament match times, rewards, or instructions..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none transition-colors resize-none"
              />
            </div>

            {/* Status & Color Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[var(--border)]/50">
              {/* Status picker */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Status:</span>
                {["active", "upcoming", "completed", "cancelled"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                      form.status === s
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mr-1">Tag Color:</span>
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setForm({ ...form, color: c.hex })}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                      form.color === c.hex ? "scale-125 border-white shadow" : "border-transparent hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Featured checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded accent-[var(--accent)]"
                />
                <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1">
                  <FiStar size={12} className={form.isFeatured ? "text-amber-400 fill-amber-400" : "text-[var(--muted)]"} />
                  Featured Event
                </span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-[var(--accent)] text-black font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" color="black" />
                ) : editingId ? (
                  <>
                    <FiCheck size={14} /> Update Event
                  </>
                ) : (
                  <>
                    <FiPlus size={14} /> Publish Event
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT PREVIEW (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Live Preview Card
            </label>

            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-lg flex flex-col">
              <div className="relative h-44 w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Event preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[var(--muted)]/40 p-6 text-center">
                    <FiImage size={32} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Poster Image Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded-md text-[9px] font-black text-white uppercase shadow"
                    style={{ backgroundColor: form.color || "#3b82f6" }}
                  >
                    {form.eventType}
                  </span>
                  {form.isFeatured && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-black uppercase shadow flex items-center gap-1">
                      <FiStar size={10} className="fill-black" /> Featured
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-black text-white uppercase border border-white/10">
                    {form.game}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-sm font-black text-white line-clamp-1">
                    {form.title || "Event Title Preview"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-mono">
                  <span className="flex items-center gap-1">
                    <FiCalendar size={12} className="text-[var(--accent)]" />
                    {form.startDate ? new Date(form.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiMapPin size={12} />
                    {form.location || "Online"}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--foreground)]/70 line-clamp-2 leading-relaxed">
                  {form.description || "Event description preview will appear here once entered..."}
                </p>

                {form.link && (
                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--accent)] font-bold">
                    <span className="truncate">Link: {form.link}</span>
                    <FiExternalLink size={12} className="shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* SEARCH & FILTER LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
              All Scheduled Events ({filteredEvents.length})
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--foreground)] focus:border-[var(--accent)] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* EVENTS LIST GRID */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <LoadingSpinner size="lg" color="accent" />
            <p className="text-xs text-[var(--muted)] font-mono">Loading scheduled events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)]/20">
            <FiCalendar size={36} className="mx-auto text-[var(--muted)]/40 mb-3" />
            <p className="text-sm font-bold text-[var(--foreground)]">No events found</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              {search ? "Try adjusting your search filter" : "Use the form above to add the first event"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((ev, idx) => {
                const sDate = new Date(ev.startDate);
                return (
                  <motion.div
                    key={ev._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)]/20 transition-all flex flex-col justify-between"
                  >
                    {/* Top Image or Header */}
                    <div className="relative h-36 bg-neutral-950 overflow-hidden">
                      {ev.image ? (
                        <img
                          src={ev.image}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted)]/30">
                          <FiCalendar size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[8.5px] font-black text-white uppercase shadow"
                          style={{ backgroundColor: ev.color || "#3b82f6" }}
                        >
                          {ev.eventType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[8.5px] font-black text-white uppercase border border-white/10">
                          {ev.game}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase border backdrop-blur ${
                            ev.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : ev.status === "upcoming"
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                              : ev.status === "completed"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <h4 className="text-xs font-black text-white line-clamp-1">{ev.title}</h4>
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--accent)]">
                          <FiClock size={12} />
                          <span>
                            {sDate.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                      </div>

                      {/* Bottom action row */}
                      <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between gap-2 mt-2">
                        <span className="text-[9px] font-mono text-[var(--muted)] flex items-center gap-1 truncate">
                          <FiMapPin size={10} /> {ev.location || "Online"}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {ev.link && (
                            <a
                              href={ev.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                              title="Open link"
                            >
                              <FiExternalLink size={13} />
                            </a>
                          )}
                          <button
                            onClick={() => handleStartEdit(ev)}
                            className="p-1.5 rounded-lg bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-blue-400 transition-colors"
                            title="Edit Event"
                          >
                            <FiEdit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(ev._id, ev.title)}
                            className="p-1.5 rounded-lg bg-[var(--foreground)]/5 text-[var(--muted)] hover:text-red-400 transition-colors"
                            title="Delete Event"
                          >
                            <FiTrash2 size={13} />
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
    </div>
  );
}
