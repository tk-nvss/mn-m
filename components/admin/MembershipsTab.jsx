"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Users, Crown, ShieldCheck, Calendar, Clock, UserX, Plus, RefreshCw } from "lucide-react";

export default function MembershipsTab() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGrantForm, setShowGrantForm] = useState(false);

  // Form State
  const [newUserId, setNewUserId] = useState("");
  const [newUserType, setNewUserType] = useState("member");
  const [expiryType, setExpiryType] = useState("days"); // 'days' or 'date'
  const [expiryDays, setExpiryDays] = useState("30");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchMemberships();
  }, [debouncedSearch]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/memberships?search=${debouncedSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMemberships(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateExpiryDate = () => {
    if (expiryType === "days") {
      const days = parseInt(expiryDays) || 0;
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString();
    }
    return new Date(expiryDate).toISOString();
  };

  const handleGrantMembership = async (e) => {
    e.preventDefault();
    if (!newUserId) return alert("User ID/Email is required");
    if (expiryType === "date" && !expiryDate) return alert("Please select an expiry date");
    if (expiryType === "days" && (!expiryDays || parseInt(expiryDays) <= 0)) return alert("Please enter valid days");

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const calculatedDate = calculateExpiryDate();

      const res = await fetch("/api/admin/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: newUserId,
          userType: newUserType,
          expiryDate: calculatedDate
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Membership granted successfully!");
        setNewUserId("");
        fetchMemberships();
      } else {
        alert(data.message || "Failed to grant membership");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (userId) => {
    if (!confirm("Are you sure you want to revoke this membership? They will become a normal user immediately.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/memberships?userId=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        alert("Membership revoked successfully");
        fetchMemberships();
      } else {
        alert(data.message || "Failed to revoke membership");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "member": return <Crown size={16} className="text-purple-500" />;
      case "admin": return <ShieldCheck size={16} className="text-emerald-500" />;
      default: return <Users size={16} />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "member": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "admin": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getTimeRemaining = (expiryStr) => {
    if (!expiryStr) return "Lifetime";
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry - now;
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days left`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hours left`;
    
    return "Less than an hour";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-[900] text-[var(--foreground)] uppercase tracking-tight">
          Memberships 
        </h2>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => fetchMemberships()}
            className="w-10 h-10 shrink-0 rounded-xl bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 text-[var(--foreground)] flex items-center justify-center transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-[var(--accent)]" : ""} />
          </button>
          <button
            onClick={() => setShowGrantForm(!showGrantForm)}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <Plus size={16} />
            Add 
          </button>
        </div>
      </div>

      {/* Grant Membership Form */}
      {showGrantForm && (
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)] shrink-0">
            <Crown size={20} />
          </div>
          <div>
            <h3 className="text-base font-[900] text-[var(--foreground)] uppercase tracking-widest leading-none">Grant Access</h3>
            <p className="text-[11px] font-bold text-[var(--muted)] mt-1">Elevate user privileges temporarily</p>
          </div>
        </div>
        
        <form onSubmit={handleGrantMembership} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-end">
          <div className="space-y-2 lg:col-span-5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] pl-1">User ID / Email</label>
            <div className="relative">
              <input
                type="text"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                placeholder="Enter user identifier..."
                className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all placeholder:text-[var(--muted)]/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] pl-1">Role Type</label>
            <div className="relative">
              <select
                value={newUserType}
                onChange={e => setNewUserType(e.target.value)}
                className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all appearance-none cursor-pointer"
              >
                <option value="member">🌟 Premium Member</option>
                <option value="admin">🛡️ Administrator</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)]">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] pl-1">Duration / Expiry</label>
            <div className="flex gap-2">
              <div className="relative shrink-0 w-[100px]">
                <select
                  value={expiryType}
                  onChange={e => setExpiryType(e.target.value)}
                  className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-3 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="days">Days</option>
                  <option value="date">Date</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted)] text-xs">
                  ▼
                </div>
              </div>
              
              {expiryType === "days" ? (
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    value={expiryDays}
                    onChange={e => setExpiryDays(e.target.value)}
                    placeholder="30"
                    className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] pointer-events-none">
                    Days
                  </span>
                </div>
              ) : (
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full flex-1 bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all [color-scheme:dark]"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-12 flex justify-end mt-4 pt-4 border-t border-[var(--border)]/50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white text-sm font-bold shadow-xl shadow-[var(--accent)]/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Crown size={18} />
                  Authorize Access
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      )}

      {/* Active Memberships List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col shadow-sm mt-8">
        <div className="p-5 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-[var(--border)] bg-gradient-to-b from-[var(--background)]/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--foreground)]/5 rounded-lg text-[var(--muted)]">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-[900] text-[var(--foreground)] uppercase tracking-widest leading-none">
                Active Access
              </h3>
              <p className="text-[11px] font-medium text-[var(--muted)] mt-1">
                {memberships.length} elevated accounts
              </p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-72 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all placeholder:text-[var(--muted)]/50"
            />
          </div>
        </div>

        <div className="border-t border-[var(--border)]">
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {loading ? (
              <div className="py-16 text-center text-[var(--muted)]">
                <Loader2 size={24} className="mx-auto animate-spin mb-3 text-[var(--accent)]" />
                <p className="font-bold uppercase tracking-widest text-xs">Loading Directory</p>
              </div>
            ) : memberships.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-3">
                  <Users size={20} className="text-[var(--muted)]" />
                </div>
                <p className="font-bold uppercase tracking-widest text-[var(--foreground)] text-sm mb-1">No Privileged Users</p>
                <p className="text-[var(--muted)] text-xs font-medium">Use the form above to grant access.</p>
              </div>
            ) : (
              memberships.map((u) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={u._id}
                  className="group flex items-center justify-between gap-3 p-4 sm:px-6 hover:bg-[var(--foreground)]/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-black text-base shrink-0">
                        {u.name?.charAt(0) || <Users size={16} />}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-bold text-[var(--foreground)] leading-none truncate">{u.name || "Unknown"}</p>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getRoleClass(u.userType)}`}>
                          {u.userType}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-[var(--muted)] truncate mb-1">{u.email}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)]">
                        <Clock size={10} className="text-[var(--accent)]" />
                        {getTimeRemaining(u.membershipExpiry)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(u.userId)}
                    className="shrink-0 w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center active:scale-95 shadow-sm"
                    title="Revoke Access"
                  >
                    <UserX size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
