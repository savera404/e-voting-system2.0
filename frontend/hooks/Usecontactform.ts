// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Observer Pattern via Custom Hook
// Hook: useContactForm
// Used in: ContactPage.tsx
// Purpose: Manages support ticket form state, validation, submission,
//          and success/reset flow
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export type TicketStatus = "idle" | "sending" | "sent";

export function useContactForm() {
  const [topic,   setTopic]   = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState<TicketStatus>("idle");

  // Derived validation — true only when all fields are filled
  const isValid = !!topic && !!subject && !!message;

  const submit = () => {
    if (!isValid) return;
    setStatus("sending");
    // Simulate API call — replace with real fetch() in production
    setTimeout(() => setStatus("sent"), 2000);
  };

  // Reset form back to initial state
  const reset = () => {
    setStatus("idle");
    setTopic("");
    setSubject("");
    setMessage("");
  };

  return {
    topic,   setTopic,
    subject, setSubject,
    message, setMessage,
    status,
    isValid,
    submit,
    reset,
  };
}