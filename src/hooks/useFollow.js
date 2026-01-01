"use client";

import { useState } from "react";

export function useFollow() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followingState, setFollowingState] = useState({});

  const toggleFollow = async (targetUserId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || "Failed to process follow request";
        throw new Error(errorMessage);
      }

      setFollowingState((prev) => ({
        ...prev,
        [targetUserId]: data.isFollowing,
      }));

      return data;
    } catch (err) {
      const errorMessage = err.message || "Failed to process follow request";
      setError(errorMessage);
      console.error("Follow error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    toggleFollow,
    loading,
    error,
    followingState,
    clearError,
  };
}