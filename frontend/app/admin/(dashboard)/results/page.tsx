"use client";
import { useState, useEffect, useCallback } from "react";
import {
  listElections, getResults,
  type ElectionResponse, type ResultsResponse, type RankedCandidate,
} from "../../../../lib/api";

// ── Party colour map ───────────────────────────────────────────────────────
const PARTY_COLORS: Record<string, string> = {
  PTI:         "#ef4444",
  "PML-N":     "#22c55e",
  PPP:         "#f59e0b",
  MQM:         "#a855f7",
  "JUI-F":     "#6366f1",
  Independent: "#6b7280",
};
const pColor = (p: string) => PARTY_COLORS[p] ?? "#9ca3af";

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skel({ h = "h-4", w = "w-full" }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} rounded-lg bg-[#22c55e]/8 animate-pulse`} />;
}

// ── Candidate row ──────────────────────────────────────────────────────────
function CandRow({ c, rank, winner }: { c: RankedCandidate; rank: number; winner: boolean }) {
  const pct = c.pct ?? 0;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${winner ? "bg-[#22c55e]/8 border border-[#22c55e]/20" : "hover:bg-white/3"}`}>
      <span className="text-xs font-bold text-gray-500 w-5 text-center">{rank}</span>
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pColor(c.party) }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5 gap-2">
          <div className="min-w-0">
            <span className={`text-sm font-semibold truncate block ${winner ? "text-[#22c55e]" : "text-white"}`}>{c.name}</span>
            <span className="text-xs text-gray-500">{c.party}</span>
          </div>
          <span className="text-sm font-bold text-white whitespace-nowrap">
            {(c.votes ?? 0).toLocaleString()}
            <span className="text-xs font-normal text-gray-500 ml-1">votes</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1e3828]">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: pColor(c.party) }} />
        </div>
      </div>
      <span className="text-xs font-semibold text-gray-400 w-11 text-right">{pct.toFixed(1)}%</span>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS: Record<string, string> = {
  upcoming:  "bg-blue-900/30 text-blue-400 border-blue-700/40",
  active:    "bg-green-900/30 text-green-400 border-green-700/40",
  completed: "bg-gray-700/40 text-gray-400 border-gray-600/40",
};

export default function AdminResultsPage() {
  const [elections,      setElections]     = useState<ElectionResponse[]>([]);
  const [selectedId,     setSelectedId]    = useState<number | null>(null);
  const [results,        setResults]       = useState<ResultsResponse | null>(null);
  const [electLoading,   setElectLoading]  = useState(true);
  const [resLoading,     setResLoading]    = useState(false);
  const [error,          setError]         = useState<string | null>(null);

  // Load elections
  useEffect(() => {
    listElections()
      .then((data) => {
        setElections(data);
        const pref = data.find(e => e.status === "active" || e.status === "completed");
        if (pref) setSelectedId(pref.id);
      })
      .catch(() => setError("Could not load elections."))
      .finally(() => setElectLoading(false));
  }, []);

  const fetchResults = useCallback((id: number) => {
    setResLoading(true);
    setError(null);
    getResults(id)
      .then(setResults)
      .catch(() => setError("No results yet for this election, or backend error."))
      .finally(() => setResLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId) fetchResults(selectedId);
    else setResults(null);
  }, [selectedId, fetchResults]);

  const selEl  = elections.find(e => e.id === selectedId) ?? null;
  const winner = results?.winner ?? null;
  const ranked = results?.ranked_candidates ?? [];

  // Human-readable strategy explanation shown in the summary panel
  const STRATEGY_LABELS: Record<string, { label: string; reason: string }> = {
    fptp:         { label: "First Past the Post", reason: "Federal / Provincial" },
    runoff:       { label: "Two-Round Runoff",    reason: "Local elections" },
    proportional: { label: "Proportional",         reason: "Party-list" },
  };
  const strategyInfo = STRATEGY_LABELS[results?.method ?? ""] ?? null;

  const fmt = (d?: string | null) => d
    ? new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Election Results</h1>
          <p className="text-sm text-gray-400 mt-0.5">View live and final results for any election.</p>
        </div>
        {selEl?.status === "active" && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
            COUNTING IN PROGRESS
          </div>
        )}
      </div>

      {/* Election selector */}
      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
        <label className="block text-xs font-semibold text-gray-400 mb-2">Select Election</label>
        {electLoading ? (
          <Skel h="h-10" w="w-72" />
        ) : elections.length === 0 ? (
          <p className="text-sm text-gray-500">No elections found. Create one first.</p>
        ) : (
          <select
            value={selectedId ?? ""}
            onChange={e => setSelectedId(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl bg-[#0f1f17] border border-[#2a4a36] text-white text-sm outline-none focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/10 transition-all w-full max-w-sm"
          >
            <option value="" className="bg-[#162b1e]">Choose an election…</option>
            {elections.map(e => (
              <option key={e.id} value={e.id} className="bg-[#162b1e]">
                {e.name} — {e.status}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {!selectedId && !electLoading && (
        <div className="text-center py-20 text-gray-600 text-sm">Select an election above to view results.</div>
      )}

      {selectedId && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

          {/* ── Left ── */}
          <div className="space-y-5">

            {/* Candidate results */}
            <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Candidate Results</h2>
                {results && (
                  <span className="text-xs text-gray-500">{(results.total_votes ?? 0).toLocaleString()} total votes</span>
                )}
              </div>
              {resLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <Skel key={i} h="h-14" />)}</div>
              ) : ranked.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No votes recorded for this election yet.</p>
              ) : (
                <div className="space-y-1">
                  {ranked.map((c, i) => (
                    <CandRow key={c.candidate_id} c={c} rank={i + 1} winner={winner?.candidate_id === c.candidate_id} />
                  ))}
                </div>
              )}
            </div>

            {/* Runoff notice */}
            {results?.requires_runoff && results.runoff_candidates && (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl p-6">
                <h3 className="font-bold text-amber-400 mb-2">⚠ Runoff Required</h3>
                <p className="text-sm text-amber-300/70 mb-3">No candidate reached the majority threshold. These candidates proceed to runoff:</p>
                {results.runoff_candidates.map(c => (
                  <div key={c.candidate_id} className="flex justify-between text-sm font-medium text-amber-300 py-2 border-t border-amber-700/20 first:border-0">
                    <span>{c.name} · {c.party}</span>
                    <span>{c.votes.toLocaleString()} votes</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* Election summary */}
            <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-5">
              <h3 className="text-base font-bold text-white mb-4">Summary</h3>
              {resLoading ? (
                <div className="space-y-3">{[1,2,3,4].map(i => <Skel key={i} h="h-5" />)}</div>
              ) : (
                <>
                  {/* election meta (always available) */}
                  {[
                    ["Name",    selEl?.name ?? "—"],
                    ["Type",    selEl?.type ?? "—"],
                    ["Start",   fmt(selEl?.start_date)],
                    ["End",     fmt(selEl?.end_date)],
                    ["Status",  selEl?.status ?? "—"],
                  ].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between py-2.5 border-b border-[#1e3828] text-sm last:border-0">
                      <span className="text-gray-500">{l}</span>
                      {l === "Status"
                        ? <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border capitalize ${STATUS[String(v)] ?? STATUS.upcoming}`}>{v}</span>
                        : <span className="font-semibold text-white text-right max-w-[55%] truncate capitalize">{v}</span>
                      }
                    </div>
                  ))}
                  {/* results-specific stats */}
                  {results && (
                    <>
                      <div className="flex justify-between py-2.5 border-b border-[#1e3828] text-sm">
                        <span className="text-gray-500">Total Votes</span>
                        <span className="font-semibold text-white">{(results.total_votes ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-start py-2.5 border-b border-[#1e3828] text-sm">
                        <span className="text-gray-500">Counting Method</span>
                        <div className="text-right">
                          <p className="font-semibold text-white text-xs">{strategyInfo?.label ?? (results.method ?? "—").toUpperCase()}</p>
                          {strategyInfo && <p className="text-[10px] text-gray-500 mt-0.5">Auto-selected · {strategyInfo.reason}</p>}
                        </div>
                      </div>
                      <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-gray-500">Turnout</span>
                        <span className="font-semibold text-white">{(results.voter_turnout_percent ?? 0).toFixed(1)}%</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Winner card */}
            {(resLoading || winner) && (
              <div className="bg-[#0a1f12] border border-[#22c55e]/25 rounded-2xl p-5">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#22c55e]/50 mb-3">
                  {selEl?.status === "completed" ? "Declared Winner" : "Currently Leading"}
                </p>
                {resLoading ? (
                  <div className="space-y-3"><Skel h="h-8" w="w-32" /><Skel h="h-4" w="w-24" /></div>
                ) : winner ? (
                  <>
                    <h2 className="text-2xl font-black text-white mb-0.5">{winner.name}</h2>
                    <p className="text-sm text-gray-400 mb-4">{winner.party}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#162b1e] rounded-xl p-3 text-center">
                        <p className="text-xl font-black text-[#22c55e]">{(winner.votes ?? 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Votes</p>
                      </div>
                      {winner.pct !== undefined && (
                        <div className="bg-[#162b1e] rounded-xl p-3 text-center">
                          <p className="text-xl font-black text-[#22c55e]">{(winner.pct ?? 0).toFixed(1)}%</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Vote Share</p>
                        </div>
                      )}
                    </div>
                    {selEl?.status === "active" && (
                      <p className="text-xs text-gray-500 mt-3 text-center">
                        ⚠ Counting in progress — not final.
                      </p>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* Updated at */}
            {results?.generated_at && (
              <p className="text-xs text-gray-600 text-center">
                Last updated: {new Date(results.generated_at).toLocaleString("en-PK")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
