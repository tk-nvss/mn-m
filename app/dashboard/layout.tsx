"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import AuthGuard from "../../components/AuthGuard";
import { FiZap, FiInbox, FiHelpCircle, FiCreditCard, FiUsers, FiKey, FiGift, FiStar } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export const useUser = () => {
    const { user, walletBalance, setWalletBalance } = useAuthStore();
    return {
        userDetails: user || {
            name: "",
            email: "",
            phone: "",
            userId: "",
            userType: "user",
            referralUsed: false,
            referralCount: 0,
            avatar: "",
        },
        walletBalance,
        setWalletBalance
    };
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, setWalletBalance, updateUser, token, _hasHydrated } = useAuthStore();
    const pathname = usePathname();

    useEffect(() => {
        if (!token) return;

        const refreshData = async () => {
            try {
                const { data } = await api.get("/api/auth/me");
                if (data.success) {
                    updateUser({
                        name: data.user.name,
                        email: data.user.email,
                        phone: data.user.phone,
                        userId: data.user.userId,
                        userType: data.user.userType,
                        referralUsed: data.user.referralUsed,
                        referralCount: data.user.referralCount,
                        avatar: data.user.avatar,
                        createdAt: data.user.createdAt,
                    });
                    setWalletBalance(data.user.wallet || 0);
                }
            } catch (err) {
                console.error("Failed to refresh user data", err);
            }
        };

        refreshData();
    }, [token, updateUser, setWalletBalance]);

    // Ensure hydration is complete before rendering to avoid mismatch
    if (!_hasHydrated) return null;

    const activeTab = pathname.split("/").pop() || "orders";

    const tabCards = [
        { key: "orders", label: "Your Orders", value: "Orders", icon: FiInbox, href: "/dashboard/orders" },
        { key: "support", label: "Get Help", value: "Support", icon: FiHelpCircle, href: "/dashboard/support" },
        { key: "wallet", label: "Add Money", value: "Wallet", icon: FiCreditCard, href: "/dashboard/wallet" },
        { key: "coins", label: "FREE Tasks & Check-in", value: "Earn BBC", icon: FiStar, href: "/dashboard/coins" },
        { key: "redeem", label: "Gift Card", value: "Redeem", icon: FiGift, href: "/dashboard/redeem" },
        { key: "referral", label: "Invite Friends", value: "Referral", icon: FiUsers, href: "/dashboard/referral" },
    ];

    tabCards.push({ key: "api-keys", label: "API Keys", value: "API Keys", icon: FiKey, href: "/dashboard/api-keys" });

    return (
        <AuthGuard>
            <section className="min-h-screen px-4 sm:px-6 pt-0 pb-4 sm:pb-6 bg-[var(--background)]">
                {/* Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[200px] bg-[var(--accent)]/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    {/* TACTICAL HEADER */}
                    {pathname === "/dashboard" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/10">
                                    <FiZap className="text-[var(--accent)] animate-pulse" size={8} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--accent)] italic">
                                        Active
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">
                                    MY <span className="text-[var(--accent)]">DASHBOARD</span>
                                </h1>
                                <p className="text-[var(--muted)] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 italic">
                                    Hi, {user?.name || "Guest"}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* TACTICAL NAVIGATION */}
                    {pathname === "/dashboard" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mb-6">
                            {tabCards.map((tab, index) => (
                                <motion.div
                                    key={tab.key}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.05 + index * 0.03 }}
                                >
                                    <Link href={tab.href} className="block w-full">
                                        <DashboardCard
                                            tab={tab}
                                            activeTab={activeTab === 'dashboard' ? 'orders' : activeTab}
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* PAGE CONTENT AREA */}
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </section>
        </AuthGuard>
    );
}
