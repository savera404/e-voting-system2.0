"""
Factory Pattern – CandidateFactory
────────────────────────────────────
Mirrors ElectionFactory: centralises Candidate ORM object creation so
CandidateService never calls Candidate(...) directly.

Benefits
--------
* Validates party_name and normalises it in one place.
* If a new candidate type or required field is added later, only this
  file needs to change — the service layer stays untouched.
* Keeps the service layer thin and readable.
"""

from typing import Optional
from app.models.candidate import Candidate


class CandidateFactory:
    """Creates Candidate ORM objects without persisting them."""

    @classmethod
    def create(
        cls,
        name: str,
        constituency_id: int,
        party_name: Optional[str] = None,
    ) -> Candidate:
        """
        Build and return a Candidate instance.
        The service/repository is responsible for adding it to the DB session.
        """
        if not name or not name.strip():
            raise ValueError("Candidate name cannot be empty.")
        if constituency_id <= 0:
            raise ValueError("constituency_id must be a positive integer.")

        # Normalise: strip whitespace; default to "Independent" if not provided
        normalised_party = party_name.strip() if party_name and party_name.strip() else "Independent"

        return Candidate(
            name=name.strip(),
            party_name=normalised_party,
            constituency_id=constituency_id,
        )
