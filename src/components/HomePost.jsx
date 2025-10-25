"use client";

import { FaRegStar } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { FaRegClock } from "react-icons/fa";
import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsContext";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage";
import { useRouter } from "next/navigation";

export default function HomePost({ isDarkMode }) {
  const { posts, setPosts } = usePosts();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const data = await apiClient.getAllPosts();

        // Normalize data
        const normalized = data.map((post) => ({
          ...post,
          id: post._id,
          starRating: post.starRating || 4,
          views: post.views || 0,
          commentCount: post.commentCount || 0,
          estimatedRead: post.estimatedRead || 3,
          authorName: post.authorName || "Anonymous",
          authorImage: getRandomProfileImage(
            post.authorImage,
            post.authorName || post.author
          ),
        }));

        setPosts(normalized);
      } catch (error) {
        console.error("Error in HomePost:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setPosts]);

  useEffect(() => {
    async function fetchSuggestedUsers() {
      try {
        const res = await fetch("/api/suggested-users");
        const data = await res.json();
        setSuggestedUsers(data);
      } catch (error) {
        console.error("Failed to load suggested users", error);
      }
    }
    fetchSuggestedUsers();
  }, []);

  // 🔥 Auto-generate sections
  const getFeaturedPosts = () =>
    [...posts]
      .sort((a, b) => b.starRating - a.starRating)
      .slice(0, 2);

  const getTrendingPosts = () =>
    [...posts]
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

  const getLatestPosts = () =>
    [...posts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

  const renderPosts = (postList) => {
    if (postList.length === 0) {
      return (
        <div
          className={`w-[1280px] mt-8 text-center py-8 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <p>No posts found.</p>
        </div>
      );
    }

    return postList.map((post) => (
      <div
        key={post._id}
        className="w-[1280px] mt-8 cursor-pointer"
        onClick={() => router.push(`/blog/${post._id}`)}
      >
        <div
          className={`w-[1280px] ${
            isDarkMode ? "text-white bg-[#2D2D2D]" : "text-black bg-[#eeeded]"
          } flex gap-6 p-5 rounded-lg transition-colors duration-500 hover:shadow-lg`}
        >
          {post.coverImage && (
            <img
              className="w-52 h-40 object-cover rounded-lg"
              src={post.coverImage}
              alt={post.title}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex flex-row justify-between items-center">
              <h1 className="font-bold text-xl">{post.title}</h1>
              <div className="flex items-center gap-2 mr-5">
                <img
                  className="w-6 h-6 rounded-full"
                  src={post.authorImage}
                  alt={post.authorName}
                  onError={(e) => {
                    e.target.src = "/imageProfile1.png";
                  }}
                />
                <p>{post.authorName}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {post.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags?.map((tag, idx) => (
                <div
                  key={idx}
                  className={`${
                    isDarkMode ? "bg-[#454343]" : "bg-gray-200"
                  } px-2 py-1 text-xs rounded transition-colors duration-500`}
                >
                  #{tag}
                </div>
              ))}
            </div>
            <div
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } flex items-center gap-4 text-sm`}
            >
              <div className="flex items-center gap-1">
                <FaRegStar className="text-yellow-500" />
                <p>{post.starRating}.0</p>
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
      <div className="w-[1280px] mt-[165px] mb-[70px] flex justify-center items-center">
        <p className={isDarkMode ? "text-white" : "text-black"}>
          Loading posts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[1280px] mt-[165px] mb-[70px] text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={`px-4 py-2 border rounded ${
            isDarkMode
              ? "border-white text-white hover:bg-white hover:text-black"
              : "border-black text-black hover:bg-black hover:text-white"
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  const featured = getFeaturedPosts();
  const trending = getTrendingPosts();
  const latest = getLatestPosts();

  return (
    <div className="w-[1280px] mt-[165px] mb-[70px]">
      {/* Featured Posts Section */}
      <div className="flex items-center gap-2 justify-between">
        <h1
          className={`${
            isDarkMode ? "text-white" : "text-black"
          } text-3xl font-bold`}
        >
          Featured posts
        </h1>
        <hr className="w-[1000px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPosts(featured)}

      {/* Suggested Users Section */}
      {isAuthenticated && (
        <div>
          <div className="flex items-center gap-2 justify-between mt-28">
            <h1
              className={`${
                isDarkMode ? "text-white" : "text-black"
              } text-3xl font-bold`}
            >
              Suggested Users
            </h1>
            <hr className="w-[1000px] border-t-[1px] border-[#f75555]" />
          </div>
          <div className="flex mt-16 gap-4 w-[1280px] overflow-x-auto [&::-webkit-scrollbar]:hidden bg-gradient-to-r from-black/10 via-transparent to-black/10 pb-4">
            {suggestedUsers.map((user, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="flex flex-col items-center justify-around gap-2 px-2 py-3 w-[220px] h-[280px] rounded-xl bg-[#2c2a2a] text-center shadow-lg">
                  <img
                    className="rounded-full object-cover w-[90px] h-[90px] border-4 border-[#f75555]"
                    src={getRandomProfileImage(user.image, user.name)}
                    alt={user.name}
                    onError={(e) => {
                      e.target.src = "/imageProfile1.png";
                    }}
                  />
                  <div>
                    <h1 className="text-white font-bold">{user.name}</h1>
                    <p className="text-[#7a7a7a] text-sm">{user.bio}</p>
                  </div>
                  <button className="bg-[#f75555] rounded-full w-[195px] text-center text-white px-5 py-2 hover:bg-red-600 transition-colors">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts Section */}
      <div className="flex items-center gap-2 mt-32 justify-between">
        <h1
          className={`${
            isDarkMode ? "text-white" : "text-black"
          } text-3xl font-bold`}
        >
          Trending posts
        </h1>
        <hr className="w-[1000px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPosts(trending)}

      {/* Latest Posts Section */}
      <div className="flex items-center gap-2 mt-32 justify-between">
        <h1
          className={`${
            isDarkMode ? "text-white" : "text-black"
          } text-3xl font-bold`}
        >
          Latest posts
        </h1>
        <hr className="w-[1000px] border-t-[1px] border-[#f75555]" />
      </div>
      {renderPosts(latest)}
    </div>
  );
}
