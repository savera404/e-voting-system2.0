// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Observer Pattern via Custom Hook
// Hook: useCandidateFilter
// Used in: CandidatesPage.tsx
// Purpose: Encapsulates all candidate search & filter logic
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { CANDIDATES, type Candidate } from "../lib/constants";

export function useCandidateFilter() {
  const [search, setSearch] = useState("");
  const [party,  setParty]  = useState("All");

  // Derived state — computed from single source of truth
  const filtered = useMemo<Candidate[]>(
    () =>
      CANDIDATES.filter(
        (c) =>
          (party === "All" || c.party === party) &&
          (c.name.toLowerCase().includes(search.toLowerCase()) ||
           c.party.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, party]
  );

  return { search, setSearch, party, setParty, filtered };
}