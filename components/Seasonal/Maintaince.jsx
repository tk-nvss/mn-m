"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";

export default function Maintaince() {
  const [show, setShow] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleLoggingOff = () => {
    setIsLoggingOut(true);
    const keysToRemove = [
      "token",
      "userName",
      "email",
      "userId",
      "phone",
      "userType",
      "walletBalance",
      "pending_topup_order",
      "avatar",
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("mlbb_verified_players");
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 overflow-y-auto bg-slate-50/95 backdrop-blur-xl select-none">
          {/* Soft ambient background aura */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-100/70 rounded-full blur-3xl opacity-60" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-100/60 rounded-full blur-3xl opacity-50" />
          </div>

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[360px] bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-7 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] z-10"
          >
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <Image
                src="/logoBB.png"
                alt="Logo"
                width={110}
                height={32}
                priority
                className="h-7 w-auto object-contain opacity-90"
              />
            </div>

            {/* Cute sleeping controller illustration with animated Zzz */}
            <div className="relative w-28 h-24 mx-auto mb-2 flex items-center justify-center">
              {/* Floating Zzz */}
              <motion.span
                animate={{ y: [-2, -20], opacity: [0, 1, 0], x: [0, 8] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute -top-1 right-2 text-xs font-black text-amber-500 select-none pointer-events-none"
              >
                Z
              </motion.span>
              <motion.span
                animate={{ y: [-2, -15], opacity: [0, 1, 0], x: [0, 6] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 0.8, ease: "easeOut" }}
                className="absolute top-3 right-0 text-[10px] font-black text-amber-400 select-none pointer-events-none"
              >
                z
              </motion.span>
              <motion.span
                animate={{ y: [-2, -10], opacity: [0, 1, 0], x: [0, 4] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 1.6, ease: "easeOut" }}
                className="absolute top-7 right-2 text-[8px] font-black text-amber-300 select-none pointer-events-none"
              >
                z
              </motion.span>

              {/* Cute sleeping controller SVG */}
              <motion.svg
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                viewBox="0 0 100 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-24 h-20 select-none"
              >
                {/* Controller body */}
                <path
                  d="M22 28 C28 20 72 20 78 28 C86 38 94 65 80 72 C68 78 60 62 50 62 C40 62 32 78 20 72 C6 65 14 38 22 28 Z"
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                
                {/* D-Pad on left */}
                <rect x="23" y="38" width="5" height="13" rx="1.5" fill="#94a3b8" />
                <rect x="19" y="42" width="13" height="5" rx="1.5" fill="#94a3b8" />

                {/* Cute sleeping eyes: ⌒   ⌒ */}
                <path d="M42 42 C44 38 48 38 50 42" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M54 42 C56 38 60 38 62 42" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

                {/* Cute smile: ‿ */}
                <path d="M49 48 C51 51 53 51 55 48" stroke="#475569" strokeWidth="2" strokeLinecap="round" />

                {/* Rosy blushing cheeks */}
                <circle cx="38" cy="46" r="3.5" fill="#fecdd3" opacity="0.8" />
                <circle cx="66" cy="46" r="3.5" fill="#fecdd3" opacity="0.8" />

                {/* Action buttons on right */}
                <circle cx="76" cy="38" r="2.5" fill="#fbbf24" />
                <circle cx="82" cy="44" r="2.5" fill="#f43f5e" />
                <circle cx="76" cy="50" r="2.5" fill="#38bdf8" />
                <circle cx="70" cy="44" r="2.5" fill="#34d399" />
              </motion.svg>
            </div>

            {/* Simple Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[10.5px] font-bold tracking-wide mb-3">
              <span>🛠️</span>
              <span>Maintenance In Progress • Back Soon</span>
            </div>

            {/* Clear Heading in Simple English */}
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug mb-1.5">
              We&apos;re Upgrading the Website! 🛠️
            </h1>

            {/* Simple, reassuring description explaining to the user */}
            <p className="text-xs text-slate-500 leading-relaxed mb-5 max-w-[290px] mx-auto">
              We are making a quick update to make the website faster and smoother for you. Don&apos;t worry, your account and orders are 100% safe!
            </p>

            {/* Actions: Refresh & WhatsApp */}
            <div className="flex flex-col gap-2 w-full mb-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <FiRefreshCw size={13} />
                <span>Check If Website Is Back</span>
              </button>

              {/* WhatsApp Direct Help Button */}
              <a
                href="https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm shadow-emerald-500/20 hover:shadow-md transition-all active:scale-[0.98] group"
              >
                <FaWhatsapp size={15} />
                <span>Join WhatsApp for Updates</span>
                <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Admin Login / Logout subtle links */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              {!isLoggedIn ? (
                <button
                  onClick={handleLogin}
                  className="hover:text-slate-700 transition-colors cursor-pointer font-semibold"
                >
                  Staff login →
                </button>
              ) : !isLoggingOut ? (
                <button
                  onClick={handleLoggingOff}
                  className="hover:text-red-500 transition-colors cursor-pointer font-semibold"
                >
                  Log out
                </button>
              ) : (
                <span className="text-slate-400 animate-pulse">Logging out...</span>
              )}

              <span className="text-[9px] tracking-wider uppercase text-slate-300 font-bold">
                © 2026 MLBBTOPUP
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
