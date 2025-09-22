"use client";

import Navbar from "../../../components/Navbar.jsx";
import { useState } from "react";

export default function Profile() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loginDone, setLoginDone] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  return (
    <div
      className={`flex flex-col items-center h-screen w-screen ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      } transition-colors duration-500`}
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
      <div
        className={`mt-32 flex flex-col w-[1280px] ${
          isDarkMode ? "text-white" : "text-black"
        } transition-colors duration-500`}
      >
        <div className="flex items-center justify-around w-[1280px] ml-10 overflow-hidden">
          <div className="flex flex-col items-center gap-4 mt-12">
            <img
              className="w-64 h-64 rounded-full object-cover border-4 border-red-500"
              src="/imageProfile1.png"
              alt=""
            />
            <div className="flex gap-4">
              <p>0 followers</p>
              <p>0 following</p>
            </div>
            <div className="flex gap-4">
              <p>0 posts</p>
              <p>Avg Rating: 0.0</p>
            </div>
            <p className="text-gray-500 text-sm">Member since August 2025</p>
            <button className="border-[1px] border-red-500 text-red-500 px-4 py-1 rounded hover:text-red-600 hover:border-red-600">
              Logout
            </button>
          </div>
          <div className="flex flex-col gap-4 items-start">
            <h1 className="text-4xl font-bold mb-8">Welcome, Kartikagarwal</h1>
            <div className="flex flex-col">
              <label htmlFor="username" className="text-sm font-light">
                Username
              </label>
              <input
                type="text"
                className={`w-[800px] h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-light">
                Email
              </label>
              <input
                type="email"
                className={`w-[800px] h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-light">
                Password
              </label>
              <input
                type="password"
                className={`w-[800px] h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="bio" className="text-sm font-light">
                Bio
              </label>
              <textarea
                className={`w-[800px] px-3 py-2 font-light rounded h-[120px] resize-none outline-none border-none ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
                placeholder="Tell us something..."
              ></textarea>
            </div>
            <button
              className={`px-4 py-2 rounded ${
                isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
              } transition-colors duration-500`}
            >
              Save changes
            </button>
          </div>
        </div>
        <div className="mt-32">
          <div className="flex items-center gap-5">
            <h1 className="text-3xl">Your posts</h1>
            <div className="border-t-2 w-[1100px] border-red-500"></div>
          </div>
          <p className="mt-6">You haven't written any posts yet.</p>
        </div>
      </div>
    </div>
  );
}
