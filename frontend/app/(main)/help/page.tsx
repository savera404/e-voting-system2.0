"use client";
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERNS USED IN THIS FILE:
//
// ✅ 1. COMPOUND COMPONENT PATTERN
//    - <Accordion> parent manages openId state
//    - <AccordionItem> children receive openId + toggle via React.cloneElement
//    - They cooperate without prop-drilling through intermediate components
//
// ✅ 2. OBSERVER PATTERN (via useFaqFilter hook)
//    - All filter logic lives in hook; page observes and re-renders on change
//
// ✅ 3. CONTAINER / PRESENTATIONAL PATTERN
//    - This page is the container (calls hooks, passes data)
//    - Accordion, AccordionItem, PageHero, FilterBar are presentational
// ─────────────────────────────────────────────────────────────────────────────

import { COLORS, FAQ_CATEGORIES } from "../../../lib/constants";
import { useFaqFilter } from "../../../hooks/Usefaqfilter";
import { PageHero, FilterBar, Accordion, AccordionItem } from "../../../components/shared/shared";

const { primary: G, primaryLight: GL, border: BORDER, bg: BG } = COLORS;

export default function HelpPage() {
  // Observer Pattern: hook encapsulates all FAQ filter state
  const { cat, setCat, search, setSearch, filtered } = useFaqFilter();

  return (
    <>
      {/* PageHero with children slot — Slot Pattern */}
      <PageHero
        eyebrow="Support Centre"
        title="Help & FAQs"
        subtitle="Find answers to common questions about voting, registration, security, and more."
      >
        {/* Hero search in slot */}
        <div className="relative max-w-md mt-7 flex">
          <svg width="18" height="18" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2} viewBox="0 0 24 24" className="absolute mt-3 ml-3 top-1/2 -translate-y-1/2 pointer-events-none ">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search FAQs…"
            className="w-full gap-2 px-6 py-2 mt-5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none"
          />
        </div>
      </PageHero>

      <div className="px-4 lg:px-8 py-10" style={{ background: BG, minHeight: "70vh" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 items-start">

          {/* Sidebar */}
          <div className="bg-white rounded-2xl border p-4 shadow-sm sticky top-20" style={{ borderColor: BORDER }}>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3 px-2">Categories</p>
            {FAQ_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all mb-0.5"
                style={{ background: cat === c ? GL : "none", color: cat === c ? G : "#6b7280" }}
              >
                {c}
              </button>
            ))}
            <div className="mt-5 pt-5 border-t" style={{ borderColor: BORDER }}>
              <a href="/contact" className="flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-3 rounded-xl w-full hover:opacity-90" style={{ background: G, color: "#fff" }}>
                Contact Support
              </a>
            </div>
          </div>

          {/* ── COMPOUND COMPONENT PATTERN ─────────────────────────────────── */}
          {/* <Accordion> owns openId. Each <AccordionItem> gets toggle injected  */}
          {/* via React.cloneElement — they cooperate without a context or refs. */}
          <div>
            <p className="text-sm text-gray-400 mb-4">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            <Accordion>
              {filtered.map((f) => (
                <AccordionItem key={f.id} id={String(f.id)} label={f.q} badge={f.cat}>
                  {f.a}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}