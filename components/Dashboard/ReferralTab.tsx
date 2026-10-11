"use client";

import { useState, useEffect } from "react";
import {
    FiUsers, FiCheckCircle, FiLoader,
    FiGift, FiShare2, FiDownload, FiRefreshCw, FiArrowRight, FiZap
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { CopyButton, LoadingSpinner } from "@/components/common";

interface ReferralTabProps {
    userReferral?: {
        userId: string;
        referralUsed: boolean;
        referralCount: number;
    };
}

export default function ReferralTab({ userReferral }: ReferralTabProps) {
    const [referralCodeInput, setReferralCodeInput] = useState("");
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralMessage, setReferralMessage] = useState("");
    const [referralSuccess, setReferralSuccess] = useState(false);

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
        } catch {
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
        } catch { console.error("Failed to fetch referrals"); }
        finally { setLoadingList(false); }
    };

    useEffect(() => { fetchReferrals(); }, [page]);

    return (
        <div className="max-w-md mx-auto space-y-4 px-2 pb-8">

            {/* ── HERO STAT ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-[var(--card)]/50 border border-[var(--border)] p-4"
            >
                {/* Big decorative number */}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[90px] font-black text-[var(--foreground)]/[0.04] leading-none select-none pointer-events-none tabular-nums">
                    {userReferral?.referralCount || 0}
                </span>

                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/50 mb-1.5">Total Friends Invited</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tabular-nums leading-none">
                        {userReferral?.referralCount || 0}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-wider">
                        Friends Joined
                    </span>
                </div>

                {/* Earn badge */}
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5">
                    <FiZap size={9} className="text-[var(--accent)]" />
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-[var(--accent)]">
                        Earn rewards for every friend
                    </span>
                </div>
            </motion.div>

            {/* ── YOUR INVITE CODE & ACTIONS ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-2.5"
            >
                <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/50">Your Invite Code</p>

                {/* Code display */}
                <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] px-4 py-3 flex items-center justify-between">
                    <code className="text-base font-black tracking-[0.16em] text-[var(--foreground)]">
                        {userReferral?.userId || "—"}
                    </code>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                    <CopyButton
                        text={userReferral?.userId || ""}
                        label="Copy"
                        copiedLabel="Copied!"
                        variant="subtle"
                        className="h-10 rounded-xl text-[9.5px] font-black uppercase tracking-wider"
                    />
                    <button
                        aria-label="button"
                        onClick={() => {
                            const shareText = `Join mlbbtopup.in\nCode: ${userReferral?.userId}`;
                            if (navigator.share) {
                                navigator.share({ title: 'Join me on mlbbtopup.in', text: shareText });
                            } else {
                                navigator.clipboard.writeText(shareText);
                            }
                        }}
                        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center gap-2 text-[9.5px] font-black uppercase tracking-wider text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all cursor-pointer"
                    >
                        <FiShare2 size={12} /> Share
                    </button>
                </div>

                {/* Reward hint note */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--border)]/60 bg-[var(--card)]/40">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                        <FiGift size={12} />
                    </div>
                    <div>
                        <p className="text-[9.5px] font-black uppercase tracking-tight text-[var(--foreground)]">Get Rewards</p>
                        <p className="text-[8px] text-[var(--muted)]/70 uppercase tracking-wide">
                            Share your code. Get a bonus for every friend who signs up.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* ── USE A CODE ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2 pt-1"
            >
                <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/50">Got a Friend's Code?</p>

                {!userReferral?.referralUsed ? (
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Paste code here..."
                            value={referralCodeInput}
                            onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                            className="w-full h-10 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-black tracking-wider text-[var(--foreground)] placeholder:text-[var(--muted)]/30 outline-none focus:border-[var(--accent)] transition-colors uppercase"
                        />
                        <AnimatePresence>
                            {referralMessage && (
                                <motion.p
                                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className={`text-[8.5px] font-black uppercase tracking-widest ${referralSuccess ? "text-emerald-500" : "text-rose-500"}`}
                                >
                                    {referralMessage}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <button
                            aria-label="button"
                            onClick={handleRedeemReferral}
                            disabled={referralLoading || !referralCodeInput}
                            className="w-full h-10 rounded-xl bg-[var(--accent)] text-white font-black uppercase tracking-wider text-[9.5px] flex items-center justify-center gap-2 disabled:opacity-25 hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            {referralLoading
                                ? <LoadingSpinner size="xs" color="current" />
                                : <><span>Use Code</span><FiArrowRight size={12} /></>
                            }
                        </button>
                        <p className="text-[7.5px] font-bold text-[var(--muted)]/40 uppercase tracking-widest">
                            Only usable within 24 hours of joining.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
                        <FiCheckCircle size={13} className="text-emerald-500 shrink-0" />
                        <p className="text-[8.5px] font-black uppercase tracking-wider text-emerald-500">You already used a code</p>
                    </div>
                )}
            </motion.div>

            {/* ── FRIENDS LIST ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="pt-2 space-y-2.5"
            >
                <div className="flex items-center justify-between">
                    <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/50">Friends Who Joined</p>
                    <button aria-label="button" onClick={fetchReferrals}
                        className="w-6 h-6 rounded-lg border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
                        <FiRefreshCw size={10} className={loadingList ? "animate-spin" : ""} />
                    </button>
                </div>

                {loadingList && referrals.length === 0 ? (
                    <div className="flex justify-center py-6">
                        <FiLoader className="animate-spin text-[var(--muted)]/30" size={16} />
                    </div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-6 space-y-1.5 border border-dashed border-[var(--border)] rounded-xl">
                        <FiUsers className="text-[var(--muted)]/30 mx-auto" size={18} />
                        <p className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)]/40">No friends yet</p>
                        <p className="text-[7.5px] text-[var(--muted)]/30 uppercase tracking-wide">Share your code to start earning</p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 px-3 py-1">
                        <div className="flex items-center justify-between py-1.5 border-b border-[var(--border)]/50">
                            <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40">Name</span>
                            <span className="text-[7px] font-black uppercase tracking-widest text-[var(--muted)]/40">Status</span>
                        </div>
                        <div className="space-y-0">
                            {referrals.map((ref, idx) => (
                                <div key={ref._id}
                                    className={`flex items-center justify-between py-2.5 ${idx < referrals.length - 1 ? "border-b border-[var(--border)]/40" : ""}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[10px] font-black text-[var(--foreground)]">
                                            {ref.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="text-[9.5px] font-black uppercase tracking-tight text-[var(--foreground)] leading-none">{ref.name || "Unknown user"}</p>
                                            <p className="text-[7.5px] text-[var(--muted)]/50 font-mono mt-0.5">{ref.userId}</p>
                                        </div>
                                    </div>
                                    <span className="text-[7.5px] font-black uppercase tracking-wider text-emerald-500">Active</span>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 py-2 border-t border-[var(--border)]/50">
                                <button aria-label="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] disabled:opacity-25 hover:text-[var(--foreground)] transition-colors">Prev</button>
                                <span className="text-[8.5px] font-black text-[var(--muted)]/40">{page} / {totalPages}</span>
                                <button aria-label="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    className="text-[8.5px] font-black uppercase tracking-widest text-[var(--muted)] disabled:opacity-25 hover:text-[var(--foreground)] transition-colors">Next</button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

        </div>
    );
}
