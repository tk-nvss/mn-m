"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingSpinner, EmptyState } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatDateTime } from "@/utils";

export default function BlocklistTab() {
  const { token, user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formType, setFormType] = useState("ip");
  const [formValue, setFormValue] = useState("");
  const [formReason, setFormReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [message, setMessage] = useState({ text: "", type: "" });

  const [isAddOpen, setIsAddOpen] = useState(false);

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  useEffect(() => {
    if (token) fetchBlocklist();
  }, [token]);

  const fetchBlocklist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blocklist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        showMessage(data.message || "Failed to fetch blocklist");
      }
    } catch (err) {
      showMessage("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) return showMessage("Value is required");
    
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/blocklist", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          type: formType,
          value: formValue,
          reason: formReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Added to blocklist", "success");
        setFormValue("");
        setFormReason("");
        setIsAddOpen(false);
        fetchBlocklist();
      } else {
        showMessage(data.message || "Failed to add");
      }
    } catch (err) {
      showMessage("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this from the blocklist?")) return;
    
    try {
      const res = await fetch(`/api/admin/blocklist?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showMessage("Removed successfully", "success");
        setItems(items.filter((item) => item._id !== id));
      } else {
        showMessage(data.message || "Failed to remove");
      }
    } catch (err) {
      showMessage("An error occurred");
    }
  };

  const filteredItems = items.filter((item) => filterType === "all" || item.type === filterType);

  if (user?.userType !== "admin" && user?.userType !== "owner") {
    return <div className="p-6 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="space-y-4 pb-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Icons.shield size={16} />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-wider leading-tight text-[var(--foreground)]">Blocklist Management</h2>
                <p className="text-[9px] text-[var(--muted)] font-mono leading-none mt-0.5">
                    Security & Access Control
                </p>
            </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex bg-[var(--card)]/60 px-2.5 py-1 rounded-md border border-[var(--border)]">
            <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)]">
              <span className="text-[var(--foreground)] mr-1">{items.length}</span> Blocked
            </span>
          </div>
          <button aria-label="button"
            onClick={fetchBlocklist}
            className="p-1.5 rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-all active:scale-95"
            title="Refresh list"
          >
            <Icons.refresh size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Collapsible Add to Blocklist Section */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="w-full px-3.5 sm:px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-[var(--card)]/50 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
              <Icons.plus size={14} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)] truncate">
                Add to Blocklist
              </h3>
              <p className="text-[9.5px] text-[var(--muted)] truncate">Block suspicious IP address, email, or game ID</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9.5px] font-bold px-2.5 py-1 rounded bg-[var(--accent)] text-white hover:brightness-110 transition-all">
              {isAddOpen ? "Close Form" : "+ Add Entry"}
            </span>
          </div>
        </button>

        {isAddOpen && (
          <div className="p-3.5 sm:p-4 border-t border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-200">
            {message.text && (
              <div className={`mb-3 p-2.5 rounded-lg text-xs font-bold uppercase flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full h-9 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg px-2.5 text-xs font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                  >
                    <option value="ip">IP Address</option>
                    <option value="email">Email Address</option>
                    <option value="gameId">Game ID</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-1">Value to Block</label>
                  <input
                    type="text"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === "ip" ? "e.g. 192.168.1.1" : formType === "email" ? "user@gmail.com" : "12345678"}
                    className="w-full h-9 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg px-2.5 text-xs font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[8.5px] font-extrabold uppercase tracking-wider text-[var(--muted)] mb-1">Reason (Optional)</label>
                  <input
                    type="text"
                    value={formReason}
                    onChange={(e) => setFormReason(e.target.value)}
                    placeholder="e.g. Suspicious activity"
                    className="w-full h-9 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg px-2.5 text-xs font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[var(--accent)] text-white font-black uppercase tracking-wider text-[9.5px] rounded-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <LoadingSpinner size="xs" color="white" /> : <Icons.plus size={12} />}
                  <span>{submitting ? "Adding..." : "Confirm Block"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Blocked Entries Container */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/30 overflow-hidden">
        <div className="px-3.5 sm:px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">Blocked Entries</h3>
          
          <div className="flex p-0.5 bg-[var(--border)]/50 border border-[var(--border)] rounded-md gap-0.5">
            {["all", "ip", "email", "gameId"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterType === type 
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" 
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {type === "all" ? "All" : type}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" color="accent" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Icons.shield}
              title="No Blocked Entries Found"
              description="The system blocklist is currently clear."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--card)]/50 text-[8.5px] font-black uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-2.5 px-3 sm:px-4">Type</th>
                  <th className="py-2.5 px-3 sm:px-4">Value</th>
                  <th className="py-2.5 px-3 sm:px-4">Reason</th>
                  <th className="py-2.5 px-3 sm:px-4">Date</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="text-xs text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.01] transition-colors">
                    <td className="py-2.5 px-3 sm:px-4">
                      <span className={`px-2 py-0.5 rounded border text-[8.5px] font-black uppercase tracking-wider ${
                        item.type === "ip" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        item.type === "email" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-[11px] text-[var(--foreground)]">{item.value}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-[10px] text-[var(--muted)] font-medium truncate max-w-[150px]">{item.reason || "-"}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-[9.5px] text-[var(--muted)]">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="w-7 h-7 inline-flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                        title="Remove from blocklist"
                      >
                        <Icons.trash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
