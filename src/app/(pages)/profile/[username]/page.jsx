"use client";

import Navbar from "../../../../components/Navbar.jsx";
import FollowersModal from "../../../../components/FollowersModal.jsx";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage.js";
import { signOut } from "next-auth/react";

export default function Profile() {
  const params = useParams();
  const username = params.username;
  const router = useRouter();

  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const { toggleFollow, loading: followLoading } = useFollow();

  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    bio: "",
    password: "",
  });

  // Fetch profile data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) return;

      try {
        const userData = await apiClient.getUserByUsername(username);
        if (!userData) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setUser(userData);
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          name: userData.name || "",
          bio: userData.bio || "",
          password: "",
        });

        const stats = await apiClient.getUserStats(userData.username);
        setUserStats(stats);

        const postsData = await apiClient.getUserPosts(userData.username);
        setUserPosts(postsData.posts || []);

        // Check if current user is following this user
        if (isAuthenticated && authUser?._id) {
          const isUserFollowing = userData.followers?.some(
            (followerId) => followerId.toString() === authUser._id
          );
          setIsFollowing(isUserFollowing || false);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, isAuthenticated, authUser]);

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    const result = await toggleFollow(user._id, isFollowing);
    if (result) {
      setIsFollowing(result.isFollowing);
      // Update stats to reflect new follower count
      setUserStats((prev) => ({
        ...prev,
        followers: result.followersCount,
      }));
    }
  };

  // Handle updates (only for own profile)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profileImage", file);
    uploadData.append("username", formData.username);
    uploadData.append("email", formData.email);
    uploadData.append("name", formData.name);
    uploadData.append("bio", formData.bio);
    if (formData.password) uploadData.append("password", formData.password);

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/protected/user/update", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile image");
      }

      const data = await res.json();

      if (data.user?.image) {
        setSuccess("Profile image updated!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error("Image update failed");
      }
    } catch (err) {
      setError(err.message || "Error uploading image");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const uploadData = new FormData();
      uploadData.append("username", formData.username);
      uploadData.append("email", formData.email);
      uploadData.append("name", formData.name);
      uploadData.append("bio", formData.bio);
      if (formData.password.trim() !== "") {
        uploadData.append("password", formData.password);
      }

      const res = await fetch("/api/protected/user/update", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));

      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Profile update error:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f75555] mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex justify-center mt-32 text-red-500 text-lg">
        {error}
      </div>
    );
  }

  const isOwnProfile = authUser?.username === user?.username;

  return (
    <div
      className={`flex flex-col items-center min-h-screen w-screen ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      } transition-colors duration-500`}
    >
      <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div
        className={`mt-32 flex flex-col w-[1280px] ${
          isDarkMode ? "text-white" : "text-black"
        } transition-colors duration-500`}
      >
        <div className="flex items-start justify-between w-full">
          {/* Profile Sidebar */}
          <div className="flex flex-col items-center gap-6 w-80">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#f75555] group">
              <img
                src={getRandomProfileImage(user?.image, user?.username)}
                alt={user?.name || "Profile"}
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <>
                  <label
                    htmlFor="profileImageInput"
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition-opacity cursor-pointer"
                  >
                    Change Picture
                  </label>
                  <input
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={saving}
                  />
                </>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setModalType("followers");
                  setModalOpen(true);
                }}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                {userStats?.followers || 0} followers
              </button>
              <button
                onClick={() => {
                  setModalType("following");
                  setModalOpen(true);
                }}
                className="hover:opacity-70 transition-opacity cursor-pointer"
              >
                {userStats?.following || 0} following
              </button>
            </div>

            <div className="flex gap-4">
              <p>{userStats?.totalPosts || 0} posts</p>
              <p>Avg Rating: {userStats?.avgRating?.toFixed(2) || "0.00"}</p>
            </div>

            <p className="text-gray-400 text-sm">
              Member since {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
            </p>

            {isOwnProfile ? (
              <button
                onClick={handleLogout}
                className="border-[1px] border-[#f75555] text-[#f75555] px-4 py-1 rounded hover:text-red-600 hover:border-red-600 transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleFollowClick}
                disabled={followLoading}
                className={`px-6 py-2 rounded font-medium transition-colors ${
                  isFollowing
                    ? isDarkMode
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-400 hover:bg-gray-500 text-white"
                    : "bg-[#f75555] hover:bg-red-600 text-white"
                } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>

          {/* Profile Details */}
          <div className="flex flex-col gap-4 items-start w-[900px]">
            <h1 className="text-4xl font-bold mb-8">
              {isOwnProfile ? `Welcome, ${user?.name || "User"}` : user?.name}
            </h1>

            {isOwnProfile ? (
              <>
                {/* Editable fields */}
                {["username", "email", "name", "password", "bio"].map((field) => (
                  <div className="flex flex-col w-full" key={field}>
                    <label
                      htmlFor={field}
                      className="text-sm font-light mb-1 capitalize"
                    >
                      {field}
                    </label>
                    {field === "bio" ? (
                      <textarea
                        id={field}
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        className={`w-full px-3 py-2 font-light rounded h-[120px] resize-none outline-none border-none ${
                          isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                        } transition-colors duration-500`}
                        placeholder="Tell us something..."
                      />
                    ) : (
                      <input
                        id={field}
                        type={field === "password" ? "password" : "text"}
                        value={formData[field]}
                        onChange={(e) =>
                          handleInputChange(field, e.target.value)
                        }
                        disabled={field === "username"}
                        placeholder={
                          field === "password"
                            ? "Leave blank to keep unchanged"
                            : ""
                        }
                        className={`w-full h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                          isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                        } transition-colors duration-500 ${
                          field === "username"
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSave}
                  className={`px-6 py-2 rounded font-medium transition-all ${
                    saving ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"
                  } bg-[#f75555] text-white`}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                {error && (
                  <div className="w-full p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="w-full p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded">
                    <p className="text-green-400">{success}</p>
                  </div>
                )}
              </>
            ) : (
              // Viewing someone else's profile
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                {user?.bio || ""}
              </p>
            )}
          </div>
        </div>

        {/* User posts */}
        <div className="mt-32 w-full mb-12">
          <div className="flex items-center gap-5 mb-6">
            <h1 className="text-3xl">
              {isOwnProfile ? "Your posts" : "Posts"}
            </h1>
            <div className="border-t-2 flex-1 border-[#f75555]"></div>
          </div>
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div
                key={post._id}
                className={`border p-4 mb-3 rounded w-full ${
                  isDarkMode ? "border-gray-700" : "border-gray-300"
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  {post.description}
                </p>
              </div>
            ))
          ) : (
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
              {isOwnProfile
                ? "You haven't written any posts yet."
                : "This user hasn't written any posts yet."}
            </p>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      <FollowersModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        userIds={
          modalType === "followers"
            ? user?.followers || []
            : user?.following || []
        }
        isDarkMode={isDarkMode}
        onFollowChange={(isFollowing) => {
          // Refresh stats immediately when follow state changes
          if (modalType === "following" && !isFollowing) {
            // User unfollowed someone, decrease following count
            setUserStats((prev) => ({
              ...prev,
              following: Math.max(0, (prev?.following || 1) - 1),
            }));
          }
        }}
      />
    </div>
  );
}