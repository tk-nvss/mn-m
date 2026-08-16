import { FiUser, FiGlobe, FiInfo, FiCheckCircle, FiChevronDown } from "react-icons/fi";
import RecentVerifiedPlayers from "../../../../region/RecentVerifiedPlayers";

export default function ValidationStep({
  game,
  playerId,
  setPlayerId,
  zoneId,
  setZoneId,
  onValidate,
  loading,
  error,
  setError,
}) {
  const isValidationRequired = game?.isValidationRequired !== false;
  const fieldOneLabel = game?.inputFieldOne || "Player ID";
  const fieldTwoLabel = game?.inputFieldTwo || "Zone ID";

  const buttonText = isValidationRequired ? "Check Player" : "Continue Order";
  return (
    <div className="space-y-4">
      {/* Premium Error State */}
      {error && (
        <div
          className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2"
        >
          <FiInfo className="shrink-0" />
          {error}
        </div>
      )}

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
      <div className={`grid gap-3 ${game?.inputFieldTwo ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1 opacity-60">{fieldOneLabel}</label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)]">
              <FiUser className="text-lg" />
            </div>
            <input
              value={playerId}
              onChange={(e) => {
                setPlayerId(e.target.value);
                if (error && setError) setError("");
              }}
              placeholder={`Enter ${fieldOneLabel}`}
              className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-[var(--foreground)] placeholder-[var(--muted)]/40 focus:ring-2 focus:ring-[var(--accent)]/10 outline-none font-bold
                ${error ? "border-red-500/30 focus:border-red-500" : "border-white/5 focus:border-[var(--accent)]"}
              `}
              disabled={loading}
            />
          </div>
        </div>

        {game?.inputFieldTwo && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1 opacity-60">{fieldTwoLabel}</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--accent)] z-10 pointer-events-none">
                <FiGlobe className="text-lg" />
              </div>
              
              {game?.inputFieldTwoOptions?.length > 0 ? (
                <>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none z-10">
                    <FiChevronDown className="text-lg group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <select
                    value={zoneId}
                    onChange={(e) => {
                      setZoneId(e.target.value);
                      if (error && setError) setError("");
                    }}
                    disabled={loading}
                    className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 outline-none transition-all duration-300 font-bold appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[var(--card)]">Select {fieldTwoLabel}</option>
                    {game.inputFieldTwoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[var(--card)] text-white font-medium">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <input
                  value={zoneId}
                  onChange={(e) => {
                    setZoneId(e.target.value);
                    if (error && setError) setError("");
                  }}
                  placeholder={`Enter ${fieldTwoLabel}`}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-[var(--foreground)] placeholder-[var(--muted)]/40 focus:ring-2 focus:ring-[var(--accent)]/10 outline-none font-bold
                    ${error ? "border-red-500/30 focus:border-red-500" : "border-white/5 focus:border-[var(--accent)]"}
                  `}
                  disabled={loading}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="relative group pt-1">
        <div className="absolute inset-0 bg-[var(--accent)] opacity-10 blur-xl group-hover:opacity-20 rounded-xl" />
        <button aria-label="button"
          onClick={onValidate}
          disabled={loading || !!error}
          className={`relative w-full py-3 rounded-xl font-black uppercase tracking-[0.15em] text-[13px] flex items-center justify-center gap-2 overflow-hidden
            ${loading || error
              ? "bg-white/5 text-[var(--muted)] cursor-not-allowed border border-white/5"
              : "bg-[var(--foreground)] text-[var(--background)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
            }`}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Verifying
            </span>
          ) : (
            <>
              {buttonText}
              <FiCheckCircle className="text-lg" />
            </>
          )}
        </button>
      </div>

      {/* Compact Recent List */}
      <div className="pt-2">
        <RecentVerifiedPlayers
          limit={3}
          onSelect={(player) => {
            setPlayerId(player.playerId);
            setZoneId(player.zoneId);
          }}
        />
      </div>
    </div>
  );
}

