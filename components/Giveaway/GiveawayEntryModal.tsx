"use client";

import { useEffect, useState } from "react";
import { FiX, FiCheck, FiExternalLink, FiGift, FiAward, FiShare2, FiClock } from "react-icons/fi";



export default function GiveawayEntryModal({ giveaway, onClose }: { giveaway: any; onClose: () => void }) {
  const [step, setStep]           = useState<"tasks" | "success">("tasks");
  const [mlbbId, setMlbbId]       = useState("");
  const [mlbbServer, setMlbbServer] = useState("");
  const [phone, setPhone]         = useState("");
  const [taskData, setTaskData]   = useState<Record<number, string | boolean>>({});
  const [verifying, setVerifying] = useState<Record<number, number>>({});
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loggedIn, setLoggedIn]   = useState(false);
  const [winners, setWinners]     = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoggedIn(true);
    fetch(`/api/giveaway/${giveaway._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { 
        if (d.hasEntered) {
          setHasEntered(true); 
          setIsVerified(d.isVerified);
          if (d.userEntry) {
            setMlbbId(d.userEntry.mlbbId || "");
            setMlbbServer(d.userEntry.mlbbServer || "");
            setPhone(d.userEntry.phone || "");
            setTaskData(d.userEntry.taskData || {});
          }
        }
        if (d.giveaway?.winners) setWinners(d.giveaway.winners); 
      }).catch(() => {});
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.user?.userId) setCurrentUserId(d.user.userId); }).catch(() => {});
  }, [giveaway._id]);

  useEffect(() => {
    const active = Object.values(verifying).some(v => v > 0);
    if (!active) return;
    const interval = setInterval(() => {
      setVerifying(prev => {
        const next = { ...prev };
        let changed = false;
        for (const key in next) {
          if (next[key] > 0) {
            next[key] -= 1;
            changed = true;
            if (next[key] === 0) {
              setTaskData(p => ({ ...p, [key]: true }));
            }
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [verifying]);

  const handleVerify = (i: number) => {
    if (taskData[i] || verifying[i] > 0) return;
    setVerifying(p => ({ ...p, [i]: 10 }));
  };

  const allTasksDone = () => {
    if (!phone || !phone.trim()) return false;
    for (let i = 0; i < (giveaway.tasks?.length || 0); i++) {
      const t = giveaway.tasks[i];
      if (!t.required) continue;
      if (!t.inputLabel && !taskData[i]) return false;
      if (t.inputLabel && !String(taskData[i] || "").trim()) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/giveaway/${giveaway._id}/enter`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mlbbId, mlbbServer, phone, taskData }),
      });
      const d = await res.json();
      if (d.success) {
        setStep("success");
        // 🎉 Confetti — dynamically imported, real colors resolved from CSS
        import("canvas-confetti").then(({ default: confetti }) => {
          const accent = getComputedStyle(document.documentElement)
            .getPropertyValue("--accent").trim() || "#3b82f6";
          const colors = [accent, "#ffffff", "#a78bfa", "#34d399", "#f9a8d4"];
          confetti({ particleCount: 130, spread: 80, origin: { y: 0.65 }, colors });
          setTimeout(() => confetti({ particleCount: 55, spread: 60, angle: 60,  origin: { x: 0.1, y: 0.7 }, colors }), 200);
          setTimeout(() => confetti({ particleCount: 55, spread: 60, angle: 120, origin: { x: 0.9, y: 0.7 }, colors }), 350);
        });
      } else {
        setError(d.message || "Something went wrong");
      }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const isEnded  = giveaway.status === "ended";
  const isWinner = winners.includes(currentUserId);

  const handleShare = async () => {
    // If you have a dedicated page, use that. Otherwise share the homepage URL.
    const url = `${window.location.origin}?giveaway=${giveaway._id}`;
    const shareData = {
      title: giveaway.title,
      text: `Join the ${giveaway.title} on MLBB Top Up India!`,
      url: url,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };


  return (
    <>
      <style>{`
        @keyframes gm-back { from{opacity:0} to{opacity:1} }
        @keyframes gm-up   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        .gm-backdrop { animation:gm-back 0.22s ease both; }
        .gm-sheet    { animation:gm-up   0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .gm-input {
          width:100%; padding:10px 12px; font-size:13px;
          background:var(--background); border:1px solid var(--border);
          border-radius:10px; color:var(--foreground); outline:none;
          transition:border-color 0.15s;
        }
        .gm-input::placeholder { color:var(--muted); opacity:0.5; }
        .gm-input:focus { border-color:var(--accent); }
        .gm-task-link {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 11px; border-radius:8px; font-size:11px; font-weight:700;
          border:1px solid color-mix(in srgb,var(--accent) 30%,var(--border));
          color:var(--accent);
          background:color-mix(in srgb,var(--accent) 8%,transparent);
          cursor:pointer; text-decoration:none;
          transition:background 0.15s;
        }
        .gm-task-link:hover { background:color-mix(in srgb,var(--accent) 16%,transparent); }
        .gm-task-done {
          display:inline-flex; align-items:center; gap:5px;
          padding:6px 11px; border-radius:8px; font-size:11px; font-weight:700;
          border:1px solid var(--border); color:var(--muted);
          background:transparent; cursor:pointer;
          transition:all 0.15s;
        }
        .gm-task-done.checked {
          border-color:color-mix(in srgb,var(--accent) 35%,transparent);
          color:var(--accent);
          background:color-mix(in srgb,var(--accent) 8%,transparent);
        }
        .gm-submit {
          width:100%; padding:13px; border-radius:12px; border:none; cursor:pointer;
          font-size:13px; font-weight:800; letter-spacing:0.02em;
          background:var(--accent); color:#fff;
          box-shadow:0 4px 18px color-mix(in srgb,var(--accent) 35%,transparent);
          transition:opacity 0.15s, transform 0.15s;
        }
        .gm-submit:hover:not(:disabled){opacity:0.88;transform:scale(1.01);}
        .gm-submit:disabled{opacity:0.35;cursor:not-allowed;box-shadow:none;}
        .gm-num {
          flex-shrink:0; width:26px; height:26px; border-radius:50%;
          background:color-mix(in srgb,var(--accent) 12%,transparent);
          border:1px solid color-mix(in srgb,var(--accent) 25%,transparent);
          color:var(--accent);
          display:flex; align-items:center; justify-content:center;
          font-size:11px; font-weight:800;
        }
        .gm-label { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.09em; color:var(--muted); }
        .gm-section-title { font-size:11px; font-weight:800; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; }
      `}</style>

      {/* Backdrop */}
      <div
        className="gm-backdrop"
        style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", zIndex:99990 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="gm-sheet"
        style={{ position:"fixed", inset:"0 0 0 0", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:99991, pointerEvents:"none" }}
      >
        <div
          style={{
            pointerEvents:"all", width:"100%", maxWidth:"460px",
            background:"var(--card)",
            border:"1px solid var(--border)", borderBottom:"none",
            borderRadius:"20px 20px 0 0",
            maxHeight:"92dvh", overflowY:"auto",
            boxShadow:"0 -16px 48px rgba(0,0,0,0.3)",
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div style={{ display:"flex", justifyContent:"center", paddingTop:"12px" }}>
            <div style={{ width:36, height:4, borderRadius:99, background:"var(--border)" }} />
          </div>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px 10px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"color-mix(in srgb,var(--accent) 12%,transparent)", border:"1px solid color-mix(in srgb,var(--accent) 22%,transparent)", color:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <FiGift size={16} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p className="gm-label" style={{ color:"#ef4444" }}>🎁 {isEnded ? "Giveaway Ended" : "Giveaway Live"}</p>
              <p style={{ margin:"1px 0 0", fontWeight:700, fontSize:14, color:"var(--foreground)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{giveaway.title}</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <button aria-label="button" onClick={handleShare} style={{ color:"var(--muted)", background:"none", border:"none", cursor:"pointer", padding:6, display:"flex", borderRadius:"50%", transition:"background 0.15s" }} onMouseOver={e => e.currentTarget.style.background="var(--border)"} onMouseOut={e => e.currentTarget.style.background="none"}>
                <FiShare2 size={16} />
              </button>
              <button aria-label="button" onClick={onClose} style={{ color:"var(--muted)", background:"none", border:"none", cursor:"pointer", padding:6, display:"flex", borderRadius:"50%", transition:"background 0.15s" }} onMouseOver={e => e.currentTarget.style.background="var(--border)"} onMouseOut={e => e.currentTarget.style.background="none"}>
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Prize bar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", background:"color-mix(in srgb,var(--accent) 6%,transparent)", borderBottom:"1px solid var(--border)" }}>
            <FiAward size={13} style={{ color:"var(--accent)", flexShrink:0 }} />
            <span style={{ fontSize:12, fontWeight:600, color:"var(--foreground)" }}>{giveaway.prize}</span>
            {giveaway.prizeCount > 1 && (
              <span style={{ marginLeft:"auto", fontSize:10, color:"var(--muted)", fontWeight:700 }}>{giveaway.prizeCount} winners</span>
            )}
          </div>

          {/* Winner notice */}
          {isEnded && winners.length > 0 && (
            <div style={{ margin:"12px 16px 0", padding:"12px", borderRadius:12, border:`1px solid color-mix(in srgb,var(--accent) 30%,var(--border))`, background:"color-mix(in srgb,var(--accent) 8%,transparent)", fontSize:13, fontWeight:700, color: isWinner ? "var(--accent)" : "var(--muted)" }}>
              {isWinner ? "🏆 Congratulations! You won this giveaway!" : "🎉 Winners have been picked."}
            </div>
          )}

          {/* Body */}
          <div style={{ padding:"16px" }}>

            {/* Success / Already entered */}
            {step === "success" || hasEntered ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"24px 0", textAlign:"center" }}>
                <div style={{ width:56, height:56, borderRadius:"50%", background:"color-mix(in srgb,var(--accent) 10%,transparent)", border:"1px solid color-mix(in srgb,var(--accent) 25%,transparent)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--accent)" }}>
                  {isVerified ? <FiCheck size={26} /> : <FiClock size={26} />}
                </div>
                <div>
                  <p style={{ margin:0, fontWeight:800, fontSize:16, color:"var(--foreground)" }}>
                    {isVerified ? "You're Verified! 🎉" : "Entry under Review ⏳"}
                  </p>
                  <p style={{ margin:"4px 0 0", fontSize:12, color:"var(--muted)" }}>
                    {isVerified 
                      ? "Your tasks are verified. You are now eligible for the draw! Good luck!" 
                      : "Your tasks are pending verification by an admin. Please wait."}
                  </p>
                </div>
                {!isVerified && (
                  <p style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", maxWidth: 300 }}>
                    Realized you missed a task? You can redo them before the giveaway ends.
                  </p>
                )}
                
                <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center" }}>
                  {!isVerified && (
                    <button 
                      aria-label="button" 
                      onClick={() => setHasEntered(false)} 
                      style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      Redo Tasks
                    </button>
                  )}
                  <a 
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}?text=${encodeURIComponent(`Hi, I have just joined the giveaway: ${giveaway.title}`)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="gm-submit" 
                    style={{ maxWidth: 160, display: "inline-block", textAlign: "center", textDecoration: "none", padding: "10px 16px" }}
                    onClick={onClose}
                  >
                    Notify Admin
                  </a>
                </div>
              </div>

            ) : !loggedIn ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"24px 0", textAlign:"center" }}>
                <FiGift size={36} style={{ color:"var(--accent)" }} />
                <div>
                  <p style={{ margin:0, fontWeight:800, fontSize:15, color:"var(--foreground)" }}>Sign in to participate</p>
                  <p style={{ margin:"4px 0 0", fontSize:12, color:"var(--muted)" }}>You need an account to enter</p>
                </div>
                <a href="/login" className="gm-submit" style={{ display:"block", textAlign:"center", textDecoration:"none", maxWidth:200, padding:"12px 0" }}>Sign In</a>
              </div>

            ) : isEnded ? (
              <p style={{ textAlign:"center", color:"var(--muted)", fontSize:13, padding:"24px 0" }}>This giveaway has ended.</p>

            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* MLBB Details */}
                <div>
                  <p className="gm-section-title" style={{ marginBottom:8 }}>Your MLBB Details</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div>
                      <p className="gm-label" style={{ marginBottom:4 }}>Player ID (Optional)</p>
                      <input className="gm-input" value={mlbbId} onChange={e => setMlbbId(e.target.value)} placeholder="e.g. 123456789" />
                    </div>
                    <div>
                      <p className="gm-label" style={{ marginBottom:4 }}>Server ID (Optional)</p>
                      <input className="gm-input" value={mlbbServer} onChange={e => setMlbbServer(e.target.value)} placeholder="e.g. 2345" />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <p className="gm-label" style={{ marginBottom:4 }}>WhatsApp / Phone Number <span style={{ color: "#ef4444" }}>*</span></p>
                    <input type="tel" className="gm-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
                  </div>
                </div>

                {/* Tasks */}
                {giveaway.tasks?.length > 0 && (
                  <div>
                    <p className="gm-section-title" style={{ marginBottom:8 }}>Your Tasks</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:2, borderRadius:12, border:"1px solid var(--border)", overflow:"hidden" }}>
                      {giveaway.tasks.map((task: any, i: number) => (
                        <div key={i} style={{ padding:"11px 13px", borderBottom: i < giveaway.tasks.length - 1 ? "1px solid var(--border)" : "none", background:"var(--background)" }}>
                          <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                            <div className="gm-num">{i + 1}</div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                                <span style={{ fontSize:13, fontWeight:700, color:"var(--foreground)" }}>{task.label}</span>
                                {task.required && (
                                  <span style={{ fontSize:8, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--accent)", background:"color-mix(in srgb,var(--accent) 10%,transparent)", border:"1px solid color-mix(in srgb,var(--accent) 20%,transparent)", padding:"2px 5px", borderRadius:4 }}>Required</span>
                                )}
                              </div>
                              {task.description && (
                                <p style={{ margin:"2px 0 0", fontSize:11, color:"var(--muted)" }}>{task.description}</p>
                              )}
                              <div style={{ marginTop:7, display:"flex", flexWrap:"wrap", gap:6 }}>
                                {task.link && (
                                  <a href={task.link} target="_blank" rel="noopener noreferrer"
                                    className="gm-task-link"
                                    onClick={() => { if (task.type === "checkbox") handleVerify(i); }}
                                  >
                                    <FiExternalLink size={10} />
                                    {task.type === "youtube" ? "Open Channel" : task.type === "whatsapp" ? "Join Group" : task.type === "instagram" ? "Follow" : "Open Link"}
                                  </a>
                                )}
                                {task.type === "checkbox" && (
                                  <button aria-label="button"
                                    className={`gm-task-done ${taskData[i] ? "checked" : ""}`}
                                    onClick={() => {
                                      if (taskData[i]) {
                                        setTaskData(p => { const n = { ...p }; delete n[i]; return n; });
                                      } else {
                                        handleVerify(i);
                                      }
                                    }}
                                    disabled={verifying[i] > 0}
                                    style={{ opacity: verifying[i] > 0 ? 0.6 : 1, cursor: verifying[i] > 0 ? "wait" : "pointer" }}
                                  >
                                    <FiCheck size={10} />
                                    {taskData[i] ? "Done!" : verifying[i] > 0 ? `Wait ${verifying[i]}s...` : "Mark as done"}
                                  </button>
                                )}
                                {task.inputLabel && (
                                  <input
                                    className="gm-input"
                                    value={String(taskData[i] || "")}
                                    onChange={e => setTaskData(p => ({ ...p, [i]: e.target.value }))}
                                    placeholder={task.inputLabel}
                                    style={{ marginTop:2 }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p style={{ fontSize:12, fontWeight:600, color:"#ef4444", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"8px 12px", margin:0 }}>{error}</p>
                )}

                {/* Verification Notice */}
                {giveaway.tasks?.length > 0 && (
                  <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", fontStyle: "italic", margin: "4px 0 -4px" }}>
                    ⚠️ Note: All completed tasks will be strictly verified before winner announcement.
                  </p>
                )}

                {/* Submit */}
                <button aria-label="button" className="gm-submit" disabled={!allTasksDone() || loading} onClick={handleSubmit}>
                  {loading ? "Entering..." : "🎁 Enter Giveaway"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
