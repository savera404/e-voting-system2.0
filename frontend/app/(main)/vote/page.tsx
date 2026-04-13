"use client";
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERNS USED IN THIS FILE:
//
// ✅ STRATEGY PATTERN   — Each step is a separate strategy component.
//                         VotePage selects which to render based on `step`.
// ✅ OBSERVER PATTERN   — All state managed centrally; step-components observe
//                         via props (same as before, now extended with API data)
// ✅ CONTAINER/PRESENTATIONAL — VotePage owns state + API calls; step components
//                         are pure presentational.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { COLORS } from "../../../lib/constants";
import { PageHero, StepBar, ReceiptCard } from "../../../components/shared/shared";
import {
  getVoterProfile,
  listCandidates,
  listElections,
  castVote,
  type VoterResponse,
  type CandidateResponse,
  type ElectionResponse,
  type VoteResponse,
} from "../../../lib/api";

const { primary: G, primaryLight: GL, border: BORDER, bg: BG } = COLORS;
const VOTE_STEPS = ["Verify Identity", "Select Candidate", "Confirm Vote", "Receipt"];

// ── Helper: party color map ────────────────────────────────────────────────
const PARTY_COLORS: Record<string, string> = {
  PTI:         "#c41e3a",
  "PML-N":     "#1a4731",
  PPP:         "#1a1a1a",
  MQM:         "#b45309",
  "JUI-F":     "#6366f1",
  Independent: "#6b7280",
};
function partyColor(party: string | null): string {
  return PARTY_COLORS[party ?? ""] ?? "#9ca3af";
}
function partyEmoji(party: string | null): string {
  const map: Record<string, string> = {
    PTI: "🦅", "PML-N": "⚡", PPP: "🏹", MQM: "🔑", "JUI-F": "📖",
  };
  return map[party ?? ""] ?? "🌟";
}

// ── STRATEGY 1: Identity Verification ─────────────────────────────────────
function Step1Verify({
  voter, cnic, setCnic, onNext, error,
}: {
  voter: VoterResponse | null;
  cnic: string;
  setCnic: (v: string) => void;
  onNext: () => void;
  error: string | null;
}) {
  const formatCnic = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 13);
    if (d.length > 10) return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
    if (d.length > 5)  return `${d.slice(0, 5)}-${d.slice(5)}`;
    return d;
  };

  const canVerify = cnic.replace(/\D/g, "").length >= 13;

  return (
    <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
      <h3 className="font-bold text-lg text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Step 1 — Verify Identity
      </h3>
      {voter && (
        <p className="text-sm text-gray-500 mb-5">
          Logged in as <span className="font-semibold text-gray-800">{voter.name}</span>. Please confirm your CNIC to proceed.
        </p>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <label className="block text-xs font-semibold text-gray-600 mb-2">CNIC Number</label>
      <input
        value={cnic}
        onChange={(e) => setCnic(formatCnic(e.target.value))}
        placeholder="35202-1234567-8"
        className="w-full px-4 py-3 rounded-xl border text-sm mb-5 bg-gray-50 focus:outline-none"
        style={{ borderColor: BORDER, fontFamily: "monospace" }}
      />

      <button
        onClick={onNext}
        disabled={!canVerify}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
        style={{ background: canVerify ? G : "#d1d5db" }}
      >
        Verify &amp; Get Ballot
      </button>
    </div>
  );
}

// ── STRATEGY 2: Ballot / Candidate Selection ───────────────────────────────
function Step2Ballot({
  candidates, elections, sel, electionId,
  onSelect, onElectionSelect, onNext, loading,
}: {
  candidates: CandidateResponse[];
  elections: ElectionResponse[];
  sel: number | null;
  electionId: number | null;
  onSelect: (id: number) => void;
  onElectionSelect: (id: number) => void;
  onNext: () => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-10 shadow-sm text-center" style={{ borderColor: BORDER }}>
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading ballot…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Election selector */}
      {elections.length > 1 && (
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Select Election</label>
          <select
            value={electionId ?? ""}
            onChange={(e) => onElectionSelect(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:outline-none"
            style={{ borderColor: BORDER }}
          >
            <option value="">Choose an election</option>
            {elections.map((el) => (
              <option key={el.id} value={el.id}>{el.name}</option>
            ))}
          </select>
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border p-8 text-center shadow-sm" style={{ borderColor: BORDER }}>
          <p className="text-sm text-gray-400">No candidates found for your constituency.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-5 font-medium">Select one candidate:</p>
          <div className="flex flex-col gap-3 mb-6">
            {candidates.map((c) => {
              const isSelected = sel === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c.id)}
                  className="flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: isSelected ? G : BORDER,
                    background:  isSelected ? GL : "#fff",
                    transform:   isSelected ? "translateX(4px)" : "none",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${partyColor(c.party_name)}22` }}
                  >
                    {partyEmoji(c.party_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.party_name ?? "Independent"}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0"
                    style={{ border: isSelected ? `6px solid ${G}` : "2px solid #d1d5db" }}
                  />
                </button>
              );
            })}
          </div>
          <button
            onClick={() => sel && electionId && onNext()}
            disabled={!sel || !electionId}
            className="w-full py-4 rounded-xl font-bold text-base text-white transition-all"
            style={{
              background: sel && electionId ? G : "#d1d5db",
              cursor: sel && electionId ? "pointer" : "not-allowed",
            }}
          >
            Proceed to Confirm →
          </button>
        </>
      )}
    </div>
  );
}

// ── STRATEGY 3: Confirmation ───────────────────────────────────────────────
function Step3Confirm({
  candidate, onConfirm, onBack, loading, error,
}: {
  candidate: CandidateResponse;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div>
      <div className="bg-white rounded-2xl border p-7 mb-4 shadow-sm" style={{ borderColor: BORDER }}>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">You are voting for:</p>
        <div className="flex items-center gap-4 p-5 rounded-xl border-2" style={{ background: GL, borderColor: G }}>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: `${partyColor(candidate.party_name)}22` }}
          >
            {partyEmoji(candidate.party_name)}
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">{candidate.name}</p>
            <p className="text-sm text-gray-500">{candidate.party_name ?? "Independent"}</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          ⚠ Your vote is anonymous and encrypted. Once submitted, it cannot be changed.
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50"
          style={{ borderColor: BORDER }}
        >
          ← Go Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 disabled:opacity-60"
          style={{ background: G }}
        >
          {loading ? "Casting vote…" : "Confirm & Cast Vote →"}
        </button>
      </div>
    </div>
  );
}

// ── STRATEGY 4: Receipt ────────────────────────────────────────────────────
function Step4Receipt({ vote, election, onReset }: {
  vote: VoteResponse;
  election: ElectionResponse | null;
  onReset: () => void;
}) {
  const ts = vote.timestamp ? new Date(vote.timestamp) : new Date();
  return (
    <div className="max-w-md mx-auto">
      <ReceiptCard
        receiptId={`VOTE-${vote.id}-${String(vote.voter_id).padStart(4, "0")}`}
        election={election?.name ?? "Election"}
        date={ts.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
        time={ts.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"}
      />
      <button
        onClick={onReset}
        className="w-full mt-3 py-3 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50"
        style={{ borderColor: BORDER }}
      >
        Return to Home
      </button>
    </div>
  );
}

// ── VOTE PAGE: CONTAINER ───────────────────────────────────────────────────
export default function VotePage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // API data
  const [voter,      setVoter]      = useState<VoterResponse | null>(null);
  const [candidates, setCandidates] = useState<CandidateResponse[]>([]);
  const [elections,  setElections]  = useState<ElectionResponse[]>([]);
  const [voteResult, setVoteResult] = useState<VoteResponse | null>(null);

  // Form state
  const [cnic,       setCnic]       = useState("");
  const [sel,        setSel]        = useState<number | null>(null);
  const [electionId, setElectionId] = useState<number | null>(null);

  // UI state
  const [ballotLoading, setBallotLoading] = useState(false);
  const [castLoading,   setCastLoading]   = useState(false);
  const [verifyError,   setVerifyError]   = useState<string | null>(null);
  const [castError,     setCastError]     = useState<string | null>(null);

  // Load voter profile on mount — redirect to login if not authenticated
  useEffect(() => {
    getVoterProfile()
      .then(setVoter)
      .catch(() => router.push("/login"));
  }, [router]);

  // Step 1 → Step 2: verify CNIC matches profile, then load ballot
  const handleVerify = async () => {
    setVerifyError(null);
    if (!voter) return;

    const stripped = cnic.replace(/\D/g, "");
    if (stripped !== voter.cnic.replace(/\D/g, "")) {
      setVerifyError("CNIC does not match our records for this account.");
      return;
    }
    if (voter.has_voted) {
      setVerifyError("You have already cast your vote in this election.");
      return;
    }

    setBallotLoading(true);
    try {
      const [cands, elecs] = await Promise.all([
        listCandidates(voter.constituency_id ?? undefined),
        listElections("active"),
      ]);
      setCandidates(cands);
      setElections(elecs);
      if (elecs.length === 1) setElectionId(elecs[0].id);
      setStep(2);
    } catch {
      setVerifyError("Failed to load ballot. Please try again.");
    } finally {
      setBallotLoading(false);
    }
  };

  // Step 3 → Step 4: cast the vote
  const handleCastVote = async () => {
    if (!sel || !electionId) return;
    setCastError(null);
    setCastLoading(true);
    try {
      const result = await castVote(sel, electionId);
      setVoteResult(result);
      setStep(4);
    } catch (err: unknown) {
      setCastError(err instanceof Error ? err.message : "Failed to cast vote. Please try again.");
    } finally {
      setCastLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSel(null);
    setCnic("");
    setVerifyError(null);
    setCastError(null);
    setVoteResult(null);
  };

  const selectedCandidate = candidates.find((c) => c.id === sel) ?? null;
  const selectedElection  = elections.find((e) => e.id === electionId) ?? null;

  const heroTitles: Record<number, string> = {
    1: "Vote in 4 Simple Steps",
    2: "Cast Your Vote",
    3: "Review Your Vote",
    4: "Vote Cast Successfully!",
  };

  // ── STRATEGY PATTERN: map step → component ──────────────────────────────
  const stepStrategies: Record<number, React.ReactNode> = {
    1: (
      <Step1Verify
        voter={voter}
        cnic={cnic}
        setCnic={setCnic}
        onNext={handleVerify}
        error={verifyError}
      />
    ),
    2: (
      <Step2Ballot
        candidates={candidates}
        elections={elections}
        sel={sel}
        electionId={electionId}
        onSelect={setSel}
        onElectionSelect={setElectionId}
        onNext={() => setStep(3)}
        loading={ballotLoading}
      />
    ),
    3: selectedCandidate ? (
      <Step3Confirm
        candidate={selectedCandidate}
        onConfirm={handleCastVote}
        onBack={() => setStep(2)}
        loading={castLoading}
        error={castError}
      />
    ) : null,
    4: voteResult ? (
      <Step4Receipt
        vote={voteResult}
        election={selectedElection}
        onReset={reset}
      />
    ) : null,
  };

  return (
    <>
      <PageHero
        eyebrow={`Step ${step} of 4`}
        title={heroTitles[step]}
        subtitle={step === 3 ? "This action is final and cannot be undone." : undefined}
      />
      <div className="px-4 lg:px-8 py-12" style={{ background: BG, minHeight: "60vh" }}>
        <div className="max-w-xl mx-auto">
          {step < 4 && <StepBar step={step} steps={VOTE_STEPS} />}
          {stepStrategies[step]}
        </div>
      </div>
    </>
  );
}
