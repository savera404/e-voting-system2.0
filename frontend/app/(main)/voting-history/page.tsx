"use client";

import { useState } from "react";

const G = "#1a4731";
const GL = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG = "#f7faf8";

const HISTORY = [
  {
    id: 1, election: "General Election 2026",   type: "National Assembly",  date: "Feb 08, 2026", time: "09:42 AM", constituency: "NA-123 Islamabad", receipt: "8F7d-22a1-99c0-x772", verified: true,  status: "counted",
  },
  {
    id: 2, election: "Punjab Assembly 2024",    type: "Provincial Assembly",date: "Feb 08, 2024", time: "11:14 AM", constituency: "PP-002 Rawalpindi",receipt: "7C3e-11b0-88d9-y543", verified: true,  status: "counted",
  },
  {
    id: 3, election: "Senate Election 2024",    type: "Senate",             date: "Apr 02, 2024", time: "02:30 PM", constituency: "Senate – ICT",      receipt: "4A1f-09c8-77f4-z881", verified: true,  status: "counted",
  },
  {
    id: 4, election: "By-Election NA-75 2023",  type: "By-Election",        date: "Sep 12, 2023", time: "10:05 AM", constituency: "NA-75 Gujranwala",  receipt: "2B9a-44d7-66e3-w210", verified: false, status: "counted",
  },
];

export default function VotingHistoryPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      {/* Hero */}
      <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">My Account</p>
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
            My Voting History
          </h1>
          <p className="text-base text-white/70 max-w-xl">
            A complete record of all elections you have participated in. Each vote is cryptographically verifiable.
          </p>
        </div>
      </section>

      <div className="px-4 lg:px-8 py-10" style={{ background: BG, minHeight: "70vh" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">

          {/* History list */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-gray-500">{HISTORY.length} elections participated</p>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: GL, color: G }}
              >
                100% Counted
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {HISTORY.map((h) => {
                const open = expanded === h.id;
                return (
                  <div
                    key={h.id}
                    className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all"
                    style={{ borderColor: open ? G : BORDER, borderWidth: open ? 2 : 1 }}
                  >
                    {/* Main row */}
                    <div
                      className="p-5 cursor-pointer grid items-center gap-4"
                      style={{ gridTemplateColumns: "auto 1fr auto" }}
                      onClick={() => setExpanded(open ? null : h.id)}
                    >
                      {/* Icon */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: GL }}
                      >
                        <svg width="22" height="22" fill="none" stroke={G} strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900">{h.election}</span>
                          {h.verified && (
                            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: GL, color: G }}>
                              <svg width="9" height="9" fill={G} viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              VERIFIED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {h.type} · {h.constituency} · {h.date} at {h.time}
                        </p>
                      </div>

                      {/* Chevron */}
                      <svg
                        width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth={2.5} viewBox="0 0 24 24"
                        className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expanded */}
                    {open && (
                      <div className="px-6 pb-6 border-t pt-5" style={{ borderColor: BORDER, background: BG }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                          {[
                            ["Election",      h.election   ],
                            ["Type",          h.type       ],
                            ["Date",          h.date       ],
                            ["Time",          h.time       ],
                            ["Constituency",  h.constituency],
                            ["Vote Status",   "Counted"    ],
                          ].map(([l, v]) => (
                            <div key={String(l)}>
                              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">{l}</p>
                              <p className="text-sm font-semibold text-gray-900">{v}</p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl p-4 border mb-4" style={{ background: "#fff", borderColor: BORDER }}>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">Cryptographic Receipt ID</p>
                          <p className="font-mono text-sm font-bold tracking-widest" style={{ color: G }}>{h.receipt}</p>
                        </div>

                        <div className="flex gap-3">
                          <a
                            href="/verify-vote"
                            className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                            style={{ background: G, color: "#fff" }}
                          >
                            Verify This Vote
                          </a>
                          <button
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                            style={{ borderColor: BORDER, color: "#6b7280" }}
                          >
                            Download Receipt
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl px-6 text-white" style={{ background: G }}>
              <p className="text-xs font-bold tracking-widest uppercase text-white/50 mt-4 mb-4">Your Stats</p>
              {[
                ["Elections Voted",    "4"],
                ["Total Eligible",     "6"],
                ["Participation Rate", "67%"],
                ["Last Voted",         "Feb 2026"],
              ].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between py-2.5 border-b border-white/10 text-sm last:border-0 mb-4">
                  <span className="text-white/55">{l}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: BORDER }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Participation Badge</p>
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"
                  style={{ background: GL }}
                >
                  🏅
                </div>
                <p className="font-bold text-gray-900 text-sm">Active Voter</p>
                <p className="text-xs text-gray-400 mt-1">Voted in 4+ elections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}