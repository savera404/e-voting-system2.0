"use client";
// DESIGN PATTERNS: Strategy (each step is a separate component),
// Observer (central state passed down as props),
// Container/Presentational (VotePage owns state, steps are pure UI)

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

const PARTY_COLORS: Record<string, string> = {
  PTI: "#c41e3a", "PML-N": "#1a4731", PPP: "#1a1a1a",
  MQM: "#b45309", "JUI-F": "#6366f1", Independent: "#6b7280",
};
function partyColor(party: string | null) { return PARTY_COLORS[party ?? ""] ?? "#9ca3af"; }
function partyEmoji(party: string | null) {
  return ({ PTI: "🦅", "PML-N": "⚡", PPP: "🏹", MQM: "🔑", "JUI-F": "📖" } as Record<string, string>)[party ?? ""] ?? "🌟";
}

// ── Helper: determine the next election type to vote in ───────────────────
function getNextElectionType(voter: VoterResponse): "federal" | "provincial" | null {
  if (!voter.has_voted_federal)    return "federal";
  if (!voter.has_voted_provincial) return "provincial";
  return null; // all done
}

function electionTypeLabel(type: string): string {
  return type === "federal" ? "Federal (National Assembly)" : "Provincial (Provincial Assembly)";
}

// ── STRATEGY 1: Identity Verification ─────────────────────────────────────
function Step1Verify({ voter, cnic, setCnic, onNext, error, currentElectionType }: {
  voter: VoterResponse | null;
  cnic: string;
  setCnic: (v: string) => void;
  onNext: () => void;
  error: string | null;
  currentElectionType: "federal" | "provincial" | null;
}) {
  const fmt = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 13);
    if (d.length > 10) return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
    if (d.length > 5)  return `${d.slice(0, 5)}-${d.slice(5)}`;
    return d;
  };
  const canVerify = cnic.replace(/\D/g, "").length >= 13;

  return (
    <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
      <h3 className="font-bold text-lg text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Verify Identity
      </h3>
      {voter && (
        <p className="text-sm text-gray-500 mb-5">
          Logged in as <span className="font-semibold text-gray-800">{voter.name}</span>. Confirm your CNIC to continue.
        </p>
      )}

      {/* Per-type vote status badges */}
      {voter && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { value: "federal",    label: "Federal",    done: voter.has_voted_federal },
            { value: "provincial", label: "Provincial", done: voter.has_voted_provincial },
          ].map(({ value, label, done }) => (
            <span key={value} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"
              style={{
                background:  done ? "#f0fdf4" : "#f9fafb",
                borderColor: done ? "#86efac" : "#e5e7eb",
                color:       done ? "#16a34a" : "#9ca3af",
              }}>
              {done ? "✓" : "○"} {label}
            </span>
          ))}
        </div>
      )}

      {/* Show which election type is next */}
      {currentElectionType && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
          🗳️ Next up: <span className="font-bold">{electionTypeLabel(currentElectionType)}</span> election
        </div>
      )}

      {!currentElectionType && voter && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
          ✅ You have already voted in all election types. Thank you!
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <label className="block text-xs font-semibold text-gray-600 mb-2">CNIC Number</label>
      <input
        value={cnic}
        onChange={(e) => setCnic(fmt(e.target.value))}
        placeholder="35202-1234567-8"
        className="w-full px-4 py-3 rounded-xl border text-sm mb-5 bg-gray-50 focus:outline-none"
        style={{ borderColor: BORDER, fontFamily: "monospace" }}
      />
      <button onClick={onNext} disabled={!canVerify || !currentElectionType}
        className="w-full py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
        style={{ background: canVerify && currentElectionType ? G : "#d1d5db", cursor: canVerify && currentElectionType ? "pointer" : "not-allowed" }}>
        Verify &amp; Get Ballot
      </button>
    </div>
  );
}

// ── STRATEGY 2: Election → Candidate selection (auto-determined type) ─────
function Step2Ballot({ voter, currentElectionType, onNext, loading }: {
  voter: VoterResponse;
  currentElectionType: "federal" | "provincial";
  onNext: (candidate: CandidateResponse, election: ElectionResponse) => void;
  loading: boolean;
}) {
  const [elections,        setElections]        = useState<ElectionResponse[]>([]);
  const [selectedElection, setSelectedElection] = useState<ElectionResponse | null>(null);
  const [candidates,       setCandidates]       = useState<CandidateResponse[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [electionsLoading,  setElectionsLoading]  = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [noElections,       setNoElections]        = useState(false);

  // Determine the voter's constituency ID for this election type
  const voterConstituencyId = currentElectionType === "federal"
    ? voter.federal_constituency_id
    : voter.provincial_constituency_id;

  // Load active elections of the current type
  useEffect(() => {
    setElections([]);
    setSelectedElection(null);
    setCandidates([]);
    setSelectedCandidate(null);
    setNoElections(false);
    setElectionsLoading(true);
    listElections("active", currentElectionType)
      .then((data) => {
        setElections(data);
        setNoElections(data.length === 0);
        if (data.length === 1) setSelectedElection(data[0]);
      })
      .catch(() => setNoElections(true))
      .finally(() => setElectionsLoading(false));
  }, [currentElectionType]);

  // When election changes → load candidates for voter's constituency
  useEffect(() => {
    setCandidates([]);
    setSelectedCandidate(null);
    if (!selectedElection) return;
    setCandidatesLoading(true);
    listCandidates(voterConstituencyId ?? undefined)
      .then(setCandidates)
      .catch(() => setCandidates([]))
      .finally(() => setCandidatesLoading(false));
  }, [selectedElection]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border p-10 shadow-sm text-center" style={{ borderColor: BORDER }}>
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading ballot…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Election type banner ── */}
      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: GL }}>
            {currentElectionType === "federal" ? "🏛️" : "🏢"}
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Voting For</p>
            <p className="text-sm font-bold text-gray-900">{electionTypeLabel(currentElectionType)}</p>
          </div>
        </div>
      </div>

      {/* ── Step A: Select Election ── */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: BORDER }}>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
          Step A — Select Election
        </p>
        {electionsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
            Loading {currentElectionType} elections…
          </div>
        ) : noElections ? (
          <p className="text-sm text-orange-600 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
            No active {currentElectionType} elections right now.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {elections.map((el) => (
              <button key={el.id} onClick={() => setSelectedElection(el)}
                className="flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: selectedElection?.id === el.id ? G : "#e5e7eb",
                  background:  selectedElection?.id === el.id ? GL : "#fff",
                }}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{el.name}</p>
                  <p className="text-xs text-gray-400 capitalize mt-0.5">{el.type} election</p>
                </div>
                <div className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ border: selectedElection?.id === el.id ? `5px solid ${G}` : "2px solid #d1d5db" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Step B: Pick candidate (only shown after election chosen) ── */}
      {selectedElection && (
        <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: BORDER }}>
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
            Step B — Select Candidate
          </p>
          {candidatesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
              Loading candidates…
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-gray-400">No candidates found for your constituency.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {candidates.map((c) => {
                const isSelected = selectedCandidate === c.id;
                return (
                  <button key={c.id} onClick={() => setSelectedCandidate(c.id)}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: isSelected ? G : "#e5e7eb",
                      background:  isSelected ? GL : "#fff",
                      transform:   isSelected ? "translateX(4px)" : "none",
                    }}>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${partyColor(c.party_name)}22` }}>
                      {partyEmoji(c.party_name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.party_name ?? "Independent"}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex-shrink-0"
                      style={{ border: isSelected ? `6px solid ${G}` : "2px solid #d1d5db" }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Proceed button ── */}
      <button
        onClick={() => {
          const full = candidates.find(c => c.id === selectedCandidate);
          if (full && selectedElection) onNext(full, selectedElection);
        }}
        disabled={!selectedCandidate || !selectedElection}
        className="w-full py-4 rounded-xl font-bold text-base text-white transition-all"
        style={{
          background: selectedCandidate && selectedElection ? G : "#d1d5db",
          cursor: selectedCandidate && selectedElection ? "pointer" : "not-allowed",
        }}>
        Proceed to Confirm →
      </button>
    </div>
  );
}

// ── STRATEGY 3: Confirmation ───────────────────────────────────────────────
function Step3Confirm({ candidate, election, onConfirm, onBack, loading, error }: {
  candidate: CandidateResponse;
  election: ElectionResponse;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div>
      <div className="bg-white rounded-2xl border p-7 mb-4 shadow-sm" style={{ borderColor: BORDER }}>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Election</p>
        <p className="text-sm font-semibold text-gray-800 mb-4">{election.name} — <span className="capitalize">{election.type}</span></p>
        <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-3">You are voting for:</p>
        <div className="flex items-center gap-4 p-5 rounded-xl border-2" style={{ background: GL, borderColor: G }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: `${partyColor(candidate.party_name)}22` }}>
            {partyEmoji(candidate.party_name)}
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">{candidate.name}</p>
            <p className="text-sm text-gray-500">{candidate.party_name ?? "Independent"}</p>
          </div>
        </div>
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}
        <div className="mt-5 flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          ⚠ Your vote is anonymous and encrypted. Once submitted it cannot be changed.
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack} disabled={loading}
          className="flex-1 py-3.5 rounded-xl border font-semibold text-sm text-gray-600 hover:bg-gray-50"
          style={{ borderColor: BORDER }}>
          ← Go Back
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-[2] py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 disabled:opacity-60"
          style={{ background: G }}>
          {loading ? "Casting vote…" : "Confirm & Cast Vote →"}
        </button>
      </div>
    </div>
  );
}

// ── STRATEGY 4: Receipt ────────────────────────────────────────────────────
function Step4Receipt({ vote, election, hasMoreVotes, onContinueVoting, onGoHome }: {
  vote: VoteResponse;
  election: ElectionResponse | null;
  hasMoreVotes: boolean;
  onContinueVoting: () => void;
  onGoHome: () => void;
}) {
  const raw = vote.timestamp
    ? (vote.timestamp.endsWith("Z") || vote.timestamp.includes("+") ? vote.timestamp : vote.timestamp + "Z")
    : new Date().toISOString();
  const ts = new Date(raw);
  return (
    <div className="max-w-md mx-auto">
      <ReceiptCard
        receiptId={vote.receipt_code ?? `VOTE-${vote.id}`}
        election={election?.name ?? "Election"}
        date={ts.toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
        time={ts.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" }) + " PKT"}
      />

      {hasMoreVotes ? (
        <div className="mt-4 space-y-3">
          <div className="px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
            🗳️ You still have <span className="font-bold">provincial election</span> vote remaining.
            You need to verify your identity again to proceed.
          </div>
          <button onClick={onContinueVoting}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
            style={{ background: G }}>
            Continue to Provincial Vote →
          </button>
          <button onClick={onGoHome}
            className="w-full py-3 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50"
            style={{ borderColor: BORDER }}>
            Vote Later
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
            ✅ You have successfully voted in all election types. Thank you for participating!
          </div>
          <button onClick={onGoHome}
            className="w-full py-3 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50"
            style={{ borderColor: BORDER }}>
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
}

// ── CONTAINER ─────────────────────────────────────────────────────────────
export default function VotePage() {
  const router = useRouter();
  const [step, setStep]           = useState<1 | 2 | 3 | 4>(1);
  const [voter, setVoter]         = useState<VoterResponse | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResponse | null>(null);
  const [cnic, setCnic]           = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [ballotLoading, setBallotLoading] = useState(false);

  // Held between step 2 → 3 → 4
  const [pendingCandidate, setPendingCandidate] = useState<CandidateResponse | null>(null);
  const [pendingElection,  setPendingElection]  = useState<ElectionResponse | null>(null);
  const [castLoading, setCastLoading] = useState(false);
  const [castError,   setCastError]   = useState<string | null>(null);

  // Auto-determined election type based on voter's voting history
  const currentElectionType = voter ? getNextElectionType(voter) : null;

  useEffect(() => {
    getVoterProfile().then(setVoter).catch(() => router.push("/login"));
  }, [router]);

  const handleVerify = () => {
    setVerifyError(null);
    if (!voter) return;

    if (voter.cnic.replace(/\D/g, "") !== cnic.replace(/\D/g, "")) {
      setVerifyError("CNIC does not match our records for this account.");
      return;
    }
    if (!currentElectionType) {
      setVerifyError("You have already voted in all election types.");
      return;
    }
    setStep(2);
  };

  const handleStep2Next = (candidate: CandidateResponse, election: ElectionResponse) => {
    setPendingCandidate(candidate);
    setPendingElection(election);
    setStep(3);
  };

  const handleCastVote = async () => {
    if (!pendingCandidate || !pendingElection) return;
    setCastError(null);
    setCastLoading(true);
    try {
      const result = await castVote(pendingCandidate.id, pendingElection.id);
      setVoteResult(result);
      // Refresh voter so per-type flags update for next vote
      const updated = await getVoterProfile();
      setVoter(updated);
      setStep(4);
    } catch (err: unknown) {
      setCastError(err instanceof Error ? err.message : "Failed to cast vote.");
    } finally {
      setCastLoading(false);
    }
  };

  const resetForNextVote = () => {
    // Go back to step 1 for the next election type (provincial)
    setStep(1);
    setCnic("");
    setVerifyError(null);
    setCastError(null);
    setVoteResult(null);
    setPendingCandidate(null);
    setPendingElection(null);
  };

  const goHome = () => {
    router.push("/");
  };

  // Check if voter still has more votes after current vote is cast
  const hasMoreVotes = voter ? getNextElectionType(voter) !== null : false;

  const heroTitles: Record<number, string> = {
    1: "Cast Your Vote", 2: "Select Your Candidate",
    3: "Review Your Vote", 4: "Vote Cast Successfully!",
  };

  return (
    <>
      <PageHero eyebrow={`Step ${step} of 4`} title={heroTitles[step]}
        subtitle={step === 3 ? "This action is final and cannot be undone." : undefined} />
      <div className="px-4 lg:px-8 py-12" style={{ background: BG, minHeight: "60vh" }}>
        <div className="max-w-xl mx-auto">
          {step < 4 && <StepBar step={step} steps={VOTE_STEPS} />}

          {step === 1 && (
            <Step1Verify voter={voter} cnic={cnic} setCnic={setCnic}
              onNext={handleVerify} error={verifyError}
              currentElectionType={currentElectionType} />
          )}

          {step === 2 && voter && currentElectionType && (
            <Step2Ballot
              voter={voter}
              currentElectionType={currentElectionType}
              onNext={handleStep2Next}
              loading={ballotLoading}
            />
          )}

          {step === 3 && pendingCandidate && pendingElection && (
            <Step3Confirm
              candidate={pendingCandidate}
              election={pendingElection}
              onConfirm={handleCastVote}
              onBack={() => setStep(2)}
              loading={castLoading}
              error={castError}
            />
          )}

          {step === 4 && voteResult && (
            <Step4Receipt
              vote={voteResult}
              election={pendingElection}
              hasMoreVotes={hasMoreVotes}
              onContinueVoting={resetForNextVote}
              onGoHome={goHome}
            />
          )}
        </div>
      </div>
    </>
  );
}
