"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import CustomWebBanner from "../Home/CustomWebBanner";
import api from "@/lib/axios";
import { FiHeart, FiChevronRight, FiChevronDown, FiLogOut, FiCheckCircle, FiShield, FiZap, FiMenu, FiX, FiLayers, FiCompass, FiGrid, FiShoppingBag, FiMessageSquare, FiUser, FiUsers, FiKey, FiGift, FiAward, FiDownload } from "react-icons/fi";

import { useAuthStore } from "@/store/useAuthStore";

/* ================= CONFIG ================= */
const HEADER_CONFIG = {
  logo: {
    src: "/logoBB.png",
    alt: "mlbbtopup.in",
    width: 140,
    height: 40,
  },

  nav: [
    { label: "Services", href: "/services", icon: <FiGrid size={14} />, colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { label: "News", href: "/blog", icon: <FiLayers size={14} />, colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { label: "Giveaways", href: "/giveaways", icon: <FiGift size={14} />, colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ],

  userMenu: {
    common: [
      { label: "My Orders", href: "/dashboard/orders", icon: <FiShoppingBag size={14} />, desc: "Track your top-ups", colorClass: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/20" },
      { label: "My Wallet", href: "/dashboard/wallet", icon: <FiLayers size={14} />, desc: "Balance & Recharge", colorClass: "bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-pink-400 border-pink-500/20" },
      { label: "Earn BBC", href: "/dashboard/coins", icon: <FiZap size={14} />, desc: "FREE Tasks, Check-in & Games", colorClass: "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-yellow-400 border-yellow-500/20" },
      { label: "Redeem Code", href: "/dashboard/redeem", icon: <FiGift size={14} />, desc: "Claim gift credits", colorClass: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20" },
      { label: "Refer & Earn", href: "/dashboard/referral", icon: <FiUsers size={14} />, desc: "Earn rewards", colorClass: "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/20" },
      { label: "My Tournaments", href: "/dashboard/tournaments", icon: <FiAward size={14} />, desc: "View your joined scrims", colorClass: "bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/20" },

      { label: "API Setup", href: "https://bluebuff.in", icon: <FiKey size={14} />, desc: "Developer API Access", colorClass: "bg-gradient-to-br from-slate-500/20 to-gray-500/20 text-slate-600 border-slate-500/20" },
      { label: "Support", href: "/dashboard/support", icon: <FiMessageSquare size={14} />, desc: "Get help 24/7", colorClass: "bg-gradient-to-br from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/20" },
    ],
    roles: {
      owner: { label: "Admin Console", href: "/owner-panal", icon: <FiZap size={14} />, colorClass: "bg-gradient-to-br from-[var(--accent)] to-purple-600 text-white" },
    },
  },
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Zustand state
  const { user, walletBalance, setWalletBalance, updateUser, logout, token, _hasHydrated } = useAuthStore();
  
  const [activeNav, setActiveNav] = useState("/");
  const [balanceLoading, setBalanceLoading] = useState(true);


  const dropdownRef = useRef(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) {
      setLoading(false);
      setBalanceLoading(false);
      return;
    }

    api.get("/api/auth/me")
      .then((r) => r.data)
      .then((d) => {
        if (d.success) {
          updateUser({
            name: d.user.name,
            email: d.user.email,
            userId: d.user.id || d.user.userId,
            avatar: d.user.avatar || "",
            userType: d.user.userType || "user",
            phone: d.user.phone,
          });
          
          if (d.user.wallet !== undefined) {
            setWalletBalance(d.user.wallet);
          }
        } else {
          logout();
        }
      })
      .finally(() => {
        setLoading(false);
        setBalanceLoading(false);
      });
  }, [_hasHydrated, token, updateUser, setWalletBalance, logout]);

  /* ================= PWA INSTALL LOGIC ================= */
  const handleInstallPWA = async () => {
    const prompt = window.__pwaPrompt;
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "installed" }) }).catch(() => {});
      }
      window.__pwaPrompt = null;
    } else {
      window.dispatchEvent(new Event("show-pwa-modal"));
    }
  };

  const [showLogoutToast, setShowLogoutToast] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setShowLogoutToast(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  };

  const [idCopied, setIdCopied] = useState(false);
  const copyId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  /* ================= SCROLL ================= */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (userMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [userMenuOpen]);

  return (
    <header
      className={`fixed top-0 w-full transition-all duration-500 ${scrolled
        ? "backdrop-blur-3xl bg-[var(--background)]/80 shadow-2xl border-b border-[var(--border)] active-header"
        : "bg-transparent"
        } opacity-100 translate-y-0`}
      style={{ zIndex: userMenuOpen ? 2147483647 : 1000 }}
    >
      <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Left section */}
          <div className="flex items-center xl:flex-1 justify-start">
            <Link
              href="/"
              className="relative z-10 flex-shrink-0"
              onClick={() => {
                setUserMenuOpen(false);
                setActiveNav("/");
              }}
            >
              <div className="hover:scale-105 active:scale-95 transition-transform duration-300">
                <Image
                  src={HEADER_CONFIG.logo.src}
                  alt={HEADER_CONFIG.logo.alt}
                  width={HEADER_CONFIG.logo.width}
                  height={HEADER_CONFIG.logo.height}
                  priority
                  className="h-9 w-auto transition-all duration-300"
                />
              </div>
            </Link>
          </div>

          {/* Center section */}
          <nav className="hidden xl:flex items-center space-x-1 shrink-0 justify-center">
            {HEADER_CONFIG.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActiveNav(item.href)}
                className="relative px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] italic text-[var(--muted)] hover:text-[var(--accent)] transition-all group flex items-center gap-2"
              >
                <span className="relative z-10 opacity-70 group-hover:opacity-100 transition-all">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[var(--accent)] shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)] transition-all duration-300 ${activeNav === item.href ? "w-full" : "w-0"}`}
                />
                <div className="absolute inset-0 bg-[var(--accent)]/0 group-hover:bg-[var(--accent)]/5 transition-colors duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 xl:flex-1">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallPWA}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--foreground)]/5 border border-[var(--border)]/30 text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors group backdrop-blur-md"
                aria-label="Install App"
                title="Install App"
              >
                <FiDownload size={14} className="group-hover:translate-y-[1px] transition-transform z-10" />
                
                {/* SPINNING RING */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-[var(--foreground)]/20 pointer-events-none"
                />
                
                {/* INDICATOR */}
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--background)] bg-[#0088cc] z-20 shadow-[0_0_8px_rgba(0,136,204,0.6)]" />
              </motion.button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2" ref={dropdownRef}>
              <ThemeToggle />

              <button
                onClick={() => user ? setUserMenuOpen((p) => !p) : window.location.href = "/login"}
                className="relative flex items-center gap-1 pl-1 pr-1.5 py-1 rounded-[2rem] transition-all duration-300 group hover:scale-105 active:scale-95 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 border border-[var(--border)]"
                aria-label="User Menu"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden flex items-center justify-center bg-[var(--background)] shadow-sm">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={`${user.name || "User"} Profile Avatar`} width={28} height={28} className="object-cover" />
                  ) : (
                    <FiUser className="text-[var(--foreground)]/60 text-xs" />
                  )}
                </div>
                <FiChevronRight className="text-[var(--foreground)]/60 text-[10px] sm:text-xs group-hover:translate-x-0.5 transition-transform" />
              </button>

              <>
                <div
                  onClick={() => setUserMenuOpen(false)}
                  className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-[2147483646] cursor-pointer transition-opacity duration-500 ${userMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                />

                <div
                  className={`fixed right-0 top-0 h-[100dvh] w-[85%] max-w-[380px] bg-[var(--background)] dark:bg-[#050505] border-l border-[var(--border)] z-[2147483647] shadow-[-20px_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${userMenuOpen ? "translate-x-0" : "translate-x-full"}`}
                  style={{ background: 'var(--background)', opacity: 1 }}
                >
                  <div className="absolute inset-0 bg-[var(--background)] pointer-events-none" style={{ background: 'var(--background)', opacity: 1 }} />
                  <div
                    className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-[radial-gradient(circle,var(--accent)_0%,transparent_60%)] blur-[100px] pointer-events-none opacity-10"
                  />
                  {/* Dark overlay for extra depth */}
                  <div className="absolute inset-0 bg-[var(--foreground)]/[0.02] pointer-events-none" />

                  {/* Compact Profile Header */}
                  <div className="relative z-10 p-3 px-4 flex items-center justify-between border-b border-[var(--border)] gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {user ? (
                        <>
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border)] shadow-sm shrink-0">
                            {user?.avatar ? (
                              <Image src={user.avatar} alt={`${user.name || "User"} Profile Avatar`} width={32} height={32} className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] text-sm font-black">{user.name?.charAt(0)}</div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-bold text-[var(--foreground)] truncate leading-tight">{user.name}</span>
                              <span className="text-[6px] font-black uppercase px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/10 italic tracking-widest shrink-0">
                                {user.userType === "owner" ? "owner" : user.userType === "admin" ? "reseller" : user.userType === "member" ? "member" : "user"}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium text-[var(--foreground)] opacity-70 truncate italic leading-tight">{user.email}</span>
                            <button aria-label="button"
                              onClick={() => copyId(user.userId)}
                              className="w-fit flex items-center gap-1 mt-0.5 px-1 py-0.5 rounded bg-[var(--foreground)]/[0.03] border border-[var(--border)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-all group"
                            >
                              <span className="text-[8px] font-bold text-[var(--foreground)] opacity-80 group-hover:opacity-100 group-hover:text-[var(--accent)] tracking-tighter truncate max-w-[80px]">ID: {user.userId}</span>
                              <div className="w-3 h-3 rounded-sm flex items-center justify-center text-[var(--foreground)] opacity-80 group-hover:opacity-100 group-hover:text-[var(--accent)] shrink-0">
                                {idCopied ? <FiCheckCircle size={9} /> : <FiLayers size={9} />}
                              </div>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]"><FiUser size={16} /></div>
                          <span className="text-sm font-bold">Guest Account</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {user && (
                        <button onClick={handleLogout} className="w-7 h-7 rounded-full hover:bg-red-500/10 flex items-center justify-center text-red-500 transition-colors" title="Logout"><FiLogOut size={14} /></button>
                      )}
                      <button onClick={() => setUserMenuOpen(false)} className="w-7 h-7 rounded-full hover:bg-[var(--foreground)]/5 flex items-center justify-center text-[var(--muted)] transition-colors" aria-label="Close User Menu"><FiX size={18} /></button>
                    </div>
                  </div>

                  <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

                    {!user ? (
                      <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
                        <div className="w-16 h-16 rounded-[2rem] bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]"><FiZap size={32} /></div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-[var(--foreground)]">Sign in required</h3>
                          <p className="text-xs text-[var(--muted)]">Login to access your personalized squad dashboard</p>
                        </div>
                        <Link href="/login" onClick={() => setUserMenuOpen(false)} className="w-full py-3.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all text-center">Authenticate Now</Link>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {HEADER_CONFIG.nav.map((item) => (
                            <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)} className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl border transition-all group overflow-hidden ${item.colorClass || 'bg-[var(--card)] border-[var(--border)] text-[var(--accent)] hover:shadow-md'}`}>
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="mb-1 drop-shadow-sm group-hover:-translate-y-0.5 transition-transform">{item.icon}</span>
                              <span className="text-[8px] font-black uppercase tracking-widest text-center">{item.label}</span>
                            </Link>
                          ))}
                        </div>

                        <div className="space-y-1">
                          {/* Main Row: Orders & Wallet side-by-side */}
                          <div className="flex flex-col gap-2 mb-2">
                            {HEADER_CONFIG.userMenu.common.slice(0, 2).map((item) => (
                              <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)} className="relative flex items-center justify-between p-3 rounded-2xl bg-[var(--card)] shadow-sm border border-transparent hover:border-[var(--accent)]/30 hover:shadow-md transition-all group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-3 min-w-0 flex-1 relative z-10">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner ${item.colorClass || "bg-[var(--accent)]/10 text-[var(--accent)]"}`}>{item.icon}</div>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] truncate leading-none mb-1">{item.label}</p>
                                    <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest truncate leading-none">{item.desc}</p>
                                  </div>
                                </div>
                                {item.label === "My Wallet" && (
                                  <div className="shrink-0 ml-2 relative z-10">
                                    {balanceLoading ? (
                                      <div className="h-4 w-10 bg-[var(--foreground)]/10 animate-pulse rounded" />
                                    ) : (
                                      <span className="text-xs font-black text-[var(--accent)]">₹{walletBalance}</span>
                                    )}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>

                          {/* 4 Items in 2x2 Grid */}
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {HEADER_CONFIG.userMenu.common.slice(2, 6).map((item) => (
                              <Link key={item.label} href={item.href} onClick={() => setUserMenuOpen(false)} className="relative flex flex-col p-3 rounded-2xl bg-[var(--card)] shadow-sm border border-transparent hover:border-[var(--accent)]/30 hover:shadow-md transition-all group overflow-hidden gap-2">
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner ${item.colorClass || "bg-[var(--foreground)]/5 text-[var(--foreground)]"}`}>{item.icon}</div>
                                <div className="flex flex-col min-w-0 relative z-10">
                                  <p className="text-[10px] font-black text-[var(--foreground)] leading-none uppercase tracking-widest truncate mb-0.5">{item.label}</p>
                                  <p className="text-[8px] text-[var(--muted)] font-bold uppercase tracking-widest truncate leading-none">{item.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* Remaining items list */}
                          <div className="flex flex-col gap-1">
                            {HEADER_CONFIG.userMenu.common.slice(6).map((item) => (
                              <Link key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} onClick={() => setUserMenuOpen(false)} className="flex items-center justify-between py-2.5 px-3 rounded-2xl bg-transparent hover:bg-[var(--card)] hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105 ${item.colorClass || "bg-[var(--foreground)]/5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:bg-[var(--accent)]/10"}`}>{item.icon}</div>
                                  <div className="flex flex-col">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[var(--foreground)] leading-none mb-0.5">{item.label}</p>
                                    <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest leading-none">{item.desc}</p>
                                  </div>
                                </div>
                                <FiChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>

                        {user?.userType === "owner" && (
                          <div className="relative mt-6 group">
                            <Link
                              href="/owner-panal"
                              onClick={() => setUserMenuOpen(false)}
                              className="relative flex items-center justify-between p-4 bg-gradient-to-r from-gray-900 to-black rounded-[2rem] overflow-hidden transition-all duration-500 shadow-xl border border-gray-800 hover:border-gray-600 hover:shadow-2xl hover:-translate-y-1"
                            >
                              {/* Sleek animated background effect */}
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
                              
                              <div className="flex items-center gap-4 relative z-10 w-full">
                                <div className="relative flex-shrink-0">
                                  <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                    <FiZap size={22} className="text-white drop-shadow-md" />
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-gray-900 shadow-sm"></span>
                                  </div>
                                </div>

                                <div className="flex flex-col min-w-0 flex-1">
                                  <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1.5 drop-shadow-sm">Admin Console</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-lg border border-purple-500/30 uppercase tracking-widest backdrop-blur-md">Elite Access</span>
                                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>Active</span>
                                  </div>
                                </div>

                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 flex items-center justify-center text-white/50 group-hover:text-white transition-all flex-shrink-0 backdrop-blur-sm">
                                  <FiChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                      </>
                    )}

                  </div>

                  {/* Drawer Footer */}
                  <div className="relative z-10 py-2 px-4 border-t border-[var(--border)] bg-[var(--foreground)]/[0.02]">
                    <div className="mt-1 mb-1 text-center text-[10px] text-[var(--foreground)] opacity-60 font-mono tracking-widest">
                      Crafted with love ❤️ by <a href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=hello big fan big fan`} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:text-violet-400 transition-colors">Tk</a>
                    </div>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>

      {showLogoutToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000] opacity-100 translate-y-0 transition-all duration-500">
          <div className="px-6 py-3 rounded-full bg-[var(--card)] border border-green-500/20 flex items-center gap-3 shadow-xl backdrop-blur-xl">
            <FiCheckCircle className="text-green-500" size={18} />
            <span className="text-xs font-bold text-[var(--foreground)]">Logout Successful</span>
          </div>
        </div>
      )}

    </header>
  );
}
