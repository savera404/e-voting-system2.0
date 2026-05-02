from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Voter(Base):
    __tablename__ = "voters"

    id                       = Column(Integer, primary_key=True, index=True)
    name                     = Column(String, nullable=False)
    father_or_husband_name   = Column(String, nullable=False)
    cnic                     = Column(String, unique=True, nullable=False)
    phone_number             = Column(String, unique=True)
    email                    = Column(String, unique=True, nullable=False)
    password                 = Column(String, nullable=False)

    # Three typed constituency registrations.
    # Every Pakistani voter belongs to one NA seat, one provincial seat,
    # and one local body seat simultaneously. Stored here so candidates
    # are filtered correctly per election type at voting time.
    federal_constituency_id    = Column(Integer, ForeignKey("constituencies.id"), nullable=True)
    provincial_constituency_id = Column(Integer, ForeignKey("constituencies.id"), nullable=True)
    local_constituency_id      = Column(Integer, ForeignKey("constituencies.id"), nullable=True)

    # Per-type vote tracking
    has_voted            = Column(Boolean, default=False)
    has_voted_federal    = Column(Boolean, default=False)
    has_voted_provincial = Column(Boolean, default=False)
    has_voted_local      = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    federal_constituency    = relationship("Constituency", foreign_keys=[federal_constituency_id])
    provincial_constituency = relationship("Constituency", foreign_keys=[provincial_constituency_id])
    local_constituency      = relationship("Constituency", foreign_keys=[local_constituency_id])
