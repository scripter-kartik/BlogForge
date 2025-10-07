// src/hooks/useAuth.js - NEW CUSTOM HOOK FOR AUTH
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "authenticated" && session?.user) {
      setIsAuthenticated(true);
      setUser(session.user);
      setLoading(false);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  }, [session, status]);

  return {
    isAuthenticated,
    user,
    loading,
    session,
  };
}
