"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Icons } from "@/components/icons";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export default function ReviewAndPaymentStep({
  game,
  step,
  setStep,
  itemName,
  itemImage,
  price,
  discount,
  totalPrice,
  userEmail,
  userPhone,
  reviewData,
  walletBalance,
  paymentMethod,
  setPaymentMethod,
  onPaymentComplete,
  slug,
  itemSlug,
}) {
  const fieldOneLabel = game?.inputFieldOne || "Player ID";
  const fieldTwoLabel = game?.inputFieldTwo || "Zone ID";

  const isManual = game?.isValidationRequired === false;
  const [upiQR, setUpiQR] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Generate UPI QR
  const handleUPI = async () => {
    setPaymentMethod("upi");

    const upiId = "yourupi@bank";
    const upiString = `upi://pay?pa=${upiId}&pn=YourStore&am=${totalPrice}&cu=INR`;

    const qr = await QRCode.toDataURL(upiString);
    setUpiQR(qr);
  };

  // Handle proceed to payment
  const handleProceed = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    setIsRedirecting(true);

    try {
      const storedPhone = userPhone || localStorage.getItem("phone");
      const orderPayload = {
        gameSlug: slug,
        itemSlug,
        itemName,
        playerId: reviewData.playerId,
        playerName: reviewData.userName || "Unknown",
        zoneId: reviewData.zoneId,
        paymentMethod,
        email: userEmail || null,
        phone: storedPhone,
        currency: "INR",
      };

      const { data } = await api.post("/api/order/create-gateway-order", orderPayload);

      if (!data.success) {
        alert("Order failed: " + data.message);
        setIsRedirecting(false);
        return;
      }

      // Handle wallet payment
      if (data.walletPayment) {
        // Update local wallet balance
        useAuthStore.getState().setWalletBalance(data.newWalletBalance);

        // Store order for tracking
        localStorage.setItem("pending_topup_order", data.orderId);

        // Redirect to success page
        window.location.href = `/payment/topup-complete?orderId=${data.orderId}&wallet=true`;
        return;
      }

      // Handle gateway payment
      localStorage.setItem("pending_topup_order", data.orderId);

      // 🚀 redirect to payment gateway
      window.location.href = data.paymentUrl;
    } catch (err) {
      alert("Something went wrong. Please try again.");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* STEP 2: REVIEW & PAY */}
      {step === 2 && (
        <div className="space-y-6">
          {/* USER & ACCOUNT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--accent)]/5 rounded-full blur-2xl -z-10 group-hover:bg-[var(--accent)]/10 transition-all" />
              <h3 className="text-xs font-[900] uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <FiUser className="text-lg" /> Your Info
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--muted)]">Email</p>
                  <p className="font-medium truncate text-sm">{userEmail || "Not added"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--muted)]">Phone</p>
                  <p className="font-medium truncate text-sm">{userPhone || "Not added"}</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl -z-10 group-hover:bg-blue-500/10 transition-all" />
              <h3 className="text-xs font-[900] uppercase tracking-widest text-[var(--muted)] mb-4 flex items-center gap-2">
                <Icons.shield className="text-lg" /> Game Account
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--muted)]">{(isManual && slug !== 'bgmi-manual') ? "Delivery Mode" : "Username"}</p>
                  <p className="font-bold text-[var(--accent)] truncate text-sm">{reviewData.userName}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[var(--muted)]">{fieldOneLabel}</p>
                    <p className="font-medium truncate text-sm">{reviewData.playerId}</p>
                  </div>
                  {reviewData.zoneId && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[var(--muted)]">{fieldTwoLabel}</p>
                      <p className="font-medium truncate text-sm">{reviewData.zoneId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="space-y-4">
            <h3 className="text-sm font-[900] uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
              <Icons.creditCard /> How do you want to pay?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Wallet Option */}
              <button aria-label="button"
                onClick={() => {
                  if (walletBalance >= totalPrice) setPaymentMethod("wallet");
                }}
                disabled={walletBalance < totalPrice}
                className={`relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden
                             ${paymentMethod === "wallet"
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--muted)]"
                  }
                             ${walletBalance < totalPrice ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                        `}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <Icons.creditCard className={paymentMethod === "wallet" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                    <span className="font-bold text-sm">My Wallet</span>
                  </div>
                  {paymentMethod === "wallet" && <Icons.check className="text-[var(--accent)]" />}
                </div>
                <div className="flex items-end gap-2 px-1">
                  <span className="text-lg font-[900]">₹{walletBalance}</span>
                  {walletBalance < totalPrice && (
                    <span className="text-[10px] text-red-400 font-bold mb-1 italic">Low balance</span>
                  )}
                </div>
              </button>

              {/* UPI Option */}
              <button aria-label="button"
                onClick={handleUPI}
                className={`relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden
                             ${paymentMethod === "upi"
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] ring-1 ring-[var(--accent)]"
                    : "bg-[var(--background)] border-[var(--border)] hover:border-[var(--muted)]"
                  }
                        `}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <Icons.smartphone className={paymentMethod === "upi" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                    <span className="font-bold text-sm">Pay with UPI</span>
                  </div>
                  {paymentMethod === "upi" && <Icons.check className="text-[var(--accent)]" />}
                </div>
                <div className="flex items-end gap-2 px-1">
                  <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest opacity-60">Fast & Safe</span>
                </div>
              </button>
            </div>
          </div>

          {/* SUMMARY & ACTION */}
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)] font-medium">Price</span>
                <span className="font-bold">₹{price}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)] font-medium">You save</span>
                  <span className="font-bold text-green-400">- ₹{discount}</span>
                </div>
              )}
              <div className="h-px bg-[var(--border)] my-2" />
              <div className="flex justify-between items-center">
                <span className="font-[900] text-lg uppercase tracking-tight">You Pay</span>
                <span className="font-[900] text-2xl text-[var(--accent)]">₹{totalPrice}</span>
              </div>
            </div>

            <button aria-label="button"
              onClick={handleProceed}
              disabled={isRedirecting || !paymentMethod || (paymentMethod === "wallet" && walletBalance < totalPrice)}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-[900] uppercase tracking-widest hover:shadow-[0_0_20px_var(--accent)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isRedirecting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 group">
                  Pay Now
                  <Icons.arrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: QR CODE DISPLAY */}
      {step === 3 && paymentMethod === "upi" && (
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.smartphone className="text-3xl text-[var(--accent)]" />
          </div>
          <h3 className="text-xl font-[900] uppercase tracking-wide mb-2">Scan to Pay</h3>
          <p className="text-[var(--muted)] text-sm mb-6">Open any UPI app and scan this code to pay.</p>

          <div className="w-64 h-64 mx-auto bg-white p-4 rounded-2xl shadow-xl mb-8">
            {upiQR ? (
              <Image src={upiQR} alt="UPI QR" width={250} height={250} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-black/50 text-sm font-bold">
                Loading QR code...
              </div>
            )}
          </div>

          <button aria-label="button"
            onClick={onPaymentComplete}
            className="w-full py-4 rounded-xl bg-[var(--accent)] text-black font-[900] uppercase tracking-widest hover:shadow-[0_0_20px_var(--accent)]"
          >
            I've Paid
          </button>
        </div>
      )}
    </div>
  );
}