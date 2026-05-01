from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, model_validator, field_serializer


def _to_naive_utc(dt: datetime) -> datetime:
    """Strip timezone info after converting to UTC, for consistent comparisons."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class ElectionCreate(BaseModel):
    name: str
    type: str       # "federal" | "provincial" | "local"
    start_date: datetime
    end_date: datetime
    # status is intentionally excluded — new elections are always "upcoming"

    @model_validator(mode="after")
    def validate_dates(self) -> "ElectionCreate":
        now       = datetime.utcnow()
        start     = _to_naive_utc(self.start_date)
        end       = _to_naive_utc(self.end_date)

        if end <= start:
            raise ValueError("end_date must be after start_date")

        if end <= now:
            raise ValueError("end_date has already passed — cannot create a completed election")

        return self


class ElectionStatusUpdate(BaseModel):
    status: str     # "upcoming" | "active" | "completed"


class ElectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: Optional[str]
    status: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]

    @field_serializer("start_date", "end_date")
    def _serialize_dt(self, dt: Optional[datetime], _info) -> Optional[str]:
        """
        Naive datetimes stored in the DB are UTC.
        Appending 'Z' tells the frontend they are UTC so JavaScript
        Date.parse() converts them to local time correctly.
        """
        if dt is None:
            return None
        if dt.tzinfo is not None:
            # Already timezone-aware — just emit ISO with offset
            return dt.isoformat()
        # Naive → treat as UTC, append Z
        return dt.isoformat() + "Z"
