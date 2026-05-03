"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listElections, type ElectionResponse } from "../../../lib/api";

const G      = "#1a4731";
const GL     = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG     = "#f7faf8";

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string; pulse: boolean }> = {
  active:    { bg: "#fef2f2", color: "#ef4444", label: "LIVE NOW",   pulse: true  },
  upcoming:  { bg: "#fffbeb", color: "#d97706", label: "UPCOMING",   pulse: false },
  completed: { bg: "#f0fdf4", color: "#16a34a", label: "COMPLETED",  pulse: false },
};

const TYPE_LABEL: Record<string, string> = {
  federal:    "Federal — National Assembly",
  provincial: "Provincial Assembly",
  local:      "Local Bodies",
};

function fmt(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return {
    day:   dt.getDate().toString().padStart(2, "0"),
    month: dt.toLocaleString("en-PK", { month: "short" }),
    year:  dt.getFullYear().toString(),
    full:  dt.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }),
  };
}

export default function ElectionSchedulePage() {
  const [elections, setElections] = useState<ElectionResponse[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState("All");
  const [expanded,  setExpanded]  = useState<number | null>(null);

  useEffect(() => {
    // Fetch active and upcoming in parallel, merge and sort by start_date
    Promise.all([
      listElections("active"),
      listElections("upcoming"),
    ])
      .then(([active, upcoming]) => {
        const merged = [...active, ...upcoming].sort((a, b) => {
          if (!a.start_date) return 1;
          if (!b.start_date) return -1;
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        });
        setElections(merged);
      })
      .catch(() => setError("Could not load elections. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  const FILTERS = ["All", "federal", "provincial", "local"];

  const filtered = filter === "All"
    ? elections
    : elections.filter(e => e.type === filter);

  const activeCount   = elections.filter(e => e.status === "active").length;
  const upcomingCount = elections.filter(e => e.status === "upcoming").length;

  return (
    <>
      {/* Hero */}
      <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">
            Election Commission of Pakistan
          </p>
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3"
            style={{ fontFamily: "Georgia, serif" }}>
            Election Schedule
          </h1>
          <p className="text-base text-white/70 max-w-xl">
            Official schedule for all registered elections. Register before the deadline to cast your vote.
          </p>
        </div>
      </section>

      <div className="px-4 lg:px-8 py-10" style={{ background: BG, minHeight: "70vh" }}>
        <div className="max-w-7xl mx-auto">

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              [activeCount,   "Active Now", "#fef2f2", "#ef4444"],
              [upcomingCount, "Upcoming",   "#fffbeb", "#d97706"],
            ].map(([v, l, bg, c]) => (
              <div key={String(l)} className="rounded-2xl border p-5 shadow-sm"
                style={{ background: "#fff", borderColor: BORDER }}>
                <p className="text-3xl font-bold mb-1"
                  style={{ color: c as string, fontFamily: "Georgia, serif" }}>
                  {loading ? "—" : String(v)}
                </p>
                <p className="text-xs text-gray-400 font-medium">{String(l)}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap mb-6">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold transition-all capitalize"
                style={{
                  borderColor: filter === f ? G : BORDER,
                  background:  filter === f ? G : "#fff",
                  color:       filter === f ? "#fff" : "#6b7280",
                }}>
                {f === "All" ? "All" : (TYPE_LABEL[f] ?? f)}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse"
                  style={{ borderColor: BORDER }}>
                  <div className="flex gap-5 items-center">
                    <div className="w-16 h-12 rounded-xl bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              No elections found.
            </div>
          )}

          {/* Election list */}
          {!loading && (
            <div className="flex flex-col gap-3">
              {filtered.map((e) => {
                const s    = STATUS_CONFIG[e.status ?? "upcoming"] ?? STATUS_CONFIG.upcoming;
                const open = expanded === e.id;
                const start = fmt(e.start_date);
                const end   = fmt(e.end_date);

                return (
                  <div key={e.id}
                    className="bg-white rounded-2xl border shadow-sm overflow-hidden transition-all"
                    style={{ borderColor: open ? G : BORDER }}>

                    {/* Row */}
                    <div
                      className="grid items-center gap-5 p-5 cursor-pointer"
                      style={{ gridTemplateColumns: "64px 1px 1fr auto auto" }}
                      onClick={() => setExpanded(open ? null : e.id)}>

                      {/* Date */}
                      <div className="text-center">
                        {typeof start === "object" ? (
                          <>
                            <p className="text-2xl font-bold leading-none"
                              style={{ color: G, fontFamily: "Georgia, serif" }}>
                              {start.day}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                              {start.month} {start.year}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">TBD</p>
                        )}
                      </div>

                      <div className="h-10 w-px" style={{ background: BORDER }} />

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="font-bold text-gray-900">{e.name}</span>
                          <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: s.bg, color: s.color }}>
                            {s.pulse && (
                              <span className="w-1 h-1 rounded-full animate-pulse inline-block"
                                style={{ background: s.color }} />
                            )}
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 capitalize">
                          {TYPE_LABEL[e.type ?? ""] ?? e.type ?? "—"}
                        </p>
                      </div>

                      {/* CTA */}
                      <Link
                        href={e.status === "active" ? "/vote" : "#"}
                        onClick={(ev) => ev.stopPropagation()}
                        className="px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                        style={{
                          background: e.status === "active" ? G : "#f3f4f6",
                          color:      e.status === "active" ? "#fff" : "#6b7280",
                        }}>
                        {e.status === "active" ? "Vote Now →" : "View Details"}
                      </Link>

                      {/* Chevron */}
                      <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth={2.5}
                        viewBox="0 0 24 24"
                        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expanded detail — only real data */}
                    {open && (
                      <div className="px-7 pb-6 border-t pt-5 grid grid-cols-1 sm:grid-cols-3 gap-5"
                        style={{ borderColor: BORDER, background: GL }}>
                        {[
                          ["Election Type", TYPE_LABEL[e.type ?? ""] ?? e.type ?? "—"],
                          ["Status",        e.status ?? "—"],
                          ["Start Date",    typeof start === "object" ? start.full : "—"],
                          ["End Date",      typeof end   === "object" ? end.full   : "—"],
                        ].map(([l, v]) => (
                          <div key={String(l)}>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">
                              {l}
                            </p>
                            <p className="text-sm font-semibold text-gray-800 capitalize">{v}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
