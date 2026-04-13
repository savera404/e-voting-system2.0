"use client";
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Presentational Components (Component-Based Pattern)
//
// These components are PURE — they receive props and render UI.
// They contain NO business logic, NO API calls, NO state (except UI-local).
// This makes them: testable, reusable, and easy to reason about.
//
// Compare to Container components (pages) which own state and pass it down.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { COLORS, createPartyColor, type Candidate, type ElectionStatus, createStatusConfig } from "./../../lib/constants";

const { primary: G, primaryLight: GL, border: BORDER, bg: BG } = COLORS;

// ── 1. PageHero — Slot/Render-Props Pattern ───────────────────────────────────
// Accepts `children` for the bottom area: flexible without needing 10 props.
// Pattern: Compound layout via slots instead of prop-drilling every variation.
export function PageHero({
  eyebrow, title, subtitle, children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">{eyebrow}</p>
        <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
          {title}
        </h1>
        {subtitle && <p className="text-base text-white/70 max-w-xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

// ── 2. CandidateCard — Presentational Component ───────────────────────────────
// No state. Receives everything via props. Fires `onSelect` event upward.
// Pattern: Dumb component. The container (CandidatesPage) owns which card is selected.
export function CandidateCard({
  candidate, isSelected, onSelect,
}: {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: (id: number) => void;
}) {
  const color = createPartyColor(candidate.party); // Factory Pattern

  return (
    <button
      onClick={() => onSelect(candidate.id)}
      className="bg-white rounded-2xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md w-full"
      style={{
        borderColor: isSelected ? G : BORDER,
        boxShadow:   isSelected ? `0 0 0 3px rgba(26,71,49,.1)` : "0 1px 4px rgba(0,0,0,.04)",
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: color }}>
          {candidate.sym}
        </div>
        {candidate.inc && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: GL, color: G }}>
            INCUMBENT
          </span>
        )}
      </div>
      <p className="font-bold text-gray-900 text-[15px] mb-0.5">{candidate.name}</p>
      <p className="text-xs text-gray-400 mb-3">{candidate.cons}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
          {candidate.party}
        </span>
        <span className="text-sm font-bold" style={{ color: G }}>{candidate.pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: "#f0f4f1" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${candidate.pct}%`, background: color }} />
      </div>
    </button>
  );
}

// ── 3. CandidateDetailPanel — Presentational Component ───────────────────────
export function CandidateDetailPanel({
  candidate, onClose,
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const color = createPartyColor(candidate.party);
  return (
    <div className="bg-white rounded-2xl border p-7 sticky top-20 self-start shadow-lg" style={{ borderColor: BORDER }}>
      <div className="flex justify-between items-start mb-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: color }}>
          {candidate.sym}
        </div>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl transition-colors">×</button>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-0.5" style={{ fontFamily: "Georgia, serif" }}>{candidate.name}</h3>
      <p className="text-xs text-gray-400 mb-5">{candidate.cons}</p>
      <div className="divide-y" style={{ borderColor: "#f0f4f1" }}>
        {([["Party", candidate.party], ["Age", `${candidate.age} years`], ["Education", candidate.edu], ["Poll Standing", `${candidate.pct}%`], ["Incumbent", candidate.inc ? "Yes" : "No"]] as [string, string][]).map(([l, v]) => (
          <div key={l} className="flex justify-between py-2.5 text-sm">
            <span className="text-gray-400">{l}</span>
            <span className="font-semibold text-gray-900 text-right max-w-[60%]">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mt-5 mb-6">{candidate.bio}</p>
      <a href="/vote" className="block w-full text-center py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90" style={{ background: G }}>
        Vote for {candidate.name.split(" ")[0]} →
      </a>
    </div>
  );
}

// ── 4. FilterBar — Presentational Component ───────────────────────────────────
export function FilterBar({
  options, active, onSelect, searchValue, onSearchChange, searchPlaceholder,
}: {
  options: string[];
  active: string;
  onSelect: (v: string) => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 mb-7">
      {onSearchChange && (
        <div className="relative flex-1 min-w-[220px]">
          <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth={2} viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? "Search…"}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm focus:outline-none"
            style={{ borderColor: BORDER }}
          />
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="px-5 py-2 rounded-lg border text-xs font-semibold transition-all"
            style={{
              borderColor: active === opt ? G : BORDER,
              background:  active === opt ? G : "#fff",
              color:       active === opt ? "#fff" : "#6b7280",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 5. StatusBadge — Presentational Component ────────────────────────────────
export function StatusBadge({ status }: { status: ElectionStatus }) {
  const cfg = createStatusConfig(status); // Factory Pattern
  return (
    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.pulse && <span className="w-1 h-1 rounded-full animate-pulse inline-block" style={{ background: cfg.color }} />}
      {cfg.label}
    </span>
  );
}

// ── 6. StepBar — Presentational Component ─────────────────────────────────────
export function StepBar({ step, steps }: { step: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const idx  = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{ background: done || active ? G : "#e5ebe7", color: done || active ? "#fff" : "#9ca3af" }}>
                {done ? (
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : idx}
              </div>
              <span className="text-[10px] font-semibold mt-1 whitespace-nowrap" style={{ color: active ? G : "#9ca3af" }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-4 transition-all" style={{ background: step > idx ? G : "#e5ebe7" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 7. ReceiptCard — Presentational Component ─────────────────────────────────
// handleDownload opens a styled print window and triggers window.print(),
// which the browser saves as a PDF via its native "Save as PDF" destination.
// No external dependencies required — works in all modern browsers.
export function ReceiptCard({
  receiptId, election, date, time,
  voterName = "Ahmed Ali",
  cnic = "35202-1234567-8",
  constituency = "NA-123 · Islamabad",
}: {
  receiptId: string;
  election: string;
  date: string;
  time: string;
  voterName?: string;
  cnic?: string;
  constituency?: string;
}) {
  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vote Receipt – ${receiptId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=DM+Mono:wght@400;500&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'EB Garamond', Georgia, serif;
            background: #f7faf8;
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; padding: 40px 20px;
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
          .page {
            width: 520px; background: white;
            border-radius: 20px; overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.12);
          }
          .header {
            background: ${G}; padding: 36px 36px 32px;
            position: relative; overflow: hidden;
          }
          .header::before {
            content: ''; position: absolute; top: -60px; right: -60px;
            width: 200px; height: 200px; border-radius: 50%;
            background: rgba(255,255,255,0.06);
          }
          .header::after {
            content: ''; position: absolute; bottom: -40px; left: -40px;
            width: 140px; height: 140px; border-radius: 50%;
            background: rgba(255,255,255,0.04);
          }
          .header-inner { position: relative; z-index: 1; }
          .header-top { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
          .logo-ring {
            width: 44px; height: 44px; border-radius: 50%;
            background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.25);
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .logo-ring svg { display: block; }
          .brand { color: white; }
          .brand-name { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
          .brand-name span { opacity: 0.6; }
          .brand-sub { font-size: 10px; opacity: 0.45; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 1px; font-family: sans-serif; }
          .success-icon {
            width: 56px; height: 56px; border-radius: 50%;
            background: rgba(16,185,129,0.2); border: 1.5px solid rgba(16,185,129,0.4);
            display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
          }
          .success-icon svg { display: block; }
          .header-title { font-size: 26px; font-weight: 700; color: white; margin-bottom: 5px; }
          .header-sub { font-size: 12px; color: rgba(255,255,255,0.55); font-family: sans-serif; font-weight: 400; }
          .body { padding: 28px 36px; }
          .section-label {
            font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
            text-transform: uppercase; color: #9ca3af;
            font-family: sans-serif; margin-bottom: 12px;
          }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .info-cell {
            background: #f7faf8; border: 1px solid ${BORDER};
            border-radius: 12px; padding: 12px 14px;
          }
          .info-cell-label {
            font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
            text-transform: uppercase; color: #9ca3af;
            font-family: sans-serif; margin-bottom: 4px;
          }
          .info-cell-value { font-size: 13px; font-weight: 600; color: #111827; }
          .info-cell.full { grid-column: 1 / -1; }
          .divider { height: 1px; background: ${BORDER}; margin: 20px 0; }
          .receipt-block {
            background: ${GL}; border: 1.5px solid #c9ddd2;
            border-radius: 14px; padding: 18px 20px; margin-bottom: 20px;
          }
          .receipt-id {
            font-family: 'DM Mono', 'Courier New', monospace;
            font-size: 15px; font-weight: 600; color: ${G};
            letter-spacing: 0.08em; word-break: break-all; margin-top: 4px;
          }
          .status-bar {
            display: flex; align-items: center; gap: 10px;
            background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.22);
            border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;
          }
          .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; flex-shrink: 0; }
          .status-text { font-size: 12px; color: #065f46; font-family: sans-serif; font-weight: 600; }
          .footer { border-top: 1px solid ${BORDER}; padding: 18px 36px 24px; text-align: center; }
          .footer-text { font-size: 10px; color: #9ca3af; font-family: sans-serif; line-height: 1.6; }
          .footer-url { color: ${G}; font-weight: 600; }
          .watermark {
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px; font-weight: 900;
            color: rgba(26,71,49,0.03); pointer-events: none;
            white-space: nowrap; font-family: Georgia, serif;
          }
          @media print {
            body { background: white; padding: 0; }
            .page { box-shadow: none; border-radius: 0; width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">PAKVOTE</div>
        <div class="page">
          <div class="header">
            <div class="header-inner">
              <div class="header-top">
                <div class="logo-ring">
                  <svg width="20" height="20" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <div class="brand">
                  <div class="brand-name">Pak<span>Vote</span></div>
                  <div class="brand-sub">Election Commission of Pakistan</div>
                </div>
              </div>
              <div class="success-icon">
                <svg width="28" height="28" fill="none" stroke="#10b981" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div class="header-title">Vote Cast Successfully</div>
              <div class="header-sub">Your vote has been recorded on the ECP blockchain</div>
            </div>
          </div>
          <div class="body">
            <div class="section-label">Voter Information</div>
            <div class="info-grid">
              <div class="info-cell full">
                <div class="info-cell-label">Full Name</div>
                <div class="info-cell-value">${voterName}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">CNIC</div>
                <div class="info-cell-value">${cnic}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">Constituency</div>
                <div class="info-cell-value">${constituency}</div>
              </div>
            </div>
            <div class="section-label">Election Details</div>
            <div class="info-grid">
              <div class="info-cell full">
                <div class="info-cell-label">Election</div>
                <div class="info-cell-value">${election}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">Date</div>
                <div class="info-cell-value">${date}</div>
              </div>
              <div class="info-cell">
                <div class="info-cell-label">Time</div>
                <div class="info-cell-value">${time}</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="section-label">Cryptographic Receipt</div>
            <div class="receipt-block">
              <div class="info-cell-label">Reference ID</div>
              <div class="receipt-id">${receiptId}</div>
            </div>
            <div class="status-bar">
              <div class="status-dot"></div>
              <div class="status-text">Vote verified and recorded · NADRA Authenticated</div>
            </div>
          </div>
          <div class="footer">
            <div class="footer-text">
              This receipt confirms your vote was securely cast.<br/>
              Verify anytime at <span class="footer-url">pakvote.gov.pk/verify</span> using your Reference ID.<br/>
              Issued by Election Commission of Pakistan · ${new Date().getFullYear()}
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }, 400);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-2xl border p-8 shadow-md" style={{ borderColor: BORDER }}>
      <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: GL, border: `2px solid ${G}` }}>
        <svg width="26" height="26" fill="none" stroke={G} strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-center text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>Vote Cast Successfully!</h2>
      <p className="text-center text-sm text-gray-500 mb-7">Thank you for exercising your democratic right.</p>
      {([["Election", election], ["Date", date], ["Time", time]] as [string, string][]).map(([l, v]) => (
        <div key={l} className="flex justify-between py-3 border-b border-gray-100 text-sm">
          <span className="text-gray-400">{l}</span>
          <span className="font-semibold text-gray-900">{v}</span>
        </div>
      ))}
      <div className="mt-5 rounded-xl p-4" style={{ background: GL }}>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Reference ID</p>
        <p className="font-mono text-base font-bold tracking-widest" style={{ color: G }}>{receiptId}</p>
      </div>
      <button
        onClick={handleDownload}
        className="w-full mt-5 flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
        style={{ background: G }}
      >
        <svg width="16" height="16" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Receipt (PDF)
      </button>
    </div>
  );
}

// ── 8. Compound Accordion — Compound Component Pattern ───────────────────────
// Parent manages openId. Children access behaviour via props passed explicitly.
// Compound pattern: multiple sub-components work together with shared context.
import { useState as useLocalState } from "react";

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
  id: string;
  label: string;
  badge?: string;
  children: React.ReactNode;
  openId?: string | null;
  toggle?: (id: string) => void;
};

export function AccordionItem({ id, label, badge, children, openId, toggle }: AccordionItemProps) {
  const open = openId === id;
  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm transition-all" style={{ borderColor: open ? G : BORDER, borderWidth: open ? 2 : 1 }}>
      <button onClick={() => toggle?.(id)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-start gap-3 flex-1">
          {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: GL, color: G }}>{badge}</span>}
          <span className="font-semibold text-gray-900 text-sm leading-snug">{label}</span>
        </div>
        <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth={2.5} viewBox="0 0 24 24" className={`flex-shrink-0 ml-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
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