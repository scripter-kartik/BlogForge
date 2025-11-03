"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { IoSearch } from "react-icons/io5";
import { FaRegStar, FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { getRandomProfileImage } from "@/lib/profileImage.js";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/useAuth";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState({ posts: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);

  const gradients = [
    "bg-gradient-to-r from-purple-500 to-pink-500",
    "bg-gradient-to-r from-blue-500 to-cyan-500",
    "bg-gradient-to-r from-green-500 to-teal-500",
    "bg-gradient-to-r from-orange-500 to-red-500",
    "bg-gradient-to-r from-indigo-500 to-purple-500",
    "bg-gradient-to-r from-pink-500 to-rose-500",
    "bg-gradient-to-r from-yellow-500 to-orange-500",
    "bg-gradient-to-r from-emerald-500 to-blue-500",
    "bg-gradient-to-r from-violet-500 to-fuchsia-500",
    "bg-gradient-to-r from-cyan-500 to-blue-500",
    "bg-gradient-to-r from-red-500 to-pink-500",
    "bg-gradient-to-r from-lime-500 to-green-500",
  ];

  const getGradientForPost = (postId) => {
    const hash = postId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  // Initialize dark mode
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === "true");
    }
    setIsInitialized(true);
  }, []);

  // Save dark mode preference
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("darkMode", isDarkMode.toString());
    }
  }, [isDarkMode, isInitialized]);

  // Perform search when query changes
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const filteredResults = () => {
    if (activeTab === "posts") return { posts: results.posts, users: [] };
    if (activeTab === "users") return { posts: [], users: results.users };
    return results;
  };

  const { posts, users } = filteredResults();
  const totalResults = results.posts.length + results.users.length;

  const renderPosts = (postList) => {
    if (postList.length === 0) return null;

    return postList.map((post) => (
      <div
        key={post._id}
        className="w-full mt-8 cursor-pointer group"
        onClick={() => router.push(`/blog/${post._id}`)}
      >
        <div
          className={`w-full ${
            isDarkMode
              ? "text-white bg-[#2D2D2D] hover:bg-[#353535]"
              : "text-black bg-[#E8EAEC] hover:bg-[#dfe1e4]"
          } flex gap-6 p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
        >
          {post.coverImage ? (
            <img
              className="w-52 h-40 object-cover rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0"
              src={post.coverImage}
              alt={post.title}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div
              className={`w-52 h-40 rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0 ${getGradientForPost(post._id)}`}
            />
          )}

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-row justify-between items-start gap-4">
              <h1 className="font-bold text-2xl leading-tight">{post.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <img
                  className="w-8 h-8 rounded-full border-2 border-[#f75555]"
                  src={getRandomProfileImage(post.author?.image, post.author?.username)}
                  alt={post.author?.name}
                  onError={(e) => {
                    e.target.src = "/imageProfile1.png";
                  }}
                />
                <p className="text-sm font-medium">{post.author?.name || post.author?.username}</p>
              </div>
            </div>
            {post.description && (
              <p
                className={`${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                } line-clamp-2 text-base`}
              >
                {post.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags?.map((tag, idx) => (
                <div
                  key={idx}
                  className={`${
                    isDarkMode
                      ? "bg-[#3a3a3a] text-gray-300"
                      : "bg-gray-200 text-gray-700"
                  } px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300`}
                >
                  #{tag}
                </div>
              ))}
            </div>
            <div
              className={`${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              } flex items-center gap-6 text-sm font-medium`}
            >
              <div className="flex items-center gap-2 hover:text-[#f75555] transition-colors">
                <FaRegStar className="text-yellow-500 text-base" />
                <p>{post.starRating || 4}.0</p>
              </div>
              <div className="flex items-center gap-2">
                <IoEyeOutline className="text-base" />
                <p>{post.views || 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <BiComment className="text-base" />
                <p>{post.commentCount || 0}</p>
              </div>
              <div className="flex items-center gap-2">
                <FaRegClock className="text-base" />
                <p>{post.estimatedRead || 3} min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const renderUsers = (userList) => {
    if (userList.length === 0) return null;

    return (
      <div className="grid grid-cols-3 gap-6 mt-8">
        {userList.map((user) => (
          <div
            key={user._id}
            onClick={() => router.push(`/profile/${user.username}`)}
            className={`flex flex-col items-center justify-around gap-4 px-4 py-6 rounded-2xl ${
              isDarkMode
                ? "bg-[#2D2D2D] hover:bg-[#353535]"
                : "bg-white hover:bg-gray-50"
            } text-center shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 border ${
              isDarkMode ? "border-[#454545]" : "border-gray-200"
            }`}
          >
            <img
              className="rounded-full object-cover w-20 h-20 border-4 border-[#f75555] hover:border-[#ff6666] transition-colors"
              src={getRandomProfileImage(user.image, user.username)}
              alt={user.name}
              onError={(e) => {
                e.target.src = "/imageProfile1.png";
              }}
            />
            <div className="min-w-0 w-full">
              <h1 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"} truncate`}>
                {user.name}
              </h1>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} mb-2`}>
                @{user.username}
              </p>
              {user.bio && (
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                  {user.bio}
                </p>
              )}
              <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-500"} mt-2`}>
                {user.followers?.length || 0} followers
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (authLoading || !isInitialized) {
    return <Loading />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-500 ${
        isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
      }`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
      
      <div className="w-[1280px] mt-[165px] mb-[70px]">
        {/* Search Header */}
        <div className="flex items-center gap-4 justify-between mb-10">
          <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-4xl font-bold tracking-tight`}>
            Search Results
          </h1>
          <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
        </div>
          
        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div
            className={`w-full flex items-center gap-3 border-b-[1px] py-3 px-4 transition-colors ${
              isDarkMode ? "border-[#ABB2BF]" : "border-gray-400"
            }`}
          >
            <IoSearch className="text-[#ABB2BF] w-5 h-5" />
            <input
              className={`bg-transparent outline-none border-none text-base w-full ${
                isDarkMode ? "text-white placeholder-gray-400" : "text-black placeholder-gray-600"
              }`}
              placeholder="Search posts or users..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#f75555]"></div>
            )}
          </div>
        </form>

        {/* Results Count */}
        {!isLoading && searchQuery && (
          <div className={`mb-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            <p className="text-lg">
              Found {results.posts.length} post{results.posts.length !== 1 ? 's' : ''} and {results.users.length} user{results.users.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-6 mb-10 border-b border-opacity-20" style={{ borderColor: isDarkMode ? '#fff' : '#000' }}>
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 px-2 font-semibold text-lg transition-colors ${
              activeTab === "all"
                ? "text-[#f75555] border-b-2 border-[#f75555]"
                : isDarkMode ? "text-gray-400 hover:text-[#f75555]" : "text-gray-600 hover:text-[#f75555]"
            }`}
          >
            All ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 px-2 font-semibold text-lg transition-colors ${
              activeTab === "posts"
                ? "text-[#f75555] border-b-2 border-[#f75555]"
                : isDarkMode ? "text-gray-400 hover:text-[#f75555]" : "text-gray-600 hover:text-[#f75555]"
            }`}
          >
            Posts ({results.posts.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-3 px-2 font-semibold text-lg transition-colors ${
              activeTab === "users"
                ? "text-[#f75555] border-b-2 border-[#f75555]"
                : isDarkMode ? "text-gray-400 hover:text-[#f75555]" : "text-gray-600 hover:text-[#f75555]"
            }`}
          >
            Users ({results.users.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f75555]"></div>
            <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-lg`}>
              Searching...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalResults === 0 && searchQuery && (
          <div className={`text-center py-20 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            <p className="text-2xl mb-4">No results found for "{searchQuery}"</p>
            <p className="text-lg">Try searching with different keywords</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && totalResults > 0 && (
          <div>
            {/* Posts Section */}
            {posts.length > 0 && (
              <div className="mb-16">
                {activeTab === "all" && (
                  <div className="flex items-center gap-4 justify-between mb-6">
                    <h2 className={`${isDarkMode ? "text-white" : "text-black"} text-2xl font-bold tracking-tight`}>
                      Posts ({results.posts.length})
                    </h2>
                    <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
                  </div>
                )}
                {renderPosts(posts)}
              </div>
            )}

            {/* Users Section */}
            {users.length > 0 && (
              <div>
                {activeTab === "all" && (
                  <div className="flex items-center gap-4 justify-between mb-6 mt-16">
                    <h2 className={`${isDarkMode ? "text-white" : "text-black"} text-2xl font-bold tracking-tight`}>
                      Users ({results.users.length})
                    </h2>
                    <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
                  </div>
                )}
                {renderUsers(users)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}