"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiExternalLink,
  FiX,
  FiTag,
  FiStar
} from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";

interface EventItem {
  _id?: string;
  title: string;
  description?: string;
  image?: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  game?: string;
  eventType?: string;
  link?: string;
  location?: string;
  isFeatured?: boolean;
  status?: string;
  color?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

export default function EventCalendarPage() {
  const today = useMemo(() => new Date(), []);
  
  // Navigation state (Default to current month / year)
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  
  // Filter toggle: "Only Event Days"
  const [onlyEventDays, setOnlyEventDays] = useState<boolean>(false);
  
  // Selected date for details or popup modal
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [activeModalEvent, setActiveModalEvent] = useState<EventItem | null>(null);
  const [showEmptyDayModal, setShowEmptyDayModal] = useState<boolean>(false);
  const [emptyModalDateStr, setEmptyModalDateStr] = useState<string>("");

  // Events data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Month navigation restrictions: 1 previous month (-1), current month (0), 2 next months (+1, +2)
  const currentTotalMonths = today.getFullYear() * 12 + today.getMonth();
  const selectedTotalMonths = currentYear * 12 + currentMonth;
  const monthDiff = selectedTotalMonths - currentTotalMonths;

  const canGoPrev = monthDiff > -1;
  const canGoNext = monthDiff < 2;

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Fetch events for current selected month & year
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events?month=${currentMonth + 1}&year=${currentYear}`);
        const data = await res.json();
        if (data.success) {
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Failed to load events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [currentMonth, currentYear]);

  // Map events to day numbers in the active month
  const eventsByDate = useMemo(() => {
    const map: Record<number, EventItem[]> = {};
    events.forEach((ev: EventItem) => {
      const d = new Date(ev.startDate);
      const dayNum = d.getDate();
      if (!map[dayNum]) map[dayNum] = [];
      map[dayNum].push(ev);
    });
    return map;
  }, [events]);

  // Calendar Grid generation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  // Click on a calendar day cell
  const handleDayClick = (dayNum: number) => {
    const clickedDate = new Date(currentYear, currentMonth, dayNum);
    setSelectedDate(clickedDate);
    const dayEvents = eventsByDate[dayNum] || [];

    if (dayEvents.length > 0) {
      // Open modal with the first event
      setActiveModalEvent(dayEvents[0]);
    } else {
      // Open "No Event Today" modal matching user mockup
      const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      setEmptyModalDateStr(formattedDate);
      setShowEmptyDayModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">

        {/* TOP CONTROLS: Only Event Days Toggle */}
        <div className="flex justify-end px-1">
          <button
            onClick={() => setOnlyEventDays(!onlyEventDays)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all border shadow-sm active:scale-95 ${
              onlyEventDays
                ? "bg-blue-600/15 border-blue-500 text-blue-400 shadow-blue-500/10"
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <span>🎯</span>
            <span>Only Event Days</span>
          </button>
        </div>

        {/* CALENDAR CARD CONTAINER */}
        <div className="bg-[var(--card)]/50 border border-[var(--border)] rounded-2xl sm:rounded-3xl p-3 sm:p-7 shadow-sm space-y-4 sm:space-y-6">
          
          {/* Month Switcher Header */}
          <div className="flex items-center justify-between max-w-md mx-auto px-2">
            <button
              onClick={handlePrevMonth}
              disabled={!canGoPrev}
              aria-label="Previous Month"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--foreground)]/5 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              <FiChevronLeft size={18} />
            </button>

            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[var(--foreground)] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h1>

            <button
              onClick={handleNextMonth}
              disabled={!canGoNext}
              aria-label="Next Month"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--foreground)]/5 active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-3 text-center pt-2">
            {WEEKDAYS.map((day, dIdx) => (
              <div key={day} className="text-xs sm:text-sm font-semibold text-[var(--muted)] py-0.5 sm:py-1">
                <span className="sm:hidden">{WEEKDAYS_SHORT[dIdx]}</span>
                <span className="hidden sm:inline">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          {loading ? (
            <div className="h-64 sm:h-80 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner size="lg" color="accent" />
              <p className="text-xs text-[var(--muted)] font-mono">Loading calendar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3.5">
              {/* Empty padding slots before first day */}
              {Array.from({ length: firstDayWeekday }).map((_, idx) => (
                <div key={`empty-${idx}`} className="aspect-square sm:h-24 rounded-xl sm:rounded-2xl bg-transparent" />
              ))}

              {/* Day Cards */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dayEvents = eventsByDate[dayNum] || [];
                const hasEvents = dayEvents.length > 0;

                const isToday =
                  today.getDate() === dayNum &&
                  today.getMonth() === currentMonth &&
                  today.getFullYear() === currentYear;

                const isSelected =
                  selectedDate.getDate() === dayNum &&
                  selectedDate.getMonth() === currentMonth &&
                  selectedDate.getFullYear() === currentYear;

                // Dim non-event days if onlyEventDays filter is on
                const isDimmed = onlyEventDays && !hasEvents;

                  const hasImage = hasEvents && !!dayEvents[0]?.image;

                  return (
                    <motion.button
                      key={`day-${dayNum}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDayClick(dayNum)}
                      className={`relative aspect-square sm:h-24 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl flex flex-col justify-between items-start transition-all text-left group overflow-hidden border ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/40 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                          : isToday
                          ? "border-[var(--accent)] bg-[var(--accent)]/5"
                          : hasEvents
                          ? "border-[var(--border)] bg-[var(--card)] hover:border-blue-400 hover:shadow-md"
                          : "border-[var(--border)]/60 bg-[var(--card)]/40 hover:bg-[var(--card)] hover:border-[var(--border)]"
                      } ${isDimmed ? "opacity-20 grayscale hover:opacity-80 transition-opacity" : ""}`}
                    >
                      {/* Full-cell Background Image if available */}
                      {hasImage && (
                        <>
                          <img
                            src={dayEvents[0].image}
                            alt={dayEvents[0].title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />
                        </>
                      )}

                      {/* Top row: Day Number & Event count pill */}
                      <div className="w-full flex items-center justify-between relative z-10">
                        <span
                          className={`text-xs sm:text-base font-bold ${
                            hasImage
                              ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black"
                              : isSelected
                              ? "text-blue-500 font-black"
                              : isToday
                              ? "text-[var(--accent)] font-black"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {dayNum}
                        </span>

                        {hasEvents && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md sm:rounded-full text-[7.5px] sm:text-[8.5px] font-black text-white shadow-sm ${
                              hasImage ? "bg-black/60 backdrop-blur border border-white/20" : ""
                            }`}
                            style={{ backgroundColor: !hasImage ? (dayEvents[0]?.color || "#3b82f6") : undefined }}
                          >
                            {dayEvents.length > 1 ? `+${dayEvents.length - 1}` : (
                              <span className="hidden sm:inline">Event</span>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Bottom row / title snippet */}
                      {hasEvents && (
                        <div className="w-full mt-auto relative z-10">
                          {hasImage ? (
                            <div className="hidden sm:block w-full">
                              <p className="text-[9.5px] font-black text-white truncate drop-shadow-md leading-tight">
                                {dayEvents[0].title}
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* Desktop fallback title */}
                              <div className="hidden sm:block w-full">
                                <div
                                  className="w-full truncate text-[10px] font-bold px-2 py-1 rounded-lg text-white shadow-sm"
                                  style={{ backgroundColor: dayEvents[0]?.color || "#3b82f6" }}
                                >
                                  {dayEvents[0].title}
                                </div>
                              </div>
                              {/* Mobile dot fallback */}
                              <div className="sm:hidden flex items-center justify-center gap-0.5 mb-0.5">
                                <span
                                  className="w-2 h-2 rounded-full block animate-pulse shadow-sm"
                                  style={{ backgroundColor: dayEvents[0]?.color || "#3b82f6" }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM BANNER: Compact Lock Notice */}
        <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-[var(--card)]/40 border border-[var(--border)]/50 text-[10px] sm:text-[11px] text-[var(--muted)] shadow-sm max-w-fit mx-auto text-center">
          <span className="text-amber-400 text-xs">🔒</span>
          <span>
            You can view only <strong className="text-[var(--foreground)] font-bold">1 previous month</strong> and <strong className="text-[var(--foreground)] font-bold">2 next months</strong>.
          </span>
        </div>

      </div>

      {/* ================= MODAL: NO EVENT TODAY (Matching User Image 2) ================= */}
      <AnimatePresence>
        {showEmptyDayModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmptyDayModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm sm:max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-3 sm:space-y-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowEmptyDayModal(false)}
                className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-black text-blue-500 tracking-tight">
                No Event Today
              </h3>

              {/* Description */}
              <div className="space-y-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                <p>
                  There is no event on <strong className="text-[var(--foreground)]">{emptyModalDateStr}</strong>.
                </p>
                <p>No upcoming events.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: EVENT DETAILS MODAL ================= */}
      <AnimatePresence>
        {activeModalEvent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalEvent(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-sm sm:max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh] sm:max-h-[90vh]"
            >
              {/* Header Image if available */}
              {activeModalEvent.image ? (
                <div className="relative h-44 sm:h-64 w-full bg-neutral-950 overflow-hidden shrink-0">
                  <img
                    src={activeModalEvent.image}
                    alt={activeModalEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />

                  {/* Close button */}
                  <button
                    onClick={() => setActiveModalEvent(null)}
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center transition-colors shadow-lg"
                    aria-label="Close"
                  >
                    <FiX size={18} />
                  </button>

                  {/* Badges on image */}
                  <div className="absolute bottom-2.5 sm:bottom-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black text-white uppercase shadow-md"
                      style={{ backgroundColor: activeModalEvent.color || "#3b82f6" }}
                    >
                      {activeModalEvent.eventType}
                    </span>

                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-black/70 backdrop-blur text-[10px] sm:text-xs font-black text-white uppercase border border-white/10">
                      {activeModalEvent.game}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 pb-0 flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-black text-white uppercase"
                      style={{ backgroundColor: activeModalEvent.color || "#3b82f6" }}
                    >
                      {activeModalEvent.eventType}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[var(--foreground)]/10 text-xs font-black text-[var(--foreground)] uppercase">
                      {activeModalEvent.game}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveModalEvent(null)}
                    className="w-8 h-8 rounded-full bg-neutral-500/20 hover:bg-neutral-500/30 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              )}

              {/* Body Content */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] leading-tight">
                    {activeModalEvent.title}
                  </h2>

                  <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold text-[var(--accent)] mt-1.5 sm:mt-2 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar size={13} />
                      {new Date(activeModalEvent.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>

                    {activeModalEvent.location && (
                      <span className="flex items-center gap-1.5 text-[var(--muted)]">
                        <FiMapPin size={13} />
                        {activeModalEvent.location}
                      </span>
                    )}
                  </div>
                </div>

                {activeModalEvent.description && (
                  <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--foreground)]/[0.02] border border-[var(--border)] text-xs text-[var(--foreground)]/80 leading-relaxed whitespace-pre-line">
                    {activeModalEvent.description}
                  </div>
                )}

                {/* Link button */}
                {activeModalEvent.link && (
                  <a
                    href={activeModalEvent.link}
                    target={activeModalEvent.link.startsWith("http") ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[var(--accent)] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-lg"
                  >
                    <span>View Event Details</span>
                    <FiExternalLink size={13} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
