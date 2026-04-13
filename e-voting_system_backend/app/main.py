from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine, Base
from app.models import *  # noqa: F401,F403 — registers all ORM models

from app.routes import voter_router, election_router, candidate_router, vote_router, location_router

from app.core.exceptions import (
    VoterNotFoundException,        voter_not_found_handler,
    ElectionNotFoundException,     election_not_found_handler,
    AlreadyVotedException,         already_voted_handler,
    ElectionNotActiveException,    election_not_active_handler,
    ConstituencyMismatchException, constituency_mismatch_handler,
    DuplicateEntryException,       duplicate_entry_handler,
    CandidateNotFoundException,    candidate_not_found_handler,
)

# ── Create all tables ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(title="E-Voting System API", version="1.0.0")

# ── CORS ───────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Exception handlers ─────────────────────────────────────────────────────
app.add_exception_handler(VoterNotFoundException,        voter_not_found_handler)
app.add_exception_handler(ElectionNotFoundException,     election_not_found_handler)
app.add_exception_handler(AlreadyVotedException,         already_voted_handler)
app.add_exception_handler(ElectionNotActiveException,    election_not_active_handler)
app.add_exception_handler(ConstituencyMismatchException, constituency_mismatch_handler)
app.add_exception_handler(DuplicateEntryException,       duplicate_entry_handler)
app.add_exception_handler(CandidateNotFoundException,    candidate_not_found_handler)

# ── Health / debug routes ──────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "E-Voting Backend Running Successfully"}


@app.get("/check_db_connection")
def check_db_connection():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        return {"database_connection": "successful"}


# ── Feature routers ────────────────────────────────────────────────────────
app.include_router(voter_router.router,     prefix="/voters",      tags=["Voters"])
app.include_router(election_router.router,  prefix="/elections",   tags=["Elections"])
app.include_router(candidate_router.router, prefix="/candidates",  tags=["Candidates"])
app.include_router(vote_router.router,      prefix="/votes",       tags=["Votes"])
app.include_router(location_router.router,  prefix="/locations",   tags=["Locations"])
