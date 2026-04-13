"use client";

import { useState } from "react";

const candidates = [
  { name: "Candidate A (JM)", votes: 21400, percent: 45, color: "bg-[#1a4731]" },
  { name: "Candidate B (UL)", votes: 18120, percent: 38, color: "bg-blue-500" },
  { name: "Candidate C (Ind)", votes: 8055, percent: 17, color: "bg-gray-500" },
];

const stats = [
  {
    label: "Total Registered Voters",
    value: "128,450",
    sub: "+2.4% this week",
    subColor: "text-emerald-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Votes Cast Today",
    value: "45,231",
    sub: "Live updating",
    subColor: "text-emerald-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: "Active Polling Stations",
    value: "142",
    sub: "All systems operational",
    subColor: "text-gray-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Pending Verification",
    value: "12",
    sub: "Review Queue →",
    subColor: "text-yellow-400",
    valueColor: "text-yellow-400",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

// SVG donut chart for voter turnout
function DonutChart({ percent }: { percent: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#1e3a2b" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none"
        stroke="#1a4731" strokeWidth="12"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      {/* Inner ring accent */}
      <circle cx="70" cy="70" r="42" fill="none" stroke="#1e3a2b" strokeWidth="1" />
    </svg>
  );
}

export default function ElectionAnalytics() {
  const [constituency, setConstituency] = useState("National Assembly");

  return (
    <section id="admin" className="py-28 bg-[#1a4731] mt-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Real-time Election Analytics
            </h2>
            <p className="text-gray-400 mt-2 text-sm">
              Monitor polling stations, voter turnout, and live tallies.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button className="text-sm font-semibold text-white border border-white/20 px-5 py-2.5 rounded-lg hover:bg-white/5 transition-all">
              Export Report
            </button>
            <button className="text-sm font-semibold bg-[#1a4731] hover:bg-[#15392a] text-white px-5 py-2.5 rounded-lg transition-all shadow-lg">
              Create New Election
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111f17] border border-white/5 rounded-2xl p-5 hover:border-[#1a4731]/40 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                <div className="w-7 h-7 rounded-lg bg-[#1a4731]/20 text-[#4ade80] flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className={`text-3xl font-black mb-1 ${stat.valueColor ?? "text-white"}`}>
                {stat.value}
              </div>
              <div className={`text-xs font-medium ${stat.subColor}`}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Bottom Row: Tally + Donut */}
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Live Results Tally */}
          <div className="lg:col-span-2 bg-[#111f17] border border-white/5 rounded-2xl p-7">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-white font-bold text-lg">Live Results Tally</h3>
              <div className="relative">
                <select
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  className="appearance-none bg-[#0d1f17] border border-white/10 text-white text-sm px-4 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[#1a4731]"
                >
                  <option>National Assembly</option>
                  <option>Punjab Assembly</option>
                  <option>Sindh Assembly</option>
                  <option>KPK Assembly</option>
                </select>
                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="space-y-6">
              {candidates.map((c) => (
                <div key={c.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300 font-medium">{c.name}</span>
                    <span className="text-sm font-bold text-white">{c.percent}%</span>
                  </div>
                  {/* Track */}
                  <div className="relative h-8 bg-[#0d1f17] rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${c.color} rounded-lg flex items-center px-3 transition-all duration-700`}
                      style={{ width: `${c.percent}%` }}
                    >
                      <span className="text-white text-xs font-bold whitespace-nowrap">
                        {c.votes.toLocaleString()} Votes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voter Turnout Donut */}
          <div className="bg-[#111f17] border border-white/5 rounded-2xl p-7 flex flex-col items-center justify-center">
            <h3 className="text-white font-bold text-lg mb-6 self-start">Voter Turnout</h3>
            <div className="relative flex items-center justify-center mb-4">
              <DonutChart percent={78} />
              <div className="absolute text-center">
                <div className="text-3xl font-black text-white">78%</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">Voter Turnout</p>
            <p className="text-gray-500 text-xs text-center mt-1">Calculated from 128k Registered</p>

            {/* Mini legend */}
            <div className="mt-6 w-full space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1a4731]" />
                  <span className="text-gray-400">Votes Cast</span>
                </div>
                <span className="text-white font-semibold">45,231</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1e3a2b]" />
                  <span className="text-gray-400">Remaining</span>
                </div>
                <span className="text-white font-semibold">83,219</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}