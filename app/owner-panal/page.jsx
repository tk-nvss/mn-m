"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiMenu,
  FiX,
  FiPocket,
  FiDatabase,
  FiGift,
  FiZap,
  FiUsers,
  FiKey,
  FiStar,
  FiShoppingCart,
  FiRepeat,
  FiMessageSquare,
  FiTag,
  FiImage,
  FiAward,
  FiSettings,
  FiLayout,
  FiSmartphone,
  FiFileText,
  FiShield,
  FiBarChart2,
} from "react-icons/fi";

import AuthGuard from "@/components/AuthGuard";
import UsersTab from "@/components/admin/UsersTab";
import MembershipsTab from "@/components/admin/MembershipsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import PricingTab from "@/components/admin/PricingTab";
import TransactionsTab from "@/components/admin/TransactionsTab";
import SupportQueriesTab from "@/components/admin/SupportQueriesTab";
import BannersTab from "@/components/admin/BannersTab";
import StatsTab from "@/components/admin/StatsTab";
import SettingsTab from "@/components/admin/SettingsTab";
import RedeemCodesTab from "@/components/admin/RedeemCodesTab";
import ApiKeysTab from "@/components/admin/ApiKeysTab";
import UsdtTab from "@/components/admin/UsdtTab";
import PromotionalTab from "@/components/admin/PromotionalTab";
import CoinsAdminTab from "@/components/admin/CoinsAdminTab";
import TournamentsAdminTab from "@/components/admin/TournamentsAdminTab";



import UiSettingsTab from "@/components/admin/UiSettingsTab";
import PwaStatsTab from "@/components/admin/PwaStatsTab";
import GiveawayAdminTab from "@/components/admin/GiveawayAdminTab";
import BlocklistTab from "@/components/admin/BlocklistTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";



const MENU_CATEGORIES = [
  {
    category: "Finance & Orders",
    items: [
      { id: "orders", label: "Orders", icon: FiShoppingCart },
      { id: "transactions", label: "Transactions", icon: FiRepeat },
      { id: "wallet", label: "Wallet", icon: FiPocket },
      { id: "usdt", label: "USDT", icon: FiDatabase },
    ]
  },
  {
    category: "Marketing & Engagement",
    items: [
      { id: "blogs", label: "Blogs", icon: FiFileText, href: "/owner-panal/blogs" },
      { id: "redeem", label: "Redeem Codes", icon: FiGift },
      { id: "coins", label: "Coins", icon: FiZap },
      { id: "promotional", label: "Promotional", icon: FiStar },
      { id: "banners", label: "Banners", icon: FiImage },
      { id: "tournaments", label: "Tournaments", icon: FiAward },
      { id: "analytics", label: "Analytics", icon: FiBarChart2 },
      { id: "pwa-stats", label: "PWA Stats", icon: FiSmartphone },
      { id: "giveaway", label: "Giveaway", icon: FiGift },
    ]
  },
  {
    category: "Platform Management",
    items: [
      { id: "users", label: "Users", icon: FiUsers },
      { id: "memberships", label: "Memberships", icon: FiShield },
      { id: "queries", label: "Support Queries", icon: FiMessageSquare },
      { id: "pricing", label: "Pricing", icon: FiTag },
      { id: "api-keys", label: "API Keys", icon: FiKey },
      { id: "blocklist", label: "Blocklist", icon: FiShield },
      { id: "ui-settings", label: "UI Settings", icon: FiLayout },
      { id: "settings", label: "Settings", icon: FiSettings },
    ]
  }
];

export default function AdminPanalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const [pinPrompt, setPinPrompt] = useState(true);
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const [showPin, setShowPin] = useState(false);
  const pinInputRefs = useRef([]);

  const SECRET_KEY = "bb_admin_secure_key_99";
  
  const encryptData = (text) => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(result);
  };

  const decryptData = (base64) => {
    let text = atob(base64);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  };

  const handleDigitChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal) {
      const newDigits = [...pinDigits];
      newDigits[index] = "";
      setPinDigits(newDigits);
      return;
    }

    const lastChar = cleanVal.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = lastChar;
    setPinDigits(newDigits);

    // Auto-focus next box
    if (index < 5 && lastChar) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...pinDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setPinDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    pinInputRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    // 12-hour expiration check
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth) {
      try {
        const authData = JSON.parse(decryptData(savedAuth));
        const isExpired = new Date().getTime() > authData.expiresAt;
        if (!isExpired && authData.pin) {
          setPinPrompt(false);
          // Store temporarily in sessionStorage for the interceptor
          sessionStorage.setItem("adminPin", authData.pin);
        } else {
          localStorage.removeItem("adminAuth");
        }
      } catch (e) {
        localStorage.removeItem("adminAuth");
      }
    }
    
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let [resource, config] = args;
      const currentPin = sessionStorage.getItem("adminPin") || "";
      
      if (typeof resource === 'string' && resource.includes('/api/admin')) {
        config = config || {};
        config.headers = {
          ...config.headers,
          "x-admin-pin": currentPin
        };
      }
      return originalFetch(resource, config);
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const handlePinSubmit = (e) => {
    if (e) e.preventDefault();
    const currentPin = pinDigits.join("");
    if (currentPin.length === 6) {
      const expiresAt = new Date().getTime() + (12 * 60 * 60 * 1000); // 12 hours from now
      const authData = encryptData(JSON.stringify({ pin: currentPin, expiresAt }));
      localStorage.setItem("adminAuth", authData);
      sessionStorage.setItem("adminPin", currentPin);
      setPinPrompt(false);
      window.location.reload();
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userType");
    if (role === "owner") {
      setIsOwner(true);
      setLoading(false);
    } else {
      // For extra security, verify with API
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user?.userType === "owner") {
            setIsOwner(true);
            localStorage.setItem("userType", "owner");
          } else {
            router.push("/");
          }
        })
        .catch(() => router.push("/"))
        .finally(() => setLoading(false));
    }
  }, []);

  const [queries, setQueries] = useState([]);

  const [balance, setBalance] = useState(null);
  const [banners, setBanners] = useState([]);


  /* ================= TABLE CONTROLS ================= */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  /* ================= PRICING STATE ================= */
  const [pricingType, setPricingType] = useState("admin");
  const [slabs, setSlabs] = useState([{ min: 0, max: 100, percent: 0 }]);
  const [overrides, setOverrides] = useState([]);
  const [gameConfigs, setGameConfigs] = useState([]);
  const [savingPricing, setSavingPricing] = useState(false);

  /* ================= HELPERS ================= */
  const normalizeSlabs = (list) =>
    [...list].sort((a, b) => a.min - b.min);

  const resetControls = () => {
    setSearch("");
    setPage(1);
  };


  /* ================= FETCH BALANCE ================= */
  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/game/balance");
      const data = await res.json();
      if (data.success) {
        setBalance(data?.balance?.data?.balance ?? data.balance);
      }
    } catch (err) {
      console.error("Balance fetch failed", err);
    }
  };


  const fetchBanners = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/banners/game-banners", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBanners(data.data || []);
  };




  /* ================= FETCH PRICING ================= */
  const fetchPricing = async (type) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/pricing?userType=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      setSlabs(
        data.data?.slabs?.length
          ? data.data.slabs
          : [{ min: 0, max: 0, percent: 0 }]
      );
      setOverrides(data.data?.overrides || []);
      setGameConfigs(data.data?.gameConfigs || []);
    }
  };

  /* ================= SAVE PRICING ================= */
  const savePricing = async () => {
    try {
      setSavingPricing(true);
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/pricing", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userType: pricingType,
          slabs: normalizeSlabs(slabs),
          overrides,
          gameConfigs,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed");
      } else {
        alert("Pricing updated successfully");
      }
    } finally {
      setSavingPricing(false);
    }
  };



  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    resetControls();
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === "banners") fetchBanners();
  }, [activeTab]);


  useEffect(() => {
    if (activeTab === "pricing") fetchPricing(pricingType);
  }, [activeTab, pricingType, page, search]);

  if (pinPrompt) {
    const isComplete = pinDigits.every((d) => d !== "");
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md text-white p-4">
        <form
          onSubmit={handlePinSubmit}
          className="w-full max-w-sm bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center gap-5"
        >
          {/* Key Icon */}
          <div className="w-12 h-12 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center text-[var(--accent)]">
            <Icons.key size={22} />
          </div>

          {/* Simple Text */}
          <div className="text-center space-y-1">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Admin Security PIN
            </h2>
            <p className="text-xs text-neutral-400">
              Enter your 6-digit PIN to continue
            </p>
          </div>

          {/* 6 Digit Inputs */}
          <div className="space-y-3 w-full">
            <div className="flex items-center justify-center gap-2" onPaste={handlePinPaste}>
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (pinInputRefs.current[idx] = el)}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className={`w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-bold rounded-xl bg-neutral-950 border transition-colors outline-none ${
                    digit
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-neutral-800 text-white focus:border-[var(--accent)]"
                  }`}
                />
              ))}
            </div>

            {/* Toggle & Clear */}
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                {showPin ? <Icons.eyeOff size={14} /> : <Icons.eye size={14} />}
                <span>{showPin ? "Hide PIN" : "Show PIN"}</span>
              </button>

              {pinDigits.some((d) => d !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setPinDigits(["", "", "", "", "", ""]);
                    pinInputRefs.current[0]?.focus();
                  }}
                  className="hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Unlock Button */}
          <button
            aria-label="button"
            type="submit"
            disabled={!isComplete}
            className="w-full py-3 rounded-xl bg-[var(--accent)] text-black font-bold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="xl" color="accent" />
      </div>
    );
  }

  if (!isOwner) return null;

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] px-2 sm:px-6 py-3">
        <div className="w-full max-w-[1600px] mx-auto">
          {/* HEADER & BALANCE (COMPACT) */}
          <div className="mb-3 flex items-center justify-between gap-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 md:p-4">
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xs md:text-sm font-black tracking-widest text-[var(--foreground)] truncate uppercase italic">
                  Admin Panel
                </h1>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0 animate-pulse" />
              </div>
              
              {/* BALANCE BELOW TEXT */}
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-[var(--muted)] font-black">Balance:</span>
                <span className="text-xs md:text-sm font-black text-[var(--foreground)] tabular-nums">
                  {balance !== null ? balance : "---"} USD
                </span>
                <span className="text-[7px] md:text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded-md ml-1">
                  Active
                </span>
              </div>
            </div>

            <button aria-label="button" 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--foreground)]/5 hover:border-[var(--accent)]/30 transition-all group shrink-0"
            >
              <FiMenu size={16} className="text-[var(--foreground)] group-active:scale-95 transition-transform" />
            </button>
          </div>


          {/* HAMBURGER SIDEBAR SLIDER MENU */}
          <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setIsSidebarOpen(false)}
          />
          <div
            className={`fixed left-0 top-0 h-[100dvh] w-[85%] max-w-[320px] bg-[var(--background)] border-r border-[var(--border)] z-[2001] shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 ease-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                <h2 className="text-base font-black tracking-widest uppercase text-[var(--foreground)]">Admin Menu</h2>
              </div>
              <button aria-label="button" 
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--foreground)]/5 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
              
              {/* BALANCE WIDGET INSIDE SIDEBAR */}
              <div className="p-5 border-b border-[var(--border)] bg-[var(--card)]/30">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Account Balance</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[var(--foreground)]">
                      {balance !== null ? balance : "Loading…"}
                    </span>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">
                      Available
                    </span>
                  </div>
                </div>
              </div>

              {/* CATEGORIZED MENU WITH ICONS */}
              <div className="px-3 py-2 space-y-4 mt-1">
                {MENU_CATEGORIES.map((category) => (
                  <div key={category.category} className="space-y-1.5">
                    <h3 className="px-2 pb-1 text-[9px] font-black uppercase tracking-[0.1em] text-[var(--muted)]/70">
                      {category.category}
                    </h3>
                    <div className="space-y-0.5">
                      {category.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                          <button aria-label="button"
                            key={item.id}
                            onClick={() => {
                              if (item.href) {
                                router.push(item.href);
                              } else {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                              }
                            }}
                            className={`
                              w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all tracking-wide group
                              ${isActive 
                                ? "bg-[var(--accent)]/10 text-[var(--accent)]" 
                                : "text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]"
                              }
                            `}
                          >
                            <div className={`
                              flex items-center justify-center w-6 h-6 rounded-md transition-colors
                              ${isActive ? "bg-[var(--accent)] text-white shadow-sm shadow-[var(--accent)]/30" : "bg-[var(--foreground)]/5 group-hover:bg-[var(--foreground)]/10"}
                            `}>
                              <Icon size={12} />
                            </div>
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
            </div>
            
            <div className="p-4 border-t border-[var(--border)] text-center text-[10px] font-bold text-[var(--muted)]/50 uppercase tracking-widest">
              Blue Buff Admin Console
            </div>
          </div>



          {/* PANEL */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6">
            {activeTab === "wallet" && <StatsTab />}
            {activeTab === "usdt" && <UsdtTab />}
            {activeTab === "redeem" && <RedeemCodesTab />}
            {activeTab === "coins" && <CoinsAdminTab />}
            {activeTab === "users" && (
              <UsersTab />
            )}
            
            {activeTab === "memberships" && (
              <MembershipsTab />
            )}

            {activeTab === "api-keys" && (
              <ApiKeysTab />
            )}

            {activeTab === "promotional" && (
              <PromotionalTab />
            )}

            {activeTab === "orders" && (
              <OrdersTab

              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab />
            )}

            {activeTab === "queries" && (
              <SupportQueriesTab

              />
            )}
            {activeTab === "banners" && (
              <BannersTab banners={banners} onRefresh={fetchBanners} />
            )}


            {activeTab === "pricing" && (
              <PricingTab
                pricingType={pricingType}
                setPricingType={setPricingType}
                slabs={slabs}
                setSlabs={setSlabs}
                overrides={overrides}
                setOverrides={setOverrides}
                gameConfigs={gameConfigs}
                setGameConfigs={setGameConfigs}
                savingPricing={savingPricing}
                onSave={savePricing}
              />
            )}
            {activeTab === "tournaments" && (
              <TournamentsAdminTab />
            )}
            {activeTab === "ui-settings" && (
              <UiSettingsTab />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab />
            )}
            {activeTab === "pwa-stats" && (
              <PwaStatsTab />
            )}
            {activeTab === "giveaway" && (
              <GiveawayAdminTab />
            )}
            {activeTab === "blocklist" && (
              <BlocklistTab />
            )}
            {activeTab === "settings" && (
              <SettingsTab />
            )}
          </div>


        </div>
      </section>
    </AuthGuard>
  );
}
