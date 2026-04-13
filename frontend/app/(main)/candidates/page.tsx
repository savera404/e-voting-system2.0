"use client";

import { useState, useEffect, useMemo } from "react";
import { listCandidates, listConstituencies, type CandidateResponse, type ConstituencyResponse } from "../../../lib/api";

const G      = "#1a4731";
const GL     = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG     = "#f7faf8";

const PARTY_COLORS: Record<string, string> = {
  PTI:         "#c41e3a",
  "PML-N":     "#1a4731",
  PPP:         "#1a1a1a",
  MQM:         "#b45309",
  "JUI-F":     "#6366f1",
  Independent: "#6b7280",
};
const pColor = (p: string) => PARTY_COLORS[p] ?? "#9ca3af";

export default function CandidatesPage() {
  const [candidates,     setCandidates]     = useState<CandidateResponse[]>([]);
  const [constituencies, setConstituencies] = useState<ConstituencyResponse[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [search,         setSearch]         = useState("");
  const [partyFilter,    setPartyFilter]    = useState("All");
  const [selectedId,     setSelectedId]     = useState<number | null>(null);

  useEffect(() => {
    Promise.all([listCandidates(), listConstituencies()])
      .then(([cands, consts]) => {
        setCandidates(cands);
        setConstituencies(consts);
      })
      .catch(() => setError("Could not load candidates. Please try again later."))
      .finally(() => setLoading(false));
  }, []);

  // Build unique party list from real data
  const parties = useMemo(() => {
    const unique = Array.from(new Set(candidates.map(c => c.party_name ?? "Independent")));
    return ["All", ...unique.sort()];
  }, [candidates]);

  const filtered = useMemo(() =>
    candidates.filter(c => {
      const party = c.party_name ?? "Independent";
      const matchParty  = partyFilter === "All" || party === partyFilter;
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          party.toLowerCase().includes(search.toLowerCase());
      return matchParty && matchSearch;
    }),
    [candidates, partyFilter, search]
  );

  const selected = selectedId !== null ? candidates.find(c => c.id === selectedId) ?? null : null;

  const constName = (id?: number | null) =>
    constituencies.find(c => c.id === id)?.name ?? "—";

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
            Candidates
          </h1>
          <p className="text-base text-white/70 max-w-xl">
            Review all registered candidates. Click any card to view details.
          </p>
        </div>
      </section>

      <div className="px-4 lg:px-8 py-10" style={{ background: BG, minHeight: "70vh" }}>
        <div className="max-w-7xl mx-auto">

          {/* Search + filter */}
          <div className="flex flex-wrap gap-3 mb-7">
            <div className="relative flex-1 min-w-[220px]">
              <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth={2}
                viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates or parties…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none"
                style={{ borderColor: BORDER }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {parties.map(p => (
                <button key={p} onClick={() => setPartyFilter(p)}
                  className="px-5 py-2 rounded-lg border text-xs font-semibold transition-all"
                  style={{
                    borderColor: partyFilter === p ? G : BORDER,
                    background:  partyFilter === p ? G : "#fff",
                    color:       partyFilter === p ? "#fff" : "#6b7280",
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse"
                  style={{ borderColor: BORDER }}>
                  <div className="w-12 h-12 rounded-full bg-gray-100 mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No candidates found.</div>
          )}

          {!loading && (
            <div className={`grid gap-5 ${selected ? "grid-cols-1 lg:grid-cols-[1fr_340px]" : "grid-cols-1"}`}>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                {filtered.map(c => {
                  const party = c.party_name ?? "Independent";
                  const color = pColor(party);
                  const isSelected = selectedId === c.id;
                  return (
                    <button key={c.id}
                      onClick={() => setSelectedId(prev => prev === c.id ? null : c.id)}
                      className="bg-white rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md w-full"
                      style={{
                        borderColor: isSelected ? G : BORDER,
                        boxShadow:   isSelected ? `0 0 0 3px rgba(26,71,49,.1)` : "0 1px 4px rgba(0,0,0,.04)",
                        borderWidth: isSelected ? 2 : 1,
                      }}>
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4"
                        style={{ background: color }}>
                        {c.name.charAt(0)}
                      </div>
                      <p className="font-bold text-gray-900 text-[15px] mb-0.5">{c.name}</p>
                      <p className="text-xs text-gray-400 mb-3">{constName(c.constituency_id)}</p>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: `${color}18`, color }}>
                        {party}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Detail panel — only real DB fields */}
              {selected && (() => {
                const party = selected.party_name ?? "Independent";
                const color = pColor(party);
                return (
                  <div className="bg-white rounded-2xl border p-7 sticky top-20 self-start shadow-lg"
                    style={{ borderColor: BORDER }}>
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                        style={{ background: color }}>
                        {selected.name.charAt(0)}
                      </div>
                      <button onClick={() => setSelectedId(null)}
                        className="text-gray-300 hover:text-gray-500 text-2xl transition-colors">×</button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-0.5"
                      style={{ fontFamily: "Georgia, serif" }}>
                      {selected.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-5">{constName(selected.constituency_id)}</p>

                    <div className="divide-y" style={{ borderColor: "#f0f4f1" }}>
                      {([
                        ["Party",        party],
                        ["Constituency", constName(selected.constituency_id)],
                      ] as [string, string][]).map(([l, v]) => (
                        <div key={l} className="flex justify-between py-2.5 text-sm">
                          <span className="text-gray-400">{l}</span>
                          <span className="font-semibold text-gray-900 text-right max-w-[60%]">{v}</span>
                        </div>
                      ))}
                    </div>

                    <a href="/vote"
                      className="mt-6 block w-full text-center py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
                      style={{ background: G }}>
                      Vote Now →
                    </a>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
