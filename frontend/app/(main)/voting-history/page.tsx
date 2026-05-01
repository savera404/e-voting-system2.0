"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getVotingHistory, type VoteHistoryItem } from "../../../lib/api";

const G      = "#1a4731";
const GL     = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG     = "#f7faf8";

function parseUtc(s: string): Date {
  return new Date((s.endsWith("Z") || s.includes("+")) ? s : s + "Z");
}

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return parseUtc(s).toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtTime(s: string | null): string {
  if (!s) return "—";
  return parseUtc(s).toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit",
  }) + " PKT";
}

export default function VotingHistoryPage() {
  const router = useRouter();
  const [history,  setHistory]  = useState<VoteHistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getVotingHistory()
      .then(setHistory)
      .catch((err) => {
        // 401 → not logged in
        if (err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
          router.push("/login");
        } else {
          setError("Failed to load voting history.");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Navigate to verify-vote with receipt pre-filled in the URL
  const goVerify = (receipt: string | null) => {
    if (!receipt) return;
    router.push(`/verify-vote?receipt=${encodeURIComponent(receipt)}`);
  };

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
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: `${G}33`, borderTopColor: G }} />
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-sm text-red-500" style={{ borderColor: BORDER }}>{error}</div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: BORDER }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: GL }}>🗳️</div>
                <p className="font-semibold text-gray-700 mb-1">No votes cast yet</p>
                <p className="text-sm text-gray-400">Once you vote in an election your history will appear here.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-semibold text-gray-500">{history.length} election{history.length !== 1 ? "s" : ""} participated</p>
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: GL, color: G }}>
                    100% Counted
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {history.map((h) => {
                    const open = expanded === h.vote_id;
                    return (
                      <div
                        key={h.vote_id}
                        className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all"
                        style={{ borderColor: open ? G : BORDER, borderWidth: open ? 2 : 1 }}
                      >
                        {/* Main row */}
                        <div
                          className="p-5 cursor-pointer grid items-center gap-4"
                          style={{ gridTemplateColumns: "auto 1fr auto" }}
                          onClick={() => setExpanded(open ? null : h.vote_id)}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: GL }}>
                            <svg width="22" height="22" fill="none" stroke={G} strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                          </div>

                          <div>
                            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                              <span className="font-bold text-gray-900">{h.election_name}</span>
                              <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: GL, color: G }}>
                                <svg width="9" height="9" fill={G} viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                COUNTED
                              </span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {h.election_type
                                ? h.election_type.charAt(0).toUpperCase() + h.election_type.slice(1)
                                : "Election"
                              } · {fmtDate(h.recorded_at)} at {fmtTime(h.recorded_at)}
                            </p>
                          </div>

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
                              {([
                                ["Election",    h.election_name],
                                ["Type",        h.election_type
                                                  ? h.election_type.charAt(0).toUpperCase() + h.election_type.slice(1)
                                                  : "—"],
                                ["Date",        fmtDate(h.recorded_at)],
                                ["Time",        fmtTime(h.recorded_at)],
                                ["Vote Status", h.vote_status],
                              ] as [string, string][]).map(([l, v]) => (
                                <div key={l}>
                                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">{l}</p>
                                  <p className="text-sm font-semibold text-gray-900">{v}</p>
                                </div>
                              ))}
                            </div>

                            {/* Receipt */}
                            <div className="rounded-xl p-4 border mb-4" style={{ background: "#fff", borderColor: BORDER }}>
                              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                                Cryptographic Receipt ID
                              </p>
                              <p className="font-mono text-sm font-bold tracking-widest" style={{ color: G }}>
                                {h.receipt_code ?? "—"}
                              </p>
                            </div>

                            {/* Ledger hash */}
                            {h.ledger_hash && (
                              <div className="rounded-xl p-4 border mb-4 bg-gray-50" style={{ borderColor: BORDER }}>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1.5">
                                  Ledger Hash
                                </p>
                                <p className="font-mono text-xs text-gray-500 break-all">{h.ledger_hash}</p>
                              </div>
                            )}

                            <div className="flex gap-3">
                              <button
                                onClick={() => goVerify(h.receipt_code)}
                                disabled={!h.receipt_code}
                                className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: G, color: "#fff" }}
                              >
                                Verify This Vote
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl px-6 text-white" style={{ background: G }}>
              <p className="text-xs font-bold tracking-widest uppercase text-white/50 mt-4 mb-4">Your Stats</p>
              {([
                ["Elections Voted",    String(history.length)],
                ["Participation Rate", history.length > 0 ? "100%" : "0%"],
                ["Last Voted",         history[0]?.recorded_at
                                         ? parseUtc(history[0].recorded_at).toLocaleDateString("en-PK", { month: "short", year: "numeric" })
                                         : "—"],
              ] as [string, string][]).map(([l, v]) => (
                <div key={l} className="flex justify-between py-2.5 border-b border-white/10 text-sm last:border-0 mb-4">
                  <span className="text-white/55">{l}</span>
                  <span className="font-bold">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: BORDER }}>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">Participation Badge</p>
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-3" style={{ background: GL }}>
                  {history.length >= 4 ? "🏅" : history.length >= 1 ? "🗳️" : "⭕"}
                </div>
                <p className="font-bold text-gray-900 text-sm">
                  {history.length >= 4 ? "Active Voter" : history.length >= 1 ? "First Vote" : "Not Voted Yet"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {history.length >= 4
                    ? "Voted in 4+ elections"
                    : history.length >= 1
                    ? "Voted in your first election"
                    : "Cast your first vote to earn a badge"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
