"use client";

import { useEffect, useState } from "react";
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiExternalLink, FiSearch } from "react-icons/fi";

export default function UsdtTab() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("submitted");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null); // ID of deposit being processed

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/wallet/usdt?status=${status}&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch USDT deposits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [status, page]);

  const handleAction = async (depositId, action) => {
    if (!confirm(`Do you want to ${action} this deposit?`)) return;

    try {
      setActionLoading(depositId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/wallet/usdt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ depositId, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchDeposits(); // Refresh
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(`USDT ${action} error:`, err);
      alert("Server error.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-[var(--foreground)] flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
           Crypto Deposits
        </h2>
        
        <div className="w-full md:w-auto">
          {/* MOBILE DROPDOWN */}
          <div className="md:hidden relative group">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full h-11 pl-4 pr-10 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs font-black uppercase tracking-[0.15em] text-[var(--foreground)] outline-none focus:border-green-500 appearance-none cursor-pointer shadow-sm transition-all hover:bg-[var(--foreground)]/[0.02]"
            >
              <option value="waiting">Waiting</option>
              <option value="submitted">Submitted</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
              <option value="expired">Expired</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 block animate-pulse"></span>
            </div>
          </div>

          {/* DESKTOP TABS */}
          <div className="hidden md:flex bg-[var(--card)] p-1.5 rounded-full border border-[var(--border)] shadow-sm">
            <div className="flex gap-1">
              {[
                { id: "waiting", label: "Waiting" },
                { id: "submitted", label: "Submitted" },
                { id: "confirmed", label: "Confirmed" },
                { id: "failed", label: "Failed" },
                { id: "expired", label: "Expired" }
              ].map(s => (
                <button aria-label="button"
                  key={s.id}
                  onClick={() => { setStatus(s.id); setPage(1); }}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap active:scale-95 ${
                    status === s.id 
                      ? "bg-green-500 text-black shadow-md shadow-green-500/20" 
                      : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/[0.02]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FiRefreshCw className="animate-spin text-green-500" size={32} />
        </div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-[var(--border)] rounded-3xl">
          <p className="text-[var(--muted)] text-sm uppercase tracking-widest font-bold">No {status} deposits found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-black">
                <th className="px-4 py-3">User / ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 font-mono">TX Hash</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/10">
              {deposits.map(d => (
                <tr key={d._id} className="group hover:bg-[var(--foreground)]/[0.02] transition-colors">
                  <td className="px-4 py-4">
                    <p className="text-[11px] font-black text-[var(--foreground)] break-all">{d.userId}</p>
                    <p className="text-[9px] text-[var(--muted)] font-mono">{d.depositId}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-green-400">{d.usdtAmount} USDT</p>
                    <p className="text-[9px] text-[var(--muted)] uppercase font-bold">≈ {d.coinsToCredit} Coins</p>
                  </td>
                  <td className="px-4 py-4 max-w-[150px]">
                    {d.txHash ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-[var(--muted)] truncate">{d.txHash}</span>
                        <a href={`https://bscscan.com/tx/${d.txHash}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400">
                           <FiExternalLink size={10} />
                        </a>
                      </div>
                    ) : (
                      <span className="text-[9px] text-amber-500 font-bold uppercase italic">Missing Hash</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[9px] font-black">{d.network}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[10px] text-[var(--muted)] font-medium">
                      {new Date(d.createdAt).toLocaleDateString()}<br/>
                      {new Date(d.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {d.status === "submitted" && (
                      <div className="flex justify-end gap-2">
                        <button aria-label="button" 
                          onClick={() => handleAction(d.depositId, "confirm")}
                          disabled={actionLoading === d.depositId}
                          className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-black transition-all"
                          title="Confirm & Credit"
                        >
                          <FiCheckCircle size={14} />
                        </button>
                        <button aria-label="button" 
                          onClick={() => handleAction(d.depositId, "reject")}
                          disabled={actionLoading === d.depositId}
                          className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-black transition-all"
                          title="Reject"
                        >
                          <FiXCircle size={14} />
                        </button>
                      </div>
                    )}
                    {d.status === "confirmed" && (
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">Confirmed</span>
                    )}
                    {d.status === "failed" && (
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Rejected</span>
                    )}
                    {d.status === "expired" && (
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Expired</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 pt-4 border-t border-[var(--border)]/10">
          <button aria-label="button" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold disabled:opacity-30"
          >
            Previous
          </button>
          <span className="flex items-center text-xs font-black text-[var(--muted)]">PAGE {page} OF {totalPages}</span>
          <button aria-label="button" 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
