"use client";
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERNS USED IN THIS FILE:
//
// ✅ 1. OBSERVER PATTERN (via useContactForm hook)
//    - All form state + submit logic lives in the hook
//    - Component just observes values and binds them to UI
//
// ✅ 2. CONTAINER / PRESENTATIONAL PATTERN
//    - ContactPage = container (wires hook → UI)
//    - TicketSuccessCard = presentational (pure render)
//
// ✅ 3. SINGLE SOURCE OF TRUTH
//    - CONTACT_TOPICS from constants.ts
// ─────────────────────────────────────────────────────────────────────────────

import { COLORS, CONTACT_TOPICS } from "../../../lib/constants";
import { useContactForm } from "../../../hooks/Usecontactform";
import { PageHero } from "../../../components/shared/shared";

const { primary: G, primaryLight: GL, border: BORDER, bg: BG } = COLORS;

// ── Presentational: success state ─────────────────────────────────────────────
function TicketSuccessCard({ ticketRef, onReset }: { ticketRef: string; onReset: () => void }) {
  return (
    <div className="bg-white rounded-2xl border-2 px-10 py-5  shadow-md text-center" style={{ borderColor: G }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: GL, border: `2px solid ${G}` }}>
        <svg width="30" height="30" fill="none" stroke={G} strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-bold text-2xl text-gray-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>Ticket Submitted!</h2>
      <p className="text-sm text-gray-500 mb-6">Your support ticket has been received. A reference number has been sent to your registered email.</p>
      <div className="rounded-xl p-4 mb-6" style={{ background: GL }}>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Ticket Reference</p>
        <p className="font-mono font-bold tracking-widest text-lg" style={{ color: G }}>{ticketRef}</p>
      </div>
      <button onClick={onReset} className="mt-2 px-6 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50" style={{ borderColor: BORDER, color: "#6b7280" }}>
        Submit Another Ticket
      </button>
    </div>
  );
}

export default function ContactPage() {
  // Observer Pattern: all logic in hook
  const { topic, setTopic, subject, setSubject, message, setMessage, status, isValid, submit, reset } = useContactForm();

  const ticketRef = `TKT-2026-${Math.floor(Math.random() * 90000 + 10000)}`;

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Contact & Support"
        subtitle="Our support team is available 24/7 to assist with voting, registration, and technical issues."
      />

      <div className="px-4 lg:px-8 py-10" style={{ background: BG, minHeight: "70vh" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — form or success */}
          <div>
            {status === "sent" ? (
              <TicketSuccessCard ticketRef={ticketRef} onReset={reset} />
            ) : (
              <div className="bg-white rounded-2xl border p-8 shadow-sm" style={{ borderColor: BORDER }}>
                <h2 className="font-bold text-xl text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>Submit a Support Ticket</h2>

                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Topic</label>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {CONTACT_TOPICS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className="px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all"
                      style={{ borderColor: topic === t ? G : BORDER, background: topic === t ? GL : "#fff", color: topic === t ? G : "#6b7280" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue…"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none mb-4 bg-gray-50"
                  style={{ borderColor: BORDER }}
                />

                <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Describe your issue in detail…"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none mb-5 bg-gray-50 resize-none"
                  style={{ borderColor: BORDER }}
                />

                <button
                  onClick={submit}
                  disabled={!isValid || status === "sending"}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: isValid ? G : "#d1d5db" }}
                >
                  {status === "sending" ? "Submitting…" : "Submit Ticket →"}
                </button>
              </div>
            )}
          </div>

          {/* Right — channels */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
              <h3 className="font-bold text-lg text-gray-900 mb-5" style={{ fontFamily: "Georgia, serif" }}>Other Ways to Reach Us</h3>
              {[
                { icon: "📞", title: "Helpline",      value: "0800-PAKVOTE",              note: "Free · 24/7 · Mon–Sun"  },
                { icon: "📧", title: "Email",          value: "support@pakvote.gov.pk",    note: "Response in 2–4 hours"  },

                { icon: "🏢", title: "ECP Office",      value: "Constitution Ave, Islamabad", note: "Mon–Fri, 9AM–5PM"   },
              ].map((ch) => (
                <div key={ch.title} className="flex items-center gap-4 p-4 rounded-xl border mb-2 last:mb-0" style={{ borderColor: BORDER, background: BG }}>
                  <span className="text-2xl">{ch.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-0.5">{ch.title}</p>
                    <p className="text-sm font-semibold text-gray-900">{ch.value}</p>
                    <p className="text-xs text-gray-400">{ch.note}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-6 py-4 text-white" style={{ background: G }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse inline-block" />
                <span className="text-sm font-bold">All Systems Operational</span>
              </div>
              <p className="text-sm text-white/65 mb-4">PakVote platform is running normally.</p>
              {[["Voting Portal","Operational"],["NADRA Verification","Operational"],["SMS OTP","Operational"],["Results Portal","Operational"]].map(([s,v])=>(
                <div key={s} className="flex justify-between py-2 border-b border-white/10 text-xs last:border-0">
                  <span className="text-white/60">{s}</span>
                  <span className="font-semibold text-green-400">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}