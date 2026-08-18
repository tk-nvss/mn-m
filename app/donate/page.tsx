"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaGift, FaHandsHelping, FaCreditCard, FaTimes } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import { CopyButton } from "@/components/common";
import { Icons } from "@/components/icons";
import { formatCurrency } from "@/utils";

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [showQR, setShowQR] = useState(false);
  const [finalDonationAmount, setFinalDonationAmount] = useState<number>(0);

  const presetAmounts = [1, 10, 20, 30, 40, 50];

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      if (value !== "") {
        setSelectedAmount(null);
      }
    }
  };

  const handleDonate = () => {
    const finalAmount = selectedAmount !== null ? selectedAmount : parseInt(customAmount);
    if (!finalAmount || finalAmount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }
    setFinalDonationAmount(finalAmount);
    setShowQR(true);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/30 pb-32 transition-colors duration-300 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto pt-16 md:pt-24 relative z-10 w-full">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-[900] italic tracking-tighter uppercase leading-none mb-2">
            SUPPORT A <span className="text-rose-500">NOBLE CAUSE</span>
          </h1>
          <p className="text-[var(--muted)] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-60 italic">
            Your contribution makes a difference
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-start">
          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Main Card */}
            <div className="p-6 md:p-8 rounded-[24px] md:rounded-3xl bg-[var(--card)]/40 border border-[var(--border)] relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <FaHeart size={18} />
                </div>
                <h2 className="text-lg font-[900] italic uppercase tracking-tight">A small step from us 🙏</h2>
              </div>

              <div className="relative z-10 space-y-3 text-[var(--muted)] text-sm leading-relaxed">
                <p>
                  We at <strong className="text-[var(--foreground)]">Blue Buff</strong> are just a small team trying to do a little good. We collect small voluntary donations from our community to help:
                </p>

                <div className="grid grid-cols-1 gap-2 my-3">
                  {[
                    { icon: "🐾", text: "Help stray & injured animals" },
                    { icon: "🤲", text: "Help people in need" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-semibold text-[var(--foreground)]">{item.text}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs opacity-70">
                  Even ₹1 counts. No pressure at all — only if you feel like it. 💛
                </p>
              </div>
            </div>

            {/* Volunteer note */}
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5">
              <span className="text-rose-400 text-lg mt-0.5">🤝</span>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                <strong className="text-[var(--foreground)]">100% Voluntary.</strong> This is not a business. It's a community initiative — completely transparent, with no obligation whatsoever. Thank you for even reading this. 🙏
              </p>
            </div>
          </motion.div>


          {/* Donation Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-5 md:p-8 rounded-[24px] md:rounded-[32px] bg-[var(--card)] border border-[var(--border)] shadow-2xl relative lg:sticky lg:top-24"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60 mb-6 text-center">
              Select an Amount
            </h3>

            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountClick(amount)}
                  className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-[900] italic text-lg md:text-xl transition-all duration-300 border ${
                    selectedAmount === amount
                      ? "bg-rose-500 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] scale-[1.02]"
                      : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-rose-500/50 hover:bg-rose-500/10"
                  }`}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60 block mb-3 pl-2">
                Or enter custom amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-[900] text-[var(--muted)]">₹</span>
                <input
                  type="text"
                  placeholder="Custom"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className={`w-full bg-[var(--background)] border ${
                    customAmount
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-[var(--border)] focus:border-rose-500/50"
                  } rounded-xl md:rounded-2xl py-3 md:py-4 pl-8 md:pl-10 pr-4 text-lg md:text-xl font-[900] italic text-[var(--foreground)] outline-none transition-colors`}
                />
              </div>
            </div>

            <button
              onClick={handleDonate}
              className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-[900] italic uppercase tracking-widest text-base md:text-lg transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] transform hover:-translate-y-1"
            >
              <Icons.creditCard className="text-base" />
              Donate Now
            </button>

            <p className="text-center text-[10px] text-[var(--muted)] opacity-50 mt-4 uppercase font-black tracking-widest">
              Secure & Encrypted Transaction
            </p>
          </motion.div>
        </div>

      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowQR(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-[32px] p-8 shadow-2xl flex flex-col items-center z-10"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:border-rose-500/50 transition-colors"
              >
                <Icons.close size={14} />
              </button>
              
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
                <Icons.heart size={28} />
              </div>
              
              <h2 className="text-2xl font-[900] italic uppercase tracking-tight text-center mb-2">Scan to Donate</h2>
              <p className="text-[var(--muted)] text-center text-sm mb-6">
                You are donating <strong className="text-[var(--foreground)]">{formatCurrency(finalDonationAmount)}</strong>
              </p>
              
              <div className="p-4 bg-white rounded-2xl mb-4 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
                <QRCodeSVG 
                  value={`upi://pay?pa=6372305866@okbizaxis&pn=Donation&am=${finalDonationAmount}`}
                  size={200}
                  level={"H"}
                  includeMargin={false}
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-[var(--muted)]">6372305866@okbizaxis</span>
                <CopyButton text="6372305866@okbizaxis" size="xs" variant="ghost" className="p-0.5" />
              </div>

              <p className="text-center text-[10px] text-[var(--muted)] opacity-60 uppercase font-black tracking-widest">
                Scan with any UPI App
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
