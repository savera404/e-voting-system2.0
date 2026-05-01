"""
Service Layer – VoteService
Uses:
  - Chain of Responsibility  (vote validation before casting)
  - Strategy Pattern         (automatic strategy selection by election type)
  - Builder Pattern          (assembles the final result report)
  - Repository Pattern       (VoteRepository, VoterRepository, ElectionRepository)
"""

import hashlib
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.repositories.vote_repository import VoteRepository
from app.repositories.voter_repository import VoterRepository
from app.repositories.election_repository import ElectionRepository
from app.models.vote import Vote
from app.models.voter import Voter
from app.patterns.chain.vote_validation_chain import VoteValidationChain, VoteContext
from app.patterns.strategy.vote_counting_strategy import VoteCounter
from app.patterns.builder.report_builder import ElectionResultBuilder
from app.schemas.vote_schema import CastVoteRequest, VoteVerificationResponse, VoteHistoryItem
from app.services.election_service import sync_election_statuses
from app.patterns.observer.election_observer import ElectionEventManager
from app.core.exceptions import VoteNotFoundException


# ── Receipt helpers ────────────────────────────────────────────────────────

def _generate_receipt_code() -> str:
    """
    Generate a unique receipt ID in the format XXXX-XXXX-XXXX-XXXX.
    Built from the first 16 hex characters of a UUID4, split into
    four groups of four and upper-cased for readability.
    Example: A3F1-08CD-9B72-E540
    """
    raw = uuid.uuid4().hex[:16].upper()          # 16 hex chars
    return f"{raw[0:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"


def _generate_ledger_hash(receipt_code: str, voter_id: int,
                           election_id: int, timestamp: datetime) -> str:
    """
    SHA-256 fingerprint that ties the receipt to this specific vote record.
    Inputs: receipt_code + voter_id + election_id + UTC timestamp (ISO-8601).
    The hash can be re-derived server-side from the stored fields as a
    tamper-evident check.
    """
    payload = f"{receipt_code}:{voter_id}:{election_id}:{timestamp.isoformat()}"
    return "0x" + hashlib.sha256(payload.encode()).hexdigest()[:32]


# ── Service ────────────────────────────────────────────────────────────────

class VoteService:

    def __init__(self):
        self.vote_repo     = VoteRepository()
        self.voter_repo    = VoterRepository()
        self.election_repo = ElectionRepository()

    # ── Cast a vote ────────────────────────────────────────────────────────
    def cast_vote(self, db: Session, current_voter: Voter, payload: CastVoteRequest):
        """
        Chain of Responsibility Pattern:
          Runs every validation handler in sequence.
          Any failed check raises an exception → FastAPI returns HTTP 4xx.
          Only if all checks pass does the vote get persisted.

        After a successful vote a cryptographic receipt code and ledger hash
        are generated and stored alongside the vote record.
        """
        # Sync election statuses before validation so the chain always
        # sees the correct (time-driven) status — no scheduler needed.
        sync_election_statuses(db, ElectionEventManager.get_instance())

        chain = VoteValidationChain.build()
        ctx   = VoteContext(
            db=db,
            voter=current_voter,
            candidate_id=payload.candidate_id,
            election_id=payload.election_id,
        )
        chain.handle(ctx)

        # ── Generate receipt before persisting ────────────────────────────
        ts           = datetime.utcnow()
        receipt_code = _generate_receipt_code()
        ledger_hash  = _generate_ledger_hash(
            receipt_code, current_voter.id, payload.election_id, ts
        )

        vote = Vote(
            voter_id=current_voter.id,
            candidate_id=payload.candidate_id,
            election_id=payload.election_id,
            timestamp=ts,
            receipt_code=receipt_code,
            ledger_hash=ledger_hash,
        )
        saved_vote = self.vote_repo.create(db, vote)
        self.voter_repo.mark_voted(db, current_voter)
        # mark_voted does a second db.commit() which expires all ORM objects.
        # Refresh saved_vote so receipt_code and ledger_hash are reloaded
        # from the DB before FastAPI serializes it into the response.
        db.refresh(saved_vote)
        return saved_vote

    # ── Voting history for the authenticated voter ────────────────────────
    def get_voting_history(self, db: Session, voter_id: int) -> list:
        """
        Returns all votes cast by this voter, enriched with election details.
        Candidate choice is deliberately excluded — ballot secrecy.
        """
        votes = self.vote_repo.get_all_by_voter(db, voter_id)
        history = []
        for v in votes:
            election = self.election_repo.get_by_id(db, v.election_id)
            ts = v.timestamp or datetime.utcnow()
            recorded_at = (ts.isoformat() + "Z") if ts.tzinfo is None else ts.isoformat()
            history.append(VoteHistoryItem(
                vote_id=v.id,
                election_id=v.election_id,
                election_name=election.name if election else "Unknown Election",
                election_type=election.type if election else None,
                recorded_at=recorded_at,
                receipt_code=v.receipt_code,
                ledger_hash=v.ledger_hash,
                vote_status="Counted",
            ))
        return history

    # ── Verify a vote by receipt code ─────────────────────────────────────
    def verify_vote(self, db: Session, receipt_code: str) -> VoteVerificationResponse:
        """
        Public endpoint — no authentication required.
        Confirms the vote exists and was counted without revealing
        the voter's identity or candidate choice.

        Returns:
          - receipt_code   — echoed back for display
          - election_name  — name of the election this vote belongs to
          - election_type  — federal / provincial / local
          - recorded_at    — UTC ISO-8601 timestamp with Z suffix
          - vote_status    — always "Counted & Verified"
          - ledger_hash    — SHA-256 fingerprint for tamper-evidence
        """
        vote = self.vote_repo.get_by_receipt_code(db, receipt_code.strip())
        if not vote:
            raise VoteNotFoundException(receipt_code)

        election = self.election_repo.get_by_id(db, vote.election_id)
        election_name = election.name if election else "Unknown Election"
        election_type = election.type if election else None

        # Normalise timestamp to UTC string with Z suffix
        ts = vote.timestamp or datetime.utcnow()
        recorded_at = (ts.isoformat() + "Z") if ts.tzinfo is None else ts.isoformat()

        return VoteVerificationResponse(
            receipt_code=vote.receipt_code,
            election_name=election_name,
            election_type=election_type,
            recorded_at=recorded_at,
            vote_status="Counted & Verified",
            ledger_hash=vote.ledger_hash or "",
        )

    # ── Results ────────────────────────────────────────────────────────────
    def get_results(self, db: Session, election_id: int):
        """
        Clear responsibility split:

        Strategy Pattern — decides HOW votes are counted:
          federal / provincial  → FirstPastThePostStrategy  (highest votes wins)
          local                 → RunoffStrategy            (>50 % needed)

        Builder Pattern — assembles the full report object step by step.
        """
        election = self.election_repo.get_by_id(db, election_id)
        if not election:
            from app.core.exceptions import ElectionNotFoundException
            raise ElectionNotFoundException(election_id)

        raw_counts      = self.vote_repo.get_vote_counts_for_election(db, election_id)
        total_votes     = self.vote_repo.count_for_election(db, election_id)
        eligible_voters = self.voter_repo.count_all(db)

        counter         = VoteCounter.for_election_type(election.type or "federal")
        strategy_result = counter.count(raw_counts)

        report = (
            ElectionResultBuilder()
            .set_election(election.id, election.name, election.type or "")
            .set_totals(
                total_votes=total_votes,
                eligible_voters=eligible_voters if eligible_voters > 0 else total_votes,
            )
            .set_strategy_result(strategy_result)
            .build()
        )

        return {
            "election_id":           report.election_id,
            "election_name":         report.election_name,
            "election_type":         report.election_type,
            "method":                report.method,
            "total_votes":           report.total_votes,
            "eligible_voters":       report.eligible_voters,
            "voter_turnout_percent": report.voter_turnout_percent,
            "generated_at":          report.generated_at,
            "winner":                report.winner,
            "ranked_candidates":     report.ranked_candidates,
            "requires_runoff":       report.requires_runoff,
            "runoff_candidates":     report.runoff_candidates,
        }
