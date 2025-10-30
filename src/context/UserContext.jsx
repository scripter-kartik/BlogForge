// src/context/UserContext.jsx
"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Sync user when session changes
  useEffect(() => {
    if (session?.user) {
      console.log("🔄 User Context: Session updated", session.user);
      setUser(session.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [session?.user]);

  // ✅ Function to refresh user data everywhere
  const refreshUser = useCallback(async () => {
    console.log("🔄 Refreshing user data globally...");
    try {
      const updated = await updateSession();
      console.log("✅ User data refreshed", updated?.user);
      // This will trigger the useEffect above
      return updated?.user;
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
    }));
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        refreshUser,
        updateUser,
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