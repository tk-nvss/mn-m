"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

declare global {
  interface Window {
    __pwaPrompt: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null;
  }
}

export default function PWAInstallBanner() {
  const [visible, setVisible]                 = useState(false);
  const [dismissed, setDismissed]             = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [isIos, setIsIos]                     = useState(false);
  const [isChromeIos, setIsChromeIos]         = useState(false);
  const [isStandalone, setIsStandalone]       = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker]     = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating]           = useState(false);
  const [browserType, setBrowserType]         = useState<"chrome"|"samsung"|"firefox"|"other">("other");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) {
      fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "active" }) }).catch(() => {});
    }

    const ua  = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIos(ios);
    setIsChromeIos(ios && /CriOS/i.test(ua));
    if (/SamsungBrowser/i.test(ua))             setBrowserType("samsung");
    else if (/Firefox/i.test(ua))               setBrowserType("firefox");
    else if (/Chrome|Chromium|CriOS/i.test(ua)) setBrowserType("chrome");
    else                                         setBrowserType("other");

    // Service Worker Update Listener
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        // If there's already a waiting worker
        if (reg.waiting && navigator.serviceWorker.controller) {
          const updateDismissed = localStorage.getItem("pwa_update_dismissed_until");
          if (!updateDismissed || Date.now() >= parseInt(updateDismissed, 10)) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
            setVisible(true);
          }
        }

        // Detect new worker update
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setUpdateAvailable(true);
                setVisible(true);
              }
            });
          }
        });

        // Periodic check every 15 minutes
        const updateInterval = setInterval(() => {
          reg.update().catch(() => {});
        }, 15 * 60 * 1000);

        return () => clearInterval(updateInterval);
      }).catch(() => {});

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // If not standalone, check if install prompt was dismissed
    if (!standalone) {
      const dismissedUntil = localStorage.getItem("pwa_dismissed_until");
      if (!dismissedUntil || Date.now() >= parseInt(dismissedUntil, 10)) {
        const timer = setTimeout(() => setVisible(true), 2000);
        return () => clearTimeout(timer);
      }
    }

    const lateHandler = (e: Event) => { e.preventDefault(); window.__pwaPrompt = e as never; };
    window.addEventListener("beforeinstallprompt", lateHandler);
    
    const handleShowModal = () => setShowModal(true);
    window.addEventListener("show-pwa-modal", handleShowModal);

    return () => { 
      window.removeEventListener("beforeinstallprompt", lateHandler); 
      window.removeEventListener("show-pwa-modal", handleShowModal);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = window.__pwaPrompt;
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "installed" }) }).catch(() => {});
        setVisible(false); setDismissed(true);
      }
      window.__pwaPrompt = null;
    } else {
      setShowModal(true);
    }
  };

  const handleUpdate = () => {
    setIsUpdating(true);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    if (updateAvailable) {
      // Hide update prompt for 1 hour
      localStorage.setItem("pwa_update_dismissed_until", (Date.now() + 3600000).toString());
    } else {
      // Hide install prompt for 24 hours
      localStorage.setItem("pwa_dismissed_until", (Date.now() + 86400000).toString());
      fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "dismissed" }) }).catch(() => {});
    }
  };

  // If already installed (standalone) and no update available, don't show install banner
  if (isStandalone && !updateAvailable) return null;
  if (!visible || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes pwa-in { 0% {opacity:0;transform:translateY(20px) scale(0.95)} 100% {opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pwa-pulse { 0% {box-shadow: 0 0 0 0 color-mix(in srgb,var(--accent) 40%,transparent)} 70% {box-shadow: 0 0 0 8px transparent} 100% {box-shadow: 0 0 0 0 transparent} }
        @keyframes pwa-float { 0% {transform:translateY(0px)} 50% {transform:translateY(-4px)} 100% {transform:translateY(0px)} }
        @keyframes pwa-sheet-in { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes pwa-back-in  { from{opacity:0} to{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        #pwa-card {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          animation: pwa-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          border-radius: 9999px;
          padding: 5px 6px 5px 8px;
          background: var(--card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--border);
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 1px 1px var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media(max-width:767px){ 
          #pwa-card {
            bottom: 62px;
            right: 12px;
            left: auto;
            max-width: fit-content;
          } 
        }

        .pwa-install-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 11px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.02em;
          white-space: nowrap;
          background: var(--accent);
          color: #000;
          box-shadow: 0 2px 10px color-mix(in srgb, var(--accent) 30%, transparent);
          transition: all 0.2s ease;
        }
        .pwa-install-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
          box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 50%, transparent);
        }
        .pwa-install-btn:active {
          transform: scale(0.97);
        }
        
        .pwa-close-btn {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          cursor: pointer;
          flex-shrink: 0;
          border: none;
          background: transparent;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          transition: all 0.2s;
        }
        .pwa-close-btn:hover {
          color: var(--foreground);
          background: var(--foreground-rgb, rgba(255,255,255,0.08));
        }

        /* Modal */
        .pwa-backdrop {
          position: fixed;
          inset: 0;
          z-index: 999998;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          animation: pwa-back-in 0.2s ease both;
        }
        .pwa-sheet-wrap {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 999999;
          animation: pwa-sheet-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .pwa-sheet {
          background: var(--card);
          border: 1px solid var(--border);
          border-bottom: none;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.3);
          padding-bottom: 28px;
        }
        .pwa-step-num {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
        }
        .pwa-step-strong { color: var(--accent); }
        .pwa-cancel-btn {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--muted);
          transition: color 0.15s;
        }
        .pwa-cancel-btn:hover { color: var(--foreground); }
        .pwa-ok-btn {
          flex: 2;
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          border: none;
          background: var(--accent);
          color: #000;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent);
          transition: opacity 0.15s;
        }
        .pwa-ok-btn:hover { opacity: 0.9; }
      `}</style>

      {/* ── Floating card ── */}
      <div id="pwa-card" role="dialog" aria-label={updateAvailable ? "Update app" : "Install app"}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* App icon */}
          <div style={{ position: "relative", flexShrink: 0, width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", background: "#09090b" }}>
            <Image src="/pwa-icon.png" alt="MLBB Topup" width={28} height={28} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            {updateAvailable && (
              <span style={{ position: "absolute", top: 1, right: 1, width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px #22c55e" }} />
            )}
          </div>
          {/* Text */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", paddingRight: "4px" }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: "11px", color: "var(--foreground)", lineHeight: 1.2, letterSpacing: "-0.01em" }}>MLBB Topup</p>
            <p style={{ margin: "1px 0 0", fontSize: "9px", color: updateAvailable ? "var(--accent)" : "var(--muted)", fontWeight: 600 }}>
              {updateAvailable ? "New Update Ready" : "Install App"}
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {updateAvailable ? (
            /* Update */
            <button
              aria-label="Update app"
              className="pwa-install-btn"
              id="pwa-update-btn"
              onClick={handleUpdate}
              disabled={isUpdating}
              style={{ opacity: isUpdating ? 0.7 : 1 }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: isUpdating ? "spin 1s linear infinite" : undefined }}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              {isUpdating ? "Updating..." : "Update"}
            </button>
          ) : (
            /* Install */
            <button aria-label="button" className="pwa-install-btn" id="pwa-install-btn" onClick={handleInstall}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Install
            </button>
          )}
          {/* Close */}
          <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Dismiss">✕</button>
        </div>
      </div>

      {/* ── Install guide modal ── */}
      {showModal && (
        <>
          <div className="pwa-backdrop" onClick={() => setShowModal(false)} />
          <div className="pwa-sheet-wrap">
            <div className="pwa-sheet">
              {/* Handle */}
              <div style={{ display:"flex", justifyContent:"center", paddingTop:14, paddingBottom:8 }}>
                <div style={{ width:36, height:4, borderRadius:99, background:"var(--border)" }} />
              </div>

              <div style={{ padding:"10px 20px 0" }}>
                {/* App row */}
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                  <div style={{ width:52, height:52, borderRadius:13, overflow:"hidden", border:"1px solid rgba(255,255,255,0.15)", background:"#09090b", flexShrink:0 }}>
                    <Image src="/pwa-icon.png" alt="MLBB Topup" width={52} height={52} style={{ objectFit:"cover", width:"100%", height:"100%" }} />
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:800, fontSize:15, color:"var(--foreground)" }}>Install app</p>
                    <p style={{ margin:"2px 0 0", fontSize:13, fontWeight:600, color:"var(--foreground)" }}>MLBB Top Up India</p>
                    <p style={{ margin:"1px 0 0", fontSize:11, color:"var(--muted)" }}>mlbbtopup.in</p>
                  </div>
                </div>

                <div style={{ height:1, background:"var(--border)", marginBottom:16 }} />

                {/* Steps heading */}
                <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.09em", color:"var(--muted)" }}>
                  {isIos ? "How to install on iOS" : "How to install"}
                </p>

                {/* Steps */}
                <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                  {isIos ? (<>
                    <Step n={1} icon={isChromeIos ? "⬆️" : "⬆️"} text={isChromeIos
                      ? <><strong className="pwa-step-strong">Share button (⬆️)</strong> in the address bar at the top</>
                      : <><strong className="pwa-step-strong">Share button (⬆️)</strong> at the bottom toolbar</>} />
                    <Step n={2} icon="📲" text={<>Scroll and tap <strong className="pwa-step-strong">&quot;Add to Home Screen&quot;</strong></>} />
                    <Step n={3} icon="✅" text={<>Tap <strong className="pwa-step-strong">&quot;Add&quot;</strong> to confirm</>} />
                    {isChromeIos && <p style={{ margin:"4px 0 0", fontSize:11, color:"var(--muted)", lineHeight:1.5 }}>💡 For best experience, open in <strong style={{ color:"var(--foreground)" }}>Safari</strong></p>}
                  </>) : browserType === "samsung" ? (<>
                    <Step n={1} icon="⋮" text={<>Tap <strong className="pwa-step-strong">menu (⋮)</strong> at the bottom of Samsung Browser</>} />
                    <Step n={2} icon="➕" text={<>Tap <strong className="pwa-step-strong">&quot;Add page to&quot;</strong> → <strong className="pwa-step-strong">&quot;Home screen&quot;</strong></>} />
                    <Step n={3} icon="✅" text={<>Tap <strong className="pwa-step-strong">&quot;Add&quot;</strong> to confirm</>} />
                  </>) : browserType === "firefox" ? (<>
                    <Step n={1} icon="⋮" text={<>Tap <strong className="pwa-step-strong">menu (⋮)</strong> in Firefox</>} />
                    <Step n={2} icon="📲" text={<>Tap <strong className="pwa-step-strong">&quot;Install&quot;</strong> or <strong className="pwa-step-strong">&quot;Add to Home Screen&quot;</strong></>} />
                    <Step n={3} icon="✅" text={<>Tap <strong className="pwa-step-strong">&quot;Add&quot;</strong> to confirm</>} />
                  </>) : (<>
                    <Step n={1} icon="⋮" text={<>Tap <strong className="pwa-step-strong">menu (⋮)</strong> in your browser</>} />
                    <Step n={2} icon="📲" text={<>Tap <strong className="pwa-step-strong">&quot;Add to Home Screen&quot;</strong> or <strong className="pwa-step-strong">&quot;Install App&quot;</strong></>} />
                    <Step n={3} icon="✅" text={<>Tap <strong className="pwa-step-strong">&quot;Add&quot;</strong> to confirm</>} />
                  </>)}
                </div>

                {/* Buttons */}
                <div style={{ marginTop:20, display:"flex", gap:10 }}>
                  <button aria-label="button" className="pwa-cancel-btn" onClick={handleDismiss}>Cancel</button>
                  <button aria-label="button" className="pwa-ok-btn"     onClick={() => setShowModal(false)}>Got it!</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Step({ n, icon, text }: { n: number; icon: string; text: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
      <div className="pwa-step-num">{n}</div>
      <div style={{ display:"flex", alignItems:"center", gap:7, paddingTop:3 }}>
        <span style={{ fontSize:"1rem" }}>{icon}</span>
        <p style={{ margin:0, fontSize:13, color:"var(--foreground)", lineHeight:1.5 }}>{text}</p>
      </div>
    </div>
  );
}
