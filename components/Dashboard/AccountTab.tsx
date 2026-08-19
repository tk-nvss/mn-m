"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";
import api from "@/lib/axios";

interface UserDetails {
  name: string;
  email: string;
  phone: string;
}

interface AccountTabProps {
  userDetails: UserDetails;
}

export default function AccountTab({ userDetails }: AccountTabProps) {
  const [newPass, setNewPass] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPass.length < 6) {
      setPassError("Password must be at least 6 characters.");
      return;
    }
    setLoadingPass(true);
    try {
      const { data } = await api.post("/api/auth/update-password", {
        identifier: userDetails.email || userDetails.phone,
        newPassword: newPass,
      });
      setLoadingPass(false);
      if (!data.success) {
        setPassError(data.message || "Could not update password. Try again.");
        return;
      }
      setNewPass("");
      setPassSuccess("Password updated!");
      setTimeout(() => setPassSuccess(""), 4000);
    } catch {
      setLoadingPass(false);
      setPassError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* IDENTITY MATRIX HEADER */}
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)]">
          <FiUser size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">
            My <span className="text-[var(--accent)]">Account</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-50">
            Your profile and settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="h-full rounded-[2.5rem] bg-white/5 border border-white/5 p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 text-white/5 group-hover:text-[var(--accent)]/10 transition-colors">
              <FiZap size={64} />
            </div>

            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-24 h-24 rounded-[3rem] bg-[var(--accent)]/15 border border-[var(--accent)]/20 flex items-center justify-center text-4xl font-black text-[var(--accent)] italic shadow-xl mb-6 relative">
                {userDetails.name?.charAt(0) || "U"}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center text-[var(--accent)] shadow-lg">
                  <FiZap size={14} className="animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">{userDetails.name}</h3>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)] opacity-60">Member</span>
            </div>

            <div className="space-y-5">
              <ProfileItem icon={FiMail} label="Email" value={userDetails.email} />
              <ProfileItem icon={FiPhone} label="Phone" value={userDetails.phone} />
            </div>
          </div>
        </motion.div>

        {/* SECURITY CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-xl h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--accent)] border border-white/5">
                <FiShield size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Change Password</h3>
                <p className="text-[10px] uppercase font-bold text-[var(--muted)]/40 tracking-widest mt-1">Pick a new password</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {passSuccess && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <FiCheckCircle size={14} /> {passSuccess}
                </motion.div>
              )}
              {passError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <FiAlertCircle size={14} /> {passError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4 max-w-md">
              <div className="relative group">
                <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors" />
                <input
                  type="password"
                  placeholder="New Password..."
                  value={newPass}
                  onChange={(e) => { setNewPass(e.target.value); setPassError(""); }}
                  className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-white/5 bg-white/5 focus:bg-white/10 focus:border-[var(--accent)]/40 text-xs font-black uppercase tracking-widest outline-none transition-all placeholder:text-[var(--muted)]/20"
                />
              </div>

              <button aria-label="button"
                disabled={true}
                onClick={handlePasswordUpdate}
                className="w-full p-5 rounded-[2rem] bg-[var(--accent)] text-black font-black uppercase tracking-[0.2em] italic text-xs shadow-[0_20px_40px_-10px_rgba(var(--accent-rgb),0.3)] hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
              >
                {loadingPass ? <LoadingSpinner size="xs" color="current" /> : "Save Password"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1">Region</p>
                <p className="text-[10px] font-black italic">India</p>
              </div>
              <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)]/40 mb-1">Status</p>
                <p className="text-[10px] font-black italic text-[var(--accent)]">Active</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ProfileItem({ icon: Icon, label, value }: any) {
  return (
    <div className="group/item">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--muted)]/40 mb-2 flex items-center gap-2">
        <Icon size={10} className="text-[var(--accent)]/40" /> {label}
      </p>
      <p className="text-xs font-black text-white tracking-wide truncate bg-black/20 p-3.5 rounded-2xl border border-white/5 group-hover/item:border-[var(--accent)]/30 transition-colors">
        {value || 'Not set'}
      </p>
    </div>
  );
}
