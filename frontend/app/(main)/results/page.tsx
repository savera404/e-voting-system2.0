"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Results page is restricted to admin only.
// Voters who land here are redirected away.
export default function ResultsPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is an admin (stored during login)
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.replace("/");
    }
  }, [router]);

  return null; // Admin dashboard will handle rendering
}

