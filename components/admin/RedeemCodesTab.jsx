"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiGift, FiPlus, FiClock, FiUser, FiTrash2, FiZap, FiHash, FiType } from "react-icons/fi";
import { StatusBadge, CopyButton } from "@/components/common";
import { formatCurrency, formatDate, formatDateTime } from "@/utils";

export default function RedeemCodesTab() {
    const [amount, setAmount] = useState("");
    const [quantity, setQuantity] = useState("");
    const [isSeries, setIsSeries] = useState(false);
    const [customCode, setCustomCode] = useState("");
    const [maxUses, setMaxUses] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [recentCodes, setRecentCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 10 });

    const [summary, setSummary] = useState({ totalUsed: 0, total: 0 });

    const fetchCodes = async (targetPage = page) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/redeem-codes?page=${targetPage}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setRecentCodes(data.codes);
                setSummary(data.summary);
                setPagination(data.pagination);
            }
        } catch (err) {
            console.error("Failed to fetch codes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes(page);
    }, [page]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("/api/admin/redeem-codes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    quantity: isSeries ? 1 : Number(quantity),
                    isSeries,
                    customCode: isSeries ? customCode : "",
                    maxUses: isSeries ? Number(maxUses) : 1
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message + (isSeries ? "" : "\n\nGenerated Codes:\n" + data.codes.join("\n")));
                setAmount("");
                setQuantity("");
                setCustomCode("");
                setMaxUses("");
                fetchCodes();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Could not generate codes.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExpire = async (codeId) => {
        if (!confirm("Do you want to expire/delete this code?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/redeem-codes?id=${codeId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchCodes();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Could not expire code.");
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">

            {/* GENERATOR CARD */}
            <div className="p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--card)] to-[var(--foreground)]/[0.02] shadow-2xl shadow-black/5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 shadow-inner">
                            <FiZap size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)] leading-tight mb-0.5">Generator</h3>
                            <p className="text-[9px] font-bold text-[var(--muted)]/60 uppercase tracking-[0.15em] leading-none">Create vouchers</p>
                        </div>
                    </div>

                    <div className="flex bg-[var(--foreground)]/[0.03] p-1 rounded-full border border-[var(--border)]/50 shadow-inner">
                        <button aria-label="button"
                            onClick={() => setIsSeries(false)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${!isSeries ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]'}`}
                        >
                            Unique
                        </button>
                        <button aria-label="button"
                            onClick={() => setIsSeries(true)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${isSeries ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.05]'}`}
                        >
                            Series
                        </button>
                    </div>
                </div>

                <form className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10" onSubmit={handleGenerate}>
                    <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-[var(--muted)] ml-2.5 tracking-[0.1em]">Value (₹)</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 group-focus-within:text-[var(--accent)] transition-colors font-black text-xs">
                                ₹
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="500"
                                className="w-full h-11 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-full pl-9 pr-4 text-xs focus:border-[var(--accent)] focus:bg-[var(--foreground)]/[0.05] outline-none transition-all font-black text-[var(--foreground)] placeholder:text-[var(--muted)]/30 hover:border-[var(--border)]/80"
                                required
                            />
                        </div>
                    </div>

                    {isSeries ? (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase text-[var(--muted)] ml-2.5 tracking-[0.1em]">Code String</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 group-focus-within:text-[var(--accent)] transition-colors">
                                        <FiType size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        value={customCode}
                                        onChange={(e) => setCustomCode(e.target.value)}
                                        placeholder="BONUS"
                                        className="w-full h-11 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-full pl-10 pr-4 text-xs focus:border-[var(--accent)] focus:bg-[var(--foreground)]/[0.05] outline-none transition-all font-black uppercase text-[var(--foreground)] placeholder:text-[var(--muted)]/30 hover:border-[var(--border)]/80"
                                        required={isSeries}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-black uppercase text-[var(--muted)] ml-2.5 tracking-[0.1em]">Max Uses</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 group-focus-within:text-[var(--accent)] transition-colors">
                                        <FiHash size={14} />
                                    </div>
                                    <input
                                        type="number"
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(e.target.value)}
                                        placeholder="100"
                                        className="w-full h-11 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-full pl-10 pr-4 text-xs focus:border-[var(--accent)] focus:bg-[var(--foreground)]/[0.05] outline-none transition-all font-black text-[var(--foreground)] placeholder:text-[var(--muted)]/30 hover:border-[var(--border)]/80"
                                        required={isSeries}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1.5 col-span-1 sm:col-span-2">
                            <label className="text-[8px] font-black uppercase text-[var(--muted)] ml-2.5 tracking-[0.1em]">Code Count</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]/50 group-focus-within:text-[var(--accent)] transition-colors">
                                    <FiHash size={14} />
                                </div>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="10"
                                    className="w-full h-11 bg-[var(--foreground)]/[0.02] border border-[var(--border)] rounded-full pl-10 pr-4 text-xs focus:border-[var(--accent)] focus:bg-[var(--foreground)]/[0.05] outline-none transition-all font-black text-[var(--foreground)] placeholder:text-[var(--muted)]/30 hover:border-[var(--border)]/80"
                                    required={!isSeries}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-end">
                        <button aria-label="button"
                            type="submit"
                            disabled={isGenerating}
                            className="w-full h-11 bg-[var(--accent)] text-white font-black uppercase text-[10px] tracking-[0.15em] rounded-full flex items-center justify-center gap-2 hover:bg-[var(--accent-hover)] transition-all shadow-lg shadow-[var(--accent)]/30 active:scale-95 disabled:opacity-50"
                        >
                            {isGenerating ? "Processing" : <><FiZap size={14} /> {isSeries ? "Create series" : "Generate unique"}</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* RECENT CODES */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/40 flex items-center gap-2">
                        <FiClock size={12} /> Recently Generated
                    </h3>
                    <span className="text-[9px] font-bold text-[var(--muted)]/30 uppercase tabular-nums">{recentCodes.length} Records</span>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden lg:block rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-lg">
                    <table className="w-full text-left text-[11px]">
                        <thead className="bg-[var(--foreground)]/[0.02] border-b border-[var(--border)] text-[var(--muted)] font-black uppercase tracking-wider">
                            <tr>
                                {["Redeem Code", "Configuration", "Value", "Activity", "Owner"].map((h) => (
                                    <th key={h} className="px-6 py-4">{h}</th>
                                ))}
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--muted)] font-bold uppercase tracking-widest opacity-20">Loading Codes</td></tr>
                            ) : recentCodes.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--muted)] font-bold uppercase tracking-widest opacity-20">No Records</td></tr>
                            ) : recentCodes.map((code) => (
                                <tr key={code._id} className="hover:bg-[var(--foreground)]/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-[var(--accent)] tracking-tighter uppercase">{code.code}</span>
                                            <CopyButton text={code.code} size="xs" variant="ghost" className="opacity-40 group-hover:opacity-100" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border tracking-widest ${code.isSeries
                                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            }`}>
                                            {code.isSeries ? "Series" : "Unique"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-black text-[var(--foreground)] tabular-nums">{formatCurrency(code.value)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {code.isSeries ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-[60px] h-1.5 bg-[var(--foreground)]/[0.05] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--accent)] rounded-full shadow-[0_0_8px_rgba(var(--accent-rgb),0.3)] transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, ((code.claimedBy?.length || 0) / code.maxUses) * 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-black tabular-nums text-[var(--muted)]/60">
                                                    {code.claimedBy?.length || 0} / {code.maxUses}
                                                </span>
                                            </div>
                                        ) : (
                                            <StatusBadge status={code.status} size="xs" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {code.isSeries ? (
                                            <span className="text-[9px] font-bold text-[var(--muted)]/40 uppercase tracking-tighter italic">Multi-User</span>
                                        ) : code.status === "used" && code.usedBy ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]">
                                                    <FiUser size={12} />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-bold text-[var(--foreground)] truncate uppercase leading-none mb-0.5">{code.usedBy.name}</span>
                                                    <span className="text-[8px] text-[var(--muted)]/40 truncate tracking-tighter">{new Date(code.usedAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-bold text-[var(--muted)]/20 uppercase tracking-[0.2em]">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {(code.status === "active" || code.isSeries) && (
                                                <button aria-label="button"
                                                    onClick={() => handleExpire(code._id)}
                                                    className="w-8 h-8 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/30 hover:text-rose-500 transition-all flex items-center justify-center group/btn"
                                                >
                                                    <FiTrash2 size={13} className="group-hover/btn:scale-110" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE LIST */}
                <div className="lg:hidden space-y-2.5">
                    {recentCodes.map((code) => (
                        <div key={code._id} className="p-3 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40">Redeem Code</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-black text-[var(--accent)] uppercase tracking-tighter">{code.code}</span>
                                        <CopyButton text={code.code} size="sm" variant="ghost" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40">Value</span>
                                    <p className="text-base font-black text-[var(--foreground)] italic tracking-tighter">{formatCurrency(code.value)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2.5 border-y border-[var(--border)]/50 border-dashed">
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border tracking-widest ${code.isSeries ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    {code.isSeries ? 'Series' : 'Unique'}
                                </span>
                                
                                <div className="flex items-center gap-3">
                                    {code.isSeries ? (
                                        <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-tighter">
                                            {code.claimedBy?.length || 0} / {code.maxUses} Uses
                                        </span>
                                    ) : (
                                        <StatusBadge status={code.status} size="xs" />
                                    )}
                                    {(code.status === 'active' || code.isSeries) && (
                                        <button aria-label="button" onClick={() => handleExpire(code._id)} className="text-rose-500/40 hover:text-rose-500 transition-colors">
                                            <FiTrash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {!code.isSeries && code.status === "used" && code.usedBy && (
                                <div className="flex items-center gap-2 pt-1">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.05] flex items-center justify-center text-[var(--muted)]">
                                        <FiUser size={14} />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-black text-[var(--foreground)] uppercase truncate">{code.usedBy.name}</span>
                                        <span className="text-[9px] text-[var(--muted)]/40 tracking-tighter">{new Date(code.usedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGINATION */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-2 pt-2">
                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                        Page {pagination.currentPage} of {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <button aria-label="button"
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={page === 1 || loading}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <button aria-label="button"
                            onClick={() => setPage(prev => Math.min(pagination.pages, prev + 1))}
                            disabled={page === pagination.pages || loading}
                            className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function InsightCard({ label, value, color, pulse }) {
    const colors = {
        blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
        amber: "text-amber-500 bg-amber-500/5 border-amber-500/10",
        purple: "text-purple-500 bg-purple-500/5 border-purple-500/10",
        emerald: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border ${colors[color]} flex flex-col items-center justify-center text-center relative overflow-hidden`}
        >
            {pulse && (
                <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current animate-ping" />
            )}
            <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tight opacity-60 mb-0.5">{label}</span>
            <span className="text-xs sm:text-sm font-black tabular-nums whitespace-nowrap">{value}</span>
        </motion.div>
    );
}
