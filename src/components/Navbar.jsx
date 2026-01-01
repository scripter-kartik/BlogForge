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
  const mobileRef = useRef();
  const searchRef = useRef();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        divRef.current &&
        !divRef.current.contains(event.target) &&
        mobileRef.current &&
        !mobileRef.current.contains(event.target)
      ) {
        setAccountInfoActive(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults({ posts: [], users: [] });
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      console.log("Search results:", data); // Debug log
      setSearchResults({
        posts: data.posts || [],
        users: data.users || [],
      });
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ posts: [], users: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setSearchQuery("");
    }
  };

  const handleResultClick = () => {
    setTimeout(() => {
      setShowDropdown(false);
      setSearchQuery("");
    }, 10);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setAccountInfoActive(false);
  };

  const handleThemeToggle = (e) => {
    e.stopPropagation();
    setIsDarkMode((prev) => !prev);
  };

  const linkClass = (path) =>
    `flex items-center gap-2 cursor-pointer px-3 py-2 transition-colors duration-200 ${pathname === path
      ? "text-[#f75555]"
      : isDarkMode
        ? "text-white hover:text-[#f75555]"
        : "text-black hover:text-[#f75555]"
    }`;

  const mobileLinkClass = (path) =>
    `flex flex-col items-center justify-center gap-1 transition-colors duration-200 ${pathname === path
      ? "text-[#f75555]"
      : isDarkMode
        ? "text-white"
        : "text-black"
    }`;

  return (
    <>
      <div
        className={`hidden lg:flex fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
          } shadow-sm justify-center`}
      >
        <div className="w-full max-w-[1280px] flex justify-between items-center px-4 xl:px-8 py-3">
          {/* LEFT LINKS */}
          <div className="flex items-center gap-4 xl:gap-8">
            <Link href="/" className={linkClass("/")}>
              <RiHome3Line className="text-lg" />
              <p className="text-sm xl:text-base">Home</p>
            </Link>

            <Link href="/trending" className={linkClass("/trending")}>
              <FaFire className="text-lg" />
              <p className="text-sm xl:text-base">Trending</p>
            </Link>

            <Link href="/latest" className={linkClass("/latest")}>
              <FaRegClock className="text-lg" />
              <p className="text-sm xl:text-base">Latest</p>
            </Link>

            {isAuthenticated && (
              <Link href="/for-you" className={linkClass("/for-you")}>
                <FaRegStar className="text-lg" />
                <p className="text-sm xl:text-base">For you</p>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 xl:gap-5">
            <div className="relative z-[99999]" ref={searchRef}>
              <div
                className={`w-[250px] xl:w-[330px] flex items-center gap-2 font-sm border-b-[1px] py-2 px-3 transition-colors ${isDarkMode ? "border-[#ABB2BF]" : "border-gray-400"
                  }`}
              >
                <IoSearch className="text-[#ABB2BF] text-lg" />

                <input
                  className={`bg-transparent font-bold outline-none border-none text-sm w-full ${isDarkMode
                    ? "text-white placeholder-gray-400"
                    : "text-black placeholder-gray-600"
                    }`}
                  placeholder="Search users or posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                />

                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f75555]" />
                )}
              </div>

              {showDropdown && (searchQuery.trim().length > 0) && (
                <div
                  className={`absolute top-full left-0 mt-2 w-[250px] xl:w-[330px] max-h-[500px] overflow-auto rounded-lg shadow-2xl z-[200000] pointer-events-auto ${isDarkMode
                    ? "bg-[#1c1d1d] border border-gray-700"
                    : "bg-white border border-gray-200"
                    }`}
                >
                  {searchResults?.users?.length > 0 && (
                    <div className="p-3 border-b border-gray-700">
                      <h3
                        className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        👤 Users ({searchResults.users.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.users.map((u) => (
                          <div
                            key={u._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              router.push(`/profile/${u.username}`);
                              handleResultClick();
                            }}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-all hover:scale-[1.02] ${isDarkMode
                              ? "hover:bg-gray-800"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            <img
                              src={getRandomProfileImage(u.image, u.username)}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                              alt={u.username}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-black"
                                }`}>
                                @{u.username}
                              </p>
                              {u.name && (
                                <p
                                  className={`text-xs truncate ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                    }`}
                                >
                                  {u.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults?.posts?.length > 0 && (
                    <div className="p-3">
                      <h3
                        className={`text-xs font-bold mb-2 uppercase tracking-wide ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        📝 Posts ({searchResults.posts.length})
                      </h3>
                      <div className="space-y-1">
                        {searchResults.posts.map((p) => (
                          <div
                            key={p._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              router.push(`/blog/${p._id}`);
                              handleResultClick();
                            }}
                            className={`block p-2 rounded-lg transition-all hover:scale-[1.01] ${isDarkMode
                              ? "hover:bg-gray-800"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            <p className={`font-semibold text-sm line-clamp-1 ${isDarkMode ? "text-white" : "text-black"
                              }`}>
                              {p.title}
                            </p>
                            {p.description && (
                              <p
                                className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                                  }`}
                              >
                                {p.description}
                              </p>
                            )}
                            {p.author && (
                              <p className="text-xs text-gray-500 mt-1">
                                by @{p.author.username}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults?.users?.length === 0 &&
                    searchResults?.posts?.length === 0 &&
                    !isSearching && (
                      <div className="p-8 text-center">
                        <p className="text-4xl mb-2">🔍</p>
                        <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                          No results found for "{searchQuery}"
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"
                          }`}>
                          Try a different search term
                        </p>
                      </div>
                    )}

                  {isSearching && (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f75555] mx-auto" />
                      <p className={`text-sm mt-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}>
                        Searching...
                      </p>
                    </div>
                  )}

                  {(searchResults?.users?.length > 0 || searchResults?.posts?.length > 0) && (
                    <div className={`p-3 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"
                      }`}>
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                          handleResultClick();
                        }}
                        className={`w-full py-2 text-sm font-semibold rounded-lg transition-all ${isDarkMode
                          ? "text-[#f75555] hover:bg-gray-800"
                          : "text-[#f75555] hover:bg-gray-100"
                          }`}
                      >
                        View all results →
                      </button>

                    </div>
                  )}
                </div>

              )}
            </div>

            {isDarkMode ? (
              <CiBrightnessDown
                className="text-white w-5 h-5 xl:w-6 xl:h-6 cursor-pointer hover:text-[#f75555] transition-colors"
                onClick={handleThemeToggle}
              />
            ) : (
              <MdOutlineDarkMode
                className="text-black w-5 h-5 xl:w-6 xl:h-6 cursor-pointer hover:text-[#f75555] transition-colors"
                onClick={handleThemeToggle}
              />
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3 xl:gap-4">
                <Link
                  href="/write"
                  className={`flex items-center gap-2 border rounded-full px-3 xl:px-4 h-[36px] xl:h-[40px] text-xs xl:text-sm transition-all
                    ${isDarkMode
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                >
                  <LuPencil className="text-base" />
                  <span className="hidden xl:inline">Write a post</span>
                </Link>

                <div className="relative" ref={divRef}>
                  <img
                    className="w-[32px] h-[32px] xl:w-[38px] xl:h-[38px] rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-[#f75555] transition-all"
                    src={getRandomProfileImage(
                      user?.image,
                      user?.username || user?.email
                    )}
                    onClick={() => setAccountInfoActive((prev) => !prev)}
                    alt="Profile"
                  />

                  {accountInfoActive && (
                    <div
                      className={`absolute top-12 right-0 w-44 p-5 rounded-xl shadow-xl flex flex-col gap-3 ${isDarkMode
                        ? "bg-[#1c1d1d] text-white"
                        : "bg-white text-black"
                        } border ${isDarkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                    >
                      <h1 className="font-bold truncate">{user?.username}</h1>

                      <Link
                        href={`/profile/${user?.username}`}
                        onClick={() => setAccountInfoActive(false)}
                        className="flex gap-2 items-center hover:text-[#f75555] transition-colors"
                      >
                        <MdEmojiEmotions className="text-lg" />
                        Profile
                      </Link>

                      <div
                        className="flex gap-2 items-center hover:text-[#f75555] cursor-pointer transition-colors"
                        onClick={handleThemeToggle}
                      >
                        {isDarkMode ? (
                          <CiBrightnessDown className="text-lg" />
                        ) : (
                          <MdOutlineDarkMode className="text-lg" />
                        )}
                        <p>{isDarkMode ? "Light theme" : "Dark theme"}</p>
                      </div>

                      <div
                        className="flex gap-2 items-center hover:text-[#f75555] cursor-pointer transition-colors"
                        onClick={handleLogout}
                      >
                        <LuLogOut className="text-lg" /> Logout
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`flex gap-4 text-sm xl:text-base ${isDarkMode ? "text-white" : "text-black"
                  }`}
              >
                <p
                  className="cursor-pointer hover:text-[#f75555] transition-colors"
                  onClick={() => setIsLoginActive(true)}
                >
                  Login
                </p>
                <p
                  className="cursor-pointer hover:text-[#f75555] transition-colors"
                  onClick={() => setIsSignupActive(true)}
                >
                  Signup
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 ${isDarkMode
          ? "bg-[#1c1d1d] text-white"
          : "bg-[#f6f6f7] text-black"
          } shadow-md`}
      >
        <div ref={searchRef} className="flex-1 relative">
          <div className="flex items-center gap-2 border-b-[1px] border-[#f75555] py-2 px-3">
            <IoSearch className="text-[#f75555] text-xl" />
            <input
              placeholder="Search..."
              className={`bg-transparent outline-none font-bold text-sm w-full ${isDarkMode ? "text-white placeholder-gray-400" : "text-black placeholder-gray-500"
                }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              onFocus={() => searchQuery && setShowDropdown(true)}
            />
            {isSearching && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#f75555]" />
            )}
          </div>

          {showDropdown && searchQuery.trim().length > 0 && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50 ${isDarkMode
                ? "bg-[#1c1d1d] border border-gray-700"
                : "bg-white border border-gray-200"
                }`}
            >
              {searchResults.users.length > 0 && (
                <div className="p-3 border-b border-gray-700">
                  <h3
                    className={`text-xs font-bold mb-2 uppercase ${isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                  >
                    👤 Users
                  </h3>
                  {searchResults.users.map((u) => (
                    <Link
                      key={u._id}
                      href={`/profile/${u.username}`}
                      onClick={handleResultClick}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                        }`}
                    >
                      <img
                        src={getRandomProfileImage(u.image, u.username)}
                        className="w-8 h-8 rounded-full object-cover"
                        alt={u.username}
                      />
                      <div>
                        <p className="font-medium text-sm">@{u.username}</p>
                        {u.name && (
                          <p
                            className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                          >
                            {u.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.posts.length > 0 && (
                <div
                  className={`p-3 ${searchResults.users.length > 0 ? "border-t" : ""
                    } ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
                >
                  <h3
                    className={`text-xs font-bold mb-2 uppercase ${isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                  >
                    📝 Posts
                  </h3>
                  {searchResults.posts.map((p) => (
                    <Link
                      key={p._id}
                      href={`/blog/${p._id}`}
                      onClick={handleResultClick}
                      className={`block p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                        }`}
                    >
                      <p className="font-medium text-sm line-clamp-1">
                        {p.title}
                      </p>
                      {p.description && (
                        <p
                          className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                          {p.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {searchResults?.users?.length === 0 &&
                searchResults?.posts?.length === 0 &&
                !isSearching && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found
                  </div>
                )}
            </div>
          )}
        </div>

        {isDarkMode ? (
          <CiBrightnessDown
            className="w-7 h-7 cursor-pointer"
            onClick={handleThemeToggle}
          />
        ) : (
          <MdOutlineDarkMode
            className="w-7 h-7 cursor-pointer"
            onClick={handleThemeToggle}
          />
        )}
      </div>

      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t py-2 px-2 ${isDarkMode
          ? "bg-[#1c1d1d] text-white border-gray-800"
          : "bg-[#f6f6f7] text-black border-gray-200"
          } shadow-lg`}
      >
        {isAuthenticated ? (
          <div className="flex items-center justify-around max-w-md mx-auto">
            <Link href="/" className={mobileLinkClass("/")}>
              <RiHome3Line className="text-2xl" />
              <p className="text-[10px] font-medium">Home</p>
            </Link>

            <Link href="/trending" className={mobileLinkClass("/trending")}>
              <FaFire className="text-2xl" />
              <p className="text-[10px] font-medium">Trending</p>
            </Link>

            <Link href="/latest" className={mobileLinkClass("/latest")}>
              <FaRegClock className="text-2xl" />
              <p className="text-[10px] font-medium">Latest</p>
            </Link>

            <Link href="/for-you" className={mobileLinkClass("/for-you")}>
              <FaRegStar className="text-2xl" />
              <p className="text-[10px] font-medium">For You</p>
            </Link>

            <Link href="/write" className={mobileLinkClass("/write")}>
              <LuPencil className="text-2xl" />
              <p className="text-[10px] font-medium">Write</p>
            </Link>

            <div ref={mobileRef} className="relative">
              <div
                className={mobileLinkClass("/profile")}
                onClick={() => setAccountInfoActive((prev) => !prev)}
              >
                <img
                  src={getRandomProfileImage(
                    user?.image,
                    user?.username || user?.email
                  )}
                  className="w-7 h-7 rounded-full object-cover border-2 border-transparent"
                  alt="Profile"
                />
                <p className="text-[10px] font-medium">Profile</p>
              </div>

              {accountInfoActive && (
                <div
                  className={`absolute bottom-16 right-0 w-48 p-4 rounded-xl shadow-2xl flex flex-col gap-3 ${isDarkMode
                    ? "bg-[#1c1d1d] text-white border border-gray-700"
                    : "bg-white text-black border border-gray-200"
                    }`}
                >
                  <h1 className="font-bold text-base truncate">
                    {user?.name || user?.username || ""}
                  </h1>

                  <Link
                    href={`/profile/${user?.username}`}
                    onClick={() => setAccountInfoActive(false)}
                    className="flex gap-2 items-center hover:text-[#f75555]"
                  >
                    <MdEmojiEmotions className="text-xl" /> View Profile
                  </Link>

                  <div
                    className="flex gap-2 items-center hover:text-[#f75555] cursor-pointer"
                    onClick={handleThemeToggle}
                  >
                    {isDarkMode ? (
                      <CiBrightnessDown className="text-xl" />
                    ) : (
                      <MdOutlineDarkMode className="text-xl" />
                    )}
                    <p>{isDarkMode ? "Light theme" : "Dark theme"}</p>
                  </div>

                  <div
                    className="flex gap-2 items-center hover:text-[#f75555] cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LuLogOut className="text-xl" /> Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-around max-w-sm mx-auto">
            <Link href="/" className={mobileLinkClass("/")}>
              <RiHome3Line className="text-2xl" />
              <p className="text-[10px] font-medium">Home</p>
            </Link>

            <Link href="/trending" className={mobileLinkClass("/trending")}>
              <FaFire className="text-2xl" />
              <p className="text-[10px] font-medium">Trending</p>
            </Link>

            <Link href="/latest" className={mobileLinkClass("/latest")}>
              <FaRegClock className="text-2xl" />
              <p className="text-[10px] font-medium">Latest</p>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}