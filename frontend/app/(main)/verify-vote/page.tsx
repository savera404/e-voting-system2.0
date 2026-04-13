"use client";

import { useState } from "react";

const G = "#1a4731";
const GL = "#f0f7f3";
const BORDER = "#e5ebe7";
const BG = "#f7faf8";

type State = "idle" | "loading" | "verified" | "failed";

export default function VerifyVotePage() {
  const [receipt, setReceipt] = useState("");
  const [state,   setState]   = useState<State>("idle");

  const handleVerify = () => {
    if (!receipt.trim()) return;
    setState("loading");
    setTimeout(() => setState(receipt.toLowerCase().includes("8f7d") ? "verified" : "failed"), 1800);
  };

  return (
    <>
      {/* Hero */}
      <section style={{ background: G }} className="px-4 lg:px-8 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase text-white/50 mb-3">My Account</p>
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Verify My Vote
          </h1>
          <p className="text-base text-white/70 max-w-xl">
            Enter your cryptographic receipt ID to confirm your vote was counted and recorded correctly on the ECP ledger.
          </p>
        </div>
      </section>

      <div className="px-4 lg:px-8 py-12" style={{ background: BG, minHeight: "70vh" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — form + result */}
          <div>
            <div className="bg-white rounded-2xl border p-8 shadow-sm mb-5" style={{ borderColor: BORDER }}>
              <h2 className="font-bold text-xl text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>
                Enter Receipt ID
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Your receipt was issued after your vote was cast. Format: XXXX-XXXX-XXXX-XXXX
              </p>

              <label className="block text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
                Cryptographic Receipt ID
              </label>
              <input
                value={receipt}
                onChange={(e) => { setReceipt(e.target.value); setState("idle"); }}
                placeholder="e.g. 8F7d-22a1-99c0-x772"
                className="w-full px-4 py-3.5 rounded-xl border text-sm focus:outline-none mb-4 font-mono bg-gray-50"
                style={{ borderColor: BORDER, letterSpacing: "0.06em" }}
              />

              <button
                onClick={handleVerify}
                disabled={state === "loading"}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: G }}
              >
                {state === "loading" ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0" />
                    </svg>
                    Verifying on ECP Ledger…
                  </>
                ) : (
                  "Verify Vote →"
                )}
              </button>
            </div>

            {/* Result: Verified */}
            {state === "verified" && (
              <div className="bg-white rounded-2xl border-2 p-7 shadow-md" style={{ borderColor: G }}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GL, border: `2px solid ${G}` }}>
                    <svg width="26" height="26" fill="none" stroke={G} strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: "Georgia, serif" }}>Vote Verified ✓</h3>
                    <p className="text-sm text-gray-500">Your vote has been confirmed.</p>
                  </div>
                </div>
                {[
                  ["Receipt ID",    receipt],
                  ["Election",      "General Election 2026 — NA-123"],
                  ["Recorded At",   "Feb 08, 2026 · 09:42 AM PKT"],
                  ["Vote Status",   "Counted & Verified"],
                  ["Ledger Hash",   "0x3f8a…c92d"],
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between py-2.5 border-b text-sm last:border-0" style={{ borderColor: BORDER }}>
                    <span className="text-gray-400">{l}</span>
                    <span className="font-semibold text-gray-900 font-mono text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Result: Failed */}
            {state === "failed" && (
              <div className="bg-white rounded-2xl border-2 p-7" style={{ borderColor: "#ef4444" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#fef2f2", border: "2px solid #ef4444" }}>
                    <svg width="26" height="26" fill="none" stroke="#ef4444" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1" style={{ fontFamily: "Georgia, serif" }}>Receipt Not Found</h3>
                    <p className="text-sm text-gray-500">This receipt ID could not be found in the ECP ledger. Please check and try again.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — how it works */}
 <div className="flex flex-col gap-5">
  <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: GL }}>
      <svg width="20" height="20" fill="none" stroke={G} strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2">How Verification Works</p>
    <h3 className="font-bold text-xl text-gray-900 mb-3" style={{ fontFamily: "Georgia, serif" }}>
      End-to-End Encrypted Verification
    </h3>
    <p className="text-sm text-gray-500 leading-relaxed mb-5">
      Every vote cast on PakVote is assigned a unique cryptographic receipt ID and stored in a tamper-proof encrypted ledger. You can verify your vote was counted without revealing your identity.
    </p>
    {[
      ["01", "Vote is cast and encrypted end-to-end using AES-256"],
      ["02", "A unique receipt ID is generated and tied to your encrypted record"],
      ["03", "The encrypted record is committed to the secure ECP database"],
      ["04", "You can verify at any time using your receipt ID"],
    ].map(([n, t]) => (
      <div key={n} className="flex gap-3 mb-3 last:mb-0">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
          style={{ background: GL, color: G }}
        >
          {n}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{t}</p>
      </div>
    ))}
  </div>

  {/* FAQ */}
  <div className="bg-white rounded-2xl border p-7 shadow-sm" style={{ borderColor: BORDER }}>
    <h3 className="font-bold text-base text-gray-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>
      Common Questions
    </h3>
    {[
      { q: "Where do I find my receipt ID?",            a: "Your receipt ID was shown on screen immediately after voting. If you downloaded it, check your downloads folder." },
      { q: "Does verification reveal who I voted for?", a: "No. The verification system only confirms your vote was counted. It never reveals your candidate selection." },
      { q: "What if my vote is not found?",             a: "Contact ECP support at 0800-PAKVOTE. Keep your receipt ID handy." },
    ].map(({ q, a }) => (
      <div key={q} className="mb-4 last:mb-0 pb-4 border-b last:border-0 last:pb-0" style={{ borderColor: BORDER }}>
        <p className="text-sm font-semibold text-gray-900 mb-1">{q}</p>
        <p className="text-xs text-gray-400 leading-relaxed">{a}</p>
      </div>
    ))}
  </div>
</div>
        </div>
      </div>
    </>
  );
}