"""
Design Pattern #6: Chain of Responsibility
────────────────────────────────────────────
Before a vote is cast, it must pass a pipeline of validation checks.
Each handler in the chain either passes the request to the next handler
or raises an exception that aborts the chain.

Handlers (in order)
--------------------
1. ElectionExistsHandler       – Does the election exist?
2. ElectionEndDateHandler      – Has the election's end_date already passed?
3. ElectionActiveHandler       – Is the election currently "active"?
4. VoterEligibilityHandler     – Has the voter already cast a vote?
5. CandidateExistsHandler      – Does the chosen candidate belong to this election?
6. ConstituencyMatchHandler    – Does the voter's constituency match the candidate's?

Usage
-----
    chain = VoteValidationChain.build()
    chain.handle(context)   # raises an app exception on failure, returns None on pass
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import (
    ElectionNotActiveException,
    AlreadyVotedException,
    ConstituencyMismatchException,
    ElectionNotFoundException,
)
from app.models.election import Election
from app.models.voter import Voter
from app.models.candidate import Candidate


# ── Request context ────────────────────────────────────────────────────────

class VoteContext:
    """Carries everything the handlers need; passed down the chain."""

    def __init__(
        self,
        db: Session,
        voter: Voter,
        candidate_id: int,
        election_id: int,
    ) -> None:
        self.db = db
        self.voter = voter
        self.candidate_id = candidate_id
        self.election_id = election_id

        # Populated lazily by handlers so we avoid redundant DB queries
        self.election: Optional[Election] = None
        self.candidate: Optional[Candidate] = None


# ── Abstract Handler ───────────────────────────────────────────────────────

class VoteHandler(ABC):
    def __init__(self) -> None:
        self._next: Optional["VoteHandler"] = None

    def set_next(self, handler: "VoteHandler") -> "VoteHandler":
        self._next = handler
        return handler   # allows chaining: a.set_next(b).set_next(c)

    def handle(self, ctx: VoteContext) -> None:
        self.check(ctx)
        if self._next:
            self._next.handle(ctx)

    @abstractmethod
    def check(self, ctx: VoteContext) -> None:
        """Raise an appropriate exception if the check fails."""


# ── Concrete Handlers ──────────────────────────────────────────────────────

class ElectionExistsHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        election = ctx.db.query(Election).filter(Election.id == ctx.election_id).first()
        if election is None:
            raise ElectionNotFoundException(ctx.election_id)
        ctx.election = election   # cache for downstream handlers


class ElectionEndDateHandler(VoteHandler):
    """
    Belt-and-suspenders check: even if the auto-complete background sync
    hasn't run yet (e.g. first request after restart), block voting for any
    election whose end_date is already in the past.
    """
    def check(self, ctx: VoteContext) -> None:
        end = ctx.election.end_date
        if end is None:
            return
        # Normalise to naive UTC for comparison
        from datetime import timezone
        if end.tzinfo is not None:
            end = end.astimezone(timezone.utc).replace(tzinfo=None)
        if end < datetime.utcnow():
            # Also opportunistically update the DB status
            if ctx.election.status != "completed":
                ctx.election.status = "completed"
                ctx.db.commit()
            raise ElectionNotActiveException(ctx.election_id, "completed")


class ElectionActiveHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        if ctx.election.status != "active":
            raise ElectionNotActiveException(ctx.election_id, ctx.election.status)


class VoterEligibilityHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        if ctx.voter.has_voted:
            raise AlreadyVotedException(ctx.voter.id, ctx.election_id)


class CandidateExistsHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        from app.core.exceptions import CandidateNotFoundException
        candidate = (
            ctx.db.query(Candidate)
            .filter(Candidate.id == ctx.candidate_id)
            .first()
        )
        if candidate is None:
            raise CandidateNotFoundException(ctx.candidate_id)
        ctx.candidate = candidate


class ConstituencyMatchHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        if ctx.voter.constituency_id != ctx.candidate.constituency_id:
            raise ConstituencyMismatchException(ctx.voter.id, ctx.candidate_id)


# ── Chain Builder ──────────────────────────────────────────────────────────

class VoteValidationChain:
    """Assembles and returns the head of the validation chain."""

    @staticmethod
    def build() -> VoteHandler:
        head = ElectionExistsHandler()
        head \
            .set_next(ElectionEndDateHandler()) \
            .set_next(ElectionActiveHandler()) \
            .set_next(VoterEligibilityHandler()) \
            .set_next(CandidateExistsHandler()) \
            .set_next(ConstituencyMatchHandler())
        return head
