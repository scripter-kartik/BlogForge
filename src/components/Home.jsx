"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home({ isDarkMode, loginDone, signupDone }) {
  const [userInfo, setUserInfo] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfoAndStats = async () => {
      if (!loginDone && !signupDone) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch user info - CORRECT ORDER: Check status first, then parse JSON
        console.log("Fetching user info...");
        const userRef = await fetch("/api/user/home");

        // ✅ Check status FIRST
        if (!userRef.ok) {
          const errorText = await userRef.text(); // Get error as text first
          console.error(
            `API Error - Status: ${userRef.status}, Response: ${errorText}`
          );
          throw new Error(
            `Failed to fetch user info: ${userRef.status} - ${errorText}`
          );
        }

        // ✅ Only parse JSON if response is OK
        let userData;
        try {
          userData = await userRef.json();
          console.log("User data received:", userData);
        } catch (jsonError) {
          console.error("Failed to parse JSON:", jsonError);
          throw new Error("Invalid JSON response from server");
        }

        setUserInfo(userData);

        // Fetch user stats
        console.log("Fetching user stats for:", userData.username);
        const statsRes = await fetch(`/api/user/stats/${userData.username}`);

        if (!statsRes.ok) {
          const errorText = await statsRes.text();
          console.error(
            `Stats API Error - Status: ${statsRes.status}, Response: ${errorText}`
          );
          throw new Error(
            `Failed to fetch stats: ${statsRes.status} - ${errorText}`
          );
        }

        const statsData = await statsRes.json();
        console.log("Stats data received:", statsData);

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
        console.error("Error fetching user info or stats:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfoAndStats();
  }, [loginDone, signupDone]);

  const handleWritePost = () => {
    router.push("/write");
  };

  // Show loading state
  if ((loginDone || signupDone) && loading) {
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
      {loginDone || signupDone ? (
        <div
          className={`flex flex-col gap-10 justify-between items-start ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          <h1 className="text-4xl font-bold">
            Welcome back{" "}
            <span className="text-[#f75555]">{userInfo?.name || "User"}</span>!
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
