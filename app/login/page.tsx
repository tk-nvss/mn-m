"use client";

import { useState, useEffect } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiZap,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiMail,
  FiShieldOff
} from "react-icons/fi";
import { useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import { Suspense, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { LoadingSpinner } from "@/components/common";



function AuthContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpField, setShowOtpField] = useState(false);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus last filled or next input
      const nextIndex = Math.min(index + pastedData.length, 5);
      otpInputs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const handleGoogleLogin = async (credential: string) => {
    if (loading) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/api/auth/google", { token: credential });
      if (!data.success) {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }
      saveSession(data);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your Gmail address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/otp/send", { email });
      if (data.success) {
        setSuccess("Check your Gmail for the code");
        setShowOtpField(true);
      } else {
        setError(data.message);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Could not send code. Try again.";
      setError(errorMessage);
    }
    setLoading(false);
  };
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/otp/verify", { email, otp: otp.join("") });
      if (data.success) {
        saveSession(data);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Authentication failed");
    }
    setLoading(false);
  };

  const saveSession = (data: any) => {
    useAuthStore.getState().login(data.token, data.user);
    setUserName(data.user.name);
    setSuccess("done");
    setTimeout(() => window.location.replace(redirectPath), 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-24 sm:pt-32 px-4 overflow-hidden bg-[var(--background)]">
      {/* AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--accent-rgb),0.15),transparent_70%)] opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-20" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <div className="w-full relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="px-6 pb-4 sm:px-8 sm:pb-4"
          >
            {/* HEADER */}
            <div className="flex flex-col items-center text-center mb-2">
              <motion.div
                variants={itemVariants}
                className="relative mb-4"
              >
                <div className="absolute inset-0 bg-[var(--accent)] blur-2xl opacity-10" />
                <div className="relative flex justify-center">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={86}
                    height={86}
                    className="relative z-10"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[var(--foreground)] to-[var(--foreground)]/60 drop-shadow-sm">
                  {showOtpField ? "Enter Your Code" : "Login"}
                </h1>
                <p className="text-xs font-medium text-[var(--muted)]/80 tracking-wide uppercase">
                  {showOtpField ? "Enter the code we sent to your email" : "Sign in to your account"}
                </p>
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              {success && success !== "done" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-center"
                >
                  <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={14} />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{success}</span>
                </motion.div>
              )}

              {success === "done" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-500 text-white flex items-center justify-center gap-2 text-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  <FiCheckCircle size={20} />
                  <span className="text-sm font-black uppercase tracking-widest">You're In! Redirecting...</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-center"
                >
                  <FiAlertCircle className="text-red-500 flex-shrink-0" size={14} />
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION AREA */}
            {success !== "done" && (
              <motion.div variants={containerVariants} className="space-y-4">

                {/* GMAIL OTP SECTION */}
                <motion.form
                  variants={itemVariants}
                  onSubmit={showOtpField ? handleOtpVerify : handleSendOtp}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center text-[var(--muted)] pointer-events-none group-focus-within:text-[var(--accent)] transition-colors">
                        <FiMail size={18} />
                      </div>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={showOtpField}
                        className={`w-full bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-2xl pl-12 pr-5 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] transition-all placeholder:text-[var(--muted)]/50 ${showOtpField ? "opacity-50" : ""}`}
                      />
                      {showOtpField && (
                        <button aria-label="button"
                          type="button"
                          onClick={() => { setShowOtpField(false); setOtp(["", "", "", "", "", ""]); setSuccess(""); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-[var(--accent)] hover:underline"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {showOtpField && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="overflow-hidden space-y-4"
                        >
                          <div className="grid grid-cols-6 gap-2">
                            {otp.map((digit, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <input
                                  ref={(el) => {
                                    otpInputs.current[idx] = el;
                                  }}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(idx, e)}
                                  required
                                  autoFocus={idx === 0}
                                  className="w-full aspect-square text-center bg-[var(--foreground)]/[0.03] border border-[var(--border)] rounded-xl text-xl font-black focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all shadow-sm"
                                />
                              </motion.div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center px-1">
                            <p className="text-[10px] text-[var(--muted)]/60 font-medium italic">Didn't get it?</p>
                            <button aria-label="button" type="button" onClick={() => handleSendOtp()} className="text-[10px] font-black uppercase text-[var(--accent)] hover:text-[var(--foreground)] transition-colors">Resend Code</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                    <button aria-label="button"
                      type="submit"
                      disabled={loading}
                      className="w-full relative overflow-hidden group/btn bg-[var(--accent)] text-white font-black uppercase tracking-widest py-3 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_-5px_rgba(var(--accent-rgb),0.3)]"
                    >
                    {loading ? (
                      <LoadingSpinner size="md" color="white" />
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center gap-2">
                          {showOtpField ? (
                            <>Verify & Login <FiCheckCircle className="text-lg" /></>
                          ) : (
                            <>Send OTP <FiZap className="text-lg" /></>
                          )}
                        </span>
                      </>
                    )}
                  </button>
                </motion.form>

                {/* DIVIDER */}
                <div className="relative flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-[var(--border)]/30" />
                  <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Or sign in with</span>
                  <div className="h-[1px] flex-1 bg-[var(--border)]/30" />
                </div>

                {/* GOOGLE SECTION (Always Available) */}
                 <motion.div variants={itemVariants} className={`relative flex justify-center w-full ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="w-full max-w-xs transition-transform hover:scale-[1.02] active:scale-[0.98] relative group">
                    <div className="relative flex justify-center w-full">
                      <GoogleLogin
                        onSuccess={(res) => res.credential && handleGoogleLogin(res.credential)}
                        onError={() => setError("Connection Failed")}
                        theme="filled_black"
                        size="large"
                        shape="pill"
                        width="300"
                        text="signin_with"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* TERMS & CONDITIONS */}
                <motion.div variants={itemVariants} className="pt-6 text-center">
                  <p className="text-[10px] text-[var(--muted)]/60 font-medium">
                    By logging in, you agree to our <br className="sm:hidden" />
                    <Link href="/terms" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors font-bold">Terms & Conditions</Link>
                    {" "}and{" "}
                    <Link href="/privacy" className="text-[var(--foreground)] hover:text-[var(--accent)] transition-colors font-bold">Privacy Policy</Link>
                  </p>
                </motion.div>              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default function AuthPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <Suspense fallback={null}>
        <AuthContent />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
