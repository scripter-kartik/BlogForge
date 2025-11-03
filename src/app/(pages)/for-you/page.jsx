// ==========================================
// FILE 4: app/(pages)/for-you/page.jsx
// ==========================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FaRegStar, FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage";
import Loading from "@/components/Loading";

export default function ForYouPage() {
  const [posts, setPosts] = useState([]);
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
    async function fetchForYou() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getForYouBlogs();

        const normalized = (Array.isArray(data) ? data : []).map((post) => ({
          ...post,
          starRating: post.starRating ?? 4,
          views: post.views ?? 0,
          commentCount: post.commentCount ?? 0,
          estimatedRead: post.estimatedRead ?? 3,
          authorName: post.author?.name || "Anonymous",
          authorUsername: post.author?.username || null,
          authorImage: getRandomProfileImage(post.author?.image, post.author?.name || post.author?.username),
        }));

        setPosts(normalized);
      } catch (err) {
        console.error("Failed to load For You posts:", err);
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
      }
    }

    fetchForYou();
  }, []);

  const renderPosts = (list) => {
    if (!list.length) {
      return (
        <p className={`w-full text-center mt-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          No personalized posts yet.
        </p>
      );
    }

    return list.map((post) => (
      <div
        key={post._id}
        className="w-full mt-8 cursor-pointer group"
        onClick={() => router.push(`/blog/${post._id}`)}
      >
        <div
          className={`flex gap-6 p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
            isDarkMode ? "bg-[#2D2D2D] text-white hover:bg-[#353535]" : "bg-[#E8EAEC] text-black hover:bg-[#dfe1e4]"
          }`}
        >
          {post.coverImage && (
            <img
              className="w-52 h-40 object-cover rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0"
              src={post.coverImage}
              alt={post.title}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex justify-between items-start gap-4">
              <h1 className={`font-bold text-2xl leading-tight ${isDarkMode ? "text-white" : "text-black"}`}>
                {post.title}
              </h1>

              <div className="flex items-center gap-2 flex-shrink-0">
                <img
                  className="w-8 h-8 rounded-full border-2 border-[#f75555]"
                  src={post.authorImage}
                  alt={post.authorName}
                  onError={(e) => (e.target.src = "/imageProfile1.png")}
                />
                {post.authorUsername ? (
                  <Link
                    href={`/profile/${post.authorUsername}`}
                    className={`text-sm font-medium ${isDarkMode ? "text-white hover:underline" : "text-black hover:underline"}`}
                  >
                    {post.authorName}
                  </Link>
                ) : (
                  <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>{post.authorName}</p>
                )}
              </div>
            </div>

            <p className={`text-base ${isDarkMode ? "text-gray-300" : "text-gray-700"} line-clamp-2`}>
              {post.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {post.tags?.map((tag, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                    isDarkMode ? "bg-[#3a3a3a] text-gray-300" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  #{tag}
                </div>
              ))}
            </div>

            <div className={`flex items-center gap-6 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              <div className="flex items-center gap-2 hover:text-[#f75555] transition-colors">
                <FaRegStar className="text-yellow-500 text-base" />
                <p>{post.starRating.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-2">
                <IoEyeOutline className="text-base" />
                <p>{post.views}</p>
              </div>
              <div className="flex items-center gap-2">
                <BiComment className="text-base" />
                <p>{post.commentCount}</p>
              </div>
              <div className="flex items-center gap-2">
                <FaRegClock className="text-base" />
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
      <div className={`w-full min-h-screen flex justify-center items-center ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"}`}>
        <p className="text-red-500">{error}</p>
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

      <div className="w-[1280px] mt-[165px] mb-[70px]">
        <div className="flex items-center gap-4 justify-between mb-10">
          <h1 className={`${isDarkMode ? "text-white" : "text-black"} text-4xl font-bold tracking-tight`}>
            For You
          </h1>
          <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
        </div>

        {renderPosts(posts)}

        {posts.length > 0 && (
          <p className={`text-center mt-12 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            You've reached the end
          </p>
        )}
      </div>
    </div>
  );
}