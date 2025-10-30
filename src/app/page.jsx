// src/app/page.jsx - UPDATED MAIN PAGE
"use client";

import Navbar from "@/components/Navbar.jsx";
import Home from "@/components/Home.jsx";
import HomePost from "@/components/HomePost.jsx";
import Login from "@/components/LoginForm.jsx";
import Signup from "@/components/SignupForm.jsx";
import { useState } from "react";
import Loading from "@/components/Loading.jsx";
import { useAuth } from "@/hooks/useAuth";

export default function Page() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
        }`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
      />

      <Home isDarkMode={isDarkMode} setIsLoginActive={setIsLoginActive} />
      <HomePost isDarkMode={isDarkMode} />

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
