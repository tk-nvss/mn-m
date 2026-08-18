"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiStar, FiCalendar, FiCheckCircle, FiArrowRight, FiCheck,
  FiYoutube, FiSmartphone, FiGlobe, FiMessageCircle,
  FiZap, FiRefreshCw, FiClock, FiList, FiLock, FiTrendingUp,
  FiExternalLink, FiAlertCircle, FiUsers, FiChevronLeft, FiChevronRight, 
  FiPlay, FiTarget, FiBox, FiArrowLeft, FiGift, FiInfo, FiAlertTriangle, FiPlus
} from "react-icons/fi";
import { Icons } from "@/components/icons";
import { Pagination, EmptyState, LoadingSpinner } from "@/components/common";
import { formatCoins, formatCurrency, formatNumber, formatDate, formatDateTime } from "@/utils";
import Link from "next/link";
import RouletteGame from "./RouletteGame";
import TreasureGame from "./TreasureGame";
import CoinFlipGame from "./CoinFlipGame";
import SlotMachineGame from "./SlotMachineGame";
import NativeBanner from "@/components/Ads/NativeBanner";
import CustomBanner1 from "@/components/Ads/CustomBanner1";
import CustomBanner2 from "@/components/Ads/CustomBanner2";
import { TaskSkeleton, TransactionSkeleton } from "../Skeleton/Skeleton";
import { ADS_CONFIG } from "@/lib/adsConfig";
import confetti from "canvas-confetti";
import api from "@/lib/axios";


// ──────────────────────────────────────────── TYPES ──────────────────────────
interface Task {
  taskId: string;
  title: string;
  icon: string;
  reward: number;
  type: string;
  url: string;
  status: "available" | "pending" | "completed";
}

interface CoinHistory {
  type: "earn" | "spend";
  coins: number;
  source: string;
  description: string;
  createdAt: string;
}

const TASK_ICONS: Record<string, any> = {
  youtube: <FiYoutube className="text-rose-500" />,
  site: <FiGlobe className="text-blue-500" />,
  app: <FiSmartphone className="text-emerald-500" />,
  social: <FiMessageCircle className="text-sky-500" />,
  custom: <FiStar className="text-amber-500" />,
};

const ICON_STYLES: Record<string, string> = {
  youtube: "bg-rose-500/10 text-rose-400",
  site: "bg-blue-500/10 text-blue-400",
  app: "bg-emerald-500/10 text-emerald-400",
  social: "bg-sky-500/10 text-sky-400",
  custom: "bg-amber-500/10 text-amber-400",
};

// ──────────────────────────────── ADSTERRA CARD ──────────────────────────────
function AdsterraCard({ lastAdReward, adId, adLink, title, onReward, showToast, reward, cooldownMs }: {
  lastAdReward: string | null;
  adId: string;
  adLink: string;
  title?: string;
  onReward: (newBal: number, adId: string, lastTime: string) => void;
  showToast: (m: string, t: "success" | "error") => void;
  reward?: number;
  cooldownMs?: number;
}) {
  const [opened, setOpened] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [cooldownText, setCooldownText] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cooldown effect
  useEffect(() => {
    if (!lastAdReward) {
      setCooldownText(null);
      return;
    }

    const updateCooldown = () => {
      const last = new Date(lastAdReward).getTime();
      const diff = Date.now() - last;
      const currentCooldownMs = cooldownMs || ADS_CONFIG.COOLDOWN_MS;
      const remains = currentCooldownMs - diff;

      if (remains > 0) {
        const mins = Math.floor(remains / 60000);
        const secs = Math.floor((remains % 60000) / 1000);
        setCooldownText(`${mins}m ${secs}s`);
      } else {
        setCooldownText(null);
      }
    };

    updateCooldown();
    const inv = setInterval(updateCooldown, 1000);
    return () => clearInterval(inv);
  }, [lastAdReward]);

  const handleOpen = () => {
    if (cooldownText) return showToast(`Please wait ${cooldownText} for next ad`, "error");
    window.open(adLink, "_blank", "noopener,noreferrer");
    setOpened(true);
    setTimer(15);
  };

  useEffect(() => {
    if (timer === null || timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer((t) => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timer]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const { data } = await api.post("/api/coins/ad-reward", { adId });
      if (data.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#60a5fa', '#ffffff']
        });
        showToast(data.message, "success");
        onReward(data.newBalance, adId, data.transaction?.createdAt || new Date().toISOString());
        setOpened(false);
        setTimer(null);
      } else {
        showToast(data.message, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Reward claim failed", "error");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border p-3 flex flex-col gap-2 overflow-hidden group transition-all ${cooldownText ? "border-[var(--border)] bg-[var(--card)]/20 opacity-80" : "border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 shadow-lg shadow-blue-500/5"
        }`}
    >
      <div className="absolute top-0 right-0 p-1.5">
        <span className={`text-[6px] font-black uppercase tracking-widest px-1 py-0.5 rounded ${cooldownText ? "text-[var(--muted)]/40 bg-[var(--card)]/40" : "text-blue-400/50 bg-blue-500/10"
          }`}>
          {cooldownText ? "Cooldown" : "Bonus"}
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${cooldownText ? "bg-[var(--card)]/40 grayscale" : "bg-blue-500/10 group-hover:scale-110"
          }`}>
          <FiPlay size={14} className={cooldownText ? "text-[var(--muted)]/40 text-xl" : "text-blue-400 text-xl"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-tight shrink-0 truncate ${cooldownText ? "text-[var(--muted)]/60" : ""}`}>
            {cooldownText ? "Locked" : (title || "Watch Ad")}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <FiStar className={cooldownText ? "text-[var(--muted)]/30 text-[8px]" : "text-blue-400 text-[8px]"} />
            <span className={`font-black text-[9px] ${cooldownText ? "text-[var(--muted)]/40" : "text-blue-400"}`}>
              +{reward || ADS_CONFIG.REWARD_COINS} BBC
            </span>
          </div>
        </div>
        {!opened ? (
          <motion.button
            whileHover={{ scale: cooldownText ? 1 : 1.05 }} whileTap={{ scale: cooldownText ? 1 : 0.95 }}
            onClick={handleOpen}
            disabled={!!cooldownText}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all min-w-[75px] justify-center ${cooldownText
              ? "bg-[var(--card)]/40 text-amber-400/80 border border-amber-500/20 cursor-not-allowed"
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              }`}
          >
            {cooldownText ? <><FiClock size={10} /> {cooldownText}</> : <><FiPlay size={10} /> Watch</>}
          </motion.button>
        ) : timer !== null && timer > 0 ? (
          <button aria-label="button"
            disabled
            className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400/50 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase cursor-not-allowed shadow-none min-w-[75px] justify-center"
          >
            <FiClock size={10} className="animate-pulse" /> {timer}s
          </button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            disabled={claiming}
            className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 min-w-[75px] justify-center"
          >
            {claiming ? <FiRefreshCw className="animate-spin text-xs" /> : "Claim"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ──────────────────────────────── TASK CARD ──────────────────────────────────
function TaskCard({ task, onClaim, pendingClaims, isUnlocked, isWatchingAd, adTimer, onStartAd }: {
  task: Task;
  onClaim: (id: string) => Promise<any>;
  pendingClaims: Set<string>;
  isUnlocked?: boolean;
  isWatchingAd?: boolean;
  adTimer?: number | null;
  onStartAd?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isPending = pendingClaims.has(task.taskId);

  const handleAction = async () => {
    if (task.status === "completed" || isPending) return;

    setLoading(true);
    if (task.url && task.url !== "#") {
      window.open(task.url, "_blank", "noopener,noreferrer");
    }

    // Slight delay to simulate user clicking before we show claim
    setTimeout(async () => {
      await onClaim(task.taskId);
      setLoading(false);
    }, 1500);
  };

  const getButtonContent = () => {
    if (isPending) return <><FiClock /> Pending</>;
    if (task.status === "completed") return <><FiCheck /> Completed</>;
    if (loading) return <FiRefreshCw className="animate-spin" />;
    return <><FiArrowRight /> Go</>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative rounded-2xl border p-4 flex items-center gap-4 transition-all ${task.status === "completed"
        ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
        : "bg-[var(--card)]/40 border-[var(--border)]"
        }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl ${ICON_STYLES[task.type] || ICON_STYLES.custom}`}>
        {TASK_ICONS[task.type] || TASK_ICONS.custom}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-tight truncate">{task.title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <FiStar className="text-amber-400 text-[10px]" />
          <span className="text-amber-400 font-black text-[10px]">+{task.reward} BBC</span>
        </div>
      </div>

      {!isUnlocked && task.status !== "completed" && !isPending ? (
        <div className="shrink-0">
          {isWatchingAd ? (
            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20`}>
              <FiClock className="animate-pulse" /> {adTimer}s
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onStartAd}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-purple-600/20"
            >
              Unlock
            </motion.button>
          )}
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: task.status === "completed" ? 1 : 1.05 }}
          whileTap={{ scale: task.status === "completed" ? 1 : 0.95 }}
          onClick={handleAction}
          disabled={task.status === "completed" || isPending || loading}
          className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${task.status === "completed"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
            : isPending
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default"
              : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
            }`}
        >
          {getButtonContent()}
        </motion.button>
      )}
    </motion.div>
  );
}

// ══════════════════════════════════ MAIN COMPONENT ════════════════════════════
type TabKey = "checkin" | "tasks" | "watch" | "convert" | "history" | "games";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "checkin", label: "Check-in", icon: <FiCalendar size={13} /> },
  { key: "watch", label: "Ads", icon: <FiPlay size={13} /> },
  { key: "games", label: "Games", icon: <FiTarget size={13} /> },
  { key: "tasks", label: "Tasks", icon: <FiZap size={13} /> },
];

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CoinsTab() {
  const [activeTab, setActiveTab] = useState<TabKey>("checkin");
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ amount: number; id: number } | null>(null);
  const [coins, setCoins] = useState(0);
  const [historyLimit] = useState(10);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [streak, setStreak] = useState(0);
  const [rewards, setRewards] = useState([2, 3, 5, 7, 10, 12, 15]);
  const [nextReward, setNextReward] = useState(2);

  // Dynamic ad channel rewards tracking
  const [adRewardTimes, setAdRewardTimes] = useState<Record<string, string | null>>({});

  const [history, setHistory] = useState<CoinHistory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingClaims, setPendingClaims] = useState<Set<string>>(new Set());
  const [tasksPage, setTasksPage] = useState(1);
  const [tasksPages, setTasksPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Conversion state
  const [convertCoins, setConvertCoins] = useState("");
  const [converting, setConverting] = useState(false);
  const convertPreview = convertCoins ? (parseInt(convertCoins) / 100).toFixed(2) : null;

  // Ad Gateway State (for Tasks)
  const [unlockedTaskIds, setUnlockedTaskIds] = useState<Set<string>>(new Set());
  const [activeAdTarget, setActiveAdTarget] = useState<string | null>(null);
  const [adTimer, setAdTimer] = useState<number | null>(null);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateCoins = (newVal: any, resultAmount?: number) => {
    if (typeof newVal === "number" && !isNaN(newVal)) {
      setCoins(newVal);
      if (resultAmount !== undefined && resultAmount !== 0) {
        setLastResult({ amount: resultAmount, id: Date.now() });
        setTimeout(() => setLastResult(null), 3000);
      }
    } else if (typeof newVal === "string" && !isNaN(parseInt(newVal))) {
      const val = parseInt(newVal);
      setCoins(val);
      if (resultAmount !== undefined && resultAmount !== 0) {
        setLastResult({ amount: resultAmount, id: Date.now() });
        setTimeout(() => setLastResult(null), 3000);
      }
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    // We'll use the browser's alert for now since we don't have a toast component in this file
    // Ideally use a custom toast UI
    const event = new CustomEvent("show-toast", { detail: { message, type } });
    window.dispatchEvent(event);
  };

  const fetchData = useCallback(async () => {
    try {
      // Fire both requests simultaneously
      const [balRes, taskRes] = await Promise.all([
        api.get(`/api/coins/balance?historyPage=${historyPage}`),
        api.get(`/api/coins/tasks?page=${tasksPage}`),
      ]);

      const bal = balRes.data;
      const tData = taskRes.data;

      // Balance & History
      if (bal.success) {
        updateCoins(bal.coins);
        setCheckedInToday(bal.checkedInToday);
        setStreak(bal.streak || 0);
        setNextReward(bal.nextReward || 5);
        setRewards(bal.rewards || [5, 7, 10, 15, 20, 25, 50]);

        const rewardMap: Record<string, string | null> = {};
        bal.adRewards?.forEach((r: any) => { rewardMap[r.id] = r.lastTime; });
        setAdRewardTimes(rewardMap);

        setHistory(bal.history || []);
        setHistoryPages(bal.historyPages || 1);
      }

      // Tasks
      if (tData.success) {
        setTasks(tData.tasks);
        setTasksPages(tData.pages);
        setPendingClaims(new Set(tData.pendingClaimIds || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [historyPage, tasksPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckin = async () => {
    // Open Ad first
    window.open(ADS_CONFIG.ADSTERRA_LINK, "_blank", "noopener,noreferrer");

    setCheckinLoading(true);
    try {
      const { data } = await api.post("/api/coins/checkin");
      if (data.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#ffffff']
        });
        showToast(data.message, "success");
        setCoins(data.newBalance);
        setCheckedInToday(true);
        setStreak(data.streak);
        fetchData(); // Refresh history
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Check-in failed", "error");
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleClaimTask = async (taskId: string) => {
    try {
      const { data } = await api.post("/api/coins/claim", { taskId });
      if (data.success) {
        showToast(data.message, "success");
        setPendingClaims(prev => new Set([...prev, taskId]));
        return data;
      } else {
        showToast(data.message, "error");
        return data;
      }
    } catch {
      showToast("Claim failed", "error");
    }
  };

  const handleConvert = async () => {
    if (!convertCoins || isNaN(parseInt(convertCoins))) return;
    setConverting(true);
    try {
      const { data } = await api.post("/api/coins/convert", { amount: parseInt(convertCoins) });
      if (data.success) {
        showToast(data.message, "success");
        updateCoins(data.newCoins);
        setConvertCoins("");
        fetchData();
        setActiveTab("checkin");
      } else {
        showToast(data.message, "error");
      }
    } catch {
      showToast("Conversion failed", "error");
    } finally {
      setConverting(false);
    }
  };

  // ── AD GATEWAY LOGIC ──
  const handleStartAd = (targetId: string) => {
    window.open(ADS_CONFIG.ADSTERRA_LINK, "_blank", "noopener,noreferrer");
    setActiveAdTarget(targetId);
    setAdTimer(15);
  };

  useEffect(() => {
    if (adTimer === null || adTimer <= 0) {
      if (adTimer === 0 && activeAdTarget) {
        setUnlockedTaskIds(prev => new Set([...prev, activeAdTarget]));
        setActiveAdTarget(null);
        setAdTimer(null);
      }
      return;
    }
    adTimerRef.current = setTimeout(() => setAdTimer(t => (t ? t - 1 : 0)), 1000);
    return () => { if (adTimerRef.current) clearTimeout(adTimerRef.current); };
  }, [adTimer, activeAdTarget]);
  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 px-2 py-4">
      {/* Balance Skeleton */}
      <div className="h-32 w-full bg-[var(--card)]/40 rounded-[1.5rem] animate-pulse border border-[var(--border)]" />
      
      {/* Tabs Skeleton */}
      <div className="h-14 w-full bg-[var(--card)]/40 rounded-2xl animate-pulse border border-[var(--border)]" />
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  const incompleteTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="max-w-3xl mx-auto space-y-1.5 pb-16 px-2 pt-0.5">

      {/* ── BALANCE CARD ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 mb-0.5">
        <div className="flex items-center justify-between gap-4">

          {/* Left: Balance */}
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-amber-500/25 bg-amber-500/8 w-fit">
              <FiStar className="text-amber-500" size={8} />
              <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">BBC Coins</span>
            </div>
            <div className="flex items-end gap-2 relative">
              <span className="text-5xl font-black text-amber-500 tabular-nums leading-none">{coins || 0}</span>
              <AnimatePresence>
                {lastResult && (
                  <motion.div
                    key={lastResult.id}
                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                    animate={{ opacity: 1, y: -25, scale: 1.2 }}
                    exit={{ opacity: 0, y: -40, scale: 0.8 }}
                    className={`absolute -right-2 top-0 font-black text-lg pointer-events-none ${
                      lastResult.amount > 0 ? "text-emerald-400" : "text-rose-500"
                    }`}
                  >
                    {lastResult.amount > 0 ? `+${lastResult.amount}` : lastResult.amount}
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-[9px] text-[var(--muted)]/50 font-mono mb-1.5">≈ ₹{((coins || 0) / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex gap-2">
            <div className="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-xl border border-[var(--border)] bg-[var(--background)] gap-0.5">
              <div className="flex items-center gap-1">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-black text-[var(--foreground)] tabular-nums">{streak}</span>
              </div>
              <span className="text-[7px] font-bold uppercase tracking-widest text-[var(--muted)]/50">Streak</span>
            </div>
            <div className="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-xl border border-amber-500/30 bg-amber-500/5 gap-0.5">
              <span className="text-sm font-black text-amber-500">+{nextReward}</span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-[var(--muted)]/50">Next</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── CONTENT AREA ──────────────────────────────────────────────── */}
      {!loading && (
        <div className="space-y-2">

          {/* Convert + History */}
          <div className="grid grid-cols-2 gap-2">
            <button aria-label="button"
              onClick={() => { setActiveTab(activeTab === "convert" ? "checkin" : "convert"); setActiveGame(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                activeTab === "convert"
                ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30"
              }`}
            >
              <FiTrendingUp size={13} />
              Convert
            </button>
            <button aria-label="button"
              onClick={() => { setActiveTab(activeTab === "history" ? "checkin" : "history"); setActiveGame(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                activeTab === "history"
                ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30"
              }`}
            >
              <FiList size={13} />
              History
            </button>
          </div>

          {/* Tab bar */}
          <div className="grid grid-cols-4 gap-1 bg-[var(--card)] p-1 rounded-2xl border border-[var(--border)]">
            {TABS.map((tab) => (
              <button aria-label="button"
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setActiveGame(null); }}
                className={`relative flex flex-col items-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wide transition-all ${
                  activeTab === tab.key
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.key === "tasks" && incompleteTasks.length > 0 && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[7px] font-black flex items-center justify-center ${
                    activeTab === "tasks" ? "bg-[var(--background)] text-[var(--foreground)]" : "bg-[var(--foreground)] text-[var(--background)]"
                  }`}>
                    {incompleteTasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── ALL TAB CONTENT ──────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {/* ══ CONVERT ══ */}
            {activeTab === "convert" && (
              <motion.div key="convert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Convert to Wallet</p>

                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <FiStar className="text-amber-500" size={12} />
                  </div>
                  <input
                    type="number"
                    value={convertCoins}
                    onChange={(e) => setConvertCoins(e.target.value)}
                    placeholder="Enter coins (min 100)"
                    className="w-full pl-9 pr-4 h-11 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm font-bold outline-none focus:border-[var(--foreground)]/30 transition-colors placeholder:text-[var(--muted)]/40"
                  />
                </div>

                <AnimatePresence>
                  {convertPreview && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl"
                    >
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">You'll receive</span>
                      <span className="text-emerald-500 font-black text-sm">₹{convertPreview}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConvert}
                  disabled={converting || !convertCoins || parseInt(convertCoins) < 100 || parseInt(convertCoins) > coins}
                  className="w-full h-11 rounded-xl bg-[var(--foreground)] text-[var(--background)] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                >
                  {converting ? <FiRefreshCw className="animate-spin" /> : <><FiArrowRight size={13} /> Add to Wallet</>}
                </motion.button>

                <div className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-xl">
                  <FiLock className="text-[var(--muted)]/40" size={11} />
                  <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)]/40">Min 100 BBC · Instant transfer</p>
                </div>

                <div className="flex items-start gap-2 px-3 py-2.5 border border-[var(--border)]/50 border-dashed rounded-xl">
                  <FiZap className="text-[var(--muted)]/40 shrink-0 mt-0.5" size={11} />
                  <p className="text-[8px] font-bold text-[var(--muted)]/40 uppercase tracking-wide leading-relaxed">
                    Crypto withdrawal & DEX listing coming soon. Hold your coins.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ══ HISTORY ══ */}
            {activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FiList className="text-[var(--muted)] text-sm" />
                  <p className="text-[11px] font-black uppercase tracking-wide">Coin History</p>
                  <button aria-label="button" onClick={fetchData} className="ml-auto text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
                    <FiRefreshCw className="text-xs" />
                  </button>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12 text-[var(--muted)]/40">
                    <FiList className="text-3xl mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-wide">No transactions yet</p>
                    <p className="text-[9px] mt-1">Complete tasks or check in to earn coins!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/30 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.type === "earn" ? "bg-amber-500/10" : "bg-rose-500/10"
                            }`}>
                            <FiStar className={`text-[10px] ${item.type === "earn" ? "text-amber-400" : "text-rose-400"}`} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black truncate max-w-[200px]">{item.description}</p>
                            <p className="text-[8px] text-[var(--muted)]/40 font-mono">
                              {formatDate(item.createdAt, { style: "short" })}
                            </p>
                          </div>
                        </div>
                        <span className={`font-black text-[11px] ${item.type === "earn" ? "text-amber-400" : "text-rose-400"}`}>
                          {item.type === "earn" ? "+" : "-"}{formatCoins(item.coins)}
                        </span>
                      </div>
                    ))}

                    <Pagination
                      page={historyPage}
                      totalPages={historyPages}
                      onPageChange={setHistoryPage}
                      size="sm"
                      hideOnSinglePage
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ GAMES ══ */}
            {activeTab === "games" && (
              <motion.div key="games" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeGame === null ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Lucky Spin */}
                    <button aria-label="button" 
                      onClick={() => setActiveGame("roulette")}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-5 transition-all hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 text-left hover:-translate-y-1"
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 blur-[40px] rounded-full group-hover:bg-amber-500/20 transition-all" />
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <FiTarget size={56} className="text-amber-500" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          <FiTarget className="text-amber-500 text-xl" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[13px] font-black uppercase tracking-wider text-amber-500/90 italic">Lucky Spin</h4>
                          <p className="text-[10px] text-[var(--muted)]/70 font-bold uppercase tracking-tight">Spin & Win up to 1 BBC</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">Play Now</span>
                          <FiArrowRight className="text-[10px] text-amber-500" />
                        </div>
                      </div>
                    </button>

                    {/* Treasure Pick */}
                    <button aria-label="button" 
                      onClick={() => setActiveGame("treasure")}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-5 transition-all hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 text-left hover:-translate-y-1"
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <FiBox size={56} className="text-blue-500" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          <FiBox className="text-blue-500 text-xl" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[13px] font-black uppercase tracking-wider text-blue-500/90 italic">Treasure Pick</h4>
                          <p className="text-[10px] text-[var(--muted)]/70 font-bold uppercase tracking-tight">Pick a chest to find 1 BBC</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Open Now</span>
                          <FiArrowRight className="text-[10px] text-blue-500" />
                        </div>
                      </div>
                    </button>

                    {/* Coin Flip - High Stakes */}
                    <button aria-label="button" 
                      onClick={() => setActiveGame("coinflip")}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-5 transition-all hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/10 text-left hover:-translate-y-1"
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 blur-[40px] rounded-full group-hover:bg-rose-500/20 transition-all" />
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <FiZap size={56} className="text-rose-500" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <FiZap className="text-rose-500 text-xl" />
                          </div>
                          <span className="px-2 py-0.5 rounded text-[7px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">High Stakes</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[13px] font-black uppercase tracking-wider text-rose-500/90 italic">Coin Flip</h4>
                          <p className="text-[10px] text-[var(--muted)]/70 font-bold uppercase tracking-tight">Heads or Tails? +/- 2 BBC</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">Flip Now</span>
                          <FiArrowRight className="text-[10px] text-rose-500" />
                        </div>
                      </div>
                    </button>


                    {/* Mega Slots */}
                    <button aria-label="button" 
                      onClick={() => setActiveGame("slot")}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-5 transition-all hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 text-left hover:-translate-y-1"
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 blur-[40px] rounded-full group-hover:bg-purple-500/20 transition-all" />
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        <FiStar size={56} className="text-purple-500" />
                      </div>
                      <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                            <FiStar className="text-purple-500 text-xl" />
                          </div>
                          <span className="px-2 py-0.5 rounded text-[7px] font-black uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20">Hot</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[13px] font-black uppercase tracking-wider text-purple-500/90 italic">Mega Slots</h4>
                          <p className="text-[10px] text-[var(--muted)]/70 font-bold uppercase tracking-tight">Match 3 to win up to 5 BBC</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-purple-500">Spin Now</span>
                          <FiArrowRight className="text-[10px] text-purple-500" />
                        </div>
                      </div>
                    </button>

                    {/* Placeholder for future games */}
                    <div className="rounded-2xl border border-[var(--border)] border-dashed bg-[var(--card)]/20 p-4 flex flex-col items-center justify-center gap-2 opacity-40">
                      <FiLock className="text-[var(--muted)]" />
                      <p className="text-[9px] font-black uppercase tracking-widest">More Games Coming Soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <button aria-label="button" 
                        onClick={() => setActiveGame(null)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--foreground)]/[0.03] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                      >
                        <FiChevronLeft /> Back to Games
                      </button>
                    </div>
                    {activeGame === "roulette" && (
                      <RouletteGame 
                        coins={coins} 
                        onWin={(win, balance) => updateCoins(balance, win)} 
                        showToast={showToast} 
                      />
                    )}
                    {activeGame === "treasure" && (
                      <TreasureGame 
                        coins={coins} 
                        onWin={(win, balance) => updateCoins(balance, win)} 
                        showToast={showToast} 
                      />
                    )}
                    {activeGame === "coinflip" && (
                      <CoinFlipGame 
                        coins={coins} 
                        onWin={(win, balance) => updateCoins(balance, win)} 
                        showToast={showToast} 
                      />
                    )}
                    {activeGame === "slot" && (
                      <SlotMachineGame 
                        coins={coins} 
                        onWin={(win, balance) => updateCoins(balance, win)} 
                        showToast={showToast} 
                      />
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ CHECK-IN ══ */}
            {activeTab === "checkin" && (
              <motion.div key="checkin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <FiCalendar className="text-blue-400" size={15} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">Daily Check-in</p>
                      <p className="text-[9px] text-[var(--muted)]/60 font-bold uppercase tracking-wider mt-0.5">
                        {checkedInToday ? `Day ${streak} complete ✓` : `Next: +${nextReward} BBC`}
                      </p>
                    </div>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-xl">
                      <span className="text-sm">🔥</span>
                      <span className="text-amber-400 font-black text-sm">{streak}</span>
                      <span className="text-amber-400/60 font-bold text-[9px] uppercase">/7</span>
                    </div>
                  )}
                </div>

                {/* 7-day grid */}
                <div className="grid grid-cols-7 gap-1">
                  {rewards.map((reward, i) => {
                    const day = i + 1;
                    const isCompleted = day <= (checkedInToday ? streak : streak);
                    const isToday = day === streak && checkedInToday;
                    const isCurrent = day === (checkedInToday ? streak : streak + 1);
                    return (
                      <div key={day} className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl border transition-all ${
                        isToday ? "bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10"
                        : isCompleted ? "bg-emerald-500/10 border-emerald-500/25"
                          : isCurrent && !checkedInToday ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/30 shadow-sm"
                            : "bg-[var(--background)]/50 border-[var(--border)]/50"
                        }`}>
                        <span className="text-[7px] font-black uppercase text-[var(--muted)]/50">{DAY_LABELS[i]}</span>
                        <span className={`text-[9px] font-black ${
                          isToday || isCompleted ? "text-amber-400" : isCurrent ? "text-blue-400" : "text-[var(--muted)]/30"
                          }`}>
                          {isToday || isCompleted ? "✓" : reward}
                        </span>
                        {day === 7 && <span className="text-[8px]">🎉</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Reward labels */}
                <div className="flex gap-1 text-[7px] font-bold text-center text-[var(--muted)]/40 tracking-wide">
                  {rewards.map((r, i) => <div key={i} className="flex-1">{r} BBC</div>)}
                </div>

                <motion.button
                  whileHover={{ scale: checkedInToday ? 1 : 1.02 }}
                  whileTap={{ scale: checkedInToday ? 1 : 0.97 }}
                  onClick={handleCheckin}
                  disabled={checkedInToday || checkinLoading}
                  className={`w-full py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    checkedInToday
                    ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 cursor-default"
                    : "bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-500/25 active:scale-[0.98]"
                    }`}
                >
                  {checkinLoading ? (
                    <FiRefreshCw className="animate-spin text-sm" />
                  ) : checkedInToday ? (
                    <><FiCheckCircle /> Checked In — Day {streak}</>
                  ) : (
                    <><FiCalendar /> Check In (+{nextReward} BBC)</>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ══ TASKS ══ */}
            {activeTab === "tasks" && (
              <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiZap className="text-[var(--accent)] text-sm" />
                    <p className="text-[11px] font-black uppercase tracking-wide">Earn Tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingClaims.size > 0 && (
                      <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        {pendingClaims.size} pending
                      </span>
                    )}
                    <button aria-label="button" onClick={fetchData} className="text-[var(--muted)]/40 hover:text-[var(--muted)] transition-colors">
                      <FiRefreshCw className="text-xs" />
                    </button>
                  </div>
                </div>

                {pendingClaims.size > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <FiAlertCircle className="text-amber-400 text-xs shrink-0" />
                    <p className="text-[8px] text-amber-400 font-bold">Claims require admin approval before coins are awarded.</p>
                  </div>
                )}


                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-[var(--muted)]/40">
                    <FiList className="text-3xl mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-wide">No tasks available</p>
                    <p className="text-[9px] mt-1">Check back soon!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incompleteTasks.map((task) => (
                      <TaskCard
                        key={task.taskId}
                        task={task}
                        onClaim={handleClaimTask}
                        pendingClaims={pendingClaims}
                        isUnlocked={unlockedTaskIds.has(task.taskId)}
                        isWatchingAd={activeAdTarget === task.taskId}
                        adTimer={activeAdTarget === task.taskId ? adTimer : null}
                        onStartAd={() => handleStartAd(task.taskId)}
                      />
                    ))}
                    {completedTasks.length > 0 && (
                      <>
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]/30 pt-2">Completed</p>
                        {completedTasks.map((task) => (
                          <div key={task.taskId} className="opacity-40">
                            <TaskCard
                              task={task}
                              onClaim={async () => ({})}
                              pendingClaims={pendingClaims}
                              isUnlocked={true}
                            />
                          </div>
                        ))}
                      </>
                    )}

                    {tasksPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-4">
                        <button aria-label="button" onClick={() => setTasksPage(p => Math.max(1, p - 1))} disabled={tasksPage === 1}
                          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 disabled:opacity-30">
                          <FiChevronLeft className="text-xs" />
                        </button>
                        <span className="text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">
                          {tasksPage} / {tasksPages}
                        </span>
                        <button aria-label="button" onClick={() => setTasksPage(p => Math.min(tasksPages, p + 1))} disabled={tasksPage === tasksPages}
                          className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 disabled:opacity-30">
                          <FiChevronRight className="text-xs" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ WATCH ADS ══ */}
            {activeTab === "watch" && (
              <motion.div key="watch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <FiPlay className="text-blue-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide">Watch Ads & Earn</p>
                    <p className="text-[9px] text-[var(--muted)]/60 font-bold uppercase">Earn daily rewards instantly</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {ADS_CONFIG.WATCH_EARN_CHANNELS.map((channel) => (
                    <AdsterraCard
                      key={channel.id}
                      adId={channel.id}
                      title={channel.title}
                      adLink={channel.link}
                      reward={(channel as any).reward}
                      cooldownMs={(channel as any).cooldownMs}
                      lastAdReward={adRewardTimes[channel.id] || null}
                      onReward={(bal, id, lastTime) => {
                        setCoins(bal);
                        setAdRewardTimes(prev => ({ ...prev, [id]: lastTime }));
                      }}
                      showToast={showToast}
                    />
                  ))}
                </div>

                <div className="relative rounded-2xl border border-[var(--border)] bg-gradient-to-br from-blue-500/5 to-indigo-500/5 p-3 overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <FiAlertCircle className="text-blue-400 text-sm" />
                    </div>
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-wide text-white/80">Ad Information</h5>
                      <p className="text-[9px] text-[var(--muted)] mt-1 leading-relaxed">
                        Watch the full 15 seconds to be eligible for rewards. You can claim this bonus once every 45 minutes. Make sure your internet connection is stable.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      )}
      {/* Adsterra Banner */}
      {/* Adsterra Banners */}
      <NativeBanner />

    </div>
  );
}
