"use client";

import Navbar from "@/components/Navbar.jsx";
import Home from "@/components/Home.jsx";
import HomePost from "@/components/HomePost.jsx";
import Login from "@/components/LoginForm.jsx";
import Signup from "@/components/SignupForm.jsx";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const { loading } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setIsDarkMode(saved === "true");
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode, isInitialized]);

  if (!isInitialized || loading) return null;

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"}`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
        onSearchResults={setSearchResults}
      />

      {!searchResults && (
        <Home
          isDarkMode={isDarkMode}
          setIsLoginActive={setIsLoginActive}
          setIsSignupActive={setIsSignupActive}
        />
      )}

      <HomePost isDarkMode={isDarkMode} searchResults={searchResults} />

      {isLoginActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Login
            setIsLoginActive={setIsLoginActive}
            isDarkMode={isDarkMode}
            setIsSignupActive={setIsSignupActive}
          />
        </div>
      )}

      {isSignupActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Signup
            setIsSignupActive={setIsSignupActive}
            isDarkMode={isDarkMode}
            setIsLoginActive={setIsLoginActive}
          />
        </div>
      )}
    </div>
  );
}
