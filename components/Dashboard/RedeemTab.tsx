import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGift, FiLoader, FiCheckCircle, FiXCircle, FiArrowRight, FiShield, FiStar } from "react-icons/fi";

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
        <div className="max-w-sm mx-auto py-6 px-4 space-y-5">

            {/* ── HERO CARD ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-5"
            >
                {/* Title block */}
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--background)] mb-3">
                        <FiGift size={9} className="text-[var(--muted)]" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Redeem</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--foreground)] leading-none">
                        Enter<br />
                        <span className="text-[var(--accent)]">Your Code</span>
                    </h1>
                    <p className="text-[10px] font-bold text-[var(--muted)]/50 uppercase tracking-widest mt-2">
                        Add credit to your wallet instantly.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRedeem} className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[8px] uppercase tracking-widest font-black text-[var(--muted)]/40">
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
                            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-4 text-xl font-black tracking-[0.2em] text-[var(--foreground)] placeholder:text-[var(--muted)]/20 focus:border-[var(--foreground)]/40 outline-none transition-colors"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        aria-label="button"
                        type="submit"
                        disabled={loading || !code.trim()}
                        className="w-full h-12 rounded-xl bg-[var(--foreground)] text-[var(--background)] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-25 hover:opacity-90 transition-opacity"
                    >
                        {loading ? (
                            <FiLoader className="animate-spin" size={15} />
                        ) : (
                            <>
                                <span>Add to Wallet</span>
                                <FiArrowRight size={13} />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* Status */}
                <AnimatePresence mode="wait">
                    {status.type && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                                status.type === 'success'
                                    ? 'bg-emerald-500/8 border-emerald-500/25 text-emerald-500'
                                    : 'bg-rose-500/8 border-rose-500/25 text-rose-500'
                            }`}
                        >
                            {status.type === 'success' ? <FiCheckCircle size={14} /> : <FiXCircle size={14} />}
                            <span>{status.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ── HOW IT WORKS ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4"
            >
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/40">How it works</p>

                <div className="space-y-0">
                    {steps.map(({ n, title, desc }, idx) => (
                        <div key={n} className="flex gap-3 items-start">
                            {/* Number + connector */}
                            <div className="flex flex-col items-center">
                                <div className="w-7 h-7 rounded-lg border border-[var(--border)] bg-[var(--background)] flex items-center justify-center text-[10px] font-black text-[var(--foreground)] shrink-0">
                                    {n}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className="w-px h-6 bg-[var(--border)] my-0.5" />
                                )}
                            </div>
                            {/* Text */}
                            <div className={`${idx < steps.length - 1 ? "pb-4" : ""} pt-0.5`}>
                                <p className="text-[11px] font-black uppercase tracking-tight text-[var(--foreground)]">{title}</p>
                                <p className="text-[9px] text-[var(--muted)]/50 mt-0.5 font-bold uppercase tracking-wide">{desc}</p>
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
                className="flex items-center justify-center gap-2 py-2"
            >
                <FiShield size={10} className="text-[var(--muted)]/30" />
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/30">
                    Safe &amp; Secure · No expiry on active codes
                </p>
            </motion.div>

        </div>
    );
}
