"use client";
import { useState, useEffect, useCallback } from "react";
import {
  listElections, createElection, deleteElection,
  type ElectionResponse,
} from "../../../../lib/api";

const STATUS_COLORS: Record<string, string> = {
  upcoming:  "bg-blue-900/30 text-blue-400 border-blue-700/40",
  active:    "bg-green-900/30 text-green-400 border-green-700/40",
  completed: "bg-gray-700/40 text-gray-400 border-gray-600/40",
};

const STATUS_LABELS: Record<string, string> = {
  upcoming:  "Upcoming",
  active:    "Active",
  completed: "Completed",
};

const FIELD = "w-full px-4 py-2.5 rounded-xl bg-[#0f1f17] border border-[#2a4a36] text-white text-sm placeholder-gray-600 outline-none focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/10 transition-all";
const LABEL = "block text-xs font-semibold text-gray-400 mb-1";

type FormState = { name: string; type: string; start_date: string; end_date: string };
const EMPTY: FormState = { name: "", type: "federal", start_date: "", end_date: "" };

/** Returns today's datetime as a datetime-local string (YYYY-MM-DDTHH:mm). */
function nowLocal(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

/** Parse an API date string as UTC (appends Z if missing). */
function parseUtc(s: string): Date {
  return new Date((s.endsWith("Z") || s.includes("+")) ? s : s + "Z");
}

export default function AdminElectionsPage() {
  const [elections, setElections] = useState<ElectionResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setElections(await listElections()); }
    catch { setError("Failed to load elections."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string, type: "ok" | "err") => {
    if (type === "ok") { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
    else               { setError(msg);   setTimeout(() => setError(null), 4000);   }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(form.start_date);
    const end   = new Date(form.end_date);
    const now   = new Date();

    if (end <= start) { flash("End date must be after start date.", "err"); return; }
    if (end <= now)   { flash("End date must be in the future.", "err");    return; }

    setSubmitting(true);
    try {
      await createElection({
        name:       form.name,
        type:       form.type,
        start_date: start.toISOString(),
        end_date:   end.toISOString(),
      });
      setForm(EMPTY);
      await load();
      flash("Election created successfully.", "ok");
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to create election.", "err");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteElection(id);
      setElections(prev => prev.filter(e => e.id !== id));
      flash("Election deleted.", "ok");
    } catch { flash("Failed to delete election.", "err"); }
    finally { setDeleteId(null); }
  };

  const fmt = (d?: string | null) => {
    if (!d) return "—";
    return parseUtc(d).toLocaleString("en-PK", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const minEnd = form.start_date || nowLocal();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Elections</h1>
        <p className="text-sm text-gray-400 mt-0.5">Create and manage elections. Statuses update automatically based on dates.</p>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${error ? "bg-red-900/30 border-red-700/40 text-red-400" : "bg-green-900/30 border-green-700/40 text-green-400"}`}>
          {error ?? success}
        </div>
      )}

      {/* ── Status lifecycle info ── */}
      <div className="bg-[#0f1f17] border border-[#2a4a36] rounded-2xl px-5 py-4 flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md border bg-blue-900/30 text-blue-400 border-blue-700/40 font-semibold">Upcoming</span>
          → created, waiting for start date
        </span>
        <span className="text-gray-600 hidden sm:inline">•</span>
        <span className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md border bg-green-900/30 text-green-400 border-green-700/40 font-semibold">Active</span>
          → start date reached, voting open
        </span>
        <span className="text-gray-600 hidden sm:inline">•</span>
        <span className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md border bg-gray-700/40 text-gray-400 border-gray-600/40 font-semibold">Completed</span>
          → end date reached, voting closed
        </span>
      </div>

      {/* ── Create Form ── */}
      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Election
        </h2>
        <p className="text-xs text-gray-500 mb-5">
          Elections start as <span className="text-blue-400 font-semibold">Upcoming</span> and transition automatically. End date must be in the future.
        </p>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className={LABEL}>Election Name *</label>
            <input className={FIELD} placeholder="e.g. General Election 2025" required
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Type *</label>
            <select className={FIELD} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="federal">Federal</option>
              <option value="provincial">Provincial</option>
              <option value="local">Local</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="w-full px-4 py-2.5 rounded-xl border border-blue-700/40 bg-blue-900/10 text-blue-400 text-sm font-semibold">
              Status: Upcoming
            </div>
          </div>
          <div>
            <label className={LABEL}>Start Date *</label>
            <input type="datetime-local" className={FIELD} required
              min={nowLocal()}
              value={form.start_date}
              onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>End Date *</label>
            <input type="datetime-local" className={FIELD} required
              min={minEnd}
              value={form.end_date}
              onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-end">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-[#22c55e] text-[#0a1a10] font-bold text-sm rounded-xl
                hover:bg-[#16a34a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#22c55e]/20">
              {submitting ? "Creating…" : "Create Election"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Table ── */}
      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a4a36] flex items-center justify-between">
          <h2 className="text-base font-bold text-white">All Elections</h2>
          <span className="text-xs text-gray-500">{elections.length} total</span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
          </div>
        ) : elections.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No elections yet. Create one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a4a36] text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Start</th>
                  <th className="px-6 py-3 text-left">End</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3828]">
                {elections.map((el) => (
                  <tr key={el.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">#{el.id}</td>
                    <td className="px-6 py-4 text-white font-semibold">{el.name}</td>
                    <td className="px-6 py-4 text-gray-300 capitalize">{el.type ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-300">{fmt(el.start_date)}</td>
                    <td className="px-6 py-4 text-gray-300">{fmt(el.end_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${STATUS_COLORS[el.status ?? "upcoming"] ?? STATUS_COLORS.upcoming}`}>
                        {STATUS_LABELS[el.status ?? "upcoming"] ?? el.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setDeleteId(el.id)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-all">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Delete Election?</h3>
            <p className="text-sm text-gray-400 mb-6">This cannot be undone. All related votes may also be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2a4a36] text-sm font-semibold text-gray-300 hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-sm font-bold text-white transition-all">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
