"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { FiUser, FiMail, FiPhone, FiShield, FiSave, FiEdit2, FiCheckCircle, FiClock, FiArrowRight, FiAward } from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";
import { formatDate } from "@/utils";
import Link from "next/link";
import Image from "next/image";

export default function MyProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handleUpdatePhone = async () => {
    if (!phoneInput) {
      alert("Phone number cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post("/api/user/update-phone", { phone: phoneInput });
      if (data.success) {
        updateUser({ phone: data.phone });
        setIsEditingPhone(false);
        alert("Phone number updated successfully!");
      } else {
        alert(data.message || "Failed to update phone number");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 text-[var(--muted)]">
        <LoadingSpinner size="lg" color="accent" />
      </div>
    );
  }

  const isLifetime = user.userType === "owner" || user.userType === "user";
  const displayExpiry = isLifetime ? "Lifetime" : (user.membershipExpiry ? formatDate(user.membershipExpiry) : "Lifetime");
  const displayRole = user.userType === "user" ? "Normal User" : user.userType === "admin" ? "Reseller" : user.userType;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      
      {/* HEADER SECTION */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center text-center">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-md bg-[var(--background)] flex items-center justify-center text-[var(--accent)] text-5xl font-[1000] overflow-hidden mb-5">
          {user.avatar ? (
            <Image src={user.avatar} alt={user.name} fill unoptimized className="object-cover" />
          ) : (
            user.name?.charAt(0)?.toUpperCase() || <FiUser />
          )}
        </div>
        
        <h2 className="text-3xl font-[1000] text-[var(--foreground)] leading-none tracking-tight mb-4">{user.name || "User"}</h2>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
            <FiShield size={14} />
            {displayRole}
          </div>
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-600 dark:bg-purple-900/20 dark:border-purple-800/30 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
            <FiClock size={14} />
            Expiry: {displayExpiry}
          </div>
        </div>
      </div>

      {/* ACCOUNT DETAILS */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)] flex items-center gap-2 mb-6">
          <FiUser size={14} /> Account Details
        </h3>

        <div className="space-y-4">
          {/* EMAIL */}
          <div className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shrink-0 shadow-sm">
                <FiMail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Email Address</p>
                <p className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">{user.email || "Not provided"}</p>
              </div>
            </div>
            {user.email && <FiCheckCircle className="text-emerald-500 shrink-0" size={20} />}
          </div>

          {/* PHONE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shrink-0 shadow-sm">
                <FiPhone size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Phone Number</p>
                
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-bold text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">{user.phone || "Not set"}</p>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 pl-[3.5rem] sm:pl-0">
              {isEditingPhone ? (
                <>
                  <button 
                    onClick={handleUpdatePhone}
                    disabled={loading}
                    className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                  >
                    {loading ? <LoadingSpinner size="xs" color="white" /> : <FiSave size={12} />}
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhoneInput(user.phone || "");
                    }}
                    className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-xs font-bold rounded-lg hover:bg-[var(--background)] transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditingPhone(true)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--accent)] text-xs font-black uppercase tracking-widest hover:border-[var(--accent)] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <FiEdit2 size={12} /> {user.phone ? "Edit" : "Add"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UPGRADE PROMPT FOR NORMAL USERS */}
      {user.userType === "user" && (
        <div className="relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm group hover:border-[var(--accent)]/50 transition-colors">
          {/* Subtle ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left relative z-10 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-[var(--background)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <FiAward size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-[1000] text-[var(--foreground)] uppercase tracking-widest mb-1.5">Upgrade to Member</h3>
              <p className="text-xs sm:text-sm font-bold text-[var(--muted)] max-w-sm leading-relaxed">
                Unlock exclusive tier discounts, reseller privileges, and premium priority support.
              </p>
            </div>
          </div>

          <Link 
            href="/games/membership/silver-membership" 
            className="w-full sm:w-auto shrink-0 px-6 py-4 bg-[var(--foreground)] text-[var(--background)] font-[1000] uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-[var(--accent)] hover:text-white transition-all flex items-center justify-center gap-2 relative z-10 shadow-md hover:shadow-lg"
          >
            View Memberships <FiArrowRight size={14} />
          </Link>
        </div>
      )}

    </div>
  );
}
