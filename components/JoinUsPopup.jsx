"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaTelegramPlane } from "react-icons/fa";
import Image from "next/image";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb87jgR17En1n5PKy129";
const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=in.bluebuff.games";
const INSTAGRAM_URL = "https://instagram.com/mlbbtopup.in";
const TELEGRAM_URL = "https://t.me/bluebuffesports";

function GooglePlayIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, marginLeft: "1.5px" }}
    >
      <path
        fill="#00d3ff"
        d="M32.5 16.5C24.4 20.8 19 29.5 19 40.5v431c0 11 5.4 19.7 13.5 24l246.6-239.5L32.5 16.5z"
      />
      <path
        fill="#00e676"
        d="M372.4 186.2l-93.3 69.8L32.5 16.5c4.7-2.5 10.3-3.7 16.5-3.5 8.8.3 18.2 4.4 26 8.8l297.4 164.4z"
      />
      <path
        fill="#ff3d00"
        d="M372.4 325.8L75 490.2c-7.8 4.4-17.2 8.5-26 8.8-6.2.2-11.8-1-16.5-3.5l246.6-239.5 93.3 69.8z"
      />
      <path
        fill="#ffcc00"
        d="M461.3 235.5l-88.9-49.3-33.3 33.8 33.3 33.8 88.9-49.3c15.6-8.7 15.6-23 0-29z"
      />
    </svg>
  );
}

const socials = [
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    url: WHATSAPP_CHANNEL_URL,
    color: "bg-[#25D366] hover:bg-[#128C7E]",
  },
  {
    name: "Play Store",
    icon: GooglePlayIcon,
    url: PLAYSTORE_URL,
    color: "bg-[#18181b] hover:bg-black",
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
              
              {/* Elegant Top Gradient & Decorative SVGs */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none overflow-hidden">
                <svg className="absolute top-3 left-4 w-4 h-4 text-amber-400/80 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.2L12 16.8 5.7 21.2l2.3-7.2-6-4.6h7.6z" />
                </svg>
                <svg className="absolute top-5 right-12 w-3.5 h-3.5 text-blue-400/60" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
                </svg>
              </div>

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
                    <h3 className="text-base font-extrabold text-gray-800 tracking-tight flex items-center justify-center gap-1.5">
                      <span>Join Our Community</span>
                      <svg className="w-4 h-4 text-blue-500 shrink-0 inline-block" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                      </svg>
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Click on any icon to join</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {socials.map((social, idx) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={social.name}
                          aria-label={social.name}
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
