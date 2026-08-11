"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  FiCheck, FiShoppingBag, FiCreditCard, FiUserCheck, FiLoader,
  FiArrowLeft, FiUser, FiGlobe, FiInfo, FiChevronRight, FiSmartphone,
  FiShield, FiArrowRight, FiCheckCircle, FiSearch
} from "react-icons/fi";

import AuthGuard from "@/components/AuthGuard";
import HelpImagePopup from "../../../../../components/HelpImage/HelpImagePopup";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";
import { BuyFlowSkeleton } from "@/components/Skeleton/BuyFlowSkeleton";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

function BuyFlowContent() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();
  const router = useRouter();

  /* ================= STATE ================= */
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [verifiedAccount, setVerifiedAccount] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const { walletBalance, setWalletBalance, user } = useAuthStore();

  /* ================= GAME & ITEMS STATE ================= */
  const [game, setGame] = useState(null);
  const [item, setItem] = useState(null);
  const [otherItems, setOtherItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  /* ================= FALLBACK DISPLAY PARAMS ================= */
  const fallbackName = params.get("name");
  const fallbackImage = params.get("image");

  /* ================= LOAD USER DATA ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setUserEmail(user.email || "");
      setUserPhone(user.phone || "");
    }
  }, [user]);

  /* ================= FETCH GAME & ITEMS ================= */
  useEffect(() => {
    if (!slug || !itemSlug) return;

    setIsFetching(true);
    api.get(`/api/games/${slug}`)
      .then((res) => res.data)
      .then((data) => {
        const gameData = data?.data;
        if (!gameData) {
          setIsFetching(false);
          return;
        }

        const foundItem = gameData.itemId.find(
          (i) => i.itemSlug === itemSlug
        );

        if (!foundItem) {
          setError("This item was not found.");
          setIsFetching(false);
          return;
        }

        setGame(gameData);
        setItem(foundItem);
        setOtherItems(gameData.itemId);
        setIsFetching(false);
      })
      .catch(() => setIsFetching(false));
  }, [slug, itemSlug]);

  /* ================= LABELS & OPTIONS ================= */
  const fieldOneLabel = game?.inputFieldOne || "Player ID";
  const fieldTwoLabel = game?.inputFieldTwo || "Zone ID";

  const gameWithOptions = useMemo(() => {
    if (!game) return null;
    return {
      ...game,
      inputFieldTwoOptions: game?.inputFieldTwoOptions?.length > 0
        ? game.inputFieldTwoOptions
        : (slug?.includes("genshin-impact")
          ? [
            { label: "America", value: "america" },
            { label: "Asia", value: "asia" },
            { label: "Europe", value: "europe" },
            { label: "TW_HK_MO", value: "tw_hk_mo" },
          ]
          : slug?.includes("wuthering-of-waves")
            ? [
              { label: "America", value: "america" },
              { label: "Asia", value: "asia" },
              { label: "Europe", value: "europe" },
              { label: "SEA", value: "sea" },
            ]
            : [])
    };
  }, [game, slug]);

  /* ================= VALIDATION LOGIC ================= */
  const handleValidate = async () => {
    setError("");
    if (!playerId || (gameWithOptions?.inputFieldTwo && !zoneId)) {
      setError(`Please enter your ${fieldOneLabel}${gameWithOptions?.inputFieldTwo ? ` and ${fieldTwoLabel}` : ""}`);
      return;
    }

    setLoading(true);

    const name = game?.gameName?.toLowerCase() || "";
    const isMLBB = slug.includes("mlbb") || name.includes("mlbb") || slug.includes("legends988") || slug.includes("weeklymonthly-bundle");

    if (game?.isValidationRequired === false && !isMLBB) {
      setVerifiedAccount({
        userName: game?.gameName || "Player",
        region: "Global",
        playerId,
        zoneId,
      });
      setLoading(false);
      return;
    }

    try {
      const baseGameId = game?.gameId || slug;
      const productId = `${baseGameId}_${item?.itemId || itemSlug}`;

      const { data: nameData } = await api.post("/api/check-region/namecheck", {
        productId,
        playerId,
        zoneId: zoneId || "NA",
      });

      if (
        (nameData?.success === 200 || nameData?.success === true) &&
        (nameData?.data?.username || nameData?.data?.name) &&
        nameData?.data?.valid !== false
      ) {
        const username = nameData?.data?.username || nameData?.data?.name || "Unknown";
        const region = nameData?.data?.region || "Global";

        if (isMLBB) {
          const restrictedRegions = ["INDO", "ID", "PH", "SG", "RU", "MY", "MM"];
          if (restrictedRegions.includes(region.toUpperCase())) {
            setError(`Sorry, we don't support orders from ${region} region for this item.`);
            setLoading(false);
            return;
          }
        }

        saveVerifiedPlayer({ playerId, zoneId, username, region, savedAt: Date.now() });
        setVerifiedAccount({ userName: username, region, playerId, zoneId });
        setLoading(false);
      } else {
        const serverMsg = nameData?.message || "Player not found";
        setError(serverMsg.toLowerCase().includes("success") ? "Player ID not found." : serverMsg);
        setLoading(false);
      }
    } catch (err) {
      console.error("Validation Error:", err);
      setError("Validation failed. Please try again.");
      setLoading(false);
    }
  };

  /* ================= PAYMENT LOGIC ================= */
  const handleProceed = async () => {
    if (!verifiedAccount) {
      setError("Please verify your account first.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderPayload = {
        gameSlug: slug,
        itemSlug,
        itemName: item?.itemName || fallbackName,
        playerId: verifiedAccount.playerId,
        playerName: verifiedAccount.userName || "Unknown",
        zoneId: verifiedAccount.zoneId,
        paymentMethod,
        email: userEmail || null,
        phone: userPhone || localStorage.getItem("phone"),
        currency: "INR",
      };

      const { data } = await api.post("/api/order/create-gateway-order", orderPayload);

      if (!data.success) {
        setError(data.message || "Order creation failed.");
        setIsProcessing(false);
        return;
      }

      if (data.walletPayment) {
        setWalletBalance(data.newWalletBalance);
        localStorage.setItem("pending_topup_order", data.orderId);
        window.location.href = `/payment/topup-complete?orderId=${data.orderId}&wallet=true`;
        return;
      }

      localStorage.setItem("pending_topup_order", data.orderId);
      window.location.href = data.paymentUrl;
    } catch (err) {
      console.error("Order Error:", err);
      setError("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  if (isFetching) {
    return (
      <section className="min-h-screen bg-[var(--background)] pt-12">
        <BuyFlowSkeleton />
      </section>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
        <div className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
            <FiCheck className="text-4xl text-white" />
          </div>
          <h2 className="text-3xl font-[900] text-[var(--foreground)] mb-2 uppercase tracking-tight">Order Placed!</h2>
          <p className="text-[var(--muted)] mb-8 font-medium">Your request is being processed. We'll top up your account soon.</p>
          <button aria-label="button" onClick={() => router.push("/")} className="w-full py-4 bg-[var(--accent)] text-black font-[900] uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_var(--accent)] transition-all">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <section className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pt-2 pb-16 px-2 sm:px-4">
        <div className="max-w-5xl mx-auto">

          {/* BACK BUTTON */}
          <button aria-label="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[var(--accent)] font-black uppercase tracking-widest text-[9px] mb-4 hover:opacity-70 transition-opacity"
          >
            <FiArrowLeft className="text-base" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: ITEM HERO & MORE PACKS */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-4">

              {/* HERO CARD */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-5 sm:p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-[60px] -z-0" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 sm:gap-6 text-left">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0">
                      <div className="absolute inset-0 bg-[var(--accent)]/10 rounded-2xl blur-2xl group-hover:bg-[var(--accent)]/20 transition-all duration-500" />
                      <img
                        src={item?.itemImageId?.image || fallbackImage || ""}
                        alt={item?.itemName || fallbackName}
                        className="relative z-10 w-full h-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--accent)]/10 rounded-full">
                        <div className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                        <span className="text-[8px] font-black text-[var(--accent)] uppercase tracking-widest">Instant Delivery</span>
                      </div>

                      <h1 className="text-xl sm:text-2xl font-[1000] text-[var(--foreground)] leading-none tracking-tighter uppercase truncate">
                        {item?.itemName || fallbackName}
                      </h1>


                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-xl sm:text-2xl font-[1000] text-[var(--accent)]">₹{item?.sellingPrice || 0}</span>
                        {item?.dummyPrice > item?.sellingPrice && (
                          <span className="text-[10px] font-bold text-[var(--muted)] line-through">₹{item.dummyPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACKGROUND DECOR */}
                <div className="absolute bottom-2 right-2 opacity-[0.03]">
                  <FiShoppingBag className="text-6xl text-[var(--foreground)]" />
                </div>
              </div>

              {/* TIER PRICES CARD REMOVED AS PER REQUEST */}

              {/* MORE PACKS */}
              {otherItems.length > 0 && (
                <div className="space-y-3 px-1">
                  <div className="flex items-center gap-2">
                    <FiShoppingBag className="text-[var(--accent)] text-lg" />
                    <h2 className="text-[10px] font-[1000] uppercase tracking-[0.2em] text-[var(--foreground)]">More packs you may like</h2>
                  </div>

                  <div className="flex lg:grid lg:grid-cols-4 items-center gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 -mx-2 lg:mx-0 px-2 lg:px-0 scrollbar-hide no-scrollbar">
                    {otherItems.map((oi) => {
                      const isActive = oi.itemSlug === itemSlug;
                      return (
                        <button aria-label="button"
                          key={oi._id}
                          onClick={() => router.push(`/games/${slug}/buy/${oi.itemSlug}`)}
                          className={`
                            p-3 rounded-2xl transition-all text-left group min-w-[120px] lg:min-w-0 shrink-0 border-2 relative
                            ${isActive
                              ? "bg-[var(--accent)]/5 border-[var(--accent)] shadow-sm"
                              : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--accent)]/30 hover:shadow-md"}
                          `}
                        >
                          {isActive && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in-50">
                              <FiCheck size={10} strokeWidth={4} />
                            </div>
                          )}
                          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 truncate ${isActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--foreground)]"}`}>
                            {oi.itemName}
                          </p>
                          <p className={`text-sm font-[1000] ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"}`}>₹{oi.sellingPrice}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: FORM & PAYMENT */}
            <div className="lg:col-span-7 space-y-5">

              {/* 1. PLAYER INFO CARD */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-5 sm:p-7 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 bg-[var(--accent)] rounded-full" />
                    <h2 className="text-xl font-[1000] text-[var(--foreground)] uppercase tracking-tight italic">1. Player Info</h2>
                  </div>
                  <HelpImagePopup />
                </div>

                <div className="space-y-5">
                  {/* INPUTS */}
                  <div className={`grid gap-3 ${gameWithOptions?.inputFieldTwo ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors">
                        <FiUser className="text-lg" />
                      </div>
                      <input
                        type="text"
                        placeholder={fieldOneLabel}
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 rounded-xl py-3 pl-11 pr-3 font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)] text-sm"
                      />
                    </div>

                    {gameWithOptions?.inputFieldTwo && (
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors z-10 pointer-events-none">
                          <FiGlobe className="text-lg" />
                        </div>
                        {gameWithOptions?.inputFieldTwoOptions?.length > 0 ? (
                          <select
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 rounded-xl py-3 pl-11 pr-3 font-bold text-[var(--foreground)] outline-none transition-all appearance-none cursor-pointer text-sm"
                          >
                            <option value="">{fieldTwoLabel}</option>
                            {gameWithOptions.inputFieldTwoOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={fieldTwoLabel}
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            className="w-full bg-[var(--background)] border border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 rounded-xl py-3 pl-11 pr-3 font-bold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted)] text-sm"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* CHECK ACCOUNT BUTTON */}
                  <div className="space-y-3">
                    <button aria-label="button"
                      onClick={handleValidate}
                      disabled={loading || !playerId}
                      className="w-full py-3.5 bg-[var(--accent)] text-white font-[1000] uppercase tracking-[0.2em] italic text-[11px] rounded-xl hover:shadow-[0_10px_20px_rgba(var(--accent-rgb),0.3)] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <FiLoader className="animate-spin text-base" /> : <><FiSearch className="text-base" /> Check Name</>}
                    </button>

                    {/* ERROR MESSAGE */}
                    {error && (
                      <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold px-2">
                        <FiInfo /> {error}
                      </div>
                    )}

                    {/* VERIFIED DISPLAY */}
                    {verifiedAccount && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                            <FiCheck className="text-xl" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none mb-1">Account Verified</p>
                            <p className="text-lg font-[1000] text-[var(--foreground)] leading-tight uppercase italic">{verifiedAccount.userName}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RECENT PLAYERS */}
                  <div className="pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <FiUserCheck className="text-[var(--accent)] text-lg" />
                        <h3 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Recent Players</h3>
                      </div>
                      <button aria-label="button"
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest hover:opacity-70 transition-opacity"
                      >
                        {showSuggestions ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Integrated Recent List */}
                    {showSuggestions && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <RecentVerifiedPlayers
                          limit={3}
                          onSelect={(p) => {
                            setPlayerId(p.playerId);
                            setZoneId(p.zoneId);
                            setVerifiedAccount(null); // Force re-verify for safety or just keep it
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. PAYMENT CARD */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-5 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-1 h-5 bg-[var(--accent)]/30 rounded-full" />
                  <h2 className="text-xl font-[1000] text-[var(--foreground)] uppercase tracking-tight italic opacity-40">2. Payment</h2>
                </div>

                <div className="space-y-3.5">
                  {/* PAYMENT METHOD SELECTION */}
                  <div
                    onClick={() => setPaymentMethod("upi")}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group
                      ${paymentMethod === "upi" ? "bg-[var(--background)] border-[var(--accent)] shadow-md" : "bg-[var(--background)]/50 border-[var(--border)] hover:border-[var(--accent)]/30"}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                        ${paymentMethod === "upi" ? "bg-[var(--accent)] text-white" : "bg-[var(--background)] text-[var(--muted)]"}
                      `}>
                        <FiSmartphone className="text-xl" />
                      </div>
                      <div>
                        <h4 className="font-[1000] text-[var(--foreground)] uppercase tracking-tight text-sm">UPI Gateway</h4>
                        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">GPay, PhonePe, Paytm</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${paymentMethod === "upi" ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--border)]"}
                    `}>
                      {paymentMethod === "upi" && <FiCheck className="text-[10px] stroke-[3]" />}
                    </div>
                  </div>

                  {walletBalance > 0 && (
                    <div
                      onClick={() => setPaymentMethod("wallet")}
                      className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group
                        ${paymentMethod === "wallet" ? "bg-[var(--background)] border-[var(--accent)] shadow-md" : "bg-[var(--background)]/50 border-[var(--border)] hover:border-[var(--accent)]/30"}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                          ${paymentMethod === "wallet" ? "bg-[var(--accent)] text-white" : "bg-[var(--background)] text-[var(--muted)]"}
                        `}>
                          <FiCreditCard className="text-2xl" />
                        </div>
                        <div>
                          <h4 className="font-[1000] text-[var(--foreground)] uppercase tracking-tight">My Wallet</h4>
                          <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Balance: ₹{walletBalance}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${paymentMethod === "wallet" ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--border)]"}
                      `}>
                        {paymentMethod === "wallet" && <FiCheck className="text-sm stroke-[3]" />}
                      </div>
                    </div>
                  )}

                  {/* FINAL CHECKOUT SUMMARY */}
                  <div className="pt-6 mt-4">
                    {verifiedAccount && (
                      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 mb-4 space-y-2 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Selected Item</span>
                          <span className="text-[11px] font-[1000] text-[var(--foreground)] uppercase italic truncate ml-4">{item?.itemName}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-[var(--border)] opacity-50 pt-2">
                          <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Player ID</span>
                          <span className="text-[11px] font-[1000] text-[var(--foreground)] tracking-tight">{verifiedAccount.playerId}</span>
                        </div>
                        {verifiedAccount.zoneId && (
                          <div className="flex justify-between items-center border-t border-[var(--border)] opacity-50 pt-2">
                            <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Server / Zone</span>
                            <span className="text-[11px] font-[1000] text-[var(--foreground)] tracking-tight">{verifiedAccount.zoneId}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6 px-2">
                      <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Total Amount</span>
                      <span className="text-3xl font-[1000] text-[var(--foreground)] tracking-tighter italic">₹{item?.sellingPrice || 0}</span>
                    </div>

                    <button aria-label="button"
                      onClick={handleProceed}
                      disabled={isProcessing || !verifiedAccount}
                      className={`w-full py-5 rounded-[1.5rem] font-[1000] uppercase tracking-[0.2em] italic text-sm transition-all flex items-center justify-center gap-3
                        ${isProcessing || !verifiedAccount
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-[var(--accent)] text-white hover:shadow-[0_15px_30px_rgba(var(--accent-rgb),0.3)] hover:-translate-y-1"}
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <FiLoader className="animate-spin text-xl" />
                          Processing
                        </>
                      ) : (
                        <>
                          Confirm & Pay
                          <FiArrowRight className="text-xl" />
                        </>
                      )}
                    </button>

                    {!verifiedAccount && (
                      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 animate-pulse">
                        Please verify account to proceed
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .animate-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AuthGuard>
  );
}

export default function BuyFlowPage() {
  return (
    <Suspense fallback={
      <section className="min-h-screen bg-[var(--background)] pt-12">
        <BuyFlowSkeleton />
      </section>
    }>
      <BuyFlowContent />
    </Suspense>
  );
}
