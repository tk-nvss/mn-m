"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiArrowRight,
  FiClock,
  FiMapPin,
  FiExternalLink
} from "react-icons/fi";

export default function HomeEventsSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const res = await fetch("/api/events?upcomingOnly=true&limit=6");
        const data = await res.json();
        if (data.success) {
          setEvents(data.events || []);
        }
      } catch (e) {
        console.error("Home events fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  if (!loading && events.length === 0) {
    return null; // hide cleanly if no events
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 my-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <FiCalendar size={16} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight uppercase text-[var(--foreground)] flex items-center gap-2">
              Event Calendar & Scrims
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            </h2>
            <p className="text-[10px] text-[var(--muted)] font-mono leading-tight">
              Tournaments, in-game events, and schedule
            </p>
          </div>
        </div>

        <Link
          href="/events"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-all active:scale-95 group shrink-0"
        >
          <span>View All</span>
          <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Events Carousel / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-[var(--card)]/50 border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {events.map((ev, idx) => {
            const sDate = new Date(ev.startDate);
            return (
              <Link
                key={ev._id || idx}
                href="/events"
                className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Poster / Header */}
                <div className="relative h-32 w-full bg-neutral-950 overflow-hidden">
                  {ev.image ? (
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--muted)]/20">
                      <FiCalendar size={28} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-[8.5px] font-black text-white uppercase shadow"
                      style={{ backgroundColor: ev.color || "#3b82f6" }}
                    >
                      {ev.eventType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[8.5px] font-black text-white uppercase border border-white/10">
                      {ev.game}
                    </span>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <h3 className="text-xs font-black text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {ev.title}
                    </h3>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 flex items-center justify-between text-[11px] font-bold text-[var(--muted)] border-t border-[var(--border)]/60">
                  <span className="flex items-center gap-1.5 text-[var(--accent)] font-mono">
                    <FiClock size={12} />
                    {sDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-[var(--muted)] truncate max-w-[120px]">
                    <FiMapPin size={11} />
                    {ev.location || "Online"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
