"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCcw,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  Loader2,
  Users,
  IdCard,
  Crown,
  Type,
  Activity,
  Globe,
  Tag,
  Plus
} from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeStats, setActiveStats] = useState({
    day: 0,
    week: 0,
    month: 0,
  });
  const [newStats, setNewStats] = useState({
    day: 0,
    week: 0,
    month: 0,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    userType: "",
    from: "",
    to: "",
  });

  const [sortBy, setSortBy] = useState("lastLogin");
  const [order, setOrder] = useState("desc");

  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const ALLOWED_TAGS = ["premium", "rare", "new", "loyal", "vip", "special"];

  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'premium' || tagLower === 'vip') return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    if (tagLower === 'rare' || tagLower === 'special') return 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30';
    if (tagLower === 'new' || tagLower === 'latest') return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    if (tagLower === 'loyal' || tagLower === 'topup') return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
    if (tagLower === 'external') return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    return 'bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]';
  };

  useEffect(() => {
    fetchUsersStats();
  }, []);

  useEffect(() => {
    fetchUsersList();
  }, [page, limit, search, filters, sortBy, order]);

  const fetchUsersStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setActiveStats(data.activeStats || { day: 0, week: 0, month: 0 });
        setNewStats(data.newStats || { day: 0, week: 0, month: 0 });
        setPagination(prev => ({ ...prev, total: data.total }));
      }
    } catch (err) {
      console.error("Fetch users stats failed", err);
    }
  };

  const fetchUsersList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page,
        limit,
        search,
        sortBy,
        order,
        ...(filters.userType && { userType: filters.userType }),
        ...(filters.from && { from: filters.from }),
        ...(filters.to && { to: filters.to }),
      });

      const res = await fetch(`/api/admin/users/data?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data?.data || []);
      setPagination(
        data?.pagination || { total: 0, page: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error("Fetch users list failed", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("desc");
    }
    setPage(1);
  };


  const handleForceLogout = async (userId) => {
    if (!confirm("Are you sure you want to log out this user forcefully? They will be logged out on their next action.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/${userId}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("User scheduled for forceful logout!");
      } else {
        alert(data.message || "Failed to force logout");
      }
    } catch (err) {
      alert("Error occurred");
    }
  };

  const handleUpdateTags = async (userId, tags) => {
    try {
      setUpdatingUserId(userId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, tags }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, tags: data.tags } : u));
        if (selectedUser?._id === userId) {
          setSelectedUser(prev => ({ ...prev, tags: data.tags }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const addTagToUser = (user, tag) => {
    if (!tag || user.tags?.includes(tag)) return;
    
    // 1-Tag Limit: Simply replace the existing tags with the new one
    handleUpdateTags(user._id, [tag]);
  };

  const removeTagFromUser = (user, tag) => {
    const updatedTags = (user.tags || []).filter(t => t !== tag);
    handleUpdateTags(user._id, updatedTags);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner": return <ShieldAlert size={14} className="text-rose-500" />;
      case "admin": return <ShieldCheck size={14} className="text-[var(--accent)]" />;
      case "member": return <Crown size={14} className="text-amber-500" />;
      default: return <User size={14} className="text-[var(--muted)]/60" />;
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "owner": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "admin": return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
      case "member": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">Users</h2>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] flex items-center gap-2">
            <Users size={12} className="text-[var(--accent)]" />
            <span className="text-xs sm:text-sm font-semibold text-[var(--muted)]">
              {pagination.total} Users 
            </span>
          </div>
          <button aria-label="button"
            onClick={() => { fetchUsersStats(); fetchUsersList(); }}
            className="p-2 sm:p-2.5 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] active:scale-95 transition-all outline-none"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>



      {/* ================= SEARCH & FILTERS ================= */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] opacity-50" size={14} />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="SEARCH USERS..."
            className="w-full h-9 pl-9 pr-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] outline-none text-[10px] font-bold tracking-widest uppercase focus:border-[var(--accent)]/50 transition-colors font-sans text-[var(--foreground)] placeholder:text-[var(--muted)]/40 text-ellipsis"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <button aria-label="button"
            onClick={() => setShowFilters(true)}
            className="w-9 h-9 flex items-center justify-center rounded-2xl border transition-colors bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] outline-none shrink-0"
          >
            <Filter size={14} />
          </button>
          <div className="hidden sm:flex px-5 h-11 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] items-center gap-2.5">
            <Users size={14} className="text-[var(--accent)]" />
            <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
              {pagination.total} Records
            </span>
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <p className="text-sm text-[var(--muted)] font-medium">Fetching users...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* DESKTOP TABLE */}
            <div className="hidden lg:block rounded-[1.5rem] overflow-hidden border border-[var(--border)] bg-[var(--card)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)] text-[var(--muted)]">
                  <tr className="text-xs font-semibold">
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("name")}>
                      User {sortBy === "name" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("totalOrders")}>
                      Orders {sortBy === "totalOrders" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("joinDate")}>
                      Joined Date {sortBy === "joinDate" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort("lastLogin")}>
                      Last Active {sortBy === "lastLogin" && (order === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u, idx) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setSelectedUser(u)}
                      className="group hover:bg-[var(--foreground)]/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={u} />
                          <div className="flex flex-col">
                            <span className="text-[var(--foreground)] font-semibold text-sm">{u.name}</span>
                            <span className="text-[11px] text-[var(--muted)]/60 font-mono truncate max-w-[120px] leading-none">{u.userId}</span>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                               {u.tags?.map(tag => (
                                 <span key={tag} className={`px-1.5 py-0.5 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[8px] font-black lowercase tracking-tight ${getTagColor(tag).split(' ')[1]}`}>
                                   #{tag}
                                 </span>
                               ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-[var(--muted)]">
                          <span className="text-[var(--foreground)] font-medium text-xs">{u.email}</span>
                          <span className="text-[11px] mt-0.5">{u.phone || "No phone linked"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-[var(--accent)]" />
                          <span className="font-bold text-[var(--foreground)]">{u.totalOrders || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[11px] font-semibold tracking-wide capitalize ${getRoleClass(u.userType)}`}>
                          {getRoleIcon(u.userType)}
                          {u.userType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[var(--foreground)]">
                            {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]/60">
                            {new Date(u.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[var(--foreground)]">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Never"}
                          </span>
                          <span className="text-[10px] text-[var(--muted)]/60">
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                          {u.lastLoginIp && (
                            <span className="text-[9px] text-[var(--accent)]/50 font-mono mt-0.5">{u.lastLoginIp.split(',')[0]}</span>
                          )}
                        </div>
                      </td>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getRoleClass(u.userType)}`}>
                          {u.userType}
                        </span>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}
            <div className="lg:hidden space-y-3">
              {users.map((u, idx) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedUser(u)}
                  className="p-3.5 sm:p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] active:bg-[var(--foreground)]/[0.04] transition-all relative"
                >
                  <div className="flex justify-between items-start mb-2.5 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar user={u} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--foreground)] text-xs truncate leading-tight">{u.name}</p>
                          <p className="text-[10px] text-[var(--muted)]/40 font-mono truncate lowercase leading-tight">{u.userId}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                               {u.tags?.map(tag => (
                                 <span key={tag} className={`px-1.5 py-0.5 rounded text-[7px] font-black lowercase tracking-tight ${getTagColor(tag)}`}>
                                   #{tag}
                                 </span>
                               ))}
                            </div>
                        </div>
                      </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${getRoleClass(u.userType)}`}>
                        {u.userType}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[var(--border)] bg-blue-500/5 text-blue-400 text-[8px] font-black uppercase tracking-wider">
                        {u.totalOrders || 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[var(--muted)]/60 px-0.5">
                      <Mail size={10} className="shrink-0 text-[var(--accent)]" />
                      <span className="text-[10px] font-medium break-all lowercase">{u.email}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[var(--muted)]/40">
                          <Calendar size={10} className="text-[var(--accent)]/50" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-bold uppercase tracking-tight">{new Date(u.createdAt).toLocaleDateString()}</span>
                            <span className="text-[7px] font-medium opacity-60 leading-none">{new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--muted)]/40">
                          <Activity size={10} className="text-emerald-500/50" />
                          <div className="flex flex-col">
                            <span className="text-[8px] font-bold uppercase tracking-tight">
                              {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                            </span>
                            {u.lastLogin && (
                              <span className="text-[7px] font-medium opacity-60 leading-none">{new Date(u.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider ${getRoleClass(u.userType)}`}>
                          {u.userType}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!users.length && (
              <div className="py-24 text-center border border-dashed border-[var(--border)] rounded-[2rem]">
                <Users className="mx-auto text-[var(--muted)]/20 mb-4" size={48} />
                <p className="text-sm font-medium text-[var(--muted)]">No users found matching your search.</p>
              </div>
            )}

            {/* ================= PAGINATION ================= */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button aria-label="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Previous
                  </button>
                  <button aria-label="button"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.04] disabled:opacity-20 transition-all outline-none"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= DRAWER (User Info) ================= */}
      < AnimatePresence >
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-[360px] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl z-[1110] flex flex-col"
            >
              {/* Simple Premium Header - Compact */}
              <div className="p-5 border-b border-[var(--border)] bg-[var(--background)]">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-[var(--muted)]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">User Profile</h3>
                  </div>
                  <button aria-label="button"
                    onClick={() => setSelectedUser(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05] transition-all outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <Avatar user={selectedUser} size="md" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--background)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-[var(--foreground)] truncate leading-none mb-1.5">{selectedUser.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${getRoleClass(selectedUser.userType)}`}>
                        {getRoleIcon(selectedUser.userType)}
                        {selectedUser.userType}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] font-mono">
                        {selectedUser.userId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content - Compact */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--foreground)]/[0.01]">
                <DrawerSection icon={<Shield size={14} />} title="Account">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] px-1">Role Assignment</p>
                      <div className="px-2 py-1.5 bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-md">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getRoleClass(selectedUser.userType)}`}>
                          {selectedUser.userType}
                        </span>
                      </div>
                      {selectedUser.userType === "owner" && (
                        <p className="text-[9px] text-rose-500/80 font-medium px-2 flex items-center gap-1 mt-1.5 bg-rose-500/10 py-1 rounded border border-rose-500/20">
                          <ShieldAlert size={10} /> Owner role
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-[var(--border)]/50">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] px-1">Session Action</p>
                      <button aria-label="button"
                        onClick={() => handleForceLogout(selectedUser._id)}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-bold shadow-sm active:scale-[0.98]"
                      >
                        Force Log Out
                      </button>
                    </div>
                  </div>
                </DrawerSection>

                <DrawerSection icon={<Tag size={14} />} title="Tags">
                  <div className="space-y-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] flex items-center gap-1 px-1">
                      <Plus size={10} /> Select Category (1 Max)
                    </p>
                    
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[var(--foreground)]/[0.02] border border-[var(--border)]/30">
                      {ALLOWED_TAGS.map(tag => {
                        const isActive = selectedUser.tags?.includes(tag);
                        return (
                          <button aria-label="button"
                            key={tag}
                            onClick={() => isActive ? removeTagFromUser(selectedUser, tag) : addTagToUser(selectedUser, tag)}
                            className={`px-2.5 py-1 rounded-md border text-[9px] font-bold lowercase transition-all active:scale-95 ${
                              isActive 
                                ? getTagColor(tag).replace('15', '100').replace('600', 'white') + " border-transparent shadow-sm"
                                : getTagColor(tag) + " bg-transparent opacity-60 hover:opacity-100 hover:bg-[var(--foreground)]/[0.03]"
                            }`}
                          >
                            {isActive ? `✓ ${tag}` : tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </DrawerSection>

                <DrawerSection icon={<IdCard size={14} />} title="Identity">
                  <div className="grid grid-cols-2 gap-2">
                    <DrawerDetail full label="Full Name" value={selectedUser.name} highlight />
                    <DrawerDetail label="User ID" value={selectedUser.userId} code />
                    <DrawerDetail label="Orders" value={selectedUser.totalOrders || 0} />
                  </div>
                </DrawerSection>

                <DrawerSection icon={<Mail size={14} />} title="Contact">
                  <div className="grid grid-cols-1 gap-2">
                    <DrawerDetail label="Email Address" value={selectedUser.email} />
                    <DrawerDetail label="Phone Number" value={selectedUser.phone || "Not provided"} />
                  </div>
                </DrawerSection>

                <DrawerSection icon={<Activity size={14} />} title="Activity">
                  <div className="grid grid-cols-1 gap-2">
                    <DrawerDetail
                      label="Last Logged In"
                      value={selectedUser.lastLogin
                        ? `${new Date(selectedUser.lastLogin).toLocaleDateString(undefined, { dateStyle: 'medium' })} at ${new Date(selectedUser.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : "No record found"
                      }
                    />
                    <DrawerDetail label="Last Login IP" value={selectedUser.lastLoginIp || "Not recorded"} code />
                  </div>
                </DrawerSection>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence >

      {/* ================= FILTER MODAL ================= */}
      < AnimatePresence >
        {showFilters && (
          <div className="fixed inset-0 z-[1200] flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-[var(--background)] border-l border-[var(--border)] p-8 space-y-8 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Filters</h3>
                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-all outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 pt-2">
                {/* SORTING */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Sort Preference</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="flex-1 h-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--foreground)] text-sm font-bold focus:border-[var(--accent)]/50 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="lastLogin">Last Active</option>
                      <option value="totalOrders">Order Count</option>
                      <option value="joinDate">Join Date</option>
                      <option value="name">Name</option>
                    </select>
                    <button aria-label="button"
                      onClick={() => {
                        setOrder(order === "asc" ? "desc" : "asc");
                        setPage(1);
                      }}
                      className="w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] text-[var(--accent)] flex items-center justify-center hover:bg-[var(--foreground)]/[0.1] transition-all"
                    >
                      <Activity size={18} className={`transition-transform duration-500 ${order === "asc" ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="h-px bg-[var(--border)]/50 my-2" />

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] ml-1">Role Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["user", "member", "admin", "owner"].map((type) => (
                      <button aria-label="button"
                        key={type}
                        onClick={() => setFilters({ ...filters, userType: filters.userType === type ? "" : type })}
                        className={`
                           px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all outline-none
                           ${filters.userType === type
                            ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                            : "border-[var(--border)] bg-[var(--foreground)]/[0.02] text-[var(--muted)] hover:text-[var(--foreground)]"}
                         `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] ml-1">Joined From</label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-[10px] font-bold focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] ml-1">Joined To</label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] text-[var(--foreground)] text-[10px] font-bold focus:border-[var(--accent)]/50 outline-none transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button aria-label="button"
                  onClick={() => {
                    setFilters({ userType: "", from: "", to: "" });
                    setPage(1);
                  }}
                  className="flex-1 h-11 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:bg-[var(--foreground)]/[0.05] hover:text-[var(--foreground)] transition-all outline-none"
                >
                  Clear All
                </button>

                <button aria-label="button"
                  onClick={() => setShowFilters(false)}
                  className="flex-1 h-11 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold shadow-lg shadow-[var(--accent)]/20 hover:brightness-110 active:scale-95 transition-all outline-none"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence >
    </div >
  );
}


/* ================= AVATAR ================= */
function Avatar({ user, size = "md" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  const initials = user.userId
    ?.replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase() || "U";

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-2xl object-cover border-2 border-[var(--border)] shadow-inner`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[var(--accent)] via-indigo-500 to-purple-600 shadow-lg shadow-[var(--accent)]/10`}>
      {size === 'lg' ? <User size={24} /> : initials}
    </div>
  );
}

/* ================= HELPERS ================= */
function DrawerSection({ icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[var(--muted)]/40">
        <div className="text-[var(--accent)]">{icon}</div>
        <h4 className="text-xs font-bold uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-4 px-1">{children}</div>
    </div>
  );
}

function DrawerDetail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--border)] pb-3">
      <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-[var(--foreground)]">
        {value || "Not available"}
      </span>
    </div>
  );
}

