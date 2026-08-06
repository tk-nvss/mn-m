"use client";

import { useState, useEffect } from "react";
import {
    FiUsers,
    FiCopy,
    FiCheckCircle,
    FiLoader,
    FiGift,
    FiShare2,
    FiDownload,
    FiActivity,
    FiZap
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";

interface ReferralTabProps {
    userReferral?: {
        userId: string;
        referralUsed: boolean;
        referralCount: number;
    };
}

export default function ReferralTab({
    userReferral,
}: ReferralTabProps) {
    const [referralCodeInput, setReferralCodeInput] = useState("");
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralMessage, setReferralMessage] = useState("");
    const [referralSuccess, setReferralSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (userReferral?.userId) {
            navigator.clipboard.writeText(userReferral.userId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRedeemReferral = async () => {
        if (!referralCodeInput.trim()) return;
        setReferralLoading(true);
        setReferralMessage("");
        setReferralSuccess(false);

        try {
            const { data } = await api.post("/api/wallet/redeem-referral", { referralCode: referralCodeInput });
            if (data.success) {
                setReferralSuccess(true);
                setReferralMessage(data.message);
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setReferralMessage(data.message);
            }
        } catch (error) {
            setReferralMessage("Something went wrong. Try again.");
        } finally {
            setReferralLoading(false);
        }
    };

    const [referrals, setReferrals] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingList, setLoadingList] = useState(true);

    const fetchReferrals = async () => {
        try {
            setLoadingList(true);
            const { data } = await api.get(`/api/wallet/referrals?page=${page}&limit=5`);
            if (data.success) {
                setReferrals(data.data);
                setTotalPages(data.pagination.totalPages);
            }
        } catch (error) {
            console.error("Failed to fetch referrals", error);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, [page]);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* OVERVIEW STATS */}
            <div className="relative p-4 sm:p-5 rounded-3xl bg-[var(--card)]/30 border border-white/5 flex items-center justify-between overflow-hidden shadow-sm">
                <div className="relative z-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-1 italic opacity-50">
                        Total Friends Invited
                    </p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black italic tracking-tighter uppercase text-[var(--foreground)]">
                            {userReferral?.referralCount || 0}
                        </span>
                        <span className="text-[8px] font-bold text-[var(--muted)]/40 uppercase tracking-widest leading-none">
                            friends joined
                        </span>
                    </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 shadow-[0_0_15px_var(--accent)]/5">
                    <FiActivity size={18} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SHARE */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50 flex items-center gap-1.5 px-1">
                        <FiShare2 className="text-[var(--accent)]" size={10} /> Your Invite Code
                    </label>

                    <div className="w-full p-3 rounded-2xl border border-white/5 bg-[var(--card)]/30 flex items-center justify-between group-hover:border-[var(--accent)]/30 transition-all shadow-sm">
                        <code className="text-base font-black italic tracking-[0.15em] text-[var(--foreground)] px-1">
                            {userReferral?.userId || "..."}
                        </code>
                        <div className="flex gap-1.5">
                            <button
                                onClick={handleCopyCode}
                                className="p-2 rounded-lg bg-white/[0.03] text-[var(--muted)] hover:text-[var(--accent)] transition-all"
                                title="Copy code"
                            >
                                {copied ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                            </button>
                            <button aria-label="button"
                                onClick={() => {
                                    const shareText = `Join mlbbtopup.in\nCode: ${userReferral?.userId}`;
                                    if (navigator.share) {
                                        navigator.share({ title: 'Join me on mlbbtopup.in', text: shareText });
                                    } else {
                                        navigator.clipboard.writeText(shareText);
                                        alert("Link copied to clipboard!");
                                    }
                                }}
                                className="p-2 rounded-lg bg-white/[0.03] text-[var(--muted)] hover:text-[var(--accent)] transition-all"
                                title="Share your code"
                            >
                                <FiShare2 size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                            <FiGift size={12} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-tight italic text-[var(--foreground)] block">Get Rewards</span>
                            <p className="text-[8px] font-bold text-[var(--muted)]/50 uppercase tracking-tighter leading-normal mt-1">Share your code. Get a bonus for every friend who signs up.</p>
                        </div>
                    </div>
                </div>

                {/* REDEEM */}
                <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/50 flex items-center gap-1.5 px-1">
                        <FiDownload className="text-[var(--accent)]" size={10} /> Got a Friend's Code?
                    </label>

                    {!userReferral?.referralUsed ? (
                        <div className="space-y-2.5">
                            <input
                                type="text"
                                placeholder="Type or paste the code here"
                                value={referralCodeInput}
                                onChange={(e) => setReferralCodeInput(e.target.value)}
                                className="w-full p-3 rounded-2xl border border-white/5 bg-[var(--card)]/30 text-sm font-black tracking-widest text-[var(--foreground)] placeholder:text-[var(--muted)]/20 outline-none transition-all uppercase"
                            />
                            {referralMessage && (
                                <p className={`text-[8px] font-black uppercase tracking-widest px-1 ${referralSuccess ? "text-green-500" : "text-red-500"}`}>
                                    {referralMessage}
                                </p>
                            )}
                            <button aria-label="button"
                                onClick={handleRedeemReferral}
                                disabled={referralLoading || !referralCodeInput}
                                className="w-full p-3 rounded-xl bg-[var(--accent)] text-black font-black uppercase tracking-widest italic text-[10px] shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                            >
                                {referralLoading ? <FiLoader className="animate-spin" size={12} /> : "Use Code"}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full p-4 rounded-2xl border border-dashed border-white/5 bg-[var(--card)]/10 flex items-center justify-center gap-2">
                            <FiCheckCircle size={14} className="text-green-500" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]">You already used a code</p>
                        </div>
                    )}
                    <p className="text-[7.5px] font-bold text-[var(--muted)]/30 uppercase tracking-[0.15em] px-1">
                        You can only use a code within 24 hours of joining.
                    </p>
                </div>
            </div>

            {/* LIST */}
            <div className="pt-4 border-t border-white/[0.03]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black italic tracking-tighter text-[var(--foreground)] uppercase">
                        Friends Who Joined
                    </h3>
                    <button aria-label="button" onClick={fetchReferrals} className="p-1.5 text-[var(--muted)] hover:text-[var(--accent)] transition-all">
                        <FiLoader size={12} className={loadingList ? "animate-spin" : ""} />
                    </button>
                </div>

                {loadingList && referrals.length === 0 ? (
                    <div className="flex justify-center py-6"><FiLoader className="animate-spin text-[var(--accent)]" size={16} /></div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-6 text-[10px] uppercase font-black tracking-widest text-[var(--muted)]/30 italic">No friends joined yet. Share your code to start!</div>
                ) : (
                    <div className="space-y-2">
                        <div className="rounded-2xl border border-white/5 bg-[var(--card)]/20 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.02] text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/50">
                                    <tr>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02] text-[10px] text-[var(--foreground)]">
                                    {referrals.map((ref) => (
                                        <tr key={ref._id} className="hover:bg-white/[0.01]">
                                            <td className="px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg bg-[var(--accent)]/5 flex items-center justify-center text-[9px] font-black text-[var(--accent)]">
                                                        {ref.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="font-black italic uppercase leading-none">{ref.name || "Unknown user"}</p>
                                                        <p className="text-[7.5px] text-[var(--muted)]/40 font-mono mt-0.5">{ref.userId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-green-500/60">Active</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-4 pt-2">
                                <button aria-label="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] disabled:opacity-20">Prev</button>
                                <span className="text-[9px] font-black text-[var(--muted)]/40 italic">Page {page} of {totalPages}</span>
                                <button aria-label="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] disabled:opacity-20">Next</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
