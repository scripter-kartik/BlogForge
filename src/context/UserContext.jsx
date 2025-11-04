// src/context/UserContext.jsx - FIXED VERSION
"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, update: updateSession, status } = useSession();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Sync user when session changes
  useEffect(() => {
    if (session?.user) {
      console.log("🔄 User Context: Session updated", session.user);
      setUser({
        ...session.user,
        // Force a timestamp to trigger re-renders
        _timestamp: Date.now(),
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [session?.user, session?.user?.image, session?.user?.name, session?.user?.email]);

  // ✅ IMPROVED: Force refresh user data from database
  const refreshUser = useCallback(async () => {
    console.log("🔄 Refreshing user data globally...");
    try {
      // First, trigger NextAuth session refresh to get latest from JWT
      console.log("🔄 Updating NextAuth session...");
      const sessionUpdate = await updateSession();
      console.log("📥 Session updated:", sessionUpdate?.user);

      // Then fetch fresh data from the database
      const response = await fetch('/api/user/home', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const freshUserData = await response.json();
        console.log("📥 Fresh user data from DB:", freshUserData);

        // Update the local state immediately
        setUser({
          ...freshUserData,
          _timestamp: Date.now(),
        });
        
        console.log("✅ User data refreshed successfully");
        return freshUserData;
      } else {
        console.error("❌ Failed to fetch fresh user data");
        // Use session data as fallback
        if (sessionUpdate?.user) {
          setUser({
            ...sessionUpdate.user,
            _timestamp: Date.now(),
          });
          return sessionUpdate.user;
        }
        return null;
      }
    } catch (error) {
      console.error("❌ Error refreshing user:", error);
      return null;
    }
  }, [updateSession]);

  // ✅ Function to manually update user data (for immediate feedback)
  const updateUser = useCallback((newUserData) => {
    console.log("🔄 Manually updating user data:", newUserData);
    setUser((prev) => ({
      ...prev,
      ...newUserData,
      _timestamp: Date.now(), // Force re-render
    }));
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        refreshUser,
        updateUser,
        loading: status === "loading",
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};