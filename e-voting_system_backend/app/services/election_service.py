"""
Service Layer – ElectionService
Uses: Factory Pattern (create), Observer Pattern (status changes)

Status lifecycle — fully automatic, time-driven
────────────────────────────────────────────────
  upcoming  →  active     when start_date is reached
  active    →  completed  when end_date is reached

No manual status changes are allowed.  The sync helper below is called
on every read/write path AND before every vote is cast, so the DB is
always up-to-date without needing a background scheduler.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.election import Election
from app.repositories.election_repository import ElectionRepository
from app.patterns.factory.election_factory import ElectionFactory
from app.patterns.observer.election_observer import ElectionEventManager
from app.core.exceptions import ElectionNotFoundException
from app.schemas.election_schema import ElectionCreate


def _naive_utc(dt: datetime) -> datetime:
    """Return a naive UTC datetime regardless of whether dt is aware or naive."""
    from datetime import timezone
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


# ── Module-level sync (imported by VoteService too) ───────────────────────

def sync_election_statuses(db: Session, event_manager: ElectionEventManager) -> None:
    """
    Scan every non-completed election and apply time-driven transitions:

      upcoming  →  active     if start_date <= now
      active    →  completed  if end_date   <= now

    Called by ElectionService on every read/write path and by VoteService
    before each vote-cast, so status is always correct without a scheduler.
    """
    now = datetime.utcnow()
    elections = (
        db.query(Election)
        .filter(Election.status != "completed")
        .all()
    )

    for el in elections:
        start = _naive_utc(el.start_date) if el.start_date else None
        end   = _naive_utc(el.end_date)   if el.end_date   else None

        new_status = None

        if end is not None and end <= now:
            # End time reached → complete regardless of current status
            new_status = "completed"
        elif start is not None and start <= now and el.status == "upcoming":
            # Start time reached and still upcoming → activate
            new_status = "active"

        if new_status and new_status != el.status:
            old_status = el.status
            el.status  = new_status
            db.commit()
            event_manager.status_changed(
                election_id=el.id,
                election_name=el.name,
                old_status=old_status,
                new_status=new_status,
            )


# ── Service ────────────────────────────────────────────────────────────────

class ElectionService:

    def __init__(self):
        self.repo          = ElectionRepository()
        self._event_manager = ElectionEventManager.get_instance()

    def _sync(self, db: Session) -> None:
        """Convenience wrapper so service methods stay one-liners."""
        sync_election_statuses(db, self._event_manager)

    # ── CRUD ────────────────────────────────────────────────────────────────

    def create_election(self, db: Session, data: ElectionCreate):
        """
        Uses Factory Pattern to create the Election ORM object.
        Status is always 'upcoming' at creation; the sync that runs on the
        next read will activate it immediately if start_date is already past.
        """
        election_obj = ElectionFactory.create(
            name=data.name,
            election_type=data.type,
            start_date=data.start_date,
            end_date=data.end_date,
            status="upcoming",
        )
        created = self.repo.create(db, election_obj)
        # Sync immediately so the returned object already has the correct status
        self._sync(db)
        db.refresh(created)
        return created

    def get_election(self, db: Session, election_id: int):
        self._sync(db)
        election = self.repo.get_by_id(db, election_id)
        if not election:
            raise ElectionNotFoundException(election_id)
        return election

    def list_elections(self, db: Session, status: Optional[str] = None, election_type: Optional[str] = None):
        self._sync(db)
        if status:
            return self.repo.get_by_status(db, status, election_type)
        return self.repo.get_all(db, election_type=election_type)

    def delete_election(self, db: Session, election_id: int):
        election = self.get_election(db, election_id)
        self.repo.delete(db, election)
        return {"message": f"Election {election_id} deleted"}
