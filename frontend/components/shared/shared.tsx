"use client";
import React from "react";
import { COLORS, createPartyColor, type Candidate, type ElectionStatus, createStatusConfig } from "./../../lib/constants";
import { useState as useLocalState } from "react";

const { primary: G, primaryLight: GL, border: BORDER, bg: BG } = COLORS;

// ── PageHero ──────────────────────────────────────────────────────────────────
export function PageHero({ eyebrow, title, subtitle, children }: {
  eyebrow: string; title: React.ReactNode; subtitle?: string; children?: React.ReactNode;
}) {
  return (
    <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">{eyebrow}</p>
        <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>{title}</h1>
        {subtitle && <p className="text-base text-white/70 max-w-xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

// ── CandidateCard ─────────────────────────────────────────────────────────────
export function CandidateCard({ candidate, isSelected, onSelect }: {
  candidate: Candidate; isSelected: boolean; onSelect: (id: number) => void;
}) {
  const color = createPartyColor(candidate.party);
  return (
    <button onClick={() => onSelect(candidate.id)} className="bg-white rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md w-full"
      style={{ borderColor: isSelected ? G : BORDER, boxShadow: isSelected ? "0 0 0 3px rgba(26,71,49,.1)" : "0 1px 4px rgba(0,0,0,.04)", borderWidth: isSelected ? 2 : 1 }}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: color }}>{candidate.sym}</div>
        {candidate.inc && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: GL, color: G }}>INCUMBENT</span>}
      </div>
      <p className="font-bold text-gray-900 text-[15px] mb-0.5">{candidate.name}</p>
      <p className="text-xs text-gray-400 mb-3">{candidate.cons}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: color + "18", color }}>{candidate.party}</span>
        <span className="text-sm font-bold" style={{ color: G }}>{candidate.pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#f0f4f1" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: candidate.pct + "%", background: color }} />
      </div>
    </button>
  );
}

// ── CandidateDetailPanel ──────────────────────────────────────────────────────
export function CandidateDetailPanel({ candidate, onClose }: { candidate: Candidate; onClose: () => void; }) {
  const color = createPartyColor(candidate.party);
  return (
    <div className="bg-white rounded-2xl border p-7 sticky top-20 self-start shadow-lg" style={{ borderColor: BORDER }}>
      <div className="flex justify-between items-start mb-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: color }}>{candidate.sym}</div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl transition-colors">&times;</button>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-0.5" style={{ fontFamily: "Georgia, serif" }}>{candidate.name}</h3>
      <p className="text-xs text-gray-400 mb-5">{candidate.cons}</p>
      <div className="divide-y" style={{ borderColor: "#f0f4f1" }}>
        {([ ["Party", candidate.party], ["Age", candidate.age + " years"], ["Education", candidate.edu], ["Poll Standing", candidate.pct + "%"], ["Incumbent", candidate.inc ? "Yes" : "No"] ] as [string, string][]).map(([l, v]) => (
          <div key={l} className="flex justify-between py-2.5 text-sm">
            <span className="text-gray-400">{l}</span>
            <span className="font-semibold text-gray-900 text-right max-w-[60%]">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mt-5 mb-6">{candidate.bio}</p>
      <a href="/vote" className="block w-full text-center py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90" style={{ background: G }}>
        Vote for {candidate.name.split(" ")[0]} &rarr;
      </a>
    </div>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────
export function FilterBar({ options, active, onSelect, searchValue, onSearchChange, searchPlaceholder }: {
  options: string[]; active: string; onSelect: (v: string) => void;
  searchValue?: string; onSearchChange?: (v: string) => void; searchPlaceholder?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-7">
      {onSearchChange && (
        <div className="relative flex-1 min-w-[220px]">
          <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
          <input value={searchValue} onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? "Search..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none" style={{ borderColor: BORDER }} />
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button key={opt} onClick={() => onSelect(opt)} className="px-5 py-2 rounded-lg border text-xs font-semibold transition-all"
            style={{ borderColor: active === opt ? G : BORDER, background: active === opt ? G : "#fff", color: active === opt ? "#fff" : "#6b7280" }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: ElectionStatus }) {
  const cfg = createStatusConfig(status);
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.pulse && <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ background: cfg.color }} />}
      {cfg.label}
    </span>
  );
}

// ── StepBar ───────────────────────────────────────────────────────────────────
export function StepBar({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const idx = i + 1; const done = step > idx; const active = step === idx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{ background: done || active ? G : "#e5ebe7", color: done || active ? "#fff" : "#9ca3af" }}>
                {done
                  ? (<svg width="14" height="14" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>)
                  : idx}
              </div>
              <span className="text-[10px] font-semibold mt-1 whitespace-nowrap" style={{ color: active ? G : "#9ca3af" }}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 mx-2 mb-4 transition-all" style={{ background: step > idx ? G : "#e5ebe7" }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── ReceiptCard ───────────────────────────────────────────────────────────────
// Displays the vote confirmation screen with the real receipt_code from the DB.
// Download/print removed intentionally.
export function ReceiptCard({ receiptId, election, date, time }: {
  receiptId: string; election: string; date: string; time: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-8 shadow-md" style={{ borderColor: BORDER }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: GL, border: "2px solid " + G }}>
        <svg width="26" height="26" fill="none" stroke={G} strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>
        Vote Cast Successfully!
      </h2>
      <p className="text-center text-sm text-gray-500 mb-7">Thank you for exercising your democratic right.</p>
      {([ ["Election", election], ["Date", date], ["Time", time] ] as [string, string][]).map(([l, v]) => (
        <div key={l} className="flex justify-between py-3 border-b border-gray-100 text-sm">
          <span className="text-gray-400">{l}</span>
          <span className="font-semibold text-gray-900">{v}</span>
        </div>
      ))}
      <div className="mt-5 rounded-xl p-4" style={{ background: GL }}>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Reference ID</p>
        <p className="font-mono text-base font-bold tracking-widest" style={{ color: G }}>{receiptId}</p>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">
        Save this ID &mdash; verify your vote anytime on the{" "}
        <a href="/verify-vote" className="underline font-semibold" style={{ color: G }}>Verify Vote</a> page.
      </p>
    </div>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
export function Accordion({ children }: { children: React.ReactNode }) {
  const [openId, setOpenId] = useLocalState<string | null>(null);
  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));
  return (
    <div className="flex flex-col gap-3">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<AccordionItemProps>, { openId, toggle })
          : child
      )}
    </div>
  );
}

type AccordionItemProps = {
  id: string; label: string; badge?: string; children: React.ReactNode;
  openId?: string | null; toggle?: (id: string) => void;
};

export function AccordionItem({ id, label, badge, children, openId, toggle }: AccordionItemProps) {
  const open = openId === id;
  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all"
      style={{ borderColor: open ? G : BORDER, borderWidth: open ? 2 : 1 }}>
      <button onClick={() => toggle?.(id)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-start gap-3 flex-1">
          {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: GL, color: G }}>{badge}</span>}
          <span className="font-semibold text-gray-900 text-sm leading-snug">{label}</span>
        </div>
        <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth={2.5} viewBox="0 0 24 24"
          className={"flex-shrink-0 ml-3 transition-transform duration-200" + (open ? " rotate-180" : "")}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: BORDER, background: BG }}>
          <p className="text-sm text-gray-600 leading-relaxed mb-5 mt-2">{children}</p>
        </div>
      )}
    </div>
  );
}
