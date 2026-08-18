"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/icons";
import { CopyButton, EmptyState, LoadingSpinner } from "@/components/common";
import { formatCurrency, formatDate } from "@/utils";
import Link from "next/link";
import { useUser } from "../layout";
import { ApiKeySkeleton } from "../../../components/Skeleton/Skeleton";
import api from "@/lib/axios";

interface ApiKey {
    _id: string;
    name: string;
    lastFour: string;
    status: string;
    createdAt: string;
    lastUsed: string | null;
    lastUsedIp: string | null;
    allowedIps: string[];
    dailyLimit: number;
    usedToday: number;
    rawKey?: string;
}

export default function ApiKeysPage() {
    const { userDetails } = useUser();
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    // Security Edit States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ name: string, dailyLimit: number, allowedIpString: string }>({
        name: "",
        dailyLimit: 0,
        allowedIpString: ""
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchKeys = async () => {
        try {
            const { data } = await api.get("/api/user/keys");
            if (data.success) {
                setKeys(data.keys);
            }
        } catch (err) {
            console.error("Failed to fetch keys", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKeys();
    }, []);

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        if (userDetails.userType !== "member" && userDetails.userType !== "owner") {
            setError("Only members can generate API keys.");
            setIsCreating(false);
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const { data } = await api.post("/api/user/keys", { name: newKeyName });
            if (data.success) {
                setKeys([data.key, ...keys]);
                setNewlyCreatedKey(data.key.rawKey);
                setNewKeyName("");
            } else {
                setError(data.message || "Failed to create key");
            }
        } catch (err) {
            setError("Server error. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateKey = async (id: string) => {
        setIsUpdating(true);
        setError(null);
        try {
            const { data } = await api.put(`/api/user/keys/${id}`, {
                name: editValues.name,
                dailyLimit: editValues.dailyLimit,
                allowedIps: editValues.allowedIpString.split(',').map(ip => ip.trim()).filter(ip => ip !== '')
            });
            if (data.success) {
                setKeys(keys.map(k => k._id === id ? data.key : k));
                setEditingId(null);
            } else {
                setError(data.message || "Failed to update key");
            }
        } catch (err) {
            setError("Failed to update security settings.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRevokeKey = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this API key? This cannot be undone.")) return;

        try {
            const { data } = await api.delete(`/api/user/keys/${id}`);
            if (data.success) {
                setKeys(keys.filter((k: any) => k._id !== id));
            }
        } catch (err) {
            console.error("Failed to revoke key", err);
        }
    };

    const handleRegenerateKey = async (id: string) => {
        if (!confirm("Regenerating will IMMEDIATELY invalidate your current key. Proceed?")) return;

        setError(null);
        try {
            const { data } = await api.patch(`/api/user/keys/${id}`);
            if (data.success) {
                setKeys(keys.map(k => k._id === id ? data.key : k));
                setNewlyCreatedKey(data.key.rawKey);
            } else {
                setError(data.message || "Failed to regenerate key");
            }
        } catch (err) {
            setError("Failed to regenerate key. Please try again.");
        }
    };

    const startEditing = (key: ApiKey) => {
        setEditingId(key._id);
        setEditValues({
            name: key.name,
            dailyLimit: key.dailyLimit || 10000,
            allowedIpString: (key.allowedIps || []).join(', ')
        });
    };



    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tight">API Command Center</h2>
                    <p className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest opacity-60">
                        {keys.length >= 2 ? "Maximum limit (2) reached" : "Secure server-to-server endpoints for your business"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {keys.length < 2 && (
                        (userDetails.userType === "member" || userDetails.userType === "owner") ? (
                            <form onSubmit={handleCreateKey} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Key Label (e.g. My Website)"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--accent)] outline-none transition-all text-sm w-full md:w-64"
                                    disabled={isCreating}
                                />
                                <button aria-label="button"
                                    type="submit"
                                    disabled={isCreating || !newKeyName.trim()}
                                    className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-black italic uppercase text-xs flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isCreating ? <LoadingSpinner size="sm" color="current" /> : <FiPlus />}
                                    Create Key
                                </button>
                            </form>
                        ) : (
                            <Link
                                href="/dashboard/support"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase italic hover:bg-amber-500/20 transition-all"
                            >
                                <FiLock /> Only Member Feature - Contact Support
                            </Link>
                        )
                    )}
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm font-bold"
                >
                    <FiAlertCircle />
                    {error}
                </motion.div>
            )}

            {newlyCreatedKey && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-[2rem] bg-[var(--accent)]/10 border border-[var(--accent)]/30 space-y-4 shadow-[0_0_30px_rgba(0,229,255,0.1)]"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[var(--accent)] font-black italic uppercase text-sm">Secret Key Generated</h3>
                            <p className="text-[var(--muted)] text-[10px] font-bold uppercase tracking-widest">Copy this key safely. You cannot view it again.</p>
                        </div>
                        <button aria-label="button"
                            onClick={() => setNewlyCreatedKey(null)}
                            className="text-[var(--muted)] hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center gap-2 p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-sm leading-none">
                        <span className="flex-1 truncate text-[var(--accent)]">{newlyCreatedKey}</span>
                        <CopyButton text={newlyCreatedKey} label="Copy Secret" variant="subtle" size="sm" />
                    </div>
                </motion.div>
            )}

            <div className="grid gap-6">
                {loading ? (
                    <div className="space-y-6">
                        <ApiKeySkeleton />
                        <ApiKeySkeleton />
                    </div>
                ) : keys.length === 0 ? (
                    <EmptyState
                        icon={Icons.key}
                        title="No API Keys Active"
                        description="Generate your first API key above to start integrating with our topup APIs."
                    />
                ) : (
                    <AnimatePresence>
                        {keys.map((key: ApiKey) => (
                            <motion.div
                                key={key._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group p-1 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 hover:border-[var(--accent)]/30 transition-all shadow-xl"
                            >
                                <div className="p-6 rounded-[1.4rem] bg-[var(--card-bg)]/80 backdrop-blur-sm">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Main Info */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                                                        <Icons.shield size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black italic uppercase text-base leading-none mb-1">{key.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded font-mono text-white/40">TK_****{key.lastFour}</span>
                                                            <button aria-label="button"
                                                                onClick={() => alert("For security, full API keys are only shown once during creation. If you've lost your key, please use the 'Regenerate' option to get a new one.")}
                                                                className="text-[8px] font-black uppercase text-[var(--accent)] hover:underline"
                                                            >
                                                                Show Full Key?
                                                            </button>
                                                            {key.allowedIps?.length > 0 && (
                                                                <span className="text-[8px] bg-[var(--accent)] text-black font-black uppercase px-1.5 rounded-sm">IP Locked</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button aria-label="button"
                                                        onClick={() => editingId === key._id ? setEditingId(null) : startEditing(key)}
                                                        className={`p-2 rounded-xl transition-all ${editingId === key._id ? 'bg-white/10 text-white' : 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20'}`}
                                                    >
                                                        {editingId === key._id ? <Icons.close size={14} /> : <Icons.edit size={14} />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Usage Progress */}
                                            <div className="space-y-1.5 pt-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase italic">
                                                    <span className="text-white/40 flex items-center gap-1"><Icons.trendingUp size={12} /> Daily Budget</span>
                                                    <span className="text-[var(--accent)]">{formatCurrency(key.usedToday || 0)} / {formatCurrency(key.dailyLimit || 10000)}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(((key.usedToday || 0) / (key.dailyLimit || 10000)) * 100, 100)}%` }}
                                                        className={`h-full rounded-full ${(key.usedToday || 0) > (key.dailyLimit || 10000) * 0.8 ? 'bg-red-500' : 'bg-[var(--accent)]'}`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-[8px] font-bold uppercase text-white/30 mb-1 flex items-center gap-1"><Icons.globe size={12} /> Last IP</p>
                                                    <p className="text-xs font-mono text-white/80">{key.lastUsedIp || "Never used"}</p>
                                                </div>
                                                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-[8px] font-bold uppercase text-white/30 mb-1 flex items-center gap-1"><Icons.mapPin size={12} /> Status</p>
                                                    <p className="text-xs font-black italic uppercase text-green-500">Live & Secure</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions or Edit Form */}
                                        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                                            {editingId === key._id ? (
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase text-white/40 ml-1">Daily Cap (₹)</label>
                                                        <input
                                                            type="number"
                                                            value={editValues.dailyLimit}
                                                            onChange={(e) => setEditValues({ ...editValues, dailyLimit: parseInt(e.target.value) })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)] transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black uppercase text-white/40 ml-1">IP Whitelist (comma separated)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="192.168.1.1, 10.0.0.1"
                                                            value={editValues.allowedIpString}
                                                            onChange={(e) => setEditValues({ ...editValues, allowedIpString: e.target.value })}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)] transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button aria-label="button"
                                                            onClick={() => handleUpdateKey(key._id)}
                                                            disabled={isUpdating}
                                                            className="flex-1 bg-[var(--accent)] text-black font-black uppercase italic text-[10px] py-2 rounded-xl flex items-center justify-center gap-2"
                                                        >
                                                            {isUpdating ? <LoadingSpinner size="xs" color="current" /> : <><Icons.save size={12} /> Save</>}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <button aria-label="button"
                                                        onClick={() => handleRegenerateKey(key._id)}
                                                        className="w-full p-3 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase italic"
                                                    >
                                                        <Icons.refresh size={14} /> Regenerate
                                                    </button>
                                                    <button aria-label="button"
                                                        onClick={() => handleRevokeKey(key._id)}
                                                        className="w-full p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 text-xs font-black uppercase italic"
                                                    >
                                                        <Icons.trash size={14} /> Revoke Key
                                                    </button>

                                                    <div className="pt-2 text-[8px] text-white/20 text-center font-bold uppercase tracking-widest leading-relaxed">
                                                        Use with caution. Revoking or Regenerating is irreversible.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-2">
                    <h4 className="text-amber-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 text-balance">
                        <FiAlertCircle /> 3-Layer Protection Active
                    </h4>
                    <p className="text-[var(--muted)] text-[10px] leading-relaxed font-bold opacity-60">
                        1. <b>IP Whitelisting (Optional):</b> Restrict access to your own servers for enhanced security.<br />
                        2. <b>Daily Limits:</b> Automated safety cap to protect your wallet.<br />
                        3. <b>Atomic Daily Limits:</b> Concurrent orders are safe — each deduction uses MongoDB's atomic operations, preventing double-spends even under high load.
                    </p>
                </div>

                <div className="p-6 rounded-[2rem] bg-[var(--accent)]/5 border border-[var(--accent)]/10 space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[var(--accent)] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <FiKey /> Integration Assets
                        </h4>
                        <a href="/api-docs.html" target="_blank" className="text-[10px] font-black uppercase italic text-[var(--accent)] hover:underline">
                            v1.0 API Specs 📄
                        </a>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-white/40 uppercase">Endpoint Prefix</p>
                            <code className="text-[10px] bg-black/30 px-2 py-1 rounded block truncate text-[var(--accent)] font-mono">
                                https://mlbbtopup.in/api/service
                            </code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
