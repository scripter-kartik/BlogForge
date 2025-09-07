"use client";

import { RiHome3Line } from "react-icons/ri";
import { FaFire } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CiBrightnessDown } from "react-icons/ci";
import { MdOutlineDarkMode } from "react-icons/md";
import { LuPencil } from "react-icons/lu";
import { LuLogOut } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function Navbar({
  setIsLoginActive,
  setIsSignupActive,
  isDarkMode,
  setIsDarkMode,
  loginDone,
  signupDone,
  setLoginDone,
}) {
  console.log("Navbar loginDone:", loginDone, "signupDone:", signupDone);

  const [accountInfoActive, setAccountInfoActive] = useState(false);
  const divRef = useRef();

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
  }, [setAccountInfoActive]);

  return (
    <div
      className={`w-[1280px] flex justify-between items-center fixed py-3 transition-colors duration-500 ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      }`}
    >
      <div
        className={`flex items-center gap-8 ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
          <RiHome3Line className="text-[#f75555]" />
          <p className="text-[#f75555]">Home</p>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
          <FaFire />
          <p>Trending</p>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
          <FaRegClock />
          <p>Latest</p>
        </div>
        {loginDone || signupDone ? (
          <div className="flex items-center gap-2 cursor-pointer hover:text-[#f75555]">
            <FaRegStar />
            <p>For you</p>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="flex items-center gap-5">
        <div className="w-[330px] flex items-center gap-2 font-sm border-b-[1px] border-[#ABB2BF] py-2 px-3">
          <IoSearch className="text-[#ABB2BF]" />
          <input
            className={`bg-transparent outline-none border-none text-sm ${
              isDarkMode ? "text-white" : "text-black"
            }`}
            placeholder="Search post or users..."
            type="text"
          />
        </div>
        {isDarkMode ? (
          <div>
            <CiBrightnessDown
              className="text-white w-5 h-5 hover:text-[#f75555]"
              onClick={() => setIsDarkMode(false)}
            />
          </div>
        ) : (
          <div>
            <MdOutlineDarkMode
              className="text-black w-5 h-5 hover:text-[#f75555]"
              onClick={() => setIsDarkMode(true)}
            />
          </div>
        )}
        {loginDone || signupDone ? (
          <div className="flex gap-4 items-center justify-center">
            <Link 
            href="/write"
              className={`flex items-center justify-center gap-3 border-[1px] ${
                isDarkMode
                  ? "border-white hover:bg-white text-white"
                  : "border-black hover:bg-black hover:text-white"
              } rounded-full mt-2 hover:text-black w-[130px] h-[40px] text-sm`}
            >
              <LuPencil />
              Write a post
            </Link>

            <div
              className="relative"
              onClick={() => setAccountInfoActive((prev) => !prev)}
            >
              <img
                className="w-[35px] h-[35px] rounded-full object-cover"
                src="/imageProfile1.png"
                alt=""
              />
              {accountInfoActive && (
                <div
                  ref={divRef}
                  className={`flex flex-col items-start justify-center gap-2 font-light absolute top-12 right-4 shadow-2xl p-5 rounded-xl ${
                    isDarkMode
                      ? "text-white bg-[#1c1d1d]"
                      : "text-black bg-[#f6f6f7]"
                  }`}
                >
                  <h1 className="font-bold">kartikagarwal</h1>
                  <p>View Profile</p>
                  <div className="flex items-center justify-center gap-2">
                    {isDarkMode ? (
                      <div
                        className="hover:text-[#f75555] flex items-center gap-2 cursor-pointer"
                        onClick={() => setIsDarkMode(false)}
                      >
                        <CiBrightnessDown className="w-5 h-5" />
                        <p>theme</p>
                      </div>
                    ) : (
                      <div
                        className="hover:text-[#f75555] flex items-center gap-2 cursor-pointer"
                        onClick={() => setIsDarkMode(true)}
                      >
                        <MdOutlineDarkMode className="w-5 h-5" />
                        <p>theme</p>
                      </div>
                    )}
                  </div>
                  <div
                    className="flex items-center justify-center gap-2 hover:text-[#f75555] cursor-pointer"
                    onClick={() => setLoginDone(false)}
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
            className={`flex items-center gap-5 ${
              isDarkMode ? "text-white" : "text-black"
            } cursor-pointer`}
          >
            <p
              className="hover:text-[#f75555]"
              onClick={() => setIsLoginActive(true)}
            >
              Login
            </p>
            <p
              className="hover:text-[#f75555]"
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
