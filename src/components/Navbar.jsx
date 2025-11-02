"use client";

import { RiHome3Line } from "react-icons/ri";
import { FaFire, FaRegClock, FaRegStar } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CiBrightnessDown } from "react-icons/ci";
import { MdOutlineDarkMode, MdEmojiEmotions } from "react-icons/md";
import { LuPencil, LuLogOut } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { getRandomProfileImage } from "@/lib/profileImage.js";

export default function Navbar({
  setIsLoginActive,
  setIsSignupActive,
  isDarkMode,
  setIsDarkMode,
}) {
  const { isAuthenticated, user } = useUser();
  const [accountInfoActive, setAccountInfoActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const divRef = useRef();
  const searchRef = useRef();
  const pathname = usePathname();
  const router = useRouter();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setAccountInfoActive(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults({ posts: [], users: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
      setShowDropdown(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setSearchQuery("");
    }
  };

  const handleResultClick = () => {
    setShowDropdown(false);
    setSearchQuery("");
  };

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
        {/* Search Box with Dropdown */}
        <div className="relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div
              className={`w-[330px] flex items-center gap-2 font-sm border-b-[1px] py-2 px-3 transition-colors ${
                isDarkMode ? "border-[#ABB2BF]" : "border-gray-400"
              }`}
            >
              <IoSearch className="text-[#ABB2BF]" />
              <input
                className={`bg-transparent outline-none border-none text-sm w-full ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
                placeholder="Search posts or users..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
              />
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f75555]"></div>
              )}
            </div>
          </form>

          {/* Search Dropdown */}
          {showDropdown && (searchResults.posts.length > 0 || searchResults.users.length > 0) && (
            <div
              className={`absolute top-full mt-2 w-[450px] max-h-[500px] overflow-y-auto rounded-lg shadow-2xl z-50 ${
                isDarkMode ? "bg-[#2a2b2b] text-white" : "bg-white text-black"
              }`}
            >
              {/* Posts */}
              {searchResults.posts.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-500 mb-3">POSTS</h3>
                  <div className="space-y-3">
                    {searchResults.posts.slice(0, 3).map((post) => (
                      <Link
                        key={post._id}
                        href={`/post/${post._id}`}
                        onClick={handleResultClick}
                        className={`block p-3 rounded-lg transition-colors ${
                          isDarkMode ? "hover:bg-[#323333]" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={getRandomProfileImage(post.author?.image, post.author?.username)}
                            alt={post.author?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{post.title}</p>
                            <p className="text-sm text-gray-500">
                              by {post.author?.name || post.author?.username}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {searchResults.users.length > 0 && (
                <div className={`p-4 ${searchResults.posts.length > 0 ? 'border-t' : ''} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className="text-sm font-bold text-gray-500 mb-3">USERS</h3>
                  <div className="space-y-3">
                    {searchResults.users.slice(0, 3).map((user) => (
                      <Link
                        key={user._id}
                        href={`/profile/${user.username}`}
                        onClick={handleResultClick}
                        className={`block p-3 rounded-lg transition-colors ${
                          isDarkMode ? "hover:bg-[#323333]" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getRandomProfileImage(user.image, user.username)}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* View All Results */}
              <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  onClick={handleResultClick}
                  className="block text-center text-[#f75555] hover:underline text-sm font-semibold"
                >
                  View all results for "{searchQuery}"
                </Link>
              </div>
            </div>
          )}
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
                key={user?.image}
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
                  <h1 className="font-bold">{user?.name || user?.username || ""}</h1>
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