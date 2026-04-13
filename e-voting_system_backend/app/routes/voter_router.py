from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.voter_schema import VoterCreate, VoterLogin
from app.services.voter_service import VoterService
from app.core.database import get_db
from app.core.dependencies import get_current_voter
from app.models.voter import Voter

router = APIRouter()
service = VoterService()


@router.post("/register")
def register_voter(voter: VoterCreate, db: Session = Depends(get_db)):
    return service.register_voter(db, voter)


@router.post("/login")
def login_voter(credentials: VoterLogin, db: Session = Depends(get_db)):
    return service.login_voter(db, credentials)


@router.get("/me")
def get_me(current_voter: Voter = Depends(get_current_voter)):
    return current_voter


@router.get("/{voter_id}")
def get_voter(voter_id: int, db: Session = Depends(get_db)):
    return service.get_voter(db, voter_id)


@router.get("/")
def list_voters(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return service.list_voters(db, skip, limit)
