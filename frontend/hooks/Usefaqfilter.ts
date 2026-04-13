// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Observer Pattern via Custom Hook
// Hook: useFaqFilter
// Used in: HelpPage.tsx
// Purpose: Encapsulates FAQ category filtering, search, and accordion state
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { FAQS, type FAQ } from "../lib/constants";

export function useFaqFilter() {
  const [cat,    setCat]    = useState("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  // Derived state — filtered list recomputed only when cat or search changes
  const filtered = useMemo<FAQ[]>(
    () =>
      FAQS.filter(
        (f) =>
          (cat === "All" || f.cat === cat) &&
          (f.q.toLowerCase().includes(search.toLowerCase()) ||
           f.a.toLowerCase().includes(search.toLowerCase()))
      ),
    [cat, search]
  );

  // Toggle accordion item open/close
  const toggle = (id: number) =>
    setOpenId((prev) => (prev === id ? null : id));

  return { cat, setCat, search, setSearch, openId, toggle, filtered };
}