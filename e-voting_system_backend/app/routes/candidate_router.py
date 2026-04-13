from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.candidate_service import CandidateService
from app.schemas.candidate_schema import CandidateCreate

router = APIRouter()
service = CandidateService()


@router.post("/")
def create_candidate(data: CandidateCreate, db: Session = Depends(get_db)):
    return service.create_candidate(db, data)


@router.get("/")
def list_candidates(constituency_id: Optional[int] = None, db: Session = Depends(get_db)):
    return service.list_candidates(db, constituency_id)


@router.get("/{candidate_id}")
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    return service.get_candidate(db, candidate_id)


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    return service.delete_candidate(db, candidate_id)
