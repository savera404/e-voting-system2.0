"""
Design Pattern – Strategy Pattern
───────────────────────────────────
Different election types use different vote-counting rules.
The Strategy pattern lets the service swap the algorithm automatically
based on election type, with zero changes to the calling code.

Pakistani election system
--------------------------
* Federal   (National Assembly)    → First Past The Post (FPTP)
            Whoever gets the most votes in a constituency wins outright.

* Provincial (Provincial Assembly) → First Past The Post (FPTP)
            Same plurality rule as federal in Pakistan's system.

* Local                            → Runoff
            If no candidate clears 50 %, the top two go to a second round.

The three concrete strategies:
  - FirstPastThePostStrategy  : highest vote count wins, no threshold needed
  - RunoffStrategy            : winner must exceed 50 %; else top-2 run off
  - ProportionalStrategy      : ranks by vote-share % (reserved for future use,
                                e.g. party-list senate seats)
"""

from __future__ import annotations
from abc import ABC, abstractmethod
from typing import List, Dict, Any


# ── Input type ─────────────────────────────────────────────────────────────

CandidateVotes = List[Dict[str, Any]]
# Each dict: {"candidate_id": int, "name": str, "party": str, "votes": int}


# ── Abstract Strategy ──────────────────────────────────────────────────────

class VoteCountingStrategy(ABC):
    @abstractmethod
    def count(self, data: CandidateVotes) -> Dict[str, Any]:
        """
        Processes raw vote counts and returns a structured result dict.
        Must include at minimum: 'ranked_candidates' and 'winner' keys.
        """


# ── Concrete Strategies ────────────────────────────────────────────────────

class FirstPastThePostStrategy(VoteCountingStrategy):
    """
    FPTP / Plurality — used for Federal and Provincial elections in Pakistan.
    The candidate with the highest vote count wins outright; no majority
    threshold is required.
    """

    def count(self, data: CandidateVotes) -> Dict[str, Any]:
        if not data:
            return {"method": "fptp", "winner": None, "ranked_candidates": []}

        total  = sum(d["votes"] for d in data)
        ranked = sorted(data, key=lambda x: x["votes"], reverse=True)

        for c in ranked:
            c["pct"] = round(c["votes"] / total * 100, 2) if total else 0.0

        return {
            "method":            "fptp",
            "total_votes":       total,
            "winner":            ranked[0],
            "ranked_candidates": ranked,
        }


class RunoffStrategy(VoteCountingStrategy):
    """
    Two-round Runoff — used for Local elections.
    If no candidate exceeds 50 %, the top two proceed to a second round.
    Returns a 'requires_runoff' flag the service and frontend can act on.
    """

    MAJORITY_THRESHOLD = 50.0

    def count(self, data: CandidateVotes) -> Dict[str, Any]:
        if not data:
            return {"method": "runoff", "winner": None, "ranked_candidates": []}

        total  = sum(d["votes"] for d in data)
        ranked = sorted(data, key=lambda x: x["votes"], reverse=True)

        for c in ranked:
            c["pct"] = round(c["votes"] / total * 100, 2) if total else 0.0

        top             = ranked[0]
        requires_runoff = top["pct"] < self.MAJORITY_THRESHOLD

        return {
            "method":            "runoff",
            "total_votes":       total,
            "requires_runoff":   requires_runoff,
            "runoff_candidates": ranked[:2] if requires_runoff else [],
            "winner":            None if requires_runoff else top,
            "ranked_candidates": ranked,
        }


# class ProportionalStrategy(VoteCountingStrategy):
#     """
#     Proportional Representation — reserved for future use
#     (e.g. party-list senate seat allocation).
#     Not currently auto-assigned to any election type.
#     """

#     def count(self, data: CandidateVotes) -> Dict[str, Any]:
#         if not data:
#             return {"method": "proportional", "winner": None, "ranked_candidates": []}

#         total  = sum(d["votes"] for d in data)
#         ranked = sorted(data, key=lambda x: x["votes"], reverse=True)

#         for c in ranked:
#             c["pct"] = round(c["votes"] / total * 100, 2) if total else 0.0

#         return {
#             "method":            "proportional",
#             "total_votes":       total,
#             "winner":            ranked[0],
#             "ranked_candidates": ranked,
#         }


# ── Context (Strategy holder) ──────────────────────────────────────────────

class VoteCounter:
    """
    The context that the service layer interacts with.
    Call VoteCounter.for_election_type(election.type) and the correct
    strategy is selected automatically — no manual ?method= param needed.
    """

    # Maps election.type  →  the correct counting strategy for Pakistan
    _ELECTION_TYPE_MAP: Dict[str, type] = {
        "federal":    FirstPastThePostStrategy,   # NA seats — FPTP
        "provincial": FirstPastThePostStrategy,   # PA seats — FPTP
        "local":      RunoffStrategy,             # Local bodies — Runoff
    }

    def __init__(self, strategy: VoteCountingStrategy | None = None) -> None:
        self._strategy = strategy or FirstPastThePostStrategy()

    @classmethod
    def for_election_type(cls, election_type: str) -> "VoteCounter":
        """
        Primary factory method.
        Picks the right strategy based on election.type from the DB.
        Unknown types fall back to FPTP.
        """
        strategy_cls = cls._ELECTION_TYPE_MAP.get(
            election_type.lower() if election_type else "",
            FirstPastThePostStrategy,
        )
        return cls(strategy_cls())

    def set_strategy(self, strategy: VoteCountingStrategy) -> None:
        """Allows runtime strategy swap if ever needed."""
        self._strategy = strategy

    def count(self, data: CandidateVotes) -> Dict[str, Any]:
        return self._strategy.count(data)
