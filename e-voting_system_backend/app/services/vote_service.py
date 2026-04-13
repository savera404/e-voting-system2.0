"""
Service Layer – VoteService
Uses:
  - Chain of Responsibility  (vote validation before casting)
  - Strategy Pattern         (automatic strategy selection by election type)
  - Builder Pattern          (assembles the final result report)
  - Repository Pattern       (VoteRepository, VoterRepository, ElectionRepository)
"""

from sqlalchemy.orm import Session

from app.repositories.vote_repository import VoteRepository
from app.repositories.voter_repository import VoterRepository
from app.repositories.election_repository import ElectionRepository
from app.models.vote import Vote
from app.models.voter import Voter
from app.patterns.chain.vote_validation_chain import VoteValidationChain, VoteContext
from app.patterns.strategy.vote_counting_strategy import VoteCounter
from app.patterns.builder.report_builder import ElectionResultBuilder
from app.schemas.vote_schema import CastVoteRequest


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
        """
        chain = VoteValidationChain.build()
        ctx   = VoteContext(
            db=db,
            voter=current_voter,
            candidate_id=payload.candidate_id,
            election_id=payload.election_id,
        )
        chain.handle(ctx)

        vote = Vote(
            voter_id=current_voter.id,
            candidate_id=payload.candidate_id,
            election_id=payload.election_id,
        )
        saved_vote = self.vote_repo.create(db, vote)
        self.voter_repo.mark_voted(db, current_voter)
        return saved_vote

    # ── Results ────────────────────────────────────────────────────────────
    def get_results(self, db: Session, election_id: int):
        """
        Clear responsibility split:

        Strategy Pattern — decides HOW votes are counted:
          federal / provincial  → FirstPastThePostStrategy  (highest votes wins)
          local                 → RunoffStrategy            (>50 % needed)
          Owns: ranked_candidates, winner, requires_runoff, runoff_candidates.

        Builder Pattern — assembles the full report object step by step:
          Step 1: set_election()        — election id / name / type
          Step 2: set_totals()          — votes cast + real eligible voter count
          Step 3: set_strategy_result() — hands in Strategy output without
                                          recalculating anything
          Step 4: build()               — computes turnout %, stamps timestamp,
                                          returns one clean ElectionResultReport

        The Builder's output is returned directly — no dict merging needed.
        """
        election = self.election_repo.get_by_id(db, election_id)
        if not election:
            from app.core.exceptions import ElectionNotFoundException
            raise ElectionNotFoundException(election_id)

        raw_counts      = self.vote_repo.get_vote_counts_for_election(db, election_id)
        total_votes     = self.vote_repo.count_for_election(db, election_id)
        eligible_voters = self.voter_repo.count_all(db)

        # ── Strategy: count votes using the right algorithm ────────────────
        counter         = VoteCounter.for_election_type(election.type or "federal")
        strategy_result = counter.count(raw_counts)

        # ── Builder: assemble the complete report ──────────────────────────
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

        # Return the report as a dict for FastAPI serialisation
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
