// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Observer Pattern via Custom Hook
// Hook: useVerifyVote
// Used in: VerifyVotePage.tsx
// Purpose: Manages receipt input state and verification status
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export type VerifyState = "idle" | "loading" | "verified" | "failed";

export function useVerifyVote() {
  const [receipt, setReceipt] = useState("");
  const [state,   setState]   = useState<VerifyState>("idle");

  const verify = () => {
    if (!receipt.trim()) return;
    setState("loading");
    // Simulate blockchain ledger lookup — replace with real API call
    setTimeout(
      () => setState(receipt.toLowerCase().includes("8f7d") ? "verified" : "failed"),
      1800
    );
  };

  // Reset when user edits the input after a failed/verified attempt
  const handleReceiptChange = (value: string) => {
    setReceipt(value);
    setState("idle");
  };

  return {
    receipt,
    state,
    verify,
    handleReceiptChange,
  };
}