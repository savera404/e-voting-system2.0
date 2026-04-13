// ─────────────────────────────────────────────────────────────────────────────
// DESIGN PATTERN: Observer Pattern via Custom Hook
// Hook: useProfileEdit
// Used in: MyProfilePage.tsx
// Purpose: Manages profile edit mode toggle and editable field state
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export function useProfileEdit() {
  const [editing, setEditing] = useState(false);
  const [name,    setName]    = useState("Ahmed Ali");
  const [email,   setEmail]   = useState("ahmed.ali@email.com");
  const [phone,   setPhone]   = useState("+92 300 1234567");

  // Toggle between view and edit mode
  const toggle = () => setEditing((prev) => !prev);

  // Save changes — sets editing to false
  const save = () => setEditing(false);

  // Discard changes — reset to original values and exit edit mode
  const discard = () => {
    setName("Ahmed Ali");
    setEmail("ahmed.ali@email.com");
    setPhone("+92 300 1234567");
    setEditing(false);
  };

  return {
    editing,
    toggle,
    save,
    discard,
    name,    setName,
    email,   setEmail,
    phone,   setPhone,
  };
}