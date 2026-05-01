from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Vote(Base):
    __tablename__ = "votes"

    id           = Column(Integer, primary_key=True, index=True)

    voter_id     = Column(Integer, ForeignKey("voters.id"))
    candidate_id = Column(Integer, ForeignKey("candidates.id"))
    election_id  = Column(Integer, ForeignKey("elections.id"))

    timestamp    = Column(DateTime, default=datetime.utcnow)

    # ── Vote verification fields ───────────────────────────────────────────
    # receipt_code: unique human-readable token given to the voter after casting
    #   Format: XXXX-XXXX-XXXX-XXXX  (16 hex chars split into groups of 4)
    # ledger_hash:  SHA-256 fingerprint of (receipt_code + voter_id +
    #               election_id + timestamp) — tamper-evident proof of record
    receipt_code = Column(String, unique=True, nullable=True, index=True)
    ledger_hash  = Column(String, nullable=True)

    voter     = relationship("Voter")
    candidate = relationship("Candidate")
