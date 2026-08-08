"use client";

import { useEffect, useState } from "react";
import {
  FiPlus, FiUsers, FiAward, FiTrash2, FiChevronDown, FiChevronUp,
  FiPlay, FiSquare, FiRefreshCw, FiDownload, FiGift, FiX, FiEdit2,
} from "react-icons/fi";

const TASK_TYPES = [
  { value: "mlbb",      label: "MLBB Verify",  icon: "🎮" },
  { value: "youtube",   label: "YouTube",       icon: "▶️" },
  { value: "whatsapp",  label: "WhatsApp",      icon: "💬" },
  { value: "instagram", label: "Instagram",     icon: "📸" },
  { value: "link",      label: "Open Link",     icon: "🔗" },
  { value: "checkbox",  label: "Checkbox",      icon: "☑️" },
  { value: "text",      label: "Text Input",    icon: "✏️" },
];

const STATUS_COLORS = {
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  live:  "text-green-400 bg-green-400/10 border-green-400/20",
  ended: "text-red-400 bg-red-400/10 border-red-400/20",
};

function token() { return localStorage.getItem("token") || ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

export default function GiveawayAdminTab() {
  const [giveaways, setGiveaways]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget]  = useState(null); // giveaway being edited
  const [selected, setSelected]      = useState(null);
  const [entries, setEntries]       = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [winnerCount, setWinnerCount] = useState(1);
  const [pickResult, setPickResult] = useState(null);
  const [picking, setPicking]       = useState(false);

  // Create form state
  const [form, setForm] = useState({
    title: "", description: "", prize: "", prizeCount: 1,
    status: "draft", startDate: "", endDate: "",
    tasks: [], maxEntries: 0,
  });

  const fetchGiveaways = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/giveaway", { headers: authHeaders() });
      const d = await res.json();
      setGiveaways(d.giveaways || []);
    } finally { setLoading(false); }
  };

  const fetchEntries = async (id) => {
    setEntriesLoading(true);
    try {
      const res = await fetch(`/api/admin/giveaway/${id}/entries`, { headers: authHeaders() });
      const d = await res.json();
      setEntries(d.entries || []);
    } finally { setEntriesLoading(false); }
  };

  useEffect(() => { fetchGiveaways(); }, []);

  useEffect(() => {
    if (selected) fetchEntries(selected._id);
  }, [selected]);

  const createGiveaway = async () => {
    if (editTarget) {
      // EDIT mode
      const res = await fetch("/api/admin/giveaway", {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ id: editTarget._id, ...form }),
      });
      const d = await res.json();
      if (d.success) {
        setShowCreate(false);
        setEditTarget(null);
        setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 });
        fetchGiveaways();
      }
    } else {
      // CREATE mode
      const res = await fetch("/api/admin/giveaway", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        setShowCreate(false);
        setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 });
        fetchGiveaways();
      }
    }
  };

  const deleteGiveaway = async (id, title) => {
    if (!confirm(`Delete "${title}" and ALL its entries? This cannot be undone.`)) return;
    await fetch("/api/admin/giveaway", { method: "DELETE", headers: authHeaders(), body: JSON.stringify({ id }) });
    if (selected?._id === id) setSelected(null);
    fetchGiveaways();
  };

  const openEdit = (g) => {
    setEditTarget(g);
    setForm({
      title:       g.title       || "",
      description: g.description || "",
      prize:       g.prize       || "",
      prizeCount:  g.prizeCount  || 1,
      status:      g.status      || "draft",
      startDate:   g.startDate   ? g.startDate.slice(0, 10) : "",
      endDate:     g.endDate     ? g.endDate.slice(0, 10)   : "",
      tasks:       g.tasks       || [],
      maxEntries:  g.maxEntries  || 0,
    });
    setShowCreate(true);
  };

  const updateStatus = async (id, status) => {
    await fetch("/api/admin/giveaway", { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ id, status }) });
    fetchGiveaways();
    if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
  };

  const pickWinner = async () => {
    setPicking(true);
    setPickResult(null);
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/pick-winner`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ count: winnerCount }),
      });
      const d = await res.json();
      if (d.success) { setPickResult(d.winners); fetchGiveaways(); fetchEntries(selected._id); }
    } finally { setPicking(false); }
  };

  const manuallyPickWinner = async (userId) => {
    if (!confirm("Are you sure you want to manually mark this user as a winner?")) return;
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/pick-winner`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ count: 1, manualUserId: userId }),
      });
      const d = await res.json();
      if (d.success) { alert("User successfully marked as a winner!"); fetchGiveaways(); fetchEntries(selected._id); }
      else { alert(d.message || "Error"); }
    } catch (e) {
      alert("Error occurred");
    }
  };

  const revertWinner = async (userId) => {
    if (!confirm("Are you sure you want to revert this winner? They will no longer be marked as a winner.")) return;
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/pick-winner`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ revertUserId: userId }),
      });
      const d = await res.json();
      if (d.success) { alert("Winner successfully reverted!"); fetchGiveaways(); fetchEntries(selected._id); }
      else { alert(d.message || "Error"); }
    } catch (e) {
      alert("Error occurred");
    }
  };

  const addTask = () => setForm(f => ({ ...f, tasks: [...f.tasks, { type: "checkbox", label: "", description: "", link: "", inputLabel: "", required: true }] }));
  const removeTask = (i) => setForm(f => ({ ...f, tasks: f.tasks.filter((_, idx) => idx !== i) }));
  const updateTask = (i, field, val) => setForm(f => {
    const tasks = [...f.tasks];
    tasks[i] = { ...tasks[i], [field]: val };
    return { ...f, tasks };
  });

  const exportCSV = () => {
    if (!entries.length) return;
    const headers = ["Name", "Email", "Phone", "MLBB ID", "Server", "Entered At", "Winner"];
    const rows = entries.map(e => [e.name, e.email, e.phone || "", e.mlbbId, e.mlbbServer, new Date(e.createdAt).toLocaleString(), e.isWinner ? "YES" : ""]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `entries-${selected?.title}.csv`; a.click();
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)] uppercase truncate">Giveaway Manager</h2>
            <button aria-label="button" onClick={fetchGiveaways} className="p-1.5 shrink-0 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-all active:scale-95">
              <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-[10px] text-[var(--muted)] mt-0.5 font-mono truncate">Create and manage giveaways, view entries, pick winners</p>
        </div>
        <div>
          <button aria-label="button" onClick={() => { setEditTarget(null); setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 }); setShowCreate(true); }} className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-[10px] font-bold bg-[var(--foreground)] text-[var(--background)] px-3 py-1.5 rounded-md transition-all hover:opacity-90 active:scale-95">
            <FiPlus size={12} /> New Giveaway
          </button>
        </div>
      </div>

      {/* Giveaways list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !giveaways.length ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] py-16 text-center">
          <FiGift size={32} className="mx-auto text-[var(--muted)] opacity-30 mb-3" />
          <p className="text-sm text-[var(--muted)]">No giveaways yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {giveaways.map(g => (
            <div key={g._id} className={`rounded-xl border bg-[var(--background)] hover:bg-[var(--foreground)]/[0.01] transition-all overflow-hidden ${selected?._id === g._id ? "border-[var(--foreground)]/30" : "border-[var(--border)]"}`}>
              <div className="p-3 sm:p-4 flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row">
                <div className="flex items-center gap-3 w-full sm:w-auto flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shrink-0">
                    <FiGift size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-xs font-bold text-[var(--foreground)] truncate">{g.title}</p>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${STATUS_COLORS[g.status] || "bg-transparent text-[var(--muted)] border-[var(--border)]"}`}>{g.status}</span>
                    </div>
                    <p className="text-[9px] text-[var(--muted)] font-mono truncate">{g.prize} · {g.entryCount || 0} entries · {g.prizeCount} winner{g.prizeCount > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                  {g.status === "draft" && (
                    <button aria-label="button" onClick={() => updateStatus(g._id, "live")} className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 hover:bg-emerald-500/5 border border-[var(--border)] hover:border-emerald-500/30 px-2 py-1 rounded transition-colors">
                      <FiPlay size={10} /> Go Live
                    </button>
                  )}
                  {g.status === "live" && (
                    <button aria-label="button" onClick={() => updateStatus(g._id, "ended")} className="flex items-center gap-1 text-[9px] font-bold text-rose-500 hover:bg-rose-500/5 border border-[var(--border)] hover:border-rose-500/30 px-2 py-1 rounded transition-colors">
                      <FiSquare size={10} /> End
                    </button>
                  )}
                  <button aria-label="button"
                    onClick={() => openEdit(g)}
                    className="flex items-center gap-1 text-[9px] font-bold text-[var(--muted)] hover:text-blue-400 hover:bg-blue-400/5 border border-[var(--border)] hover:border-blue-400/30 px-2 py-1 rounded transition-colors"
                  >
                    <FiEdit2 size={10} /> Edit
                  </button>
                  <button aria-label="button"
                    onClick={() => deleteGiveaway(g._id, g.title)}
                    className="flex items-center gap-1 text-[9px] font-bold text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/5 border border-[var(--border)] hover:border-rose-500/30 px-2 py-1 rounded transition-colors"
                  >
                    <FiTrash2 size={10} /> Delete
                  </button>
                  <button aria-label="button"
                    onClick={() => setSelected(selected?._id === g._id ? null : g)}
                    className={`flex items-center gap-1 text-[9px] font-bold border px-2 py-1 rounded transition-colors ${selected?._id === g._id ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] border-[var(--border)]"}`}
                  >
                    <FiUsers size={10} /> Entries
                    {selected?._id === g._id ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}
                  </button>
                </div>
              </div>

              {/* Entries panel */}
              {selected?._id === g._id && (
                <div className="border-t border-[var(--border)] bg-[var(--card)]/30">

                  {/* Winners picked result */}
                  {pickResult && (
                    <div className="mx-4 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2">🏆 Winners Picked!</p>
                      {pickResult.map((w, i) => (
                        <p key={i} className="text-sm text-white font-bold">{w.name || w.userId} — MLBB: {w.mlbbId}</p>
                      ))}
                    </div>
                  )}

                  {/* Pick winner controls */}
                  {g.status !== "draft" && (
                    <div className="px-4 py-3 flex items-center gap-3 flex-wrap border-b border-[var(--border)]">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-[var(--muted)] font-semibold">Winners to pick:</label>
                        <input
                          type="number" min={1} max={entries.length || 1} value={winnerCount}
                          onChange={e => setWinnerCount(Number(e.target.value))}
                          className="w-16 bg-[var(--background)] border border-[var(--border)] rounded-lg px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-yellow-500/50"
                        />
                      </div>
                      <button aria-label="button"
                        onClick={pickWinner}
                        disabled={picking || !entries.length}
                        className="flex items-center gap-1.5 text-[11px] font-black bg-yellow-500 text-black px-3 py-1.5 rounded-lg disabled:opacity-40 transition-opacity hover:opacity-90"
                      >
                        <FiAward size={12} /> {picking ? "Picking..." : "Pick Winner"}
                      </button>
                      <button aria-label="button" onClick={exportCSV} className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                        <FiDownload size={12} /> Export CSV
                      </button>
                    </div>
                  )}

                  {/* Entries table */}
                  {entriesLoading ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : !entries.length ? (
                    <p className="text-center text-[12px] text-[var(--muted)] py-8">No entries yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            {["#", "Name", "Email", "Phone", "MLBB ID", "Server", "Tasks", "Date", ""].map(h => (
                              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {entries.map((e, i) => (
                            <tr key={e._id} className={e.isWinner ? "bg-yellow-500/5" : ""}>
                              <td className="px-4 py-2.5 text-[var(--muted)]">{i + 1}</td>
                              <td className="px-4 py-2.5 font-bold text-[var(--foreground)] whitespace-nowrap">
                                {e.isWinner && <span className="mr-1">🏆</span>}{e.name || "—"}
                              </td>
                              <td className="px-4 py-2.5 text-[var(--muted)]">{e.email || "—"}</td>
                              <td className="px-4 py-2.5 text-[var(--muted)]">{e.phone || "—"}</td>
                              <td className="px-4 py-2.5 font-mono text-[var(--foreground)]">{e.mlbbId}</td>
                              <td className="px-4 py-2.5 text-[var(--muted)]">{e.mlbbServer}</td>
                              <td className="px-4 py-2.5 text-[var(--muted)]">
                                {Object.keys(e.taskData || {}).length} / {g.tasks?.length || 0}
                              </td>
                              <td className="px-4 py-2.5 text-[var(--muted)] whitespace-nowrap">
                                {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </td>
                              <td className="px-4 py-2.5">
                                {e.isWinner ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">WINNER</span>
                                    <button aria-label="button" onClick={() => revertWinner(e.userId)} className="text-[9px] font-black text-red-400 hover:text-red-500 border border-[var(--border)] hover:border-red-500/50 bg-[var(--background)] px-1.5 py-0.5 rounded transition-all">
                                      REVERT
                                    </button>
                                  </div>
                                ) : (
                                  <button aria-label="button" onClick={() => manuallyPickWinner(e.userId)} className="text-[9px] font-black text-[var(--muted)] hover:text-yellow-400 border border-[var(--border)] hover:border-yellow-500/50 bg-[var(--background)] px-1.5 py-0.5 rounded transition-all">
                                    MAKE WINNER
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Giveaway Modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] sticky top-0 bg-[var(--card)]">
                <h3 className="text-sm font-extrabold text-[var(--foreground)]">{editTarget ? "Edit Giveaway" : "Create Giveaway"}</h3>
                <button aria-label="button" onClick={() => { setShowCreate(false); setEditTarget(null); }} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"><FiX size={18} /></button>
              </div>

              <div className="p-5 space-y-4">
                <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Weekly Passes Giveaway" />
                <Field label="Prize" value={form.prize} onChange={v => setForm(f => ({ ...f, prize: v }))} placeholder="e.g. 5 Weekly Passes" />
                <Field label="Description" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Optional details..." />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Winners</label>
                    <input type="number" min={1} value={form.prizeCount} onChange={e => setForm(f => ({ ...f, prizeCount: Number(e.target.value) }))}
                      className="mt-1 w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="mt-1 w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50">
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Max Entries (0 = Unlimited)</label>
                    <input type="number" min={0} value={form.maxEntries} onChange={e => setForm(f => ({ ...f, maxEntries: Number(e.target.value) }))}
                      className="mt-1 w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50" />
                  </div>
                </div>

                {/* Tasks builder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-[var(--muted)] uppercase tracking-wider">Tasks</label>
                    <button aria-label="button" onClick={addTask} className="text-[11px] font-bold text-[var(--accent)] flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <FiPlus size={11} /> Add Task
                    </button>
                  </div>

                  {form.tasks.length === 0 && (
                    <p className="text-[11px] text-[var(--muted)] py-3 text-center border border-dashed border-[var(--border)] rounded-xl">No tasks added yet</p>
                  )}

                  {form.tasks.map((task, i) => (
                    <div key={i} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-[var(--muted)]">#{i + 1}</span>
                        <select value={task.type} onChange={e => updateTask(i, "type", e.target.value)}
                          className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-xs text-[var(--foreground)] outline-none">
                          {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                        </select>
                        <label className="flex items-center gap-1 text-[11px] text-[var(--muted)] cursor-pointer">
                          <input type="checkbox" checked={task.required} onChange={e => updateTask(i, "required", e.target.checked)} className="accent-[var(--accent)]" />
                          Required
                        </label>
                        <button aria-label="button" onClick={() => removeTask(i)} className="text-[var(--muted)] hover:text-red-400 transition-colors">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                      <input value={task.label} onChange={e => updateTask(i, "label", e.target.value)}
                        placeholder="Task label (e.g. Subscribe to our YouTube channel)"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]/40" />
                      <input value={task.link} onChange={e => updateTask(i, "link", e.target.value)}
                        placeholder="Link URL (optional)"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]/40" />
                      <input value={task.inputLabel} onChange={e => updateTask(i, "inputLabel", e.target.value)}
                        placeholder="Input placeholder (if user needs to enter something)"
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] placeholder-[var(--muted)]/50 outline-none focus:border-[var(--accent)]/40" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button aria-label="button" onClick={() => { setShowCreate(false); setEditTarget(null); }} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Cancel</button>
                  <button aria-label="button" onClick={createGiveaway} disabled={!form.title || !form.prize}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-black disabled:opacity-40 hover:opacity-90 transition-opacity">
                    {editTarget ? "Save Changes" : "Create Giveaway"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none focus:border-[var(--accent)]/50 transition-colors" />
    </div>
  );
}
