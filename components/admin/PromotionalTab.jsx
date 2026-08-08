"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Users,
  Search,
  CheckSquare,
  Square,
  Mail,
  Loader2,
  Trash2,
  AlertCircle,
  Globe,
  Tag,
  Plus,
  X,
  UserPlus,
  RefreshCcw,
  Info
} from "lucide-react";

export default function PromotionalTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [stats, setStats] = useState({ todayEmails: 0, totalEmails: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [manualEmail, setManualEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [manualEmails, setManualEmails] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [editingTagsUserId, setEditingTagsUserId] = useState(null);
  const [newTagInput, setNewTagInput] = useState("");
  const [tagUpdateLoading, setTagUpdateLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const ALLOWED_TAGS = ["premium", "rare", "new", "loyal", "vip", "special"];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/users/data?page=${page}&limit=50&role=${selectedRole === 'all' ? '' : selectedRole}&tag=${selectedTag || ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.filter(u => u.email));
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalRecords(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, selectedTag]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/promo-mail/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const useTemplate = (log) => {
    setSubject(log.subject || "");
    setPromoTitle(log.promoTitle || "");
    setContent(log.content || "");
    setImageUrl(log.imageUrl || "");
    setStatus({ type: "success", message: "Template loaded." });
    // Scroll to composer
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const allDisplayUsers = [
    ...users.filter(u => !manualEmails.includes(u.email.toLowerCase())),
    ...manualEmails.map(email => ({
      _id: `manual-${email}`,
      email,
      name: "External Gmail",
      userType: "external",
      isManual: true,
      tags: ["External"]
    }))
  ];

  const filteredUsers = allDisplayUsers.filter(u => {
    const searchLower = search.toLowerCase();
    const matchesSearch = u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.tags?.some(t => t.toLowerCase().includes(searchLower));

    // Role and Tag filtering is now handled by the API, but we keep this for manual emails and local search
    const matchesRole = selectedRole === "all" ||
      (selectedRole === "external" ? u.isManual : u.userType === selectedRole);

    const matchesTag = !selectedTag || u.tags?.includes(selectedTag);

    return matchesSearch && matchesRole && matchesTag;
  });

  const uniqueTags = Array.from(new Set([...users.flatMap(u => u.tags || []), ...ALLOWED_TAGS]));

  const handleUpdateTags = async (userId, tags) => {
    try {
      setTagUpdateLoading(true);

      const userToUpdate = allDisplayUsers.find(user => user._id === userId);

      if (userToUpdate?.isManual) {
        // Just update local state for manual/external contacts
        setUsers(prev => prev.map(user => user._id === userId ? { ...user, tags } : user));
        // Also update manualEmails if the user was originally from manualEmails
        setManualEmails(prev => prev.map(email => userToUpdate.email === email ? { ...userToUpdate, tags }.email : email));
        setEditingTagsUserId(null);
        setStatus({ type: "success", message: "Tags updated for external contact." });
        return;
      }

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
        setEditingTagsUserId(null);
        setStatus({ type: "success", message: "Tags updated." });
      } else {
        setStatus({ type: "error", message: data.message || "Failed to update tags." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Failed to update tags." });
    } finally {
      setTagUpdateLoading(false);
    }
  };

  const addTagToUser = (user, tag) => {
    if (!tag || user.tags?.includes(tag)) return;

    // 1-Tag Limit: Simply replace the existing tags with the new one
    handleUpdateTags(user._id, [tag]);
    setNewTagInput("");
  };

  const removeTagFromUser = (user, tag) => {
    const updatedTags = (user.tags || []).filter(t => t !== tag);
    handleUpdateTags(user._id, updatedTags);
  };

  const syncAllTags = async () => {
    try {
      setTagUpdateLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users/migrate-tags", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: data.message });
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Migration failed." });
    } finally {
      setTagUpdateLoading(false);
    }
  };

  const addManualEmail = () => {
    if (!manualEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      setStatus({ type: "error", message: "Please enter a valid email address." });
      return;
    }

    const cleanEmail = manualEmail.trim().toLowerCase();
    if (selectedEmails.includes(cleanEmail)) {
      setStatus({ type: "info", message: "This email is already in the recipient list." });
      return;
    }

    setManualEmails(prev => [...prev, cleanEmail]);
    setSelectedEmails(prev => [...prev, cleanEmail]);
    setManualEmail("");
    setStatus({ type: "success", message: `Added ${cleanEmail} to recipients.` });
  };

  const removeManualEmail = (e, email) => {
    e.stopPropagation();
    const targetEmail = email.toLowerCase();
    setManualEmails(prev => prev.filter(m => m.toLowerCase() !== targetEmail));
    setSelectedEmails(prev => prev.filter(m => m.toLowerCase() !== targetEmail));
    setStatus({ type: "info", message: "Manual entry removed." });
  };

  const getTagColor = (tag) => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'premium' || tagLower === 'vip') return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    if (tagLower === 'rare' || tagLower === 'special') return 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30';
    if (tagLower === 'new' || tagLower === 'latest') return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';
    if (tagLower === 'loyal' || tagLower === 'topup') return 'bg-rose-500/15 text-rose-600 border-rose-500/30';
    if (tagLower === 'external') return 'bg-blue-500/15 text-blue-600 border-blue-500/30';
    return 'bg-[var(--foreground)]/[0.05] text-[var(--muted)] border-[var(--border)]';
  };

  const toggleSelectAll = () => {
    // This will select/deselect all users currently displayed on the page
    const currentEmailsOnPage = filteredUsers.map(u => u.email);
    const allSelectedOnPage = currentEmailsOnPage.every(email => selectedEmails.includes(email));

    if (allSelectedOnPage) {
      // Deselect all on current page
      setSelectedEmails(prev => prev.filter(email => !currentEmailsOnPage.includes(email)));
    } else {
      // Select all on current page that are not already selected
      setSelectedEmails(prev => [...new Set([...prev, ...currentEmailsOnPage])]);
    }
  };

  const toggleSelectUser = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleSend = async () => {
    if (selectedEmails.length === 0) {
      setStatus({ type: "error", message: "Please select at least one recipient." });
      return;
    }
    if (!subject || !content) {
      setStatus({ type: "error", message: "Subject and Content are required." });
      return;
    }

    try {
      setSending(true);
      setStatus({ type: "info", message: `Preparing to send to ${selectedEmails.length} recipients...` });
      const token = localStorage.getItem("token");

      const batchSize = 50; // Send 50 emails per request to avoid timeouts
      const totalRecipients = selectedEmails.length;
      let totalSuccess = 0;
      let totalFailed = 0;

      for (let i = 0; i < totalRecipients; i += batchSize) {
        const currentBatch = selectedEmails.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(totalRecipients / batchSize);

        setStatus({
          type: "info",
          message: `Sending batch ${batchNumber}/${totalBatches} (${currentBatch.length} users)...`
        });

        const res = await fetch("/api/admin/promo-mail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emails: currentBatch,
            subject,
            promoTitle,
            content,
            imageUrl,
          }),
        });

        const data = await res.json();
        if (data.success) {
          totalSuccess += data.report.success;
          totalFailed += data.report.failed;
          // Update stats after each success
          fetchStats();
        } else {
          // If a whole batch fails (e.g. server error)
          totalFailed += currentBatch.length;
          console.error(`Batch ${batchNumber} failed:`, data.message);
        }

        // Add a small delay between batches to be extra safe with rate limits
        if (i + batchSize < totalRecipients) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setStatus({
        type: "success",
        message: `Transmission complete: ${totalSuccess} sent, ${totalFailed} failed.`
      });
      setSubject("");
      setPromoTitle("");
      setContent("");
      setImageUrl("");
      setSelectedEmails([]);

    } catch (err) {
      console.error("Transmission Error:", err);
      setStatus({ type: "error", message: "An error happened while sending. Some emails may still be sent." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ================= PREMIUM DASHBOARD HEADER ================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-[var(--foreground)] flex items-center gap-2 whitespace-nowrap">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white shadow-md shadow-[var(--accent)]/20 shrink-0">
                <Send size={16} />
              </div>
              Promo mail
            </h2>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
               onClick={syncAllTags}
               disabled={tagUpdateLoading}
               className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 text-indigo-500 hover:text-white transition-all group disabled:opacity-40 shadow-md shadow-indigo-500/5 active:scale-95"
               title="Initialize tags for all users in database"
            >
              <div className={`p-1 rounded-md ${tagUpdateLoading ? '' : 'bg-indigo-500/10 group-hover:bg-white/20'}`}>
                <RefreshCcw size={14} className={tagUpdateLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
              </div>
              <div className="flex flex-col items-start leading-tight">
                 <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">Sync DB</span>
                 <span className="text-[8px] font-bold opacity-60 whitespace-nowrap hidden sm:block">Add missing tags</span>
              </div>
            </button>
          </div>
        </div>

        {/* STATS TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <StatTile 
            icon={<Send size={18} />} 
            label="Mails Today" 
            value={stats.todayEmails.toLocaleString()} 
            sub="Active Campaign"
            color="emerald"
          />
          <StatTile 
            icon={<Mail size={18} />} 
            label="Total reach" 
            value={stats.totalEmails.toLocaleString()} 
            sub="Past Lifetime"
            color="amber"
          />
          <StatTile 
            icon={<Globe size={18} />} 
            label="External" 
            value={manualEmails.length.toLocaleString()} 
            sub="Manual Added"
            color="blue"
          />
          <StatTile 
            icon={<Users size={18} />} 
            label="Database" 
            value={totalRecords.toLocaleString()} 
            sub="Total Contacts"
            color="indigo"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: User Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
              <Users size={14} className="text-[var(--accent)]" /> Recipients ({selectedEmails.length})
            </h3>
            <button aria-label="button"
              onClick={toggleSelectAll}
              className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] hover:brightness-110 active:scale-95 transition-all"
            >
              {filteredUsers.every(u => selectedEmails.includes(u.email)) && filteredUsers.length > 0 ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 px-1 items-center">
            {["all", "user", "member", "admin", "owner", "external"].map((role) => (
              <button aria-label="button"
                key={role}
                onClick={() => { setSelectedRole(role); setPage(1); }}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  selectedRole === role
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Compact Tag Filter */}
          <div className="px-1">
            <div className="relative group">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] opacity-50" size={12} />
              <select
                value={selectedTag || ""}
                onChange={(e) => { setSelectedTag(e.target.value || null); setPage(1); }}
                className="w-full h-9 pl-9 pr-9 rounded border border-[var(--border)] bg-[var(--background)] text-[10px] font-bold uppercase tracking-widest outline-none appearance-none cursor-pointer text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-colors"
              >
                <option value="" className="bg-[var(--background)] text-[var(--foreground)]">Filter by Category / Tag</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag} className="bg-[var(--background)] text-[var(--foreground)]">
                    #{tag.toLowerCase()}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <Plus size={10} className="rotate-45" />
              </div>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="flex gap-2 px-1">
            <div className="relative flex-1 group">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] opacity-50" size={14} />
              <input
                type="text"
                placeholder="Type external Gmail..."
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManualEmail()}
                className="w-full h-9 pl-9 pr-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs outline-none transition-colors placeholder:text-[var(--muted)]/40 text-[var(--foreground)] focus:border-[var(--accent)]/50"
              />
            </div>
            <button aria-label="button"
              onClick={addManualEmail}
              className="px-4 h-9 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="relative group px-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] opacity-50" size={14} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs outline-none transition-colors placeholder:text-[var(--muted)]/40 text-[var(--foreground)] focus:border-[var(--accent)]/50"
            />
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2">
              Showing {users.length} of {totalRecords} Records
            </h3>
            <div className="flex items-center gap-2">
              <button aria-label="button" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] disabled:opacity-20 transition-all"
              >
                 <RefreshCcw size={14} className="-rotate-90" />
              </button>
              <span className="text-[10px] font-black text-[var(--foreground)]">Page {page} / {totalPages}</span>
              <button aria-label="button" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-[var(--foreground)]/[0.05] hover:bg-[var(--foreground)]/[0.1] disabled:opacity-20 transition-all"
              >
                 <RefreshCcw size={14} className="rotate-90" />
              </button>
            </div>
          </div>

          <div className="h-[450px] overflow-y-auto border border-[var(--border)] rounded bg-[var(--background)] custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted)]">Loading contact list...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              [...filteredUsers]
                .sort((a, b) => {
                  const aSelected = selectedEmails.includes(a.email);
                  const bSelected = selectedEmails.includes(b.email);
                  if (aSelected && !bSelected) return -1;
                  if (!aSelected && bSelected) return 1;
                  return 0;
                })
                .map(u => (
                  <div
                    key={u._id}
                    onClick={() => toggleSelectUser(u.email)}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors border-b border-[var(--border)]/50 last:border-0 relative group ${selectedEmails.includes(u.email) ? 'bg-[var(--accent)]/5' : 'bg-transparent hover:bg-[var(--foreground)]/[0.02]'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] uppercase tracking-widest shrink-0 ${selectedEmails.includes(u.email) ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--muted)] bg-[var(--background)]'}`}>
                        {u.isManual ? <Globe size={14} /> : (u.name?.charAt(0).toUpperCase() || 'U')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[var(--foreground)] truncate leading-tight">{u.name}</p>
                          {u.isManual && <span className="px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest shrink-0">Manual</span>}
                        </div>
                        <p className="text-[11px] text-[var(--muted)]/60 font-medium truncate lowercase leading-tight mb-1">{u.email}</p>

                        {/* Tags Display */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {u.tags?.map(tag => (
                            <span key={tag} className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${getTagColor(tag)}`}>
                              {tag}
                              {!u.isManual && (
                                <button aria-label="button" onClick={(e) => { e.stopPropagation(); removeTagFromUser(u, tag); }} className="opacity-60 hover:opacity-100 hover:text-[var(--foreground)]">
                                  <X size={10} />
                                </button>
                              )}
                            </span>
                          ))}
                          {!u.isManual && editingTagsUserId !== u._id && (
                            <button aria-label="button"
                              onClick={(e) => { e.stopPropagation(); setEditingTagsUserId(u._id); }}
                              className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 border border-[var(--border)] rounded px-1.5 py-0.5"
                            >
                              <Plus size={8} /> Tag
                            </button>
                          )}
                        </div>

                        {/* Tag Selection Only */}
                        {editingTagsUserId === u._id && (
                          <div className="mt-3 space-y-2 p-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-black lowercase tracking-tight text-[var(--accent)] flex items-center gap-1.5">
                                <Plus size={10} /> Select Category (1 Max)
                              </p>
                              <button aria-label="button" onClick={() => setEditingTagsUserId(null)} className="p-1 px-2 text-[10px] font-black lowercase text-rose-500 hover:bg-rose-500/10 rounded-lg">
                                Close
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {ALLOWED_TAGS.map(tag => {
                                const isActive = u.tags?.includes(tag);
                                return (
                                  <button aria-label="button"
                                    key={tag}
                                    onClick={() => isActive ? removeTagFromUser(u, tag) : addTagToUser(u, tag)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black lowercase border transition-all hover:scale-105 active:scale-95 shadow-sm ${isActive
                                        ? getTagColor(tag).replace('15', '100').replace('600', 'white') + " border-transparent"
                                        : getTagColor(tag) + " opacity-40 hover:opacity-100"
                                      }`}
                                  >
                                    {isActive ? `✓ ${tag}` : `+ ${tag}`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center shrink-0 ml-2">
                      {u.isManual && (
                        <button aria-label="button"
                          onClick={(e) => removeManualEmail(e, u.email)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors mr-2 group/remove"
                          title="Remove permanently"
                        >
                          <Trash2 size={14} className="opacity-40 group-hover/remove:opacity-100 transition-opacity" />
                        </button>
                      )}
                      {selectedEmails.includes(u.email) ? (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                          <CheckSquare size={12} className="text-white" />
                        </div>
                      ) : (
                        <Square size={18} className="text-[var(--muted)]/30" />
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <Users size={40} className="text-[var(--muted)]/20 mb-3" />
                <p className="text-sm font-semibold text-[var(--muted)]">No contacts found</p>
                <p className="text-[10px] text-[var(--muted)]/60 mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Email Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 px-1">
            <Mail size={14} className="text-[var(--accent)]" /> Email Composer
          </h3>

          <div className="space-y-4 border border-[var(--border)] rounded-xl bg-[var(--background)] p-5 relative overflow-hidden">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Subject Line</label>
              <input
                type="text"
                placeholder="Ex: Exclusive Offer for You! 🎉"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-9 px-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Email Header / Title (Appears in body)</label>
              <input
                type="text"
                placeholder="Ex: SPECIAL PROMOTION"
                value={promoTitle}
                onChange={(e) => setPromoTitle(e.target.value)}
                className="w-full h-9 px-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Banner Image URL (Optional)</label>
              <input
                type="text"
                placeholder="Ex: https://example.com/banner.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full h-9 px-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none placeholder:text-[var(--muted)]/40"
              />
              {imageUrl && (
                <div className="mt-2 rounded overflow-hidden border border-[var(--border)] aspect-video bg-[var(--foreground)]/[0.02] relative group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Image Preview</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Message Body</label>
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">Supports HTML</span>
                  <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest cursor-help" title="Use HTML tags like <b>, <br>, <p> etc.">Rich Format</span>
                </div>
              </div>
              <textarea
                placeholder="Dear customer, we have a special promotion for you..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[180px] p-3 rounded border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:border-[var(--accent)]/50 transition-all outline-none resize-y custom-scrollbar leading-relaxed placeholder:text-[var(--muted)]/40"
              />
            </div>

            <AnimatePresence mode="wait">
              {status.message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded flex items-center gap-2 text-xs font-bold border ${status.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      : status.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                    }`}
                >
                  {status.type === 'info' ? <Loader2 className="animate-spin" size={14} /> : <AlertCircle size={14} />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button aria-label="button"
              onClick={handleSend}
              disabled={sending || selectedEmails.length === 0}
              className="w-full h-10 mt-2 rounded border border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[var(--accent)] hover:text-white active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-colors"
            >
              {sending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Send size={14} />
                  <span>Send to {selectedEmails.length} Recipients</span>
                </>
              )}
              {sending && <span className="ml-1">Transmitting...</span>}
            </button>
          </div>
        </motion.div>
      </div>

    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">
          Recent Campaigns <span className="text-[var(--muted)]">(Last 10)</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentLogs.length > 0 ? (
          recentLogs.map((log) => (
            <div
              key={log._id}
              className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--foreground)]/[0.01] transition-colors overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-start mb-3 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[var(--foreground)] truncate uppercase tracking-tight leading-none">{log.subject}</p>
                  <p className="text-[10px] text-[var(--muted)] font-medium mt-1.5">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
                <button aria-label="button"
                  onClick={() => useTemplate(log)}
                  className="shrink-0 px-3 py-1.5 rounded border border-[var(--accent)]/30 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-white transition-colors"
                >
                  Use Template
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-600 bg-emerald-500/10">
                  <span className="mr-1">✓</span>{log.successCount} Sent
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-rose-500/20 text-rose-600 bg-rose-500/10">
                  <span className="mr-1">✕</span>{log.failedCount} Failed
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-[var(--accent)]/20 text-[var(--accent)] bg-[var(--accent)]/5 truncate max-w-[120px]">
                  <span className="mr-1 opacity-70">👤</span>By {log.sentBy}
                </span>
              </div>

              {/* Decorative content preview */}
              <div className="p-3 rounded border border-[var(--border)] bg-[var(--foreground)]/[0.02] mt-auto">
                <div className="text-[10px] text-[var(--muted)] font-mono line-clamp-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: (log.content || "").replace(/<[^>]*>?/gm, ' ') }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center rounded-xl border border-dashed border-[var(--border)]">
            <p className="text-sm font-bold text-[var(--muted)]">No campaign history found yet.</p>
            <p className="text-[10px] font-mono text-[var(--muted)] mt-1">Sent emails will appear here for quick reuse.</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

// ================= HELPER COMPONENTS =================
function StatTile({ icon, label, value, sub, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  };

  return (
    <div className={`p-2 sm:p-3 rounded-2xl border ${colors[color]} bg-[var(--card)] flex items-center gap-2 sm:gap-3 transition-all hover:scale-[1.02] hover:shadow-md hover:shadow-${color}-500/5`}>
      <div className={`w-8 h-8 rounded-xl ${colors[color].split(' ')[0]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-none mb-0.5 truncate">{label}</span>
        <span className="text-base sm:text-lg font-black text-[var(--foreground)] leading-none truncate">{value}</span>
        <span className="text-[7px] font-bold opacity-40 uppercase tracking-tighter mt-0.5 truncate">{sub}</span>
      </div>
    </div>
  );
}
