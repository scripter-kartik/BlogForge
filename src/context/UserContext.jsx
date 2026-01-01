"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, update: updateSession, status } = useSession();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (session?.user) {
      console.log("User Context: Session updated", session.user);
      setUser({
        ...session.user,
        _timestamp: Date.now(),
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [session?.user, session?.user?.image, session?.user?.name, session?.user?.email]);

  const refreshUser = useCallback(async () => {
    console.log("Refreshing user data globally...");
    try {
      console.log("Updating NextAuth session...");
      const sessionUpdate = await updateSession();
      console.log("Session updated:", sessionUpdate?.user);

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
        console.log("Fresh user data from DB:", freshUserData);

        setUser({
          ...freshUserData,
          _timestamp: Date.now(),
        });
        
        console.log("User data refreshed successfully");
        return freshUserData;
      } else {
        console.error("Failed to fetch fresh user data");
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
      console.error("Error refreshing user:", error);
      return null;
    }
  }, [updateSession]);

  const updateUser = useCallback((newUserData) => {
    console.log("🔄 Manually updating user data:", newUserData);
    setUser((prev) => ({
      ...prev,
      ...newUserData,
      _timestamp: Date.now(), 
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