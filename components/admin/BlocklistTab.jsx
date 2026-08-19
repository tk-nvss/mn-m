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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shadow-inner">
                <Icons.shield className="text-[var(--accent)] text-lg" />
            </div>
            <div>
                <h2 className="text-sm font-black uppercase tracking-widest leading-tight text-[var(--foreground)]">Blocklist Management</h2>
                <p className="text-[9px] text-[var(--muted)]/50 font-bold uppercase tracking-[0.15em] leading-none mt-0.5">
                    Security & Access Control
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] p-6 md:p-8 h-fit shadow-xl shadow-black/5">
          <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)] mb-6 flex items-center gap-2">
             <Icons.plus className="text-[var(--accent)] text-sm" />
             Add to Blocklist
          </h3>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-[var(--background)]/50 border border-[var(--border)] text-[var(--foreground)] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-colors appearance-none"
              >
                <option value="ip">IP Address</option>
                <option value="email">Email Address</option>
                <option value="gameId">Game ID</option>
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Value to Block</label>
              <input
                type="text"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={formType === "ip" ? "e.g. 192.168.1.1" : formType === "email" ? "user@gmail.com" : "12345678"}
                className="w-full bg-[var(--background)]/50 border border-[var(--border)] text-[var(--foreground)] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-2">Reason (Optional)</label>
              <input
                type="text"
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="e.g. Suspicious activity"
                className="w-full bg-[var(--background)]/50 border border-[var(--border)] text-[var(--foreground)] rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-lg shadow-[var(--accent)]/20 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {submitting ? <LoadingSpinner size="xs" color="white" /> : <Icons.plus className="text-sm" />}
              {submitting ? "Adding..." : "Add to Blocklist"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 bg-[var(--card)]/40 border border-[var(--border)] rounded-[1.5rem] p-6 md:p-8 shadow-xl shadow-black/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-xs font-black uppercase tracking-wide text-[var(--foreground)]">Blocked Entries</h3>
            
            <div className="flex bg-[var(--foreground)]/[0.03] p-1 rounded-full border border-[var(--border)]/50 shadow-inner overflow-x-auto hide-scrollbar max-w-full">
              {["all", "ip", "email", "gameId"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                    filterType === type 
                      ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                  }`}
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" color="accent" />
            </div>
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={Icons.shield}
              title="No Blocked Entries Found"
              description="The system blocklist is currently clear."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background)]/30 hide-scrollbar">
              <table className="w-full text-left border-collapse min-w-max">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--foreground)]/[0.02]">
                    {["Type", "Value", "Reason", "Date"].map((h) => (
                      <th key={h} className="py-4 px-6 font-black text-[9px] uppercase tracking-widest text-[var(--muted)]/60">
                        {h}
                      </th>
                    ))}
                    <th className="py-4 px-6 font-black text-[9px] uppercase tracking-widest text-[var(--muted)]/60 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="text-xs text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded border text-[9px] font-black uppercase tracking-widest ${
                          item.type === "ip" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          item.type === "email" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-[11px] text-[var(--foreground)]">{item.value}</td>
                      <td className="py-4 px-6 text-[10px] text-[var(--muted)]/80 font-medium truncate max-w-[150px]">{item.reason || "-"}</td>
                      <td className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="w-8 h-8 inline-flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
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
    </div>
  );
}
