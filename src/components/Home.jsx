// src/components/Home.jsx - UPDATED (No localStorage)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

export default function Home({ isDarkMode }) {
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

  // Show loading state
  if (authLoading || (isAuthenticated && loading)) {
    return (
      <div className="w-[1280px] mt-[130px] h-auto flex justify-center items-center">
        <p className={isDarkMode ? "text-white" : "text-black"}>Loading...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-[1280px] mt-[130px] h-auto">
        <div
          className={`text-center ${isDarkMode ? "text-white" : "text-black"}`}
        >
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-4 py-2 border rounded ${
              isDarkMode
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
    <div className="w-[1280px] mt-[130px] h-auto">
      {isAuthenticated ? (
        <div
          className={`flex flex-col gap-10 justify-between items-start ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          <h1 className="text-4xl font-bold">
            Welcome back{" "}
            <span className="text-[#f75555]">{user?.name || "User"}</span>!
          </h1>

          {userStats && (
            <div className="flex justify-center items-center gap-6">
              <div
                className={`flex flex-col gap-2 border-[1px] ${
                  isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-xl font-bold">Views</h1>
                <h1 className="text-xl font-bold">{userStats.totalViews}</h1>
                <p className="text-sm">+0.0% from last period</p>
              </div>
              <div
                className={`flex flex-col gap-2 border-[1px] ${
                  isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-xl font-bold">Views/Post</h1>
                <h1 className="text-xl font-bold">{userStats.viewsPerPosts}</h1>
              </div>
              <div
                className={`flex flex-col gap-2 border-[1px] ${
                  isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-xl font-bold">Posts</h1>
                <h1 className="text-xl font-bold">{userStats.totalPosts}</h1>
              </div>
              <div
                className={`flex flex-col gap-2 border-[1px] ${
                  isDarkMode ? "border-[#494949]" : "border-[#dbdada]"
                } shadow-lg w-[300px] h-[135px] rounded-xl p-5`}
              >
                <h1 className="text-xl font-bold">Avg Rating</h1>
                <h1 className="text-xl font-bold">
                  {userStats.avgRating.toFixed(2)}
                </h1>
              </div>
            </div>
          )}

          <button
            onClick={handleWritePost}
            className={`border-[1px] ${
              isDarkMode
                ? "border-white hover:bg-white"
                : "border-black hover:bg-black hover:text-white"
            } rounded-full px-6 py-[8px] mt-2 hover:text-black hover:animate-pulse w-[200px] h-[50px] text-lg`}
          >
            Write a post
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div
            className={`flex flex-col gap-6 items-start mt-[28px] ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            <div className="flex flex-col gap-2 font-bold">
              <h1 className="text-5xl">Where developers</h1>
              <h1 className="text-6xl">Build, Write, and Share</h1>
            </div>
            <p className="text-xl w-[750px]">
              A space to share ideas, projects, lessons, and stories, and
              connect with a thriving community of tech enthusiasts.
            </p>
            <button
              className={`border-[1px] ${
                isDarkMode
                  ? "border-white hover:bg-white"
                  : "border-black hover:bg-black hover:text-white"
              } rounded-full px-6 py-[8px] mt-2 hover:text-black hover:animate-pulse`}
            >
              Join the community
            </button>
          </div>
          <div>
            <img className="w-96 h-80" src="/image.png" alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
