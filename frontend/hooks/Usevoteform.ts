// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Observer Pattern + Strategy Pattern via Custom Hook
// Hook: useVoteForm
// Used in: VotePage.tsx
// Purpose: Manages all vote wizard state — step navigation, CNIC formatting,
//          candidate selection, and form validation
//
// Strategy Pattern connection:
//   The `step` value acts as the strategy selector in VotePage.
//   This hook controls WHICH strategy (step component) gets rendered.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export type VoteStep = 1 | 2 | 3 | 4;

export function useVoteForm() {
  const [step, setStep] = useState<VoteStep>(1);
  const [cnic, setCnicRaw] = useState("");
  const [dob,  setDob]     = useState("");
  const [sel,  setSel]     = useState<number | null>(null);

  // CNIC auto-formatter: 35202-1234567-8
  const formatCnic = (v: string): string => {
    const d = v.replace(/\D/g, "").slice(0, 13);
    if (d.length > 10) return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
    if (d.length > 5)  return `${d.slice(0, 5)}-${d.slice(5)}`;
    return d;
  };

  const setCnic = (v: string) => setCnicRaw(formatCnic(v));

  // Validation flags
  const canVerify  = cnic.replace(/\D/g, "").length >= 13 && !!dob;
  const canConfirm = sel !== null;

  // Navigation
  const goNext = () => setStep((s) => Math.min(s + 1, 4) as VoteStep);
  const goBack = () => setStep((s) => Math.max(s - 1, 1) as VoteStep);

  // Full reset — used on "Return to Home" in step 4
  const reset = () => {
    setStep(1);
    setSel(null);
    setCnicRaw("");
    setDob("");
  };

  return {
    step,
    cnic,
    dob,
    sel,
    setCnic,
    setDob,
    setSel,
    canVerify,
    canConfirm,
    goNext,
    goBack,
    reset,
  };
}