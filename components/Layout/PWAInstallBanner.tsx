"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

declare global {
  interface Window {
    __pwaPrompt: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } | null;
  }
}

export default function PWAInstallBanner() {
  const [visible, setVisible]         = useState(false);
  const [dismissed, setDismissed]     = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [isIos, setIsIos]             = useState(false);
  const [isChromeIos, setIsChromeIos] = useState(false);
  const [browserType, setBrowserType] = useState<"chrome"|"samsung"|"firefox"|"other">("other");

  useEffect(() => {
    // 1. Check if user dismissed it in the last 24 hours
    const dismissedUntil = localStorage.getItem("pwa_dismissed_until");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "active" }) }).catch(() => {});
      return;
    }

    const ua  = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIos(ios);
    setIsChromeIos(ios && /CriOS/i.test(ua));
    if (/SamsungBrowser/i.test(ua))             setBrowserType("samsung");
    else if (/Firefox/i.test(ua))               setBrowserType("firefox");
    else if (/Chrome|Chromium|CriOS/i.test(ua)) setBrowserType("chrome");
    else                                         setBrowserType("other");

    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const lateHandler = (e: Event) => { e.preventDefault(); window.__pwaPrompt = e as never; };
    window.addEventListener("beforeinstallprompt", lateHandler);
    
    const handleShowModal = () => setShowModal(true);
    window.addEventListener("show-pwa-modal", handleShowModal);

    const timer = setTimeout(() => setVisible(true), 2000); // 2 second delay
    return () => { 
      window.removeEventListener("beforeinstallprompt", lateHandler); 
      window.removeEventListener("show-pwa-modal", handleShowModal);
      clearTimeout(timer); 
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

  const handleDismiss = () => {
    setVisible(false); setDismissed(true);
    // Hide for 24 hours (1 day = 86400000 ms)
    localStorage.setItem("pwa_dismissed_until", (Date.now() + 86400000).toString());
    fetch("/api/pwa/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "dismissed" }) }).catch(() => {});
  };

  if (!visible || dismissed) return null;

  return (
    <>
      <style>{`
        @keyframes pwa-in { 0% {opacity:0;transform:translateY(20px) scale(0.95)} 100% {opacity:1;transform:translateY(0) scale(1)} }
        @keyframes pwa-pulse { 0% {box-shadow: 0 0 0 0 color-mix(in srgb,var(--accent) 40%,transparent)} 70% {box-shadow: 0 0 0 8px transparent} 100% {box-shadow: 0 0 0 0 transparent} }
        @keyframes pwa-float { 0% {transform:translateY(0px)} 50% {transform:translateY(-4px)} 100% {transform:translateY(0px)} }
        @keyframes pwa-sheet-in { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes pwa-back-in  { from{opacity:0} to{opacity:1} }

        #pwa-card {
          position:fixed; bottom:24px; right:24px; z-index:99999;
          animation: pwa-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both, pwa-float 6s ease-in-out infinite;
          border-radius: 100px;
          padding: 8px 8px 8px 12px;
          background: rgba(15, 15, 15, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media(max-width:767px){ #pwa-card{bottom:16px;right:16px;left:16px;justify-content:space-between;} }

        .pwa-install-btn {
          display:flex; align-items:center; gap:6px;
          padding:9px 18px; border-radius:100px; border:none; cursor:pointer;
          font-size:12px; font-weight:700; letter-spacing:0.02em; white-space:nowrap;
          background: linear-gradient(135deg, var(--accent), color-mix(in srgb,var(--accent) 80%, #fff));
          color:#fff;
          box-shadow: 0 4px 15px color-mix(in srgb,var(--accent) 40%,transparent);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          animation: pwa-pulse 2s infinite;
        }
        .pwa-install-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px color-mix(in srgb,var(--accent) 60%,transparent);
          filter: brightness(1.1);
        }
        
        .pwa-close-btn {
          width:30px; height:30px; border-radius:50%; cursor:pointer; flex-shrink:0;
          border:none; background:rgba(255,255,255,0.08);
          color:rgba(255,255,255,0.6); display:flex; align-items:center; justify-content:center;
          font-size:12px; transition:all 0.2s;
        }
        .pwa-close-btn:hover {
          color:#fff; background:rgba(255,255,255,0.2); transform: scale(1.05);
        }

        /* Modal */
        .pwa-backdrop {
          position:fixed; inset:0; z-index:999998;
          background:rgba(0,0,0,0.55); backdrop-filter:blur(5px);
          animation:pwa-back-in 0.25s ease both;
        }
        .pwa-sheet-wrap {
          position:fixed; bottom:0; left:0; right:0; z-index:999999;
          animation:pwa-sheet-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pwa-sheet {
          background:var(--card);
          border:1px solid var(--border); border-bottom:none;
          border-radius:22px 22px 0 0;
          box-shadow:0 -12px 40px rgba(0,0,0,0.25);
          padding-bottom:32px;
        }
        .pwa-step-num {
          flex-shrink:0; width:26px; height:26px; border-radius:50%;
          background:color-mix(in srgb,var(--accent) 10%,transparent);
          border:1px solid color-mix(in srgb,var(--accent) 22%,transparent);
          color:var(--accent);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:800;
        }
        .pwa-step-strong { color:var(--accent); }
        .pwa-cancel-btn {
          flex:1; padding:12px; border-radius:12px; cursor:pointer; font-size:13px; font-weight:700;
          border:1px solid var(--border); background:var(--background); color:var(--muted);
          transition:color 0.15s;
        }
        .pwa-cancel-btn:hover{color:var(--foreground);}
        .pwa-ok-btn {
          flex:2; padding:12px; border-radius:12px; cursor:pointer; font-size:13px; font-weight:800;
          border:none; background:var(--accent); color:#fff;
          box-shadow:0 4px 16px color-mix(in srgb,var(--accent) 35%,transparent);
          transition:opacity 0.15s;
        }
        .pwa-ok-btn:hover{opacity:0.87;}
      `}</style>

      {/* ── Floating card ── */}
      <div id="pwa-card" role="dialog" aria-label="Install app">
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flex: 1 }}>
          {/* App icon */}
          <div style={{ flexShrink:0, width:36, height:36, borderRadius:50, overflow:"hidden", border:"2px solid rgba(255,255,255,0.1)", background:"var(--background)" }}>
            <Image src="/logoBB.png" alt="MLBB Topup" width={36} height={36} style={{ objectFit:"cover", width:"100%", height:"100%" }} />
          </div>
          {/* Text */}
          <div style={{ minWidth:0, display:"flex", flexDirection:"column" }}>
            <p style={{ margin:0, fontWeight:700, fontSize:"13px", color:"#fff", lineHeight:1.2, letterSpacing:"-0.01em" }}>MLBB Topup</p>
            <p style={{ margin:"1px 0 0", fontSize:"10px", color:"rgba(255,255,255,0.6)", fontWeight:500 }}>Install App</p>
          </div>
        </div>
        
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {/* Install */}
          <button aria-label="button" className="pwa-install-btn" id="pwa-install-btn" onClick={handleInstall}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Install
          </button>
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
                  <div style={{ width:52, height:52, borderRadius:13, overflow:"hidden", border:"1px solid var(--border)", background:"var(--background)", flexShrink:0 }}>
                    <Image src="/logoBB.png" alt="MLBB Topup" width={52} height={52} style={{ objectFit:"cover", width:"100%", height:"100%" }} />
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
