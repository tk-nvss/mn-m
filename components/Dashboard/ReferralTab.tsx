"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    FiUsers, FiCheckCircle, FiLoader,
    FiGift, FiShare2, FiRefreshCw, FiArrowRight, FiZap, FiCopy, FiCheck, FiX
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";
import { CopyButton, LoadingSpinner, SectionTitle, Pagination } from "@/components/common";

interface ReferralTabProps {
    userReferral?: {
        userId: string;
        referralUsed: boolean;
        referralCount: number;
    };
}

export default function ReferralTab({ userReferral }: ReferralTabProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const [referralCodeInput, setReferralCodeInput] = useState("");
    const [referralLoading, setReferralLoading] = useState(false);
    const [referralMessage, setReferralMessage] = useState("");
    const [referralSuccess, setReferralSuccess] = useState(false);
    const [showFriendsSheet, setShowFriendsSheet] = useState(false);

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

    useEffect(() => { 
        if (showFriendsSheet) {
            fetchReferrals(); 
        }
    }, [page, showFriendsSheet]);

    return (
        <div className="max-w-md mx-auto space-y-4 px-2 pb-8">

            <SectionTitle
              subtitle="INVITE & EARN"
              title="REFERRAL PROGRAM"
              icon={<FiUsers className="text-[var(--accent)]" size={13} />}
              description="Share your unique link and earn bonus BBC Coins when friends top up."
              className="mb-1"
            />

            {/* ── HERO STAT (Borderless / Card-free) ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative py-2"
            >
                {/* Big decorative number */}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[80px] font-black text-[var(--foreground)]/[0.04] leading-none select-none pointer-events-none tabular-nums">
                    {userReferral?.referralCount || 0}
                </span>

                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/60 mb-1">
                    Total Friends Invited
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-[var(--foreground)] tabular-nums leading-none">
                        {userReferral?.referralCount || 0}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--muted)]/60 uppercase tracking-wider">
                        Friends Joined
                    </span>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 text-[var(--accent)] font-bold text-[9px] uppercase tracking-wider">
                        <FiZap size={11} className="text-[var(--accent)]" />
                        <span>Earn rewards for every friend</span>
                    </div>

                    {(userReferral?.referralCount || 0) > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowFriendsSheet(true)}
                            className="ml-auto inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--accent)] hover:underline cursor-pointer"
                        >
                            <FiUsers size={11} />
                            <span>View List</span>
                        </button>
                    )}
                </div>
            </motion.div>

            {/* ── YOUR INVITE CODE & ACTIONS ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-2.5 pt-1"
            >
                <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/60">
                    Your Invite Code
                </p>

                {/* Sleek Code Input/Display */}
                <div className="relative flex items-center">
                    <input
                        type="text"
                        readOnly
                        value={userReferral?.userId || "—"}
                        className="w-full h-12 pl-4 pr-24 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-sm sm:text-base font-black tracking-[0.16em] text-[var(--foreground)] select-all outline-none"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                        <CopyButton
                            text={userReferral?.userId || ""}
                            label="Copy"
                            copiedLabel="Copied!"
                            variant="subtle"
                            className="h-9 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider bg-[var(--foreground)]/[0.06] hover:bg-[var(--foreground)]/[0.1] border-none"
                        />
                        <button
                            type="button"
                            aria-label="Share Code"
                            onClick={() => {
                                const shareText = `Join mlbbtopup.in\nCode: ${userReferral?.userId}`;
                                if (navigator.share) {
                                    navigator.share({ title: 'Join me on mlbbtopup.in', text: shareText });
                                } else {
                                    navigator.clipboard.writeText(shareText);
                                }
                            }}
                            className="h-9 px-3 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            <FiShare2 size={11} /> Share
                        </button>
                    </div>
                </div>

                {/* Reward Hint note - borderless */}
                <div className="flex items-center gap-2 pt-0.5">
                    <FiGift size={13} className="text-[var(--accent)] shrink-0" />
                    <p className="text-[8.5px] text-[var(--muted)] uppercase tracking-wide">
                        Share your code. Get a bonus for every friend who signs up.
                    </p>
                </div>
            </motion.div>

            {/* ── USE A FRIEND'S CODE ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2 pt-2"
            >
                <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/60">
                    Got a Friend's Code?
                </p>

                {!userReferral?.referralUsed ? (
                    <div className="space-y-2">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="PASTE CODE HERE..."
                                value={referralCodeInput}
                                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                                className="w-full h-11 pl-4 pr-24 rounded-xl bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-xs font-black tracking-wider text-[var(--foreground)] placeholder:text-[var(--muted)]/30 outline-none focus:border-[var(--accent)] transition-colors uppercase"
                            />
                            <div className="absolute right-1.5">
                                <button
                                    type="button"
                                    aria-label="Use Code"
                                    onClick={handleRedeemReferral}
                                    disabled={referralLoading || !referralCodeInput}
                                    className="h-8 px-3 rounded-lg bg-[var(--accent)] text-white font-black uppercase tracking-wider text-[9px] flex items-center justify-center gap-1.5 disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer"
                                >
                                    {referralLoading ? (
                                        <LoadingSpinner size="xs" color="current" />
                                    ) : (
                                        <><span>Apply</span><FiArrowRight size={11} /></>
                                    )}
                                </button>
                            </div>
                        </div>

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
                        
                        <p className="text-[7.5px] font-bold text-[var(--muted)]/50 uppercase tracking-widest">
                            Only usable within 24 hours of joining.
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 py-1">
                        <FiCheckCircle size={14} className="text-emerald-500 shrink-0" />
                        <p className="text-[9px] font-black uppercase tracking-wider text-emerald-500">
                            You already used a referral code
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Friends Quick Trigger Button if has friends */}
            <div className="pt-2">
                <button
                    type="button"
                    onClick={() => setShowFriendsSheet(true)}
                    className="w-full h-11 rounded-xl bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.06] border border-[var(--border)]/60 flex items-center justify-between px-4 text-xs font-bold text-[var(--foreground)] transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <FiUsers size={14} className="text-[var(--accent)]" />
                        <span className="text-[9.5px] font-black uppercase tracking-wider">Friends Who Joined</span>
                    </div>
                    <span className="text-[9.5px] font-mono text-[var(--muted)] tabular-nums">
                        {userReferral?.referralCount || 0} friends →
                    </span>
                </button>
            </div>

            {/* ══ FRIENDS LIST BOTTOM SHEET ══ */}
            {mounted && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {showFriendsSheet && (
                        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setShowFriendsSheet(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-[9999]"
                            />

                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                                className="relative w-full sm:max-w-md bg-[var(--card)] border-t sm:border border-[var(--border)] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 pb-8 sm:pb-5 z-[10000] max-h-[85vh] overflow-y-auto"
                            >
                                {/* Drag handle */}
                                <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-3" />

                                {/* Header */}
                                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)]/60">
                                    <div className="flex items-center gap-2">
                                        <FiUsers className="text-[var(--accent)]" size={16} />
                                        <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">Friends Who Joined</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label="Refresh referrals"
                                            onClick={fetchReferrals}
                                            className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-lg cursor-pointer"
                                        >
                                            <FiRefreshCw size={13} className={loadingList ? "animate-spin" : ""} />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Close sheet"
                                            onClick={() => setShowFriendsSheet(false)}
                                            className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-lg cursor-pointer"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                </div>

                                {loadingList && referrals.length === 0 ? (
                                    <div className="flex justify-center py-10">
                                        <FiLoader className="animate-spin text-[var(--muted)]/40" size={20} />
                                    </div>
                                ) : referrals.length === 0 ? (
                                    <div className="text-center py-8 space-y-2">
                                        <FiUsers className="text-[var(--muted)]/30 mx-auto" size={24} />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/60">No friends yet</p>
                                        <p className="text-[8px] text-[var(--muted)]/40 uppercase tracking-wide">Share your invite code to start earning</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {referrals.map((ref, idx) => (
                                            <div
                                                key={ref._id || idx}
                                                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[var(--foreground)]/[0.02] border border-[var(--border)]/40"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--foreground)]/[0.05] border border-[var(--border)]/60 flex items-center justify-center text-xs font-black text-[var(--foreground)]">
                                                        {ref.name?.[0]?.toUpperCase() || "U"}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                                                            {ref.name || "Unknown user"}
                                                        </p>
                                                        <p className="text-[8px] text-[var(--muted)] font-mono mt-0.5">
                                                            {ref.userId}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-500">
                                                    Active
                                                </span>
                                            </div>
                                        ))}

                                        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} size="sm" hideOnSinglePage />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
}
