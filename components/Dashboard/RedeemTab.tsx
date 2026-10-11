import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "@/components/common";
import { Icons } from "@/components/icons";

interface RedeemTabProps {
    setWalletBalance: (balance: number) => void;
}

export default function RedeemTab({ setWalletBalance }: RedeemTabProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });

    const handleRedeem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setStatus({ type: null, message: "" });

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/user/redeem", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ code: code.trim() })
            });
            const data = await res.json();

            if (data.success) {
                setStatus({ type: 'success', message: data.message });
                setCode("");
                setWalletBalance(data.newBalance);
            } else {
                setStatus({ type: 'error', message: data.message });
            }
        } catch (err) {
            setStatus({ type: 'error', message: "Something went wrong. Try again." });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { n: 1, title: "Enter Your Code", desc: "Type the code exactly as given to you." },
        { n: 2, title: "Tap Add to Wallet", desc: "Hit the button to submit your code." },
        { n: 3, title: "Instant Credit", desc: "Money is added to your wallet immediately." },
    ];

    return (
        <div className="max-w-sm mx-auto py-2 px-2 space-y-4">

            {/* ── REDEEM FORM ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                {/* Title block */}
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--card)]/40 mb-2">
                        <Icons.gift size={9} className="text-[var(--muted)]" />
                        <span className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]">Redeem</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                        Enter<br />
                        <span className="text-[var(--accent)]">Your Code</span>
                    </h1>
                    <p className="text-[9px] font-bold text-[var(--muted)]/60 uppercase tracking-widest mt-1.5">
                        Add credit to your wallet instantly.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRedeem} className="space-y-2.5">
                    <div className="space-y-1">
                        <label className="text-[7.5px] uppercase tracking-widest font-black text-[var(--muted)]/50">
                            Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value.toUpperCase());
                                if (status.type) setStatus({ type: null, message: "" });
                            }}
                            placeholder="TK-XXXX-XXXX"
                            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 sm:py-3 text-lg font-black tracking-[0.18em] text-[var(--foreground)] placeholder:text-[var(--muted)]/20 focus:border-[var(--accent)] outline-none transition-colors"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        aria-label="button"
                        type="submit"
                        disabled={loading || !code.trim()}
                        className="w-full h-11 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-widest text-[9.5px] flex items-center justify-center gap-2 disabled:opacity-25 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    >
                        {loading ? (
                            <LoadingSpinner size="xs" color="current" />
                        ) : (
                            <>
                                <span>Add to Wallet</span>
                                <Icons.arrowRight size={12} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Status */}
                <AnimatePresence mode="wait">
                    {status.type && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider ${
                                status.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500'
                                    : 'bg-rose-500/10 border-rose-500/25 text-rose-500'
                            }`}
                        >
                            {status.type === 'success' ? <Icons.checkCircle size={13} /> : <Icons.alertCircle size={13} />}
                            <span>{status.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── HOW IT WORKS ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="pt-1 space-y-2.5"
            >
                <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/50">How it works</p>

                <div className="space-y-0">
                    {steps.map(({ n, title, desc }, idx) => (
                        <div key={n} className="flex gap-2.5 items-start">
                            {/* Number + connector */}
                            <div className="flex flex-col items-center">
                                <div className="w-5 h-5 rounded-md border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[9px] font-black text-[var(--foreground)] shrink-0">
                                    {n}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="w-px h-4 bg-[var(--border)] my-0.5" />
                                )}
                            </div>
                            {/* Text */}
                            <div className={`${idx < steps.length - 1 ? "pb-2.5" : ""} pt-0.5`}>
                                <p className="text-[9.5px] font-black uppercase tracking-tight text-[var(--foreground)]">{title}</p>
                                <p className="text-[8px] text-[var(--muted)]/60 mt-0.5 font-bold uppercase tracking-wide">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── SAFE & SECURE ── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-1.5 pt-1"
            >
                <Icons.shield size={9} className="text-[var(--muted)]/40" />
                <p className="text-[7.5px] font-black uppercase tracking-widest text-[var(--muted)]/40">
                    Safe &amp; Secure · No expiry on active codes
                </p>
            </motion.div>

        </div>
    );
}
