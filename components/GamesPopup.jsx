"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiArrowRight } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Image from "next/image";

export default function GamesPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("games_popup_seen");
    if (!shown) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("games_popup_seen", "1");
      }, 700);

      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* Subtle Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-[92%] max-w-[340px] sm:max-w-[360px] z-10"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/25 via-indigo-500/20 to-emerald-500/25 rounded-2xl blur-lg opacity-70" />

            {/* Ultra Premium Compact Card */}
            <div className="relative bg-white rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-gray-100 text-center overflow-hidden">
              
              {/* Top Accent Gradient */}
              <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-blue-100/40 to-transparent pointer-events-none" />

              {/* High Contrast Close Button */}
              <button
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-900/85 hover:bg-slate-950 text-white shadow-md backdrop-blur-sm transition-all z-30 active:scale-90 hover:scale-105"
              >
                <FiX size={14} strokeWidth={2.5} />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                
                {/* Banner Image Container */}
                <div className="relative w-full mb-2 rounded-xl overflow-hidden shadow-sm">
                  <Image 
                    src="https://res.cloudinary.com/dwt0xaang/image/upload/v1787469065/img_1_nzbtwy.png" 
                    alt="Play Games on Website" 
                    width={420} 
                    height={260}
                    quality={95}
                    className="w-full h-auto object-contain rounded-xl"
                    priority
                  />
                </div>

                {/* Actions Stack */}
                <div className="w-full flex flex-col gap-2">
                  {/* Primary CTA: Play Now */}
                  <a
                    href="https://games.bluebuff.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ffffff' }}
                    className="group relative w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0062FF] via-[#0070FF] to-[#0050E6] !text-white hover:!text-white font-bold text-[13px] tracking-wide shadow-[0_6px_18px_-4px_rgba(0,98,255,0.45)] hover:shadow-[0_8px_24px_-4px_rgba(0,98,255,0.6)] hover:brightness-105 active:scale-[0.98] transition-all duration-200"
                  >
                    <span className="!text-white font-bold">Play Now</span>
                    <FiArrowRight size={16} strokeWidth={2.5} className="!text-white text-white group-hover:translate-x-1 transition-transform duration-200" />
                  </a>

                  {/* Secondary CTA: WhatsApp Channel */}
                  <a
                    href="https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#ffffff' }}
                    className="group relative w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] !text-white hover:!text-white font-bold text-[13px] tracking-wide shadow-[0_4px_14px_-3px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_-3px_rgba(37,211,102,0.55)] hover:brightness-105 active:scale-[0.98] transition-all duration-200"
                  >
                    <FaWhatsapp className="text-base !text-white text-white group-hover:scale-110 transition-transform duration-200" />
                    <span className="!text-white font-bold">Join WhatsApp Channel</span>
                    <FiArrowRight size={15} strokeWidth={2.5} className="!text-white text-white opacity-90 group-hover:translate-x-1 transition-all duration-200" />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
