from sqlalchemy import Column, Integer, String
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    election_id = Column(Integer, index=True)
    event = Column(String, nullable=False)
    at = Column(String, nullable=False)
