"use client";
import { useState, useEffect, useCallback } from "react";
import {
  listCandidates, createCandidate, deleteCandidate,
  listConstituencies,
  type CandidateResponse, type ConstituencyResponse,
} from "../../../../lib/api";

const FIELD = "w-full px-4 py-2.5 rounded-xl bg-[#0f1f17] border border-[#2a4a36] text-white text-sm placeholder-gray-600 outline-none focus:border-[#22c55e]/60 focus:ring-2 focus:ring-[#22c55e]/10 transition-all";
const LABEL = "block text-xs font-semibold text-gray-400 mb-1";

type FormState = { name: string; party_name: string; constituency_id: string };
const EMPTY: FormState = { name: "", party_name: "", constituency_id: "" };

export default function AdminCandidatesPage() {
  const [candidates, setCandidates]     = useState<CandidateResponse[]>([]);
  const [constituencies, setConstituencies] = useState<ConstituencyResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [form, setForm]                 = useState<FormState>(EMPTY);
  const [filterConst, setFilterConst]   = useState<string>("");
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [deleteId, setDeleteId]         = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cons] = await Promise.all([listCandidates(), listConstituencies()]);
      setCandidates(c);
      setConstituencies(cons);
    } catch { setError("Failed to load data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string, type: "ok" | "err") => {
    if (type === "ok") { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); }
    else               { setError(msg);   setTimeout(() => setError(null), 4000); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.constituency_id) { flash("Please select a constituency.", "err"); return; }
    setSubmitting(true);
    try {
      await createCandidate({
        name: form.name,
        party_name: form.party_name || undefined,
        constituency_id: Number(form.constituency_id),
      });
      setForm(EMPTY);
      await load();
      flash("Candidate added successfully.", "ok");
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed to add candidate.", "err");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCandidate(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      flash("Candidate deleted.", "ok");
    } catch { flash("Failed to delete candidate.", "err"); }
    finally { setDeleteId(null); }
  };

  const constName = (id?: number | null) =>
    constituencies.find(c => c.id === id)?.name ?? `#${id}`;

  const filtered = filterConst
    ? candidates.filter(c => String(c.constituency_id) === filterConst)
    : candidates;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Candidates</h1>
        <p className="text-sm text-gray-400 mt-0.5">Add and remove candidates per constituency.</p>
      </div>

      {(error || success) && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${error ? "bg-red-900/30 border-red-700/40 text-red-400" : "bg-green-900/30 border-green-700/40 text-green-400"}`}>
          {error ?? success}
        </div>
      )}

      {/* ── Create Form ── */}
      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6">
        <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Candidate
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className={LABEL}>Full Name *</label>
            <input className={FIELD} placeholder="Candidate full name" required
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Party Name</label>
            <input className={FIELD} placeholder="e.g. PTI, PMLN…"
              value={form.party_name} onChange={e => setForm(p => ({ ...p, party_name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Constituency *</label>
            <select className={FIELD} required value={form.constituency_id}
              onChange={e => setForm(p => ({ ...p, constituency_id: e.target.value }))}>
              <option value="">Select constituency</option>
              {constituencies.map(c => (
                <option key={c.id} value={c.id} className="bg-[#162b1e]">{c.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-[#22c55e] text-[#0a1a10] font-bold text-sm rounded-xl
                hover:bg-[#16a34a] transition-all disabled:opacity-50 shadow-lg shadow-[#22c55e]/20">
              {submitting ? "Adding…" : "Add Candidate"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Filter + Table ── */}
      <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2a4a36] flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white">All Candidates</h2>
          <div className="flex items-center gap-3">
            <select className="px-3 py-1.5 rounded-lg bg-[#0f1f17] border border-[#2a4a36] text-sm text-gray-300 outline-none focus:border-[#22c55e]/50"
              value={filterConst} onChange={e => setFilterConst(e.target.value)}>
              <option value="">All Constituencies</option>
              {constituencies.map(c => <option key={c.id} value={c.id} className="bg-[#162b1e]">{c.name}</option>)}
            </select>
            <span className="text-xs text-gray-500">{filtered.length} shown</span>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#22c55e]/30 border-t-[#22c55e] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No candidates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a4a36] text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Party</th>
                  <th className="px-6 py-3 text-left">Constituency</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e3828]">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">#{c.id}</td>
                    <td className="px-6 py-4 text-white font-semibold">{c.name}</td>
                    <td className="px-6 py-4">
                      {c.party_name
                        ? <span className="px-2.5 py-1 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 rounded-lg text-xs font-semibold">{c.party_name}</span>
                        : <span className="text-gray-600 text-xs">Independent</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{constName(c.constituency_id)}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setDeleteId(c.id)}
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

      {/* ── Delete Modal ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#162b1e] border border-[#2a4a36] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">Delete Candidate?</h3>
            <p className="text-sm text-gray-400 mb-6">This will permanently remove the candidate.</p>
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
