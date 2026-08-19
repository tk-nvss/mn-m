"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaTelegramPlane, FaDiscord } from "react-icons/fa";
import Image from "next/image";

const WHATSAPP_CHANNEL_1_URL = "https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129";
const WHATSAPP_CHANNEL_2_URL = "https://whatsapp.com/channel/0029Vb7zuwD0VycLqwDcE53y";
const INSTAGRAM_URL = "https://instagram.com/mlbbtopup.in";
const TELEGRAM_URL = "https://t.me/bluebuffesports";

const socials = [
  {
    name: "WhatsApp 1",
    icon: FaWhatsapp,
    url: WHATSAPP_CHANNEL_1_URL,
    color: "bg-[#25D366] hover:bg-[#128C7E]",
  },
  {
    name: "WhatsApp 2",
    icon: FaWhatsapp,
    url: WHATSAPP_CHANNEL_2_URL,
    color: "bg-[#25D366] hover:bg-[#128C7E]",
  },
  {
    name: "Instagram",
    icon: FaInstagram,
    url: INSTAGRAM_URL,
    color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
  },
  {
    name: "Telegram",
    icon: FaTelegramPlane,
    url: TELEGRAM_URL,
    color: "bg-[#0088cc] hover:bg-[#0077b5]",
  }
];

export default function JoinUsPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("joinus_popup_seen");
    if (!shown) {
      const t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("joinus_popup_seen", "1");
      }, 800);

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
            className="relative w-full max-w-[300px] z-10"
          >
            {/* Ultra Premium Compact Card */}
            <div className="relative bg-white rounded-3xl p-5 pb-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden text-center">
              
              {/* Elegant Top Gradient */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button aria-label="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-20"
              >
                <FiX size={15} />
              </button>

              <div className="relative z-10 flex flex-col items-center">
                
                {/* Image Container */}
                <div className="relative mb-5 mt-2 rounded-[20px] overflow-hidden shadow-sm">
                  <Image 
                    src="https://res.cloudinary.com/dwt0xaang/image/upload/v1783605566/join_vf9bpz.png" 
                    alt="Join Us" 
                    width={300} 
                    height={300}
                    quality={80}
                    className="object-contain"
                  />
                </div>

                <div className="w-full space-y-4 mt-1">
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-gray-800 tracking-tight">
                      Join Our Community
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Click on any icon to join</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    {socials.map((social, idx) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.name}
                          className={`w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${social.color}`}
                        >
                          <Icon size={20} color="white" />
                        </a>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
