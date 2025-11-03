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

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
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
    <>
      {/* Desktop Navbar (hidden on mobile) */}
      <div
        className={`hidden md:flex fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
        } shadow-sm justify-center`}
      >
        <div className="w-full max-w-[1280px] flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
          {/* Left: Navigation Links */}
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
              <FaRegClock className={pathname === "/latest" ? "text-[#f75555]" : ""} />
              <p>Latest</p>
            </Link>

            {isAuthenticated && (
              <Link href="/for-you" className={linkClass("/for-you")}>
                <FaRegStar className={pathname === "/for-you" ? "text-[#f75555]" : ""} />
                <p>For you</p>
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-5">
            {/* Search Box with Dropdown */}
            <div className="relative" ref={searchRef}>
              <div
                className={`w-[330px] flex items-center gap-2 font-sm border-b-[1px] py-2 px-3 transition-colors ${
                  isDarkMode ? "border-[#ABB2BF]" : "border-gray-400"
                }`}
              >
                <IoSearch className="text-[#ABB2BF]" />
                <input
                  className={`bg-transparent outline-none border-none text-sm w-full ${
                    isDarkMode ? "text-white placeholder-gray-400" : "text-black placeholder-gray-600"
                  }`}
                  placeholder="Search posts or users..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  onFocus={() => searchQuery && setShowDropdown(true)}
                />
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f75555]"></div>
                )}
              </div>

              {/* Search Dropdown */}
              {showDropdown && (searchResults.posts?.length > 0 || searchResults.users?.length > 0) && (
                <div
                  className={`absolute top-full mt-2 w-[450px] max-h-[500px] overflow-y-auto rounded-lg shadow-2xl z-50 ${
                    isDarkMode ? "bg-[#2a2b2b] text-white" : "bg-white text-black"
                  }`}
                >
                  {/* Posts */}
                  {searchResults.posts?.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-500 mb-3">POSTS</h3>
                      <div className="space-y-3">
                        {searchResults.posts.slice(0, 3).map((post) => (
                          <Link
                            key={post._id}
                            href={`/blog/${post._id}`}
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
                                onError={(e) => {
                                  e.target.src = "/imageProfile1.png";
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{post.title}</p>
                                {post.description && (
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                    {post.description}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                  by {post.author?.name || post.author?.username || "Anonymous"}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users */}
                  {searchResults.users?.length > 0 && (
                    <div className={`p-4 ${searchResults.posts?.length > 0 ? 'border-t' : ''} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
                                onError={(e) => {
                                  e.target.src = "/imageProfile1.png";
                                }}
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

              {/* No Results Message */}
              {showDropdown && !isSearching && searchResults.posts?.length === 0 && searchResults.users?.length === 0 && searchQuery.trim().length > 0 && (
                <div
                  className={`absolute top-full mt-2 w-[450px] rounded-lg shadow-2xl z-50 p-6 text-center ${
                    isDarkMode ? "bg-[#2a2b2b] text-white" : "bg-white text-black"
                  }`}
                >
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try different keywords</p>
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
      </div>

      {/* Mobile - Top Bar (Search + Dark Mode) */}
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
        } shadow-sm`}
      >
        <div className="flex justify-between items-center px-4 py-3 gap-3">
          {/* Search Box */}
          <div className="flex-1 relative" ref={searchRef}>
            <div className="w-full flex items-center gap-2 font-sm border-b-2 border-[#f75555] py-2 px-3 transition-colors">
              <IoSearch className="text-[#f75555]" />
              <input
                className={`bg-transparent outline-none border-none text-sm w-full ${
                  isDarkMode ? "text-white placeholder-gray-400" : "text-black placeholder-gray-600"
                }`}
                placeholder="Search..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                onFocus={() => searchQuery && setShowDropdown(true)}
              />
              {isSearching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f75555]"></div>
              )}
            </div>

            {/* Mobile Search Dropdown */}
            {showDropdown && (searchResults.posts?.length > 0 || searchResults.users?.length > 0) && (
              <div
                className={`absolute top-full mt-2 left-0 right-0 max-h-[400px] overflow-y-auto rounded-lg shadow-2xl z-50 ${
                  isDarkMode ? "bg-[#2a2b2b] text-white" : "bg-white text-black"
                }`}
              >
                {/* Posts */}
                {searchResults.posts?.length > 0 && (
                  <div className="p-3">
                    <h3 className="text-xs font-bold text-gray-500 mb-2">POSTS</h3>
                    <div className="space-y-2">
                      {searchResults.posts.slice(0, 3).map((post) => (
                        <Link
                          key={post._id}
                          href={`/blog/${post._id}`}
                          onClick={handleResultClick}
                          className={`block p-2 rounded-lg transition-colors ${
                            isDarkMode ? "hover:bg-[#323333]" : "hover:bg-gray-100"
                          }`}
                        >
                          <p className="font-semibold text-sm truncate">{post.title}</p>
                          <p className="text-xs text-gray-500">
                            by {post.author?.name || post.author?.username || "Anonymous"}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Users */}
                {searchResults.users?.length > 0 && (
                  <div className={`p-3 ${searchResults.posts?.length > 0 ? 'border-t' : ''} ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="text-xs font-bold text-gray-500 mb-2">USERS</h3>
                    <div className="space-y-2">
                      {searchResults.users.slice(0, 3).map((user) => (
                        <Link
                          key={user._id}
                          href={`/profile/${user.username}`}
                          onClick={handleResultClick}
                          className={`block p-2 rounded-lg transition-colors ${
                            isDarkMode ? "hover:bg-[#323333]" : "hover:bg-gray-100"
                          }`}
                        >
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          {isDarkMode ? (
            <CiBrightnessDown
              className="text-white w-6 h-6 hover:text-[#f75555] cursor-pointer transition-colors flex-shrink-0"
              onClick={() => setIsDarkMode(false)}
            />
          ) : (
            <MdOutlineDarkMode
              className="text-black w-6 h-6 hover:text-[#f75555] cursor-pointer transition-colors flex-shrink-0"
              onClick={() => setIsDarkMode(true)}
            />
          )}
        </div>
      </div>

      {/* Mobile - Bottom Navigation */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
        } shadow-lg border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex justify-around items-center py-3 px-2">
          <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === "/" ? "text-[#f75555]" : isDarkMode ? "text-white" : "text-black"}`}>
            <RiHome3Line className="w-6 h-6" />
            <p className="text-xs">Home</p>
          </Link>

          <Link href="/trending" className={`flex flex-col items-center gap-1 ${pathname === "/trending" ? "text-[#f75555]" : isDarkMode ? "text-white" : "text-black"}`}>
            <FaFire className="w-6 h-6" />
            <p className="text-xs">Trending</p>
          </Link>

          <Link href="/latest" className={`flex flex-col items-center gap-1 ${pathname === "/latest" ? "text-[#f75555]" : isDarkMode ? "text-white" : "text-black"}`}>
            <FaRegClock className="w-6 h-6" />
            <p className="text-xs">Latest</p>
          </Link>

          {isAuthenticated && (
            <Link href="/for-you" className={`flex flex-col items-center gap-1 ${pathname === "/for-you" ? "text-[#f75555]" : isDarkMode ? "text-white" : "text-black"}`}>
              <FaRegStar className="w-6 h-6" />
              <p className="text-xs">For you</p>
            </Link>
          )}

          {isAuthenticated ? (
            <>
              <Link href="/write" className={`flex flex-col items-center gap-1 ${isDarkMode ? "text-white" : "text-black"}`}>
                <LuPencil className="w-6 h-6" />
                <p className="text-xs">Write</p>
              </Link>

              <div 
                className="flex flex-col items-center gap-1 cursor-pointer"
                onClick={() => setAccountInfoActive((prev) => !prev)}
              >
                <img
                  className="w-7 h-7 rounded-full object-cover"
                  src={getRandomProfileImage(user?.image, user?.username || user?.email)}
                  alt="Profile"
                />
                <p className={`text-xs ${isDarkMode ? "text-white" : "text-black"}`}>Profile</p>
              </div>
            </>
          ) : (
            <>
              <div 
                className={`flex flex-col items-center gap-1 cursor-pointer ${isDarkMode ? "text-white" : "text-black"}`}
                onClick={() => setIsLoginActive(true)}
              >
                <MdEmojiEmotions className="w-6 h-6" />
                <p className="text-xs">Login</p>
              </div>

              <div 
                className={`flex flex-col items-center gap-1 cursor-pointer ${isDarkMode ? "text-white" : "text-black"}`}
                onClick={() => setIsSignupActive(true)}
              >
                <MdEmojiEmotions className="w-6 h-6" />
                <p className="text-xs">Signup</p>
              </div>
            </>
          )}
        </div>

        {/* Mobile Profile Dropdown */}
        {accountInfoActive && isAuthenticated && (
          <div
            ref={divRef}
            className={`absolute bottom-full mb-2 right-4 flex flex-col items-start justify-center w-44 gap-2 font-light shadow-2xl p-5 rounded-xl transition-colors z-40 ${
              isDarkMode
                ? "text-white bg-[#1c1d1d] border border-gray-700"
                : "text-black bg-white border border-gray-200"
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
    </>
  );
}