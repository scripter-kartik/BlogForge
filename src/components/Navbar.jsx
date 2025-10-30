"use client";

import { RiHome3Line } from "react-icons/ri";
import { FaFire, FaRegClock, FaRegStar } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CiBrightnessDown } from "react-icons/ci";
import { MdOutlineDarkMode, MdEmojiEmotions } from "react-icons/md";
import { LuPencil, LuLogOut } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import { getRandomProfileImage } from "@/lib/profileImage.js";

export default function Navbar({
  setIsLoginActive,
  setIsSignupActive,
  isDarkMode,
  setIsDarkMode,
}) {
  const { isAuthenticated, user } = useAuth();
  const [accountInfoActive, setAccountInfoActive] = useState(false);
  const divRef = useRef();
  const pathname = usePathname();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setAccountInfoActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setAccountInfoActive(false);
  };

  const linkClass = (path) =>
    `flex items-center gap-2 cursor-pointer px-3 py-2 transition-colors duration-200 ${
      pathname === path
        ? "text-[#f75555]"
        : isDarkMode
        ? "text-white hover:text-[#f75555]"
        : "text-black hover:text-[#f75555]"
    }`;

  return (
    <div
      className={`w-[1280px] flex justify-between items-center py-3 transition-colors duration-500 ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      }`}
    >
      {/* Left Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className={linkClass("/")}>
          <RiHome3Line className={pathname === "/" ? "text-[#f75555]" : ""} />
          <p>Home</p>
        </Link>

        <Link href="/trending" className={linkClass("/trending")}>
          <FaFire className={pathname === "/trending" ? "text-[#f75555]" : ""} />
          <p>Trending</p>
        </Link>

        <Link href="/latest" className={linkClass("/latest")}>
          <FaRegClock
            className={pathname === "/latest" ? "text-[#f75555]" : ""}
          />
          <p>Latest</p>
        </Link>

        {isAuthenticated && (
          <Link href="/for-you" className={linkClass("/for-you")}>
            <FaRegStar
              className={pathname === "/for-you" ? "text-[#f75555]" : ""}
            />
            <p>For you</p>
          </Link>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">
        {/* Search Box */}
        <div
          className={`w-[330px] flex items-center gap-2 font-sm border-b-[1px] py-2 px-3 transition-colors ${
            isDarkMode
              ? "border-[#ABB2BF]"
              : "border-gray-400"
          }`}
        >
          <IoSearch className="text-[#ABB2BF]" />
          <input
            className={`bg-transparent outline-none border-none text-sm ${
              isDarkMode ? "text-white" : "text-black"
            }`}
            placeholder="Search post or users..."
            type="text"
          />
        </div>

        {/* Dark Mode Toggle */}
        {isDarkMode ? (
          <CiBrightnessDown
            className="text-white w-5 h-5 hover:text-[#f75555] cursor-pointer transition-colors"
            onClick={() => setIsDarkMode(false)}
          />
        ) : (
          <MdOutlineDarkMode
            className="text-black w-5 h-5 hover:text-[#f75555] cursor-pointer transition-colors"
            onClick={() => setIsDarkMode(true)}
          />
        )}

        {/* Auth Buttons / Profile */}
        {isAuthenticated ? (
          <div className="flex gap-4 items-center justify-center">
            {/* Write Post Button */}
            <Link
              href="/write"
              className={`flex items-center justify-center gap-3 border-[1px] rounded-full mt-2 w-[130px] h-[40px] text-sm transition-colors ${
                isDarkMode
                  ? "border-white text-white hover:bg-white hover:text-black"
                  : "border-black text-black hover:bg-black hover:text-white"
              }`}
            >
              <LuPencil />
              Write a post
            </Link>

            {/* Profile Dropdown */}
            <div
              className="relative cursor-pointer"
              onClick={() => setAccountInfoActive((prev) => !prev)}
            >
              <img
                className="w-[35px] h-[35px] rounded-full object-cover"
                src={getRandomProfileImage(user?.image, user?.username || user?.email)}
                alt="Profile"
              />
              {accountInfoActive && (
                <div
                  ref={divRef}
                  className={`flex flex-col items-start justify-center w-40 gap-2 font-light absolute top-12 right-2 shadow-2xl p-5 rounded-xl transition-colors z-40 ${
                    isDarkMode
                      ? "text-white bg-[#1c1d1d]"
                      : "text-black bg-white"
                  }`}
                >
                  <h1 className="font-bold">{user?.username || ""}</h1>
                  <Link href={`/profile/${user?.username || ""}`}>
                    <div className="hover:text-[#f75555] flex items-center gap-2 cursor-pointer transition-colors">
                      <MdEmojiEmotions className="w-5 h-5" />
                      <p>Profile</p>
                    </div>
                  </Link>
                  <div className="flex items-center justify-center gap-2">
                    {isDarkMode ? (
                      <div
                        className="hover:text-[#f75555] flex items-center gap-2 cursor-pointer transition-colors"
                        onClick={() => setIsDarkMode(false)}
                      >
                        <CiBrightnessDown className="w-5 h-5" />
                        <p>Light theme</p>
                      </div>
                    ) : (
                      <div
                        className="hover:text-[#f75555] flex items-center gap-2 cursor-pointer transition-colors"
                        onClick={() => setIsDarkMode(true)}
                      >
                        <MdOutlineDarkMode className="w-5 h-5" />
                        <p>Dark theme</p>
                      </div>
                    )}
                  </div>
                  <div
                    className="flex items-center justify-center gap-2 hover:text-[#f75555] cursor-pointer transition-colors"
                    onClick={handleLogout}
                  >
                    <LuLogOut />
                    <p>Logout</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center gap-5 cursor-pointer transition-colors ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            <p
              className="hover:text-[#f75555] transition-colors"
              onClick={() => setIsLoginActive(true)}
            >
              Login
            </p>
            <p
              className="hover:text-[#f75555] transition-colors"
              onClick={() => setIsSignupActive(true)}
            >
              Signup
            </p>
          </div>
        )}
      </div>
    </div>
  );
}