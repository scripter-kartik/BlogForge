"use client";

import { FaRegStar } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";
import { FaRegClock } from "react-icons/fa";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { usePosts } from "@/context/PostsContext";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage";
import { useRouter } from "next/navigation";

export default function HomePost({ isDarkMode }) {
  const { posts, setPosts } = usePosts();
  const { isAuthenticated, user } = useAuth();
  const { toggleFollow, loading: followLoading } = useFollow();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followStates, setFollowStates] = useState({});
  const scrollContainerRef = useRef(null);
  const router = useRouter();

  // Gradient colors for fallback
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

  // Function to get gradient for post
  const getGradientForPost = (postId) => {
    const hash = postId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const data = await apiClient.getAllPosts();

        const normalized = data.map((post) => ({
          ...post,
          id: post._id,
          starRating: post.starRating || 4,
          views: post.views || 0,
          commentCount: post.commentCount || 0,
          estimatedRead: post.estimatedRead || 3,
          // Get author name from populated author object or fallback
          authorName: post.author?.name || post.authorName || "Anonymous",
          // Get author image from populated author object or fallback
          authorImage: getRandomProfileImage(
            post.author?.image || post.authorImage,
            post.author?.name || post.authorName || "Anonymous"
          ),
          // Add gradient fallback color
          gradientColor: getGradientForPost(post._id),
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
        console.log("👤 Fetching suggested users. Current user:", user);

        const res = await fetch("/api/suggested-users");
        const data = await res.json();

        console.log("📝 Suggested users response:", data);

        if (!Array.isArray(data)) {
          console.error("❌ Suggested users data is not an array:", data);
          setSuggestedUsers([]);
          return;
        }

        // ✅ Check if current user is in the list
        const currentUserInList = data.find(u => u._id === user?.id || u._id?.toString() === user?.id);
        if (currentUserInList) {
          console.warn("⚠️ WARNING: Current user found in suggestions:", currentUserInList);
        } else {
          console.log("✅ Current user is correctly excluded from suggestions");
        }

        setSuggestedUsers(data);

        const userRes = await fetch("/api/user/home");
        const userData = await userRes.json();
        const followingIds = userData.following || [];

        const states = {};
        data.forEach((suggestedUser) => {
          states[suggestedUser._id] = followingIds.some(id => id.toString() === suggestedUser._id);
        });
        setFollowStates(states);
      } catch (error) {
        console.error("❌ Failed to load suggested users", error);
        setSuggestedUsers([]);
      }
    }

    if (isAuthenticated) {
      console.log("🔄 isAuthenticated changed, fetching suggested users");
      fetchSuggestedUsers();
    }
  }, [isAuthenticated, user]);

  const handleFollowClick = async (e, userId) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    const currentState = followStates[userId] || false;
    const result = await toggleFollow(userId, currentState);

    if (result) {
      setFollowStates((prev) => ({
        ...prev,
        [userId]: result.isFollowing,
      }));
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
          className={`w-[1280px] mt-8 text-center py-8 ${isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
        >
          <p className="text-lg">No posts found.</p>
        </div>
      );
    }

    return postList.map((post) => (
      <div
        key={post._id}
        className="w-[1280px] mt-8 cursor-pointer group"
        onClick={() => router.push(`/blog/${post._id}`)}
      >
        <div
          className={`w-[1280px] ${isDarkMode
            ? "text-white bg-[#2D2D2D] hover:bg-[#353535]"
            : "text-black bg-[#E8EAEC] hover:bg-[#dfe1e4]"
            } flex gap-6 p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
        >
          {/* Cover Image or Gradient Fallback */}
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
              className={`w-52 h-40 rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0 ${post.gradientColor}`}
            />
          )}

          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-row justify-between items-start gap-4">
              <h1 className="font-bold text-2xl leading-tight">{post.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <img
                  className="w-8 h-8 rounded-full border-2 border-[#f75555]"
                  src={post.authorImage}
                  alt={post.authorName}
                  onError={(e) => {
                    e.target.src = "/imageProfile1.png";
                  }}
                />
                <p className="text-sm font-medium">{post.authorName}</p>
              </div>
            </div>
            <p
              className={`${isDarkMode ? "text-gray-300" : "text-gray-700"
                } line-clamp-2 text-base`}
            >
              {post.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags?.map((tag, idx) => (
                <div
                  key={idx}
                  className={`${isDarkMode
                    ? "bg-[#3a3a3a] text-gray-300"
                    : "bg-gray-200 text-gray-700"
                    } px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300`}
                >
                  #{tag}
                </div>
              ))}
            </div>
            <div
              className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                } flex items-center gap-6 text-sm font-medium`}
            >
              <div className="flex items-center gap-2 hover:text-[#f75555] transition-colors">
                <FaRegStar className="text-yellow-500 text-base" />
                <p>{post.starRating}.0</p>
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

  if (loading) {
    return (
      <div className="w-[1280px] mt-[165px] mb-[70px] flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f75555]"></div>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-lg`}>
            Loading posts...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[1280px] mt-[165px] mb-[70px] text-center">
        <p className="text-red-500 mb-6 text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${isDarkMode
            ? "border-2 border-white text-white hover:bg-white hover:text-black"
            : "border-2 border-black text-black hover:bg-black hover:text-white"
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
      <div className="flex items-center gap-4 justify-between mb-10">
        <h1
          className={`${isDarkMode ? "text-white" : "text-black"
            } text-4xl font-bold tracking-tight`}
        >
          Featured Posts
        </h1>
        <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
      </div>
      {renderPosts(featured)}

      {/* Suggested Users Section */}
      {isAuthenticated && suggestedUsers.length > 0 && (
        <div className="mt-32">
          <div className="flex items-center gap-4 justify-between mb-8">
            <h1
              className={`${isDarkMode ? "text-white" : "text-black"
                } text-4xl font-bold tracking-tight`}
            >
              Suggested For You
            </h1>
            <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
          </div>

          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scroll("left")}
              className={`absolute -left-16 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${isDarkMode
                ? "bg-[#2D2D2D] hover:bg-[#f75555] text-white"
                : "bg-gray-200 hover:bg-[#f75555] text-black hover:text-white"
                } opacity-0 group-hover:opacity-100`}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Suggested Users Container */}
            <div
              ref={scrollContainerRef}
              className={`flex gap-6 overflow-x-auto scroll-smooth pb-6 px-2 transition-colors duration-500 ${isDarkMode
                ? "bg-gradient-to-r from-[#1c1d1d] via-[#2D2D2D] to-[#1c1d1d]"
                : "bg-gradient-to-r from-[#f6f6f7] via-[#f5f5f5] to-[#f6f6f7]"
                } rounded-2xl [&::-webkit-scrollbar]:hidden`}
            >
              {suggestedUsers.map((user) => (
                <div key={user._id} className="flex-shrink-0">
                  <div
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className={`flex flex-col items-center justify-around gap-4 px-4 py-6 w-[240px] h-[300px] rounded-2xl ${isDarkMode
                      ? "bg-[#353535] hover:bg-[#3f3f3f]"
                      : "bg-white hover:bg-gray-50"
                      } text-center shadow-lg hover:shadow-2xl cursor-pointer transition-colors duration-300 hover:scale-105 border ${isDarkMode ? "border-[#454545]" : "border-gray-200"
                      }`}
                  >
                    <img
                      className="rounded-full object-cover w-24 h-24 border-4 border-[#f75555] hover:border-[#ff6666] transition-colors"
                      src={getRandomProfileImage(user.image, user.name)}
                      alt={user.name}
                      onError={(e) => {
                        e.target.src = "/imageProfile1.png";
                      }}
                    />
                    <div className="min-w-0">
                      <h1 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"} truncate`}>
                        {user.name}
                      </h1>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"} line-clamp-2`}>
                        {user.bio}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleFollowClick(e, user._id)}
                      disabled={followLoading}
                      className={`rounded-full w-full text-center text-white px-4 py-2.5 font-semibold transition-all duration-300 ${followStates[user._id]
                        ? isDarkMode
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-gray-400 hover:bg-gray-500"
                        : "bg-[#f75555] hover:bg-[#ff6666] hover:shadow-lg"
                        } ${followLoading ? "opacity-50 cursor-not-allowed" : ""} active:scale-95`}
                    >
                      {followLoading ? "..." : followStates[user._id] ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll("right")}
              className={`absolute -right-16 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-all duration-300 ${isDarkMode
                ? "bg-[#2D2D2D] hover:bg-[#f75555] text-white"
                : "bg-gray-200 hover:bg-[#f75555] text-black hover:text-white"
                } opacity-0 group-hover:opacity-100`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Trending Posts Section */}
      <div className="flex items-center gap-4 justify-between mb-10 mt-32">
        <h1
          className={`${isDarkMode ? "text-white" : "text-black"
            } text-4xl font-bold tracking-tight`}
        >
          Trending Posts
        </h1>
        <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
      </div>
      {renderPosts(trending)}

      {/* Latest Posts Section */}
      <div className="flex items-center gap-4 justify-between mb-10 mt-32">
        <h1
          className={`${isDarkMode ? "text-white" : "text-black"
            } text-4xl font-bold tracking-tight`}
        >
          Latest Posts
        </h1>
        <div className={`flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"}`}></div>
      </div>
      {renderPosts(latest)}
    </div>
  );
}