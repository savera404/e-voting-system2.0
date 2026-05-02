"""
Design Pattern #6: Chain of Responsibility
────────────────────────────────────────────
Handlers (in order)
--------------------
1. ElectionExistsHandler       – Does the election exist?
2. ElectionEndDateHandler      – Has the election's end_date already passed?
3. ElectionActiveHandler       – Is the election currently "active"?
4. VoterEligibilityHandler     – Has the voter already voted in this election TYPE?
5. CandidateExistsHandler      – Does the chosen candidate exist?
6. ConstituencyMatchHandler    – Does the voter's constituency match the candidate's?
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

_TYPE_TO_FIELD = {
    "federal":    "has_voted_federal",
    "provincial": "has_voted_provincial",
    "local":      "has_voted_local",
}


class VoteContext:
    def __init__(self, db: Session, voter: Voter,
                 candidate_id: int, election_id: int) -> None:
        self.db           = db
        self.voter        = voter
        self.candidate_id = candidate_id
        self.election_id  = election_id
        self.election: Optional[Election]  = None
        self.candidate: Optional[Candidate] = None


class VoteHandler(ABC):
    def __init__(self) -> None:
        self._next: Optional["VoteHandler"] = None

    def set_next(self, handler: "VoteHandler") -> "VoteHandler":
        self._next = handler
        return handler

    def handle(self, ctx: VoteContext) -> None:
        self.check(ctx)
        if self._next:
            self._next.handle(ctx)

    @abstractmethod
    def check(self, ctx: VoteContext) -> None: ...


class ElectionExistsHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        election = ctx.db.query(Election).filter(Election.id == ctx.election_id).first()
        if election is None:
            raise ElectionNotFoundException(ctx.election_id)
        ctx.election = election


class ElectionEndDateHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        end = ctx.election.end_date
        if end is None:
            return
        from datetime import timezone
        if end.tzinfo is not None:
            end = end.astimezone(timezone.utc).replace(tzinfo=None)
        if end < datetime.utcnow():
            if ctx.election.status != "completed":
                ctx.election.status = "completed"
                ctx.db.commit()
            raise ElectionNotActiveException(ctx.election_id, "completed")


class ElectionActiveHandler(VoteHandler):
    def check(self, ctx: VoteContext) -> None:
        if ctx.election.status != "active":
            raise ElectionNotActiveException(ctx.election_id, ctx.election.status)


class VoterEligibilityHandler(VoteHandler):
    """
    Checks whether this voter has already cast a vote in the SAME election type
    (federal / provincial / local).  A voter may vote once per type.
    """
    def check(self, ctx: VoteContext) -> None:
        election_type = ctx.election.type or ""
        field = _TYPE_TO_FIELD.get(election_type)
        if field and getattr(ctx.voter, field, False):
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
    _TYPE_TO_CONS_FIELD = {
        "federal":    "federal_constituency_id",
        "provincial": "provincial_constituency_id",
        "local":      "local_constituency_id",
    }

    def check(self, ctx: VoteContext) -> None:
        election_type = ctx.election.type or ""
        field = self._TYPE_TO_CONS_FIELD.get(election_type)
        voter_cons = getattr(ctx.voter, field, None) if field else None
        if voter_cons != ctx.candidate.constituency_id:
            raise ConstituencyMismatchException(ctx.voter.id, ctx.candidate_id)


class VoteValidationChain:
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
