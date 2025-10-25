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

export default function ForYouPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const router = useRouter();

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
        className="w-[1280px] mt-8 cursor-pointer"
        onClick={() => router.push(`/blog/${post._id}`)}
      >
        <div
          className={`flex gap-6 p-5 rounded-lg transition-colors duration-500 ${
            isDarkMode ? "bg-[#2D2D2D] text-white" : "bg-[#f6f6f7] text-black"
          } hover:shadow-lg`}
        >
          {post.coverImage && (
            <img
              className="w-52 h-40 object-cover rounded-lg"
              src={post.coverImage}
              alt={post.title}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center">
              <h1 className={`font-bold text-xl ${isDarkMode ? "text-white" : "text-black"}`}>
                {post.title}
              </h1>

              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src={post.authorImage}
                  alt={post.authorName}
                  onError={(e) => (e.target.src = "/imageProfile1.png")}
                />
                {post.authorUsername ? (
                  <Link
                    href={`/profile/${post.authorUsername}`}
                    className={isDarkMode ? "text-white hover:underline" : "text-black hover:underline"}
                  >
                    {post.authorName}
                  </Link>
                ) : (
                  <p className={isDarkMode ? "text-white" : "text-black"}>{post.authorName}</p>
                )}
              </div>
            </div>

            <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              {post.description}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {post.tags?.map((tag, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-1 text-xs rounded transition-colors duration-500 ${
                    isDarkMode ? "bg-[#454343] text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  #{tag}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-1">
                <FaRegStar className="text-yellow-500" />
                <p>{post.starRating.toFixed(1)}</p>
              </div>
              <div className="flex items-center gap-1">
                <IoEyeOutline />
                <p>{post.views}</p>
              </div>
              <div className="flex items-center gap-1">
                <BiComment />
                <p>{post.commentCount}</p>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock />
                <p>{post.estimatedRead} min read</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <p className={isDarkMode ? "text-white" : "text-black"}>Loading personalized posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"}`}>
      {/* Centered Navbar */}
      <div className="fixed top-0 w-full flex justify-center z-50">
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>

      {/* Posts */}
      <div className="max-w-[1280px] mx-auto pt-28 px-6 pb-16">
        {renderPosts(posts)}

        {/* End of posts message */}
        {posts.length > 0 && (
          <p className={`text-center mt-12 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
             You’ve reached the end
          </p>
        )}
      </div>
    </div>
  );
}
