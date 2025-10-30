// src/hooks/useAuth.js
"use client";

import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();

  // ✅ Refresh session to get updated user data
  const updateSession = useCallback(async () => {
    try {
      const updated = await update();
      return updated;
    } catch (error) {
      console.error("Error updating session:", error);
      return null;
    }
  }, [update]);

  return {
    user: session?.user || null,
    isAuthenticated: !!session?.user,
    loading: status === "loading",
    updateSession,
  };
}