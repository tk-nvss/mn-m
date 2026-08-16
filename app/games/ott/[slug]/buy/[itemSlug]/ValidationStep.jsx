import { FiUser, FiCheckCircle } from "react-icons/fi";
import RecentVerifiedPlayers from "../../../../../region/RecentVerifiedPlayers";
import { motion } from "framer-motion";

export default function ValidationStep({
  playerId,
  setPlayerId,
  onValidate,
  loading,
}) {
  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-[900] uppercase tracking-tight text-[var(--foreground)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            Verification
          </h2>
          <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider mt-0.5 opacity-70">Enter details to proceed</p>
        </div>
      </div>

      {/* Input Group */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1 opacity-60">Account ID</label>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] transition-colors duration-300">
            <FiUser className="text-lg" />
          </div>
          <input
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Enter ID"
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-[var(--foreground)] placeholder-[var(--muted)]/40 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all duration-300 font-bold"
            disabled={loading}
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="relative group pt-1">
        <div className="absolute inset-0 bg-[var(--accent)] opacity-10 blur-xl group-hover:opacity-20 transition-opacity rounded-xl" />
        <button aria-label="button"
          onClick={onValidate}
          disabled={loading || !playerId}
          className={`relative w-full py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[13px] transition-all duration-500 flex items-center justify-center gap-2 overflow-hidden
            ${loading || !playerId
              ? "bg-white/5 text-[var(--muted)] cursor-not-allowed border border-white/5"
              : "bg-[var(--foreground)] text-[var(--background)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] active:scale-[0.98]"
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Verifying
            </span>
          ) : (
            <>
              Check Player
              <FiCheckCircle className="text-lg" />
            </>
          )}

          {/* Subtle Button Shimmer */}
          {!loading && playerId && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full skew-x-[-30deg]"
              />
            </div>
          )}
        </button>
      </div>

      <div className="pt-2">
        <RecentVerifiedPlayers
          limit={3}
          onSelect={(player) => {
            setPlayerId(player.playerId);
          }}
        />
      </div>
    </div>
  );
}
