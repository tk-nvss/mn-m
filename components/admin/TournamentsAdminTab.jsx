"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiLoader,
  FiUsers, FiAward, FiCopy, FiBookmark, FiZap, FiClock,
  FiCalendar, FiLock, FiStar, FiChevronRight, FiLayers
} from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";

const GAMES = ["mlbb", "freefire", "codm", "honorkings", "other"];
const STATUSES = ["upcoming", "open", "ongoing", "closed", "ended"];

const PRESET_TEMPLATES = [
  {
    id: "mlbb-5v5-bo3",
    label: "MLBB 5v5 Squad (Bo3)",
    tag: "Popular",
    icon: "🏆",
    data: {
      game: "mlbb",
      title: "5v5 Squad Scrims",
      subtitle: "Daily competitive squad showdown",
      format: "5v5 · Best of 3",
      prize: "5x Weekly Pass",
      slots: 16,
      entryCoins: 0,
      status: "open",
    }
  },
  {
    id: "mlbb-1v1-solo",
    label: "MLBB 1v1 Fast Cup",
    tag: "Solo",
    icon: "⚔️",
    data: {
      game: "mlbb",
      title: "1v1 Solo Scrims",
      subtitle: "Mid lane 1v1 fast knockout matches",
      format: "1v1 · Knockout",
      prize: "Weekly Pass",
      slots: 16,
      entryCoins: 0,
      status: "open",
    }
  },
  {
    id: "freefire-4v4",
    label: "Free Fire 4v4 Clash",
    tag: "Squad",
    icon: "🔥",
    data: {
      game: "freefire",
      title: "4v4 Clash Squad Cup",
      subtitle: "Bermuda squad elimination showdown",
      format: "4v4 · Clash Squad",
      prize: "1,000 Diamonds",
      slots: 12,
      entryCoins: 0,
      status: "open",
    }
  },
  {
    id: "codm-5v5-snd",
    label: "CODM 5v5 S&D",
    tag: "Tactical",
    icon: "🎯",
    data: {
      game: "codm",
      title: "5v5 Search & Destroy",
      subtitle: "Tactical competitive scrim cup",
      format: "5v5 · S&D",
      prize: "800 CP",
      slots: 8,
      entryCoins: 0,
      status: "open",
    }
  },
  {
    id: "mlbb-diamond-cup",
    label: "MLBB Diamond Championship",
    tag: "Paid / High Prize",
    icon: "💎",
    data: {
      game: "mlbb",
      title: "MLBB Diamond Championship",
      subtitle: "High-tier weekend tournament",
      format: "5v5 · Best of 3",
      prize: "2,000 Diamonds + Pass",
      slots: 16,
      entryCoins: 50,
      status: "open",
    }
  }
];

const emptyForm = {
  game: "mlbb",
  title: "",
  subtitle: "",
  format: "",
  prize: "Weekly Pass",
  slots: 16,
  entryCoins: 0,
  status: "open",
  startsAt: "",
  endsAt: "",
  roomId: "",
  roomPassword: "",
};

const STATUS_COLOR = {
  open: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  ongoing: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  upcoming: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  closed: "text-red-400 bg-red-500/10 border-red-500/20",
  ended: "text-[var(--muted)] bg-[var(--border)]/20 border-[var(--border)]",
};

export default function TournamentsAdminTab() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [customTemplates, setCustomTemplates] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Inline confirm state — { id, type: "end" | "delete" }
  const [confirmAction, setConfirmAction] = useState(null);
  // Entry confirm state — { entryId, action }
  const [confirmEntry, setConfirmEntry] = useState(null);

  const token = () => localStorage.getItem("token");

  // Load custom templates from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bb_custom_tourn_templates");
      if (saved) setCustomTemplates(JSON.parse(saved));
    } catch {}
  }, []);

  /* ── Fetch ── */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      setTournaments(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3500); };

  // Apply template
  const applyTemplate = (templateData) => {
    setForm(prev => ({
      ...prev,
      ...templateData,
      roomId: prev.roomId || "",
      roomPassword: prev.roomPassword || "",
      startsAt: prev.startsAt || "",
      endsAt: prev.endsAt || "",
    }));
    setShowForm(true);
    flash(`Loaded template: "${templateData.title}"`);
  };

  // Save custom template
  const saveCustomTemplate = () => {
    if (!templateName.trim()) {
      flash("Please enter a template name");
      return;
    }
    const newTpl = {
      id: "custom-" + Date.now(),
      label: templateName.trim(),
      tag: "Custom",
      icon: "⭐",
      data: {
        game: form.game,
        title: form.title,
        subtitle: form.subtitle,
        format: form.format,
        prize: form.prize,
        slots: Number(form.slots) || 16,
        entryCoins: Number(form.entryCoins) || 0,
        status: form.status,
      }
    };
    const updated = [newTpl, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem("bb_custom_tourn_templates", JSON.stringify(updated));
    } catch {}
    setTemplateName("");
    setShowSaveTemplate(false);
    flash("Template saved successfully!");
  };

  // Delete custom template
  const deleteCustomTemplate = (id, e) => {
    e?.stopPropagation();
    const updated = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem("bb_custom_tourn_templates", JSON.stringify(updated));
    } catch {}
    flash("Template deleted");
  };

  // Quick schedule helper (e.g. today at 8pm)
  const setQuickTime = (type) => {
    const d = new Date();
    if (type === "today8") {
      d.setHours(20, 0, 0, 0);
    } else if (type === "tomorrow8") {
      d.setDate(d.getDate() + 1);
      d.setHours(20, 0, 0, 0);
    } else if (type === "tomorrow9") {
      d.setDate(d.getDate() + 1);
      d.setHours(21, 0, 0, 0);
    }
    // format as YYYY-MM-DDTHH:MM local
    const pad = (n) => String(n).padStart(2, "0");
    const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm(f => ({ ...f, startsAt: localIso }));
  };

  // Duplicate existing tournament
  const duplicateTournament = (t) => {
    setForm({
      game: t.game,
      title: `${t.title} (Copy)`,
      subtitle: t.subtitle || "",
      format: t.format,
      prize: t.prize || "Weekly Pass",
      slots: t.slots,
      entryCoins: t.entryCoins || 0,
      status: "open",
      startsAt: "",
      endsAt: "",
      roomId: "",
      roomPassword: "",
    });
    setEditId(null);
    setShowForm(true);
    flash(`Duplicated from "${t.title}"`);
  };

  /* ── Create / Update ── */
  const handleSubmit = async () => {
    if (!form.title || !form.format || !form.slots) {
      flash("Title, format and slots are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slots: Number(form.slots),
        entryCoins: Number(form.entryCoins),
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        roomId: form.roomId,
        roomPassword: form.roomPassword
      };

      const res = await fetch(
        editId ? `/api/tournaments/${editId}` : "/api/tournaments",
        {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        flash(editId ? "Tournament updated successfully!" : "Tournament created successfully!");
        setShowForm(false);
        setEditId(null);
        setForm(emptyForm);
        fetchAll();
      } else {
        flash(data.message || "Error saving tournament");
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── End Tournament (quick status change) ── */
  const endTournament = (id) => setConfirmAction({ id, type: "end" });

  /* ── Delete ── */
  const deleteTournament = (id) => setConfirmAction({ id, type: "delete" });

  /* ── Execute confirmed action ── */
  const executeConfirm = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    setConfirmAction(null);
    if (type === "end") {
      await fetch(`/api/tournaments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: "ended" }),
      });
    } else {
      await fetch(`/api/tournaments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
    }
    fetchAll();
  };

  /* ── Open Edit ── */
  const openEdit = (t) => {
    setForm({
      game: t.game,
      title: t.title,
      subtitle: t.subtitle || "",
      format: t.format,
      prize: t.prize || "Weekly Pass",
      slots: t.slots,
      entryCoins: t.entryCoins || 0,
      status: t.status,
      startsAt: t.startsAt ? t.startsAt.slice(0, 16) : "",
      endsAt: t.endsAt ? t.endsAt.slice(0, 16) : "",
      roomId: t.roomId || "",
      roomPassword: t.roomPassword || "",
    });
    setEditId(t._id);
    setShowForm(true);
  };

  const [viewEntries, setViewEntries] = useState(null); // stores tournament object
  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const fetchEntries = async (tournamentId) => {
    setEntriesLoading(true);
    try {
      const res = await fetch(`/api/admin/tournaments/entries?tournamentId=${tournamentId}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (data.success) setEntries(data.data);
    } finally {
      setEntriesLoading(false);
    }
  };

  const openEntries = (t) => {
    setViewEntries(t);
    setEntries([]);
    fetchEntries(t._id);
  };

  const updateEntryProgress = async (entryId, action, extra = {}) => {
    setConfirmEntry(null);
    try {
      const res = await fetch("/api/admin/tournaments/entries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ entryId, action, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        setEntries(prev => prev.map(e => e._id === entryId ? { ...e, ...data.data } : e));
      }
    } catch (err) {
      console.error("Update entry failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black tracking-tight text-[var(--foreground)] uppercase">
              Tournament Manager
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest border border-[var(--accent)]/20">
              {tournaments.length} Active
            </span>
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-0.5 font-bold uppercase tracking-wider">
            Create tournaments, load templates, and manage live match entries
          </p>
        </div>

        <button
          aria-label="New Tournament"
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 transition-all text-[9.5px] font-black uppercase tracking-widest shadow-md shadow-[var(--accent)]/20 w-fit"
        >
          <FiPlus size={13} /> New Tournament
        </button>
      </div>

      {msg && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <FiCheck size={14} /> {msg}
        </div>
      )}

      {/* ── TEMPLATES BAR ── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBookmark className="text-[var(--accent)]" size={13} />
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]">
              Quick Tournament Templates
            </span>
          </div>
          <span className="text-[7.5px] font-bold text-[var(--muted)]/50 uppercase tracking-widest">
            Click to auto-fill form
          </span>
        </div>

        {/* Preset Templates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.data)}
              className="group p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{tpl.icon}</span>
                  <span className="text-[6.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]">
                    {tpl.tag}
                  </span>
                </div>
                <p className="text-[9px] font-black text-[var(--foreground)] uppercase leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                  {tpl.label}
                </p>
                <p className="text-[7.5px] text-[var(--muted)]/60 font-bold uppercase mt-0.5 line-clamp-1">
                  {tpl.data.format} · {tpl.data.prize}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Saved Templates */}
        {customTemplates.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)]/50">
            <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/50 mb-2">
              My Saved Templates ({customTemplates.length})
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {customTemplates.map((ct) => (
                <div
                  key={ct.id}
                  onClick={() => applyTemplate(ct.data)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer text-left transition-all"
                >
                  <span className="text-xs">{ct.icon}</span>
                  <div>
                    <span className="text-[8.5px] font-black uppercase text-[var(--foreground)] group-hover:text-[var(--accent)]">
                      {ct.label}
                    </span>
                    <span className="text-[7px] text-[var(--muted)]/50 ml-1.5 uppercase">
                      ({ct.data.game?.toUpperCase()})
                    </span>
                  </div>
                  <button
                    aria-label="Delete template"
                    onClick={(e) => deleteCustomTemplate(ct.id, e)}
                    className="text-[var(--muted)]/30 hover:text-rose-400 p-0.5 transition-colors"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT FORM MODAL / PANEL ── */}
      {showForm && (
        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--card)] p-5 sm:p-6 space-y-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                {editId ? <FiEdit2 size={13} /> : <FiPlus size={14} />}
              </div>
              <div>
                <p className="text-sm font-black text-[var(--foreground)] uppercase">
                  {editId ? "Edit Tournament" : "Create New Tournament"}
                </p>
                <p className="text-[8px] text-[var(--muted)]/60 font-bold uppercase tracking-wider">
                  Fill in tournament specs or use the presets above
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!editId && (
                <button
                  type="button"
                  onClick={() => setShowSaveTemplate(!showSaveTemplate)}
                  className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-colors"
                >
                  <FiBookmark size={10} /> Save as Template
                </button>
              )}
              <button
                aria-label="Close"
                onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                className="w-8 h-8 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>

          {/* Save Template Prompt Popover */}
          {showSaveTemplate && (
            <div className="p-3 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 flex items-center gap-2">
              <input
                placeholder="Template Name (e.g. My Weekly 5v5 Scrim)"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[9px] px-3 py-2 outline-none font-bold uppercase focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={saveCustomTemplate}
                className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-[8px] font-black uppercase tracking-widest shrink-0"
              >
                Save
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Game */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Game Title *
              </label>
              <select
                value={form.game}
                onChange={e => setForm(f => ({ ...f, game: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-3 py-2.5 outline-none focus:border-[var(--accent)]"
              >
                {GAMES.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Initial Status *
              </label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-3 py-2.5 outline-none focus:border-[var(--accent)]"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>

            {/* Total Slots */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Total Team / Player Slots *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={2}
                  value={form.slots}
                  onChange={e => setForm(f => ({ ...f, slots: e.target.value }))}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black px-3 py-2.5 outline-none focus:border-[var(--accent)]"
                />
                <div className="flex items-center gap-1">
                  {[8, 16, 32].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, slots: s }))}
                      className={`px-2 py-2 rounded-lg border text-[8px] font-bold ${
                        Number(form.slots) === s
                          ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                          : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Tournament Title *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. 5v5 Squad Scrims Daily Cup"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-3 py-2.5 outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Subtitle */}
            <div className="sm:col-span-1">
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Subtitle Tagline
              </label>
              <input
                value={form.subtitle}
                onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                placeholder="e.g. Win Weekly Pass & Diamonds"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-medium px-3 py-2.5 outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Format with quick chips */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Match Format *
              </label>
              <input
                value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                placeholder="e.g. 5v5 · Best of 3"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-3 py-2 outline-none focus:border-[var(--accent)] mb-1.5"
              />
              <div className="flex flex-wrap gap-1">
                {["1v1 · Solo", "4v4 · Squad", "5v5 · Bo1", "5v5 · Bo3"].map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, format: fmt }))}
                    className="text-[7px] font-bold uppercase px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Prize with quick chips */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Prize Pool *
              </label>
              <input
                value={form.prize}
                onChange={e => setForm(f => ({ ...f, prize: e.target.value }))}
                placeholder="e.g. Weekly Pass"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black uppercase px-3 py-2 outline-none focus:border-[var(--accent)] mb-1.5 text-amber-400"
              />
              <div className="flex flex-wrap gap-1">
                {["Weekly Pass", "5x Weekly Pass", "1,000 💎", "2,000 💎"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, prize: p }))}
                    className="text-[7px] font-bold uppercase px-2 py-0.5 rounded-md bg-[var(--background)] border border-[var(--border)] text-amber-400/80 hover:text-amber-400"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry Coins */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Entry Coins (0 = Free Entry)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={form.entryCoins}
                  onChange={e => setForm(f => ({ ...f, entryCoins: e.target.value }))}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] font-black px-3 py-2.5 outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, entryCoins: 0 }))}
                  className={`px-3 py-2.5 rounded-xl border text-[8px] font-black uppercase tracking-wider ${
                    Number(form.entryCoins) === 0
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-[var(--background)] border-[var(--border)] text-[var(--muted)]"
                  }`}
                >
                  Free (0)
                </button>
              </div>
            </div>

            {/* Starts At with Quick Helpers */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70">
                  Starts At (Match Time)
                </label>
              </div>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] px-3 py-2 outline-none focus:border-[var(--accent)] mb-1.5"
              />
              <div className="flex gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setQuickTime("today8")}
                  className="text-[7px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Today 8 PM
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime("tomorrow8")}
                  className="text-[7px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Tomorrow 8 PM
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime("tomorrow9")}
                  className="text-[7px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Tomorrow 9 PM
                </button>
              </div>
            </div>

            {/* Ends At */}
            <div>
              <label className="block text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/70 mb-1.5">
                Registration Deadline / Ends At
              </label>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-[10px] px-3 py-2 outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Room Info (Highlighted in dedicated box) */}
            <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 space-y-3">
              <div className="flex items-center gap-2">
                <FiLock size={12} className="text-[var(--accent)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]">
                  Live Custom Lobby Credentials (Optional now, can be updated before match)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[7.5px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">
                    Room ID
                  </label>
                  <input
                    value={form.roomId}
                    onChange={e => setForm(f => ({ ...f, roomId: e.target.value }))}
                    placeholder="e.g. 892341"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono font-bold px-3 py-2 outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-[7.5px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">
                    Room Password
                  </label>
                  <input
                    value={form.roomPassword}
                    onChange={e => setForm(f => ({ ...f, roomPassword: e.target.value }))}
                    placeholder="e.g. 5566"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono font-bold px-3 py-2 outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
            <button
              aria-label="Submit"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-[9.5px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-60 transition-all shadow-md shadow-[var(--accent)]/20"
            >
              {saving ? <FiLoader size={14} className="animate-spin" /> : <FiCheck size={14} />}
              {editId ? "Save Changes" : "Publish Tournament"}
            </button>
            <button
              aria-label="Cancel"
              onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[9.5px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── TOURNAMENT LIST ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <FiLoader size={24} className="animate-spin text-[var(--muted)]" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <div className="w-12 h-12 rounded-2xl border border-[var(--border)] flex items-center justify-center text-[var(--muted)]/40 mx-auto">
            <FiAward size={20} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]/50">
            No Tournaments Created Yet
          </p>
          <p className="text-[8px] text-[var(--muted)]/40 uppercase font-bold">
            Use any preset template above or click "New Tournament" to launch your first event!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t) => {
            const isPending = confirmAction?.id === t._id;
            return (
              <div
                key={t._id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 hover:border-[var(--accent)]/30 transition-all shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border border-[var(--border)] text-[var(--accent)] bg-[var(--accent)]/5">
                        {t.game}
                      </span>
                      <span className={`text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${STATUS_COLOR[t.status] || ""}`}>
                        {t.status}
                      </span>
                      {Boolean(t.roomId) && (
                        <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                          Room: {t.roomId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-[var(--foreground)] truncate uppercase tracking-tight">
                      {t.title}
                    </p>
                    <p className="text-[8px] text-[var(--muted)]/60 mt-0.5 font-bold uppercase tracking-wide truncate">
                      {t.format} · <span className="text-amber-400">Prize: {t.prize}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[8px] font-bold text-[var(--muted)]/70 uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <FiUsers size={10} className="text-[var(--accent)]" /> {t.slotsFilled}/{t.slots} slots
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <FiAward size={10} className="text-amber-400" /> {t.entryCoins === 0 ? "Free Entry" : `${t.entryCoins} Coins`}
                      </span>
                      {t.startsAt && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <FiClock size={10} /> {new Date(t.startsAt).toLocaleDateString()} {new Date(t.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                    <button
                      aria-label="View Entries"
                      onClick={() => openEntries(t)}
                      className="px-3.5 py-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[8.5px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      Entries ({t.slotsFilled || 0})
                    </button>
                    
                    <button
                      aria-label="Duplicate as template"
                      onClick={() => duplicateTournament(t)}
                      className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)] transition-colors"
                      title="Duplicate as Template"
                    >
                      <FiCopy size={13} />
                    </button>

                    <button
                      aria-label="Edit"
                      onClick={() => openEdit(t)}
                      className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 size={13} />
                    </button>

                    {t.status !== "ended" && (
                      <button
                        aria-label="End tournament"
                        onClick={() => endTournament(t._id)}
                        disabled={isPending}
                        className="px-2.5 py-2 rounded-xl border border-amber-500/20 text-[8.5px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-40"
                        title="End tournament"
                      >
                        End
                      </button>
                    )}

                    <button
                      aria-label="Delete"
                      onClick={() => deleteTournament(t._id)}
                      disabled={isPending}
                      className="p-2 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Inline confirm strip */}
                {isPending && (
                  <div className={`mt-3 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[9px] font-bold ${
                    confirmAction.type === "delete"
                      ? "border-rose-500/20 text-rose-400"
                      : "border-amber-500/20 text-amber-400"
                  }`}>
                    <span className="uppercase tracking-widest">
                      {confirmAction.type === "delete"
                        ? "⚠️ Permanently delete tournament and all entry records?"
                        : "Mark this tournament as ENDED?"}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        aria-label="Confirm"
                        onClick={executeConfirm}
                        className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-white ${
                          confirmAction.type === "delete" ? "bg-rose-500 hover:bg-rose-600" : "bg-amber-500 hover:bg-amber-600"
                        } transition-colors`}
                      >
                        Confirm
                      </button>
                      <button
                        aria-label="Cancel"
                        onClick={() => setConfirmAction(null)}
                        className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-[8px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Entries Modal ── */}
      {viewEntries && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Entries: {viewEntries.title}</h3>
                <p className="text-xs text-[var(--muted)]">{viewEntries.format} · {viewEntries.slotsFilled} Joined</p>
              </div>
              <button aria-label="button" onClick={() => setViewEntries(null)} className="w-8 h-8 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)]"><FiX size={18} /></button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {entriesLoading ? (
                <div className="flex items-center justify-center py-20"><FiLoader size={24} className="animate-spin text-[var(--muted)]" /></div>
              ) : entries.length === 0 ? (
                <div className="py-20 text-center text-[var(--muted)] text-sm italic">No entries yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                        <th className="px-4 py-3 font-bold uppercase tracking-widest">Team / Lead</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-widest">Contact</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-widest">Game IDs</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-widest">Progress</th>
                        <th className="px-4 py-3 font-bold uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {entries.map((e) => (
                        <tr key={e._id} className="hover:bg-[var(--foreground)]/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-bold">{e.teamName ? `TEAM: ${e.teamName}` : (e.userId?.name || "N/A")}</div>
                            <div className="text-[10px] text-[var(--muted)] uppercase">{e.teamName ? (e.userId?.name || "Lead") : `ID: ${e.userId?.userId || "N/A"}`}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{e.contactEmail}</div>
                            <div>{e.contactPhone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {e.gameIds.map((id, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/5 border border-[var(--border)] font-mono text-[10px]">{id}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-bold text-[9px] uppercase`}>
                                  Round {e.currentRound}
                                </span>
                                {e.isEliminated && (
                                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase">Eliminated</span>
                                )}
                                {e.isWinner && (
                                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase flex items-center gap-1">
                                    <FiAward size={10} /> Winner
                                  </span>
                                )}
                              </div>
                              {e.currentRound > 1 && !e.isEliminated && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex gap-1">
                                    <input 
                                      placeholder="New Room ID"
                                      defaultValue={e.assignedRoomId}
                                      onBlur={(e_target) => updateEntryProgress(e._id, "updateRoom", { roomId: e_target.target.value, roomPassword: e.assignedRoomPassword })}
                                      className="w-24 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[8px] outline-none focus:border-[var(--accent)]/40"
                                    />
                                    <input 
                                      placeholder="Pass"
                                      defaultValue={e.assignedRoomPassword}
                                      onBlur={(e_target) => updateEntryProgress(e._id, "updateRoom", { roomId: e.assignedRoomId, roomPassword: e_target.target.value })}
                                      className="w-16 bg-[var(--card)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[8px] outline-none focus:border-[var(--accent)]/40"
                                    />
                                  </div>
                                  <p className="text-[7px] text-[var(--muted)] italic">Room for next round</p>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {confirmEntry?.entryId === e._id ? (
                                <div className="flex items-center gap-1 bg-[var(--accent)]/5 border border-[var(--accent)]/20 p-1 rounded-lg">
                                  <span className="text-[7px] font-black uppercase text-[var(--accent)] px-1">Sure?</span>
                                  <button aria-label="button" onClick={() => updateEntryProgress(e._id, confirmEntry.action)} className="px-2 py-1 rounded bg-[var(--accent)] text-white text-[8px] font-black uppercase">Yes</button>
                                  <button aria-label="button" onClick={() => setConfirmEntry(null)} className="px-2 py-1 rounded bg-[var(--border)] text-[var(--muted)] text-[8px] font-black uppercase">No</button>
                                </div>
                              ) : (
                                <>
                                  {!e.isEliminated && (
                                    <>
                                      <div className="flex flex-col items-center gap-1">
                                        <button aria-label="button"
                                          onClick={() => setConfirmEntry({ entryId: e._id, action: "promote" })}
                                          className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all"
                                        >
                                          <FiPlus size={14} />
                                        </button>
                                        <span className="text-[6px] font-black uppercase text-emerald-500/60 tracking-tighter">Promote</span>
                                      </div>

                                      {e.currentRound > 1 && (
                                        <div className="flex flex-col items-center gap-1">
                                          <button aria-label="button"
                                            onClick={() => setConfirmEntry({ entryId: e._id, action: "demote" })}
                                            className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                                          >
                                            <div className="w-2.5 h-0.5 bg-current rounded-full" />
                                          </button>
                                          <span className="text-[6px] font-black uppercase text-blue-500/60 tracking-tighter">Demote</span>
                                        </div>
                                      )}

                                      <div className="flex flex-col items-center gap-1">
                                        <button aria-label="button"
                                          onClick={() => setConfirmEntry({ entryId: e._id, action: "eliminate" })}
                                          className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
                                        >
                                          <FiX size={14} />
                                        </button>
                                        <span className="text-[6px] font-black uppercase text-red-500/60 tracking-tighter">Kill</span>
                                      </div>

                                      <div className="flex flex-col items-center gap-1">
                                        <button aria-label="button"
                                          onClick={() => setConfirmEntry({ entryId: e._id, action: "winner" })}
                                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                            e.isWinner 
                                              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                                          }`}
                                        >
                                          <FiAward size={14} />
                                        </button>
                                        <span className="text-[6px] font-black uppercase text-amber-500/60 tracking-tighter">Winner</span>
                                      </div>
                                    </>
                                  )}
                                  {e.isEliminated && (
                                    <button aria-label="button"
                                      onClick={() => setConfirmEntry({ entryId: e._id, action: "reset" })}
                                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[8px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                                    >
                                      Bring Back
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
