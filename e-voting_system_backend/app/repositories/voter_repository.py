"""Repository Pattern - VoterRepository"""

from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.voter import Voter

_TYPE_TO_VOTED_FIELD = {
    "federal":    "has_voted_federal",
    "provincial": "has_voted_provincial",
    "local":      "has_voted_local",
}

_TYPE_TO_CONS_FIELD = {
    "federal":    "federal_constituency_id",
    "provincial": "provincial_constituency_id",
    "local":      "local_constituency_id",
}


class VoterRepository:

    def create_voter(self, db: Session, voter_data) -> Voter:
        voter = Voter(**voter_data.dict())
        db.add(voter)
        db.commit()
        db.refresh(voter)
        return voter

    def get_by_id(self, db: Session, voter_id: int) -> Optional[Voter]:
        return db.query(Voter).filter(Voter.id == voter_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[Voter]:
        return db.query(Voter).filter(Voter.email == email).first()

    def get_by_cnic(self, db: Session, cnic: str) -> Optional[Voter]:
        return db.query(Voter).filter(Voter.cnic == cnic).first()

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Voter]:
        return db.query(Voter).offset(skip).limit(limit).all()

    def mark_voted(self, db: Session, voter: Voter, election_type: str) -> Voter:
        field = _TYPE_TO_VOTED_FIELD.get(election_type)
        if field:
            setattr(voter, field, True)
        voter.has_voted = True
        db.commit()
        db.refresh(voter)
        return voter

    def get_constituency_id_for_type(self, voter: Voter, election_type: str) -> Optional[int]:
        """Return the voter's registered constituency ID for the given election type."""
        field = _TYPE_TO_CONS_FIELD.get(election_type)
        if not field:
            return None
        return getattr(voter, field, None)

    # Alias for backwards compatibility
    def get_voter_by_email(self, db: Session, email: str) -> Optional[Voter]:
        return self.get_by_email(db, email)

    def count_all(self, db: Session) -> int:
        return db.query(Voter).count()
