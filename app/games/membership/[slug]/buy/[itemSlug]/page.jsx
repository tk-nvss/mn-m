"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/components/icons";
import { LoadingSpinner } from "@/components/common";

import AuthGuard from "@/components/AuthGuard";
import ValidationStep from "./ValidationStep";
import ReviewAndPaymentStep from "./ReviewAndPaymentStep";
import { saveVerifiedPlayer } from "@/utils/storage/verifiedPlayerStorage";
import { useAuthStore } from "@/store/useAuthStore";

function BuyFlowContent() {
  const { slug, itemSlug } = useParams();
  const params = useSearchParams();

  const [step, setStep] = useState(1);
  const [playerId, setPlayerId] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showSuccess, setShowSuccess] = useState(false);

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const { walletBalance, setWalletBalance, user } = useAuthStore();

  /* ================= LOAD USER DATA ================= */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (user) {
      setUserEmail(user.email || "");
      setUserPhone(user.phone || "");
    }
  }, [user]);

  /* ================= ITEM DATA ================= */
  const itemName = params.get("name") || "";
  const price = Number(params.get("price") || 0);
  const discount = Number(params.get("discount") || 0);
  const totalPrice = price - discount;
  const itemImage = params.get("image") || "";

  /* ================= VALIDATION ================= */
  const handleValidate = () => {
    if (!playerId) {
      alert("Please enter Character ID");
      return;
    }

    saveVerifiedPlayer({
      playerId,
      zoneId: "",
      username: "Player",
      region: "INDIA",
      savedAt: Date.now(),
    });

    setReviewData({
      userName: "Player",
      region: "INDIA",
      playerId,
      zoneId: "",
    });

    setStep(2);
  };

  /* ================= PAYMENT COMPLETE ================= */
  const handlePayment = async () => {
    setTimeout(() => {
      setShowSuccess(true);
      window.scrollTo(0, 0);
    }, 500);
  };

  return (
    <AuthGuard>
      <section className="min-h-screen px-4 pt-2 pb-12 md:pt-4 md:pb-16 bg-gradient-to-b from-[var(--background)] to-[var(--card)]/20">
        <div className="max-w-4xl mx-auto">

          {/* ================= HEADER & PROGRESS ================= */}
          <div className="mb-4 relative">
            <div className="max-w-md mx-auto px-6">
              <div className="flex items-center justify-between relative text-center">
                {/* Progress Line Background */}
                <div className="absolute top-[20px] left-0 w-full h-[1.5px] bg-[var(--border)]/10 -z-10" />

                {/* Animated Progress Line */}
                <div className="absolute top-[20px] left-0 w-full h-[1.5px] -z-10">
                  <motion.div
                    className="h-full bg-[var(--accent)] shadow-[0_0_15px_var(--accent)]"
                    initial={{ width: "0%" }}
                    animate={{
                      width: step === 1 ? "0%" : step === 2 ? "50%" : "100%"
                    }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                  />
                </div>

                {/* Steps */}
                {[
                  { id: 1, label: "Verify", icon: Icons.userCheck },
                  { id: 2, label: "Confirm", icon: Icons.shoppingBag },
                  { id: 3, label: "Pay", icon: Icons.creditCard },
                ].map((s) => {
                  const isActive = step === s.id;
                  const isCompleted = step > s.id;

                  return (
                    <div key={s.id} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        {/* Elegant Active Glow */}
                        {isActive && (
                          <motion.div
                            layoutId="step-glow"
                            className="absolute -inset-1.5 bg-[var(--accent)]/15 blur-md rounded-full"
                          />
                        )}

                        <motion.div
                          animate={{
                            scale: isActive ? 1.05 : 1,
                            borderColor: isActive || isCompleted ? "var(--accent)" : "rgba(255,255,255,0.05)"
                          }}
                          className={`
                            w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 relative z-10 backdrop-blur-md
                            ${isCompleted
                              ? "bg-[var(--accent)] text-[var(--background)] shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]"
                              : isActive
                                ? "bg-[var(--foreground)] text-[var(--background)] shadow-xl border-[var(--foreground)]/20"
                                : "bg-[var(--foreground)]/[0.03] text-[var(--muted)] border-[var(--foreground)]/5"
                            }
                          `}
                        >
                          {isCompleted ? (
                            <Icons.check className="text-base stroke-[3]" />
                          ) : (
                            <s.icon className={`text-base ${isActive ? "opacity-100" : "opacity-30"}`} />
                          )}
                        </motion.div>
                      </div>

                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive || isCompleted ? "text-[var(--foreground)] opacity-100" : "text-[var(--muted)] opacity-20"}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">

            {/* ================= ITEM SUMMARY CARD ================= */}
            {itemName && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/3 order-1 md:order-2"
              >
                <div className="sticky top-24 bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--foreground)]/5 rounded-2xl p-3.5 shadow-2xl overflow-hidden relative group/card">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--accent)]/10 blur-2xl rounded-full transition-transform duration-700 group-hover/card:scale-150" />

                  <div className="flex items-center gap-3.5">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[var(--foreground)]/10 shrink-0 group">
                      {itemImage && (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                        <h3 className="text-[9px] font-[900] uppercase tracking-[0.2em] text-[var(--muted)]/80 italic">
                          Pack Details
                        </h3>
                      </div>
                      <h4 className="font-[900] text-[13px] leading-tight uppercase tracking-tight truncate text-[var(--foreground)]/90 mb-1">{itemName}</h4>

                      <div className="flex items-end gap-2">
                        <span className="text-lg font-[900] text-[var(--accent)] leading-none">₹{totalPrice}</span>
                        {discount > 0 && (
                          <span className="text-[10px] font-bold text-[var(--muted)]/50 line-through decoration-red-500/30 pb-0.5">
                            ₹{price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ================= MAIN FORM STEPS ================= */}
            <div className="w-full md:w-2/3 order-2 md:order-1">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center backdrop-blur-sm"
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                      <Icons.check className="text-4xl text-white" />
                    </div>
                    <h2 className="text-3xl font-[900] text-green-400 mb-2 uppercase tracking-tight">Payment successful!</h2>
                    <p className="text-[var(--muted)] max-w-sm mx-auto mb-8 font-medium">
                      Verification complete. Your order has been placed.
                    </p>
                    <button aria-label="button"
                      onClick={() => window.location.href = "/"}
                      className="px-8 py-3 bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white border border-[var(--border)] hover:border-[var(--accent)] rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                      Return Home
                    </button>
                  </motion.div>
                ) : (
                  step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] rounded-[2rem] p-5 md:p-6 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -z-10" />
                      <ValidationStep
                        playerId={playerId}
                        setPlayerId={setPlayerId}
                        onValidate={handleValidate}
                        label="Character ID"
                        placeholder="Enter Character ID"
                        loading={false}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-[var(--card)]/40 backdrop-blur-md border border-[var(--border)] rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -z-10" />
                      {(step === 2 || step === 3) && reviewData && (
                        <ReviewAndPaymentStep
                          step={step}
                          setStep={setStep}
                          itemName={itemName}
                          itemImage={itemImage}
                          price={price}
                          discount={discount}
                          totalPrice={totalPrice}
                          userEmail={userEmail}
                          userPhone={userPhone}
                          reviewData={reviewData}
                          walletBalance={walletBalance}
                          paymentMethod={paymentMethod}
                          setPaymentMethod={setPaymentMethod}
                          onPaymentComplete={handlePayment}
                          slug={slug}
                          itemSlug={itemSlug}
                        />
                      )}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </AuthGuard>
  );
}

export default function BuyFlowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <LoadingSpinner size="lg" color="accent" />
      </div>
    }>
      <BuyFlowContent />
    </Suspense>
  );
}
