"use client";

import { useEffect, useState } from "react";
import {
  FiPlus, FiUsers, FiAward, FiTrash2, FiChevronDown, FiChevronUp,
  FiPlay, FiSquare, FiRefreshCw, FiDownload, FiGift, FiX, FiEdit2,
} from "react-icons/fi";
import { StatusBadge, EmptyState, LoadingSpinner } from "@/components/common";
import { Gift, Sparkles, CheckCircle2, UserCheck, Trash2 } from "lucide-react";

const TASK_TYPES = [
  { value: "mlbb",      label: "MLBB Verify",  icon: "🎮" },
  { value: "youtube",   label: "YouTube",       icon: "▶️" },
  { value: "whatsapp",  label: "WhatsApp",      icon: "💬" },
  { value: "instagram", label: "Instagram",     icon: "📸" },
  { value: "link",      label: "Open Link",     icon: "🔗" },
  { value: "checkbox",  label: "Checkbox",      icon: "☑️" },
  { value: "text",      label: "Text Input",    icon: "✏️" },
];

function token() { return localStorage.getItem("token") || ""; }
function authHeaders() { return { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" }; }

export default function GiveawayAdminTab() {
  const [giveaways, setGiveaways]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget]  = useState(null);
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

  const toggleVerify = async (entryId, currentStatus) => {
    try {
      const res = await fetch(`/api/admin/giveaway/${selected._id}/entries`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ entryId, isVerified: !currentStatus })
      });
      const d = await res.json();
      if (d.success) {
        setEntries(entries.map(e => e._id === entryId ? { ...e, isVerified: !currentStatus } : e));
      } else {
        alert(d.message || "Error");
      }
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
    if (!entries.length || !selected) return;
    const inputTasks = (selected.tasks || []).map((t, i) => ({ label: t.inputLabel, index: i })).filter(t => t.label);
    const headers = ["Name", "Email", "Phone", "MLBB ID", "Server", "Entered At", "Winner", "Verified", ...inputTasks.map(t => t.label)];
    const rows = entries.map(e => [
      e.name, e.email, e.phone || "", e.mlbbId, e.mlbbServer, new Date(e.createdAt).toLocaleString(), e.isWinner ? "YES" : "", e.isVerified ? "YES" : "",
      ...inputTasks.map(t => (e.taskData?.[t.index] && typeof e.taskData[t.index] === 'string') ? e.taskData[t.index] : "")
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `entries-${selected.title}.csv`; a.click();
  };

  return (
    <div className="space-y-3 pb-8 animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-black tracking-wider text-[var(--foreground)] uppercase">Giveaway Manager</h2>
            <span className="px-1.5 py-0.2 rounded-md bg-[var(--foreground)]/5 border border-[var(--border)] text-[9px] font-bold text-[var(--muted)]">
              {giveaways?.length || 0}
            </span>
          </div>
          <button aria-label="button" onClick={fetchGiveaways} className="w-6.5 h-6.5 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-all cursor-pointer">
            <FiRefreshCw size={11} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <button aria-label="button"
          onClick={() => {
            setEditTarget(null);
            setForm({ title: "", description: "", prize: "", prizeCount: 1, status: "draft", startDate: "", endDate: "", tasks: [], maxEntries: 0 });
            setShowCreate(true);
          }}
          className="h-7 px-2.5 rounded-lg bg-[var(--accent)] text-white text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-[var(--accent-hover)] transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <FiPlus size={12} /> New Giveaway
        </button>
      </div>

      {/* Giveaways list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" color="accent" />
        </div>
      ) : !giveaways.length ? (
        <EmptyState
          icon={Gift}
          title="No Giveaways Yet"
          description="Create your first giveaway to engage players!"
        />
      ) : (
        <div className="space-y-2">
          {giveaways.map(g => (
            <div key={g._id} className={`rounded-xl border bg-[var(--card)] transition-all overflow-hidden ${selected?._id === g._id ? "border-[var(--accent)]" : "border-[var(--border)]"}`}>
              <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0">
                    <Gift size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs font-black text-[var(--foreground)] truncate leading-tight">{g.title}</p>
                      <StatusBadge status={g.status} size="xs" />
                    </div>
                    <p className="text-[8.5px] text-[var(--muted)] font-mono mt-0.5 truncate">
                      {g.prize} · {g.entryCount || 0} entries · {g.prizeCount} winner{g.prizeCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {g.status === "draft" && (
                    <button aria-label="button" onClick={() => updateStatus(g._id, "live")} className="px-2 py-1 rounded-md text-[8.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors flex items-center gap-1 cursor-pointer">
                      <FiPlay size={9} /> Go Live
                    </button>
                  )}
                  {g.status === "live" && (
                    <button aria-label="button" onClick={() => updateStatus(g._id, "ended")} className="px-2 py-1 rounded-md text-[8.5px] font-black uppercase text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1 cursor-pointer">
                      <FiSquare size={9} /> End
                    </button>
                  )}
                  <button aria-label="button"
                    onClick={() => openEdit(g)}
                    className="w-6.5 h-6.5 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center cursor-pointer"
                    title="Edit Giveaway"
                  >
                    <FiEdit2 size={11} />
                  </button>
                  <button aria-label="button"
                    onClick={() => deleteGiveaway(g._id, g.title)}
                    className="w-6.5 h-6.5 rounded-md bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition-colors flex items-center justify-center cursor-pointer"
                    title="Delete Giveaway"
                  >
                    <FiTrash2 size={11} />
                  </button>
                  <button aria-label="button"
                    onClick={() => setSelected(selected?._id === g._id ? null : g)}
                    className={`h-6.5 px-2 rounded-md text-[8.5px] font-black uppercase flex items-center gap-1 transition-colors cursor-pointer border ${selected?._id === g._id ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-[var(--foreground)]/5 text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--foreground)]/10"}`}
                  >
                    <FiUsers size={10} />
                    <span>Entries</span>
                    {selected?._id === g._id ? <FiChevronUp size={9} /> : <FiChevronDown size={9} />}
                  </button>
                </div>
              </div>

              {/* Entries panel */}
              {selected?._id === g._id && (
                <div className="border-t border-[var(--border)] bg-[var(--background)]">

                  {/* Winners picked result */}
                  {pickResult && (
                    <div className="m-2.5 p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-[10px] font-black text-yellow-400 uppercase tracking-wider mb-1">🏆 Winners Picked!</p>
                      {pickResult.map((w, i) => (
                        <p key={i} className="text-xs text-[var(--foreground)] font-bold">{w.name || w.userId} — MLBB: {w.mlbbId}</p>
                      ))}
                    </div>
                  )}

                  {/* Pick winner controls */}
                  {g.status !== "draft" && (
                    <div className="px-3 py-2 flex items-center gap-2.5 flex-wrap border-b border-[var(--border)] bg-[var(--card)]">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[8.5px] text-[var(--muted)] font-black uppercase">Pick Winners:</label>
                        <input
                          type="number" min={1} max={entries.length || 1} value={winnerCount}
                          onChange={e => setWinnerCount(Number(e.target.value))}
                          className="w-12 h-6 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 text-[10px] font-bold text-[var(--foreground)] outline-none"
                        />
                      </div>
                      <button aria-label="button"
                        onClick={pickWinner}
                        disabled={picking || !entries.length}
                        className="h-6 px-2.5 rounded bg-yellow-500 text-black text-[8.5px] font-black uppercase flex items-center gap-1 hover:bg-yellow-400 disabled:opacity-40 transition-opacity cursor-pointer"
                      >
                        <FiAward size={10} /> {picking ? "Picking..." : "Roll Winner"}
                      </button>
                      <button aria-label="button" onClick={exportCSV} className="ml-auto h-6 px-2 rounded border border-[var(--border)] bg-[var(--foreground)]/5 text-[8.5px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1 cursor-pointer">
                        <FiDownload size={10} /> Export CSV
                      </button>
                    </div>
                  )}

                  {/* Entries table */}
                  {entriesLoading ? (
                    <div className="py-6 flex justify-center">
                      <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : !entries.length ? (
                    <p className="text-center text-[10px] text-[var(--muted)] py-6">No entries recorded yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[10.5px]">
                        <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[var(--muted)] font-black uppercase tracking-wider text-[8px]">
                          <tr>
                            {["#", "Player", "Phone", "MLBB Info", "Tasks", "Date", "Action"].map(h => (
                              <th key={h} className="px-3 py-2 text-left">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {entries.map((e, i) => (
                            <tr key={e._id} className={`hover:bg-[var(--foreground)]/[0.02] transition-colors ${e.isWinner ? "bg-yellow-500/5" : ""}`}>
                              <td className="px-3 py-2 text-[var(--muted)] text-[9px]">{i + 1}</td>
                              <td className="px-3 py-2 font-bold text-[var(--foreground)] whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-[10.5px] font-bold flex items-center gap-1">
                                    {e.isWinner && <span>🏆</span>}
                                    {e.name || "—"}
                                  </span>
                                  <span className="text-[8px] text-[var(--muted)] font-normal">{e.email || "—"}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-[var(--muted)] font-mono text-[9.5px]">{e.phone || "—"}</td>
                              <td className="px-3 py-2 font-mono text-[var(--foreground)]">
                                <span className="font-bold text-[10px] text-[var(--accent)]">{e.mlbbId}</span>
                                <span className="text-[8.5px] text-[var(--muted)] ml-1">({e.mlbbServer})</span>
                              </td>
                              <td className="px-3 py-2 text-[var(--muted)] align-middle">
                                <span className="px-1.5 py-0.2 rounded bg-[var(--foreground)]/5 border border-[var(--border)] text-[8px] font-bold text-[var(--foreground)]">
                                  {Object.keys(e.taskData || {}).length} / {g.tasks?.length || 0}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-[var(--muted)] whitespace-nowrap text-[8.5px]">
                                {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1 justify-end">
                                  <button aria-label="button" onClick={() => toggleVerify(e._id, e.isVerified)} className={`text-[7.5px] font-black px-1.5 py-0.5 rounded transition-all border cursor-pointer ${e.isVerified ? 'text-green-400 border-green-500/40 bg-green-500/10' : 'text-[var(--muted)] border-[var(--border)] bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'}`}>
                                    {e.isVerified ? "VERIFIED" : "VERIFY"}
                                  </button>
                                  {e.isWinner ? (
                                    <button aria-label="button" onClick={() => revertWinner(e.userId)} className="text-[7.5px] font-black text-rose-400 hover:text-rose-500 border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.5 rounded transition-all cursor-pointer">
                                      REVERT
                                    </button>
                                  ) : (
                                    <button aria-label="button" onClick={() => manuallyPickWinner(e.userId)} className="text-[7.5px] font-black text-[var(--muted)] hover:text-yellow-400 border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 rounded transition-all cursor-pointer">
                                      WINNER
                                    </button>
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
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Giveaway Modal (Shadowless & Flat) */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] sticky top-0 bg-[var(--background)] z-10">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">{editTarget ? "Edit Giveaway" : "Create Giveaway"}</h3>
                <button aria-label="button" onClick={() => { setShowCreate(false); setEditTarget(null); }} className="w-6 h-6 rounded-md bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
                  <FiX size={12} />
                </button>
              </div>

              <div className="p-4 space-y-2.5">
                <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Weekly Diamond Pass Giveaway" />
                <Field label="Prize" value={form.prize} onChange={v => setForm(f => ({ ...f, prize: v }))} placeholder="e.g. 5 Weekly Diamond Passes" />
                
                <div>
                  <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description..."
                    className="w-full h-12 bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 text-[11px] text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none placeholder:text-[var(--muted)]/40 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Winners</label>
                    <input type="number" min={1} value={form.prizeCount} onChange={e => setForm(f => ({ ...f, prizeCount: Number(e.target.value) }))}
                      className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]">
                      <option value="draft">Draft</option>
                      <option value="live">Live</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">Max Entries (0 = Unlimited)</label>
                    <input type="number" min={0} value={form.maxEntries} onChange={e => setForm(f => ({ ...f, maxEntries: Number(e.target.value) }))}
                      className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]" />
                  </div>
                </div>

                {/* Tasks builder */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[8px] font-black uppercase text-[var(--muted)]">Required Tasks</label>
                    <button aria-label="button" onClick={addTask} className="text-[8px] font-black text-[var(--accent)] uppercase flex items-center gap-0.5 hover:underline cursor-pointer">
                      <FiPlus size={10} /> Add Task
                    </button>
                  </div>

                  {form.tasks.length === 0 && (
                    <p className="text-[9px] text-[var(--muted)] py-2 text-center border border-dashed border-[var(--border)] rounded-lg">No custom tasks added</p>
                  )}

                  {form.tasks.map((task, i) => (
                    <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] font-black text-[var(--muted)]">#{i + 1}</span>
                        <select value={task.type} onChange={e => updateTask(i, "type", e.target.value)}
                          className="flex-1 h-6 bg-[var(--background)] border border-[var(--border)] rounded px-1.5 text-[9.5px] text-[var(--foreground)] outline-none">
                          {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                        </select>
                        <label className="flex items-center gap-1 text-[8.5px] font-bold text-[var(--muted)] cursor-pointer">
                          <input type="checkbox" checked={task.required} onChange={e => updateTask(i, "required", e.target.checked)} className="accent-[var(--accent)]" />
                          Req
                        </label>
                        <button aria-label="button" onClick={() => removeTask(i)} className="text-[var(--muted)] hover:text-red-400 p-0.5 cursor-pointer">
                          <FiTrash2 size={11} />
                        </button>
                      </div>
                      <input value={task.label} onChange={e => updateTask(i, "label", e.target.value)}
                        placeholder="Task label (e.g. Subscribe to channel)"
                        className="w-full h-6 bg-[var(--background)] border border-[var(--border)] rounded px-2 text-[10px] text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none" />
                      <input value={task.link} onChange={e => updateTask(i, "link", e.target.value)}
                        placeholder="Link URL (optional)"
                        className="w-full h-6 bg-[var(--background)] border border-[var(--border)] rounded px-2 text-[10px] text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none font-mono" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                  <button aria-label="button" onClick={() => { setShowCreate(false); setEditTarget(null); }} className="flex-1 h-8 rounded-lg border border-[var(--border)] text-[9px] font-black uppercase text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">Cancel</button>
                  <button aria-label="button" onClick={createGiveaway} disabled={!form.title || !form.prize}
                    className="flex-1 h-8 rounded-lg bg-[var(--accent)] text-white text-[9px] font-black uppercase disabled:opacity-40 hover:bg-[var(--accent-hover)] transition-colors cursor-pointer">
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
      <label className="text-[8px] font-black uppercase text-[var(--muted)] block mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-8 bg-[var(--card)] border border-[var(--border)] rounded-lg px-2.5 text-[11px] font-bold text-[var(--foreground)] placeholder-[var(--muted)]/40 outline-none focus:border-[var(--accent)] transition-colors" />
    </div>
  );
}
