"""
Service Layer – CandidateService
Uses: Factory Pattern (create), Repository Pattern (CRUD)
"""

from sqlalchemy.orm import Session
from app.repositories.candidate_repository import CandidateRepository
from app.patterns.factory.candidate_factory import CandidateFactory
from app.core.exceptions import CandidateNotFoundException
from app.schemas.candidate_schema import CandidateCreate


class CandidateService:

    def __init__(self):
        self.repo = CandidateRepository()

    def create_candidate(self, db: Session, data: CandidateCreate):
        """
        Factory Pattern:
          CandidateFactory.create() handles validation and normalisation
          (e.g. empty-string party_name → None) so this service stays thin.
        """
        candidate = CandidateFactory.create(
            name=data.name,
            constituency_id=data.constituency_id,
            party_name=data.party_name,
        )
        return self.repo.create(db, candidate)

    def get_candidate(self, db: Session, candidate_id: int):
        candidate = self.repo.get_by_id(db, candidate_id)
        if not candidate:
            raise CandidateNotFoundException(candidate_id)
        return candidate

    def list_candidates(self, db: Session, constituency_id: int = None):
        if constituency_id:
            return self.repo.get_by_constituency(db, constituency_id)
        return self.repo.get_all(db)

    def delete_candidate(self, db: Session, candidate_id: int):
        candidate = self.get_candidate(db, candidate_id)
        self.repo.delete(db, candidate)
        return {"message": f"Candidate {candidate_id} deleted"}
