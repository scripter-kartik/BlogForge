// src/components/FollowersModal.jsx
"use client";

import { useEffect, useState } from "react";
import { useFollow } from "@/hooks/useFollow";
import { getRandomProfileImage } from "@/lib/profileImage";
import { useRouter } from "next/navigation";

export default function FollowersModal({
  isOpen,
  onClose,
  type,
  userIds,
  isDarkMode,
  onFollowChange,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFollow } = useFollow();
  const [followingStates, setFollowingStates] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (!isOpen || !userIds || userIds.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Fetch current user's following list
        const currentUserRes = await fetch("/api/user/home");
        const currentUserData = await currentUserRes.json();
        const currentUserFollowing = currentUserData.following || [];

        const userPromises = userIds.map((userId) => {
          // Convert ObjectId to string if needed
          const id = typeof userId === "object" ? userId.toString() : userId;
          return fetch(`/api/user/by-id/${id}`)
            .then((res) => res.json())
            .catch((err) => {
              console.error("Error fetching user:", err);
              return null;
            });
        });
        
        const fetchedUsers = await Promise.all(userPromises);
        const validUsers = fetchedUsers.filter((u) => u && !u.error);
        setUsers(validUsers);

        // Initialize following states based on current user's following list
        const states = {};
        validUsers.forEach((user) => {
          const isFollowing = currentUserFollowing.some(
            (followingId) => followingId.toString() === user._id
          );
          states[user._id] = isFollowing;
        });
        setFollowingStates(states);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userIds]);

  const handleFollowClick = async (userId, currentState) => {
    const result = await toggleFollow(userId, currentState);
    if (result) {
      setFollowingStates((prev) => ({
        ...prev,
        [userId]: result.isFollowing,
      }));
    }
  };

  const handleUserClick = (username) => {
    router.push(`/profile/${username}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`${
          isDarkMode ? "bg-[#2D2D2D] text-white" : "bg-white text-black"
        } rounded-lg shadow-lg w-96 max-h-96 flex flex-col`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <h2 className="text-lg font-bold capitalize">{type}</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Loading...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                No {type} yet
              </p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className={`flex items-center justify-between p-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                } hover:opacity-80 transition-opacity`}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => handleUserClick(user.username)}
                >
                  <img
                    src={getRandomProfileImage(user.image, user.username)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/imageProfile1.png";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      @{user.username}
                    </p>
                  </div>
                </div>

                {type === "following" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowClick(user._id, followingStates[user._id]);
                    }}
                    className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
                      followingStates[user._id]
                        ? isDarkMode
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-400 hover:bg-gray-500 text-white"
                        : "bg-[#f75555] hover:bg-red-600 text-white"
                    }`}
                  >
                    {followingStates[user._id] ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}