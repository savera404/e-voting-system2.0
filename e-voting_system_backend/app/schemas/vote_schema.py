from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_serializer


def _utc_str(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    return (dt.isoformat() + "Z") if dt.tzinfo is None else dt.isoformat()


class CastVoteRequest(BaseModel):
    candidate_id: int
    election_id: int


class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:           int
    voter_id:     Optional[int]
    candidate_id: Optional[int]
    election_id:  Optional[int]
    timestamp:    Optional[datetime]
    receipt_code: Optional[str]
    ledger_hash:  Optional[str]

    @field_serializer("timestamp")
    def _serialize_ts(self, dt: Optional[datetime], _info) -> Optional[str]:
        return _utc_str(dt)


class VoteHistoryItem(BaseModel):
    """
    One entry in a voter's voting history.
    Safe to return to the authenticated voter — no other voter's data included.
    Candidate name is intentionally excluded to preserve ballot secrecy.
    """
    vote_id:       int
    election_id:   int
    election_name: str
    election_type: Optional[str]
    recorded_at:   Optional[str]   # UTC ISO-8601 with Z
    receipt_code:  Optional[str]
    ledger_hash:   Optional[str]
    vote_status:   str             # always "Counted"


class VoteVerificationResponse(BaseModel):
    """
    Returned by GET /votes/verify/{receipt_code}.
    Confirms the vote exists and was counted without revealing
    the voter's identity or candidate choice.
    """
    receipt_code:  str
    election_name: str
    election_type: Optional[str]
    recorded_at:   str
    vote_status:   str
    ledger_hash:   str


class ElectionResultResponse(BaseModel):
    method:            str
    total_votes:       int
    winner:            Optional[dict]
    ranked_candidates: list
    requires_runoff:   Optional[bool] = None
    runoff_candidates: Optional[list] = None
