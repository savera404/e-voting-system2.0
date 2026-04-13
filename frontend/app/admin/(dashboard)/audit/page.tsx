"use client";
import { useState, useEffect, useCallback } from "react";
import { getAuditTrail, type AuditEntry } from "../../../../lib/api";

function parseEvent(event: string) {
  // Format: "status_change:upcoming→active"
  const match = event.match(/^status_change:(.+)→(.+)$/);
  if (match) return { from: match[1], to: match[2] };
  return { from: null, to: null };
}

const STATUS_COLORS: Record<string, string> = {
  upcoming:  "bg-blue-900/30 text-blue-400 border-blue-700/40",
  active:    "bg-green-900/30 text-green-400 border-green-700/40",
  completed: "bg-gray-700/40 text-gray-400 border-gray-600/40",
};

const badge = (status: string | null) => status
  ? <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border capitalize ${STATUS_COLORS[status] ?? "bg-gray-700/30 text-gray-400 border-gray-600/40"}`}>{status}</span>
  : <span className="text-gray-600 text-xs">—</span>;

export default function AdminAuditPage() {
  const [trail,   setTrail]   = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditTrail();
      // Most recent first
      setTrail([...data.audit_trail].reverse());
    } catch {
      setError("Could not load audit trail. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-PK", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch { return iso; }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Audit Trail</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Every election status change recorded by the Observer Pattern since the server started.
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/25 text-[#22c55e] text-sm font-semibold hover:bg-[#22c55e]/20 transition-all">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[#0a1f12] border border-[#22c55e]/20 rounded-2xl px-5 py-4 flex gap-3">
        <svg className="flex-shrink-0 mt-0.5" width="16" height="16" fill="none" stroke="#22c55e" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-gray-400 leading-relaxed">
          This trail is powered by the <span className="text-[#22c55e] font-semibold">Observer Pattern</span> —
          the <code className="text-[#22c55e] bg-[#162b1e] px-1 rounded">AuditObserver</code> automatically
          records an entry every time <code className="text-[#22c55e] bg-[#162b1e] px-1 rounded">ElectionEventManager.status_changed()</code> is called.
          The trail resets when the server restarts (in-memory store — swap for a DB table in production).
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a4a36] flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Status Change Events</h2>
          <span className="text-xs text-gray-500">{trail.length} event{trail.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
          </div>
        ) : trail.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-gray-500 text-sm">No events yet.</p>
            <p className="text-gray-600 text-xs">Change an election's status to generate the first audit entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a4a36] text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Election ID</th>
                  <th className="px-6 py-3 text-left">From</th>
                  <th className="px-6 py-3 text-left">To</th>
                  <th className="px-6 py-3 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3828]">
                {trail.map((entry, i) => {
                  const { from, to } = parseEvent(entry.event);
                  return (
                    <tr key={i} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{trail.length - i}</td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold font-mono">Election #{entry.election_id}</span>
                      </td>
                      <td className="px-6 py-4">{badge(from)}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <svg width="12" height="12" fill="none" stroke="#22c55e" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          {badge(to)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs font-mono">{fmt(entry.at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
