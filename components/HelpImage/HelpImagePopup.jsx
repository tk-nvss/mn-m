"use client";

import { useState } from "react";
import { FiHelpCircle, FiX } from "react-icons/fi";
import Image from "next/image";

export default function HelpImagePopup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Question Mark Button (INLINE, not fixed) */}
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-full bg-[var(--accent)]
                   text-white flex items-center justify-center
                   shadow hover:scale-105 transition"
        aria-label="Help"
      >
        <FiHelpCircle size={18} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
          
          {/* Modal */}
          <div className="relative bg-[var(--card)] rounded-xl max-w-md w-full p-4 shadow-xl">
            
            {/* Close Button */}
            <button aria-label="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3
                         w-7 h-7 rounded-full
                         bg-black/70 text-white
                         flex items-center justify-center
                         hover:bg-black transition"
            >
              <FiX size={18} />
            </button>

            {/* Image */}
            <Image
              src="https://res.cloudinary.com/dk0sslz1q/image/upload/v1765620596/ID_ele414.png"
              alt="How to find Player ID & Zone ID"
              width={400}
              height={400}
              className="rounded-lg w-full h-auto"
            />
          </div>
        </div>
      )}
    </>
  );
}
