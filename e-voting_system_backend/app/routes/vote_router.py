from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_voter
from app.models.voter import Voter
from app.services.vote_service import VoteService
from app.schemas.vote_schema import CastVoteRequest, VoteResponse

router = APIRouter()
service = VoteService()


@router.post("/cast", response_model=VoteResponse)
def cast_vote(
    payload: CastVoteRequest,
    db: Session = Depends(get_db),
    current_voter: Voter = Depends(get_current_voter),
):
    """
    response_model=VoteResponse is critical here.
    Without it FastAPI serializes the raw SQLAlchemy ORM object AFTER
    mark_voted() has done a second db.commit(), which expires all ORM
    instances in the session.  FastAPI then gets empty stubs instead of
    real column values.  Using response_model forces Pydantic to read the
    attributes through the still-open session before returning, so every
    field (including receipt_code and ledger_hash) is populated correctly.
    """
    return service.cast_vote(db, current_voter, payload)


@router.get("/history")
def get_voting_history(
    db: Session = Depends(get_db),
    current_voter: Voter = Depends(get_current_voter),
):
    """
    Authenticated — returns the current voter's full voting history.
    Each item includes election name, timestamp, receipt code and ledger hash.
    Candidate choice is never included (ballot secrecy).
    """
    return service.get_voting_history(db, current_voter.id)


@router.get("/verify/{receipt_code}")
def verify_vote(receipt_code: str, db: Session = Depends(get_db)):
    """
    Public — no authentication required.
    Verifies a vote by its receipt code.
    Returns election name, timestamp, status and ledger hash.
    Never reveals voter identity or candidate choice.
    """
    return service.verify_vote(db, receipt_code)


@router.get("/results/{election_id}")
def get_results(
    election_id: int,
    db: Session = Depends(get_db),
):
    return service.get_results(db, election_id)
