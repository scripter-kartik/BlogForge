"use client";

import Navbar from "@/components/Navbar.jsx";
import Home from "@/components/Home.jsx";
import HomePost from "@/components/HomePost.jsx";
import Login from "@/components/LoginForm.jsx";
import Signup from "@/components/SignupForm.jsx";
import { useState, useEffect } from "react";
import Loading from "@/components/Loading.jsx";

export default function Page() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loginDone, setLoginDone] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLoginDone(true);
          } else {
            localStorage.removeItem("token");
            setLoginDone(false);
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setLoginDone(false);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

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
        setLoginDone={setLoginDone}
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
            setIsSignupActive={setIsSignupActive}
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
            setIsLoginActive={setIsLoginActive}
          />
        </div>
      )}
    </div>
  );
}
