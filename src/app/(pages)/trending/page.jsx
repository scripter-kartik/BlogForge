"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FaRegStar, FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { usePosts } from "@/context/PostsContext";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage";
import Image from "next/image";

const PAGE_SIZE = 10;

export default function TrendingPage() {
  const { posts, setPosts } = usePosts();
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setIsDarkMode(saved === "true");
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode, isInitialized]);

  useEffect(() => {
    if (posts.length > 0) return;
    async function fetchPosts() {
      try {
        const data = await apiClient.getAllPosts();
        if (Array.isArray(data)) setPosts(data);
      } catch (err) {
        setError("Failed to load trending posts.");
      }
    }
    fetchPosts();
  }, []);

  const allTrendingPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .map((post) => ({
        ...post,
        starRating: post.averageRating || post.starRating || 4,
        views: post.views || 0,
        commentCount: post.commentCount || 0,
        estimatedRead: post.estimatedRead || 3,
        authorName: post.author?.name || "Anonymous",
        authorImage: getRandomProfileImage(
          post.author?.image,
          post.author?.name,
        ),
      }));
  }, [posts]);

  const visiblePosts = allTrendingPosts.slice(0, visibleCount);
  const hasMore = visibleCount < allTrendingPosts.length;

  if (!isInitialized) return null;

  if (error) {
    return (
      <div
        className={`w-full min-h-screen flex justify-center items-center px-4 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"}`}
      >
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"}`}
    >
      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
      />

      <div className="w-full max-w-[1280px] mt-20 sm:mt-20 md:mt-24 mb-12 sm:mb-16 md:mb-[70px] px-4 sm:px-6 lg:px-8">
        {visiblePosts.length === 0 ? (
          <p
            className={`w-full text-center mt-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            No trending posts yet.
          </p>
        ) : (
          visiblePosts.map((post) => (
            <div
              key={post._id}
              className="w-full mt-6 sm:mt-8 cursor-pointer group"
              onClick={() => router.push(`/blog/${post._id}`)}
            >
              <div
                className={`flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${isDarkMode ? "bg-[#2D2D2D] text-white hover:bg-[#353535]" : "bg-[#E8EAEC] text-black hover:bg-[#dfe1e4]"}`}
              >
                {post.coverImage && (
                  <div className="relative w-full md:w-52 h-48 md:h-40 flex-shrink-0 rounded-lg overflow-hidden group-hover:shadow-md transition-shadow">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 208px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <h1
                      className={`font-bold text-xl sm:text-2xl leading-tight break-words ${isDarkMode ? "text-white" : "text-black"}`}
                    >
                      {post.title}
                    </h1>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                        <Image
                          src={post.authorImage}
                          alt={post.authorName}
                          fill
                          sizes="32px"
                          className="rounded-full border-2 border-[#f75555] object-cover"
                        />
                      </div>
                      <p
                        className={`text-sm font-medium truncate ${isDarkMode ? "text-white" : "text-black"}`}
                      >
                        {post.authorName}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm sm:text-base line-clamp-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
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
                      <span
                        className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                      >
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium flex-wrap ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                  >
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
          ))
        )}

        {hasMore && (
          <div className="flex justify-center mt-10 sm:mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className={`px-8 py-3 rounded-full font-medium text-sm transition-all ${isDarkMode ? "border border-white text-white hover:bg-white hover:text-black" : "border border-black text-black hover:bg-black hover:text-white"}`}
            >
              Load more
            </button>
          </div>
        )}

        {!hasMore && visiblePosts.length > 0 && (
          <p
            className={`text-center mt-10 sm:mt-12 text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            You've reached the end
          </p>
        )}
      </div>
    </div>
  );
}
