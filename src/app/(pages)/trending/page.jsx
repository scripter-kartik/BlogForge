// ==========================================
// FILE 2: app/(pages)/trending/page.jsx
// ==========================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FaRegStar, FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage";
import Loading from "@/components/Loading";

export default function TrendingPage() {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    async function fetchTrendingPosts() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getTrendingBlogs();

        const normalized = data.map((post) => ({
          ...post,
          starRating: post.starRating || 4,
          views: post.views || 0,
          commentCount: post.commentCount || 0,
          estimatedRead: post.estimatedRead || 3,
          authorName: post.author?.name || "Anonymous",
          authorImage: getRandomProfileImage(post.author?.image, post.author?.name),
        }));

        setTrendingPosts(normalized);
      } catch (err) {
        console.error("Failed to load trending posts:", err);
        setError("Failed to load trending posts.");
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingPosts();
  }, []);

  const renderPosts = (posts) => {
    if (!posts.length) {
      return (
        <p className={`w-full text-center mt-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          No trending posts yet.
        </p>
      );
    }

    return posts.map((post) => (
      <div key={post._id} className="w-full mt-6 sm:mt-8 cursor-pointer group" onClick={() => router.push(`/blog/${post._id}`)}>
        <div className={`flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${isDarkMode ? "bg-[#2D2D2D] text-white hover:bg-[#353535]" : "bg-[#E8EAEC] text-black hover:bg-[#dfe1e4]"}`}>
          {post.coverImage && (
            <img 
              className="w-full md:w-52 h-48 md:h-40 object-cover rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0" 
              src={post.coverImage} 
              alt={post.title} 
              onError={(e) => (e.target.style.display = "none")} 
            />
          )}
          <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
              <h1 className={`font-bold text-xl sm:text-2xl leading-tight break-words ${isDarkMode ? "text-white" : "text-black"}`}>
                {post.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <img 
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#f75555]" 
                  src={post.authorImage} 
                  alt={post.authorName} 
                  onError={(e) => (e.target.src = "/imageProfile1.png")} 
                />
                <p className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-black"}`}>
                  {post.authorName}
                </p>
              </div>
            </div>
            <p className={`text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"} line-clamp-2`}>
              {post.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags?.slice(0, 3).map((tag, idx) => (
                <div 
                  key={idx} 
                  className={`px-2 sm:px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${isDarkMode ? "bg-[#3a3a3a] text-gray-300" : "bg-gray-200 text-gray-700"}`}
                >
                  #{tag}
                </div>
              ))}
              {post.tags?.length > 3 && (
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  +{post.tags.length - 3} more
                </span>
              )}
            </div>
            <div className={`flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium flex-wrap ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              <div className="flex items-center gap-1.5 sm:gap-2 hover:text-[#f75555] transition-colors">
                <FaRegStar className="text-yellow-500 text-sm sm:text-base flex-shrink-0" />
                <p>{post.starRating.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <IoEyeOutline className="text-sm sm:text-base flex-shrink-0" />
                <p>{post.views}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <BiComment className="text-sm sm:text-base flex-shrink-0" />
                <p>{post.commentCount}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FaRegClock className="text-sm sm:text-base flex-shrink-0" />
                <p>{post.estimatedRead} min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (!isInitialized || loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={`w-full min-h-screen flex justify-center items-center px-4 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"}`}>
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"}`}>
      <Navbar 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
      />

      <div className="w-full max-w-[1280px] mt-20 sm:mt-20 md:mt-20 mb-12 sm:mb-16 md:mb-[70px] px-4 sm:px-6 lg:px-8">

        {renderPosts(trendingPosts)}

        {trendingPosts.length > 0 && (
          <p className={`text-center mt-10 sm:mt-12 text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            You've reached the end
          </p>
        )}
      </div>
    </div>
  );
}