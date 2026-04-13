from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.election_service import ElectionService
from app.schemas.election_schema import ElectionCreate, ElectionStatusUpdate
from app.patterns.observer.election_observer import ElectionEventManager, AuditObserver

router = APIRouter()
service = ElectionService()


@router.post("/")
def create_election(data: ElectionCreate, db: Session = Depends(get_db)):
    return service.create_election(db, data)


@router.get("/")
def list_elections(status: Optional[str] = None, db: Session = Depends(get_db)):
    return service.list_elections(db, status)


@router.get("/audit-trail")
def get_audit_trail():
    """
    Observer Pattern — exposes the AuditObserver's in-memory trail.
    Returns every election status-change event since the server started.
    """
    manager = ElectionEventManager.get_instance()
    # Find the AuditObserver that was registered at startup
    audit_observer = next(
        (obs for obs in manager._observers if isinstance(obs, AuditObserver)),
        None,
    )
    if audit_observer is None:
        return {"audit_trail": [], "message": "AuditObserver not registered"}
    return {"audit_trail": audit_observer.trail}


@router.get("/{election_id}")
def get_election(election_id: int, db: Session = Depends(get_db)):
    return service.get_election(db, election_id)


@router.patch("/{election_id}/status")
def update_status(election_id: int, body: ElectionStatusUpdate, db: Session = Depends(get_db)):
    return service.update_status(db, election_id, body.status)


@router.delete("/{election_id}")
def delete_election(election_id: int, db: Session = Depends(get_db)):
    return service.delete_election(db, election_id)
