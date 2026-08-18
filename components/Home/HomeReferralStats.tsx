"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiUsers, FiArrowRight, FiUserPlus } from "react-icons/fi";
import { Icons } from "@/components/icons";
import { CopyButton } from "@/components/common";

export default function HomeReferralStats() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                if (json.success) {
                    setUser(json.user);
                }
            } catch (err) {
                console.error("Failed to fetch user", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (!user && !loading) return null;
    if (loading) return null;

    return (
        <section className="relative max-w-7xl mx-auto px-4 mt-2 mb-2">
            <div className="max-w-xl mx-auto">
                <div
                    className="group relative opacity-100 translate-y-0"
                >
                    {/* Subtle Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-transparent to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-xl p-3.5 transition-all duration-300 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--card)]/60">
                        <div className="relative z-10 flex items-center justify-between gap-4">

                            {/* Left: Info Grid */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/80 italic">
                                        Invite & Earn
                                    </h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                    {/* Invites */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] opacity-60">Invites</span>
                                        <span className="text-sm font-black text-[var(--foreground)] tabular-nums">{user.referralCount || 0}</span>
                                    </div>

                                    {/* Code */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)] opacity-60">Code</span>
                                        <CopyButton text={user.userId} label={user.userId} size="xs" variant="outline" />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-2 pt-2 border-t border-[var(--border)]/30 flex items-center gap-2">
                                    <FiUserPlus size={9} className="text-[var(--accent)] opacity-50" />
                                    {user.referredBy ? (
                                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/50">
                                            Invited by <span className="text-[var(--foreground)] opacity-80">{user.referredBy}</span>
                                        </span>
                                    ) : (
                                        (Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000) && (
                                            <Link href="/dashboard/referral" className="flex items-center gap-1 text-[var(--accent)] hover:text-[var(--foreground)] transition-colors text-[9px] font-black tracking-widest uppercase">
                                                Use a friend's code <FiArrowRight size={10} />
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Right: Compact CTA */}
                            <Link
                                href="/dashboard/referral"
                                className="relative w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-[var(--background)] border border-[var(--border)] group/btn transition-all duration-300 hover:border-[var(--accent)]/40 hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover/btn:opacity-5 rounded-xl" />
                                <FiArrowRight
                                    size={18}
                                    className="text-[var(--muted)] group-hover/btn:text-[var(--accent)] -rotate-45 group-hover/btn:rotate-0 transition-all duration-500 ease-out"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
