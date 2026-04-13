"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  listElections, listCandidates, listConstituencies,
  type ElectionResponse,
} from "../../../../lib/api";

const QUICK_LINKS = [
  {
    label: "Manage Elections",
    desc: "Create, update status, delete elections",
    href: "/admin/elections",
    color: "from-[#22c55e]/20 to-[#22c55e]/5",
    border: "border-[#22c55e]/25",
    icon: (
      <svg width="22" height="22" fill="none" stroke="#22c55e" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Manage Candidates",
    desc: "Add or remove candidates per constituency",
    href: "/admin/candidates",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/25",
    icon: (
      <svg width="22" height="22" fill="none" stroke="#60a5fa" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Manage Locations",
    desc: "Provinces, cities, districts, constituencies",
    href: "/admin/locations",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/25",
    icon: (
      <svg width="22" height="22" fill="none" stroke="#a78bfa" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "View Results",
    desc: "Live and final election results",
    href: "/admin/results",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/25",
    icon: (
      <svg width="22" height="22" fill="none" stroke="#fbbf24" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const STATUS_COLORS: Record<string, string> = {
  upcoming:  "bg-blue-900/30 text-blue-400 border-blue-700/40",
  active:    "bg-green-900/30 text-green-400 border-green-700/40",
  completed: "bg-gray-700/40 text-gray-400 border-gray-600/40",
};

export default function AdminDashboardPage() {
  const [elections,       setElections]       = useState<ElectionResponse[]>([]);
  const [candidateCount,  setCandidateCount]  = useState<number | null>(null);
  const [constCount,      setConstCount]      = useState<number | null>(null);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([listElections(), listCandidates(), listConstituencies()])
      .then(([el, ca, co]) => {
        setElections(el);
        setCandidateCount(ca.length);
        setConstCount(co.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount    = elections.filter(e => e.status === "active").length;
  const upcomingCount  = elections.filter(e => e.status === "upcoming").length;
  const completedCount = elections.filter(e => e.status === "completed").length;

  const fmt = (d?: string | null) => d
    ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back. Here's an overview of the system.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Elections",  value: elections.length,   color: "text-white" },
          { label: "Active Now",       value: activeCount,        color: "text-[#22c55e]" },
          { label: "Upcoming",         value: upcomingCount,      color: "text-blue-400" },
          { label: "Candidates",       value: candidateCount,     color: "text-purple-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl px-5 py-4">
            {loading ? (
              <div className="h-8 w-12 rounded bg-[#22c55e]/10 animate-pulse mb-1" />
            ) : (
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value ?? "—"}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(q => (
            <Link key={q.label} href={q.href}
              className={`bg-gradient-to-br ${q.color} border ${q.border} rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.01] transition-all`}>
              <div className="w-11 h-11 rounded-xl bg-[#0f1f17] flex items-center justify-center flex-shrink-0">
                {q.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{q.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{q.desc}</p>
              </div>
              <svg className="ml-auto text-gray-600 flex-shrink-0" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent elections */}
      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a4a36] flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Recent Elections</h2>
          <Link href="/admin/elections" className="text-xs text-[#22c55e] font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="w-7 h-7 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No elections yet.{" "}
            <Link href="/admin/elections" className="text-[#22c55e] hover:underline">Create one →</Link>
          </div>
        ) : (
          <div className="divide-y divide-[#1e3828]">
            {elections.slice(0, 5).map(el => (
              <div key={el.id} className="px-6 py-4 flex flex-wrap items-center gap-3 hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{el.name}</p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">{el.type ?? "—"} · {fmt(el.start_date)} – {fmt(el.end_date)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize ${STATUS_COLORS[el.status ?? "upcoming"] ?? STATUS_COLORS.upcoming}`}>
                  {el.status}
                </span>
                <Link href="/admin/results" className="text-xs text-[#22c55e] font-semibold hover:underline whitespace-nowrap">
                  Results →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
        <div className="bg-[#162b1e] border border-[#2a4a36] rounded-xl px-5 py-4">
          <p className="font-semibold text-gray-300 mb-1">Constituencies in System</p>
          <p className="text-2xl font-black text-white">{constCount ?? "—"}</p>
        </div>
        <div className="bg-[#162b1e] border border-[#2a4a36] rounded-xl px-5 py-4">
          <p className="font-semibold text-gray-300 mb-1">Completed Elections</p>
          <p className="text-2xl font-black text-white">{completedCount}</p>
        </div>
      </div>
    </div>
  );
}
