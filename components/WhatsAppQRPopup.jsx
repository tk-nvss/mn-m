"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { FiX, FiUsers, FiArrowRight } from "react-icons/fi";
import Image from "next/image";

export default function WhatsAppCommunityPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("wa_qr_premium_v4");
    if (!shown) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("wa_qr_premium_v4", "1");
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative w-full max-w-[280px] z-10"
          >
            {/* Ultra Premium Compact Card */}
            <div className="relative bg-white rounded-3xl p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden text-center">
              
              {/* Elegant Top Gradient */}
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button aria-label="button"
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-20"
              >
                <FiX size={14} />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                
                {/* Compact Header (Horizontal) */}
                <div className="flex items-center gap-3 mb-4 w-full justify-center">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50 shrink-0">
                    <FiUsers size={18} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-[800] tracking-tight text-gray-900 leading-tight">
                      Our Community
                    </h2>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Giveaways & Updates
                    </p>
                  </div>
                </div>

                {/* Compact QR Code Container */}
                <div className="relative mb-5">
                  <div className="absolute -inset-3 bg-gray-50 rounded-[1.25rem] border border-gray-100 pointer-events-none" />
                  
                  <div className="relative bg-white p-2.5 rounded-[1rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-50">
                    <QRCodeCanvas
                      value="https://chat.whatsapp.com/L9d2jdWf5wBHTfv9CI17ip"
                      size={110}
                      level="H"
                      includeMargin={false}
                      fgColor="#0f172a"
                      className="rounded-md"
                    />
                    
                    {/* Small inner logo overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center p-1">
                        <Image src="/logoBB.png" alt="Logo" width={18} height={18} className="object-contain" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Premium Action Button (Compact) */}
                <a
                  href="https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#ffffff' }}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] !text-white font-bold text-xs tracking-wide shadow-[0_8px_20px_-6px_rgba(0,102,255,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(0,102,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  <span className="!text-white font-bold">Join Now</span>
                  <FiArrowRight size={14} className="!text-white" />
                </a>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
