"use client";

import Navbar from "@/components/Navbar.jsx";
import Home from "@/components/Home.jsx";
import HomePost from "@/components/HomePost.jsx";
import Login from "@/components/LoginForm.jsx";
import Signup from "@/components/SignupForm.jsx";
import { useState } from "react";

export default function Page() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loginDone, setLoginDone] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-500 ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      }`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
        loginDone={loginDone}
        signupDone={signupDone}
      />
      <Home
        isDarkMode={isDarkMode}
        loginDone={loginDone}
        signupDone={signupDone}
      />
      <HomePost
        isDarkMode={isDarkMode}
        loginDone={loginDone}
        signupDone={signupDone}
      />
      {isLoginActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Login
            isLoginActive={isLoginActive}
            setIsLoginActive={setIsLoginActive}
            isDarkMode={isDarkMode}
            setLoginDone={setLoginDone}
          />
        </div>
      )}
      {isSignupActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <Signup
            isSignupActive={isSignupActive}
            setIsSignupActive={setIsSignupActive}
            isDarkMode={isDarkMode}
            setSignupDone={setSignupDone}
          />
        </div>
      )}
    </div>
  );
}
