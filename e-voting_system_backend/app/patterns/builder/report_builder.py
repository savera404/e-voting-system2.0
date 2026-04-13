"""
Design Pattern #7: Builder Pattern
────────────────────────────────────
Building an election result report requires assembling multiple pieces
of information: election details, vote totals, per-candidate results,
and turnout percentage. The Builder pattern lets us construct this
complex object step by step instead of passing everything to one
giant constructor.

Responsibility split with the Strategy pattern
───────────────────────────────────────────────
Strategy  →  decides HOW votes are counted: ranks candidates, finds the
             winner, flags runoffs.  Owns: ranked_candidates, winner,
             requires_runoff, runoff_candidates.

Builder   →  assembles the FULL report object: wraps the strategy's
             ranked results together with election metadata, vote totals,
             turnout %, and a generated-at timestamp.  Owns: everything
             that describes the election itself and the final report shape.

This way there is zero duplication — the Builder never recalculates
percentages; it just slots in the already-ranked list from the Strategy.

Usage
-----
    strategy_result = VoteCounter.for_election_type(election.type).count(raw)

    report = (
        ElectionResultBuilder()
        .set_election(election.id, election.name, election.type)
        .set_totals(total_votes=500, eligible_voters=1000)
        .set_strategy_result(strategy_result)   # ← hand off Strategy output
        .build()
    )
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


# ── Product ────────────────────────────────────────────────────────────────

@dataclass
class ElectionResultReport:
    """
    The final object produced by the builder.
    This is what gets serialised and sent to the frontend.
    """
    election_id:           int
    election_name:         str
    election_type:         str
    total_votes:           int
    eligible_voters:       int
    voter_turnout_percent: float
    generated_at:          str

    # ── From Strategy ──────────────────────────────────────────────────────
    method:             str
    ranked_candidates:  List[Dict[str, Any]]
    winner:             Optional[Dict[str, Any]]

    # Only populated when RunoffStrategy fires
    requires_runoff:    bool                    = False
    runoff_candidates:  List[Dict[str, Any]]    = field(default_factory=list)


# ── Builder ────────────────────────────────────────────────────────────────

class ElectionResultBuilder:
    """
    Assembles an ElectionResultReport piece by piece.

    Step 1 — set_election()       : election id / name / type
    Step 2 — set_totals()         : votes cast + eligible voter count
    Step 3 — set_strategy_result(): hand in the Strategy's output dict
    Step 4 — build()              : validate, compute turnout, return report
    """

    def __init__(self) -> None:
        self._reset()

    def _reset(self) -> None:
        self._election_id:      Optional[int]       = None
        self._election_name:    str                 = ""
        self._election_type:    str                 = ""
        self._total_votes:      int                 = 0
        self._eligible_voters:  int                 = 0
        self._strategy_result:  Optional[Dict[str, Any]] = None

    # ── Step 1 ─────────────────────────────────────────────────────────────
    def set_election(
        self,
        election_id:   int,
        election_name: str,
        election_type: str,
    ) -> "ElectionResultBuilder":
        self._election_id   = election_id
        self._election_name = election_name
        self._election_type = election_type
        return self

    # ── Step 2 ─────────────────────────────────────────────────────────────
    def set_totals(
        self,
        total_votes:     int,
        eligible_voters: int,
    ) -> "ElectionResultBuilder":
        self._total_votes     = total_votes
        self._eligible_voters = eligible_voters
        return self

    # ── Step 3 ─────────────────────────────────────────────────────────────
    def set_strategy_result(
        self,
        strategy_result: Dict[str, Any],
    ) -> "ElectionResultBuilder":
        """
        Accepts the dict returned by VoteCountingStrategy.count().
        The Builder does NOT recalculate anything from this — it trusts
        the Strategy completely and just stores it for final assembly.
        """
        self._strategy_result = strategy_result
        return self

    # ── Step 4 ─────────────────────────────────────────────────────────────
    def build(self) -> ElectionResultReport:
        """Validates inputs, computes turnout, returns the complete report."""
        if self._election_id is None:
            raise ValueError(
                "Cannot build report: election not set. Call set_election() first."
            )
        if self._strategy_result is None:
            raise ValueError(
                "Cannot build report: strategy result not set. Call set_strategy_result() first."
            )

        turnout = (
            round(self._total_votes / self._eligible_voters * 100, 2)
            if self._eligible_voters > 0 else 0.0
        )

        report = ElectionResultReport(
            # ── Election metadata ──────────────────────────────────────────
            election_id=self._election_id,
            election_name=self._election_name,
            election_type=self._election_type,
            # ── Vote totals (Builder responsibility) ──────────────────────
            total_votes=self._total_votes,
            eligible_voters=self._eligible_voters,
            voter_turnout_percent=turnout,
            generated_at=datetime.now(timezone.utc).isoformat(),
            # ── Counting results (Strategy responsibility) ─────────────────
            method=self._strategy_result.get("method", ""),
            ranked_candidates=self._strategy_result.get("ranked_candidates", []),
            winner=self._strategy_result.get("winner"),
            requires_runoff=self._strategy_result.get("requires_runoff", False),
            runoff_candidates=self._strategy_result.get("runoff_candidates", []),
        )

        self._reset()   # ready for reuse
        return report
