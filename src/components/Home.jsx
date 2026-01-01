"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

export default function Home({ isDarkMode, setIsLoginActive, setIsSignupActive }) {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isAuthenticated || !user?.username) return;

      setLoading(true);
      setError(null);

      try {
        const statsData = await apiClient.getUserStats(user.username);
        setUserStats({
          totalViews: statsData.totalViews || 0,
          totalPosts: statsData.totalPosts || 0,
          viewsPerPosts:
            statsData.totalPosts > 0
              ? (statsData.totalViews / statsData.totalPosts).toFixed(1)
              : "0.0",
          avgRating: statsData.avgRating || 0,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [isAuthenticated, user]);

  const handleWritePost = () => {
    router.push("/write");
  };

  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 lg:mt-32 h-auto flex justify-center items-center">
        <p className={isDarkMode ? "text-white" : "text-black"}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 lg:mt-32 h-auto">
        <div
          className={`text-center ${isDarkMode ? "text-white" : "text-black"}`}
        >
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 border rounded ${isDarkMode
              ? "border-white hover:bg-white hover:text-black"
              : "border-black hover:bg-black hover:text-white"
              }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28 lg:mt-32 h-auto mb-20 md:mb-0">
      {isAuthenticated ? (
        <div
          className={`flex flex-col gap-6 sm:gap-8 lg:gap-10 justify-between items-start ${isDarkMode ? "text-white" : "text-black"
            }`}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
            Welcome back{" "}
            <span className="text-[#f75555]">{user?.name || "User"}</span>!
          </h1>

          {userStats && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              <div
                className={`flex flex-col gap-2 border-[1px] ${isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                  } shadow-lg w-full h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-lg sm:text-xl font-bold">Views</h1>
                <h1 className="text-lg sm:text-xl font-bold">{userStats.totalViews}</h1>
                <p className="text-xs sm:text-sm">+0.0% from last period</p>
              </div>
              <div
                className={`flex flex-col gap-2 border-[1px] ${isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                  } shadow-lg w-full h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-lg sm:text-xl font-bold">Views/Post</h1>
                <h1 className="text-lg sm:text-xl font-bold">{userStats.viewsPerPosts}</h1>
              </div>
              <div
                className={`flex flex-col gap-2 border-[1px] ${isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                  } shadow-lg w-full h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-lg sm:text-xl font-bold">Posts</h1>
                <h1 className="text-lg sm:text-xl font-bold">{userStats.totalPosts}</h1>
              </div>
              <div
                className={`flex flex-col gap-2 border-[1px] ${isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                  } shadow-lg w-full h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-lg sm:text-xl font-bold">Avg Rating</h1>
                <h1 className="text-lg sm:text-xl font-bold">
                  {userStats.avgRating.toFixed(2)}
                </h1>
              </div>
            </div>
          )}

          <button
            onClick={handleWritePost}
            className={`border-[1px] ${isDarkMode
              ? "border-white hover:bg-white"
              : "border-black hover:bg-black hover:text-white"
              } rounded-full px-6 py-[8px] mt-2 hover:text-black hover:animate-pulse w-full sm:w-[200px] h-[50px] text-base sm:text-lg transition-all`}
          >
            Write a post
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 lg:gap-4">
          <div className={`sm:hidden ${isDarkMode ? "text-white" : "text-black"}`}>
            👋 <span onClick={() => setIsLoginActive(true)} className="underline">Login</span> or <span onClick={() => setIsSignupActive(true)} children className="underline">Sign up</span> fot best experience
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end w-full lg:w-auto">
            <img
              className="w-96 h-80 object-contain"
              src="/image.png"
              alt="Community illustration"
            />
          </div>

          <div
            className={`order-2 lg:order-1 flex flex-col gap-4 sm:gap-6 items-center lg:items-start mt-0 sm:mt-4 lg:mt-[28px] ${isDarkMode ? "text-white" : "text-black"
              } text-center lg:text-left`}
          >
            <div className="flex flex-col gap-2 font-bold">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl">Where developers</h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#f75555]">Build, Write, and Share</h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl w-full lg:w-[750px]">
              A space to share ideas, projects, lessons, and stories, and
              connect with a thriving community of tech enthusiasts.
            </p>
            <button
              onClick={() => setIsLoginActive(true)}
              className={`border-[1px] ${isDarkMode
                ? "border-white hover:bg-white"
                : "border-black hover:bg-black hover:text-white"
                } rounded-full px-6 py-[8px] mt-2 hover:text-black hover:animate-pulse transition-all`}
            >
              Join the community
            </button>
          </div>
        </div>
      )}
    </div>
  );
}