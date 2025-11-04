"use client";

import Navbar from "../../../../components/Navbar.jsx";
import FollowersModal from "../../../../components/FollowersModal.jsx";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/context/UserContext";
import { useFollow } from "@/hooks/useFollow";
import { apiClient } from "@/lib/api";
import { getRandomProfileImage } from "@/lib/profileImage.js";
import { signOut } from "next-auth/react";
import { FaRegStar, FaRegClock } from "react-icons/fa";

export default function Profile() {
  const params = useParams();
  const username = params.username;
  const router = useRouter();

  const { isAuthenticated, user: authUser, loading: authLoading, updateSession } = useAuth();
  const { refreshUser, updateUser } = useUser();
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

  const getGradientForPost = (postId) => {
    const hash = postId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const fetchUserData = useCallback(async () => {
    if (!username) return;

    try {
      setLoading(true);
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
  }, [username, isAuthenticated, authUser]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleFollowClick = async () => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    const result = await toggleFollow(user._id, isFollowing);
    if (result) {
      setIsFollowing(result.isFollowing);
      setUserStats((prev) => ({
        ...prev,
        followers: result.followersCount,
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Upload the file
      const uploadData = new FormData();
      uploadData.append("profileImage", file);
      uploadData.append("username", formData.username);
      uploadData.append("email", formData.email);
      uploadData.append("name", formData.name);
      uploadData.append("bio", formData.bio);

      console.log("📤 Uploading profile image...");

      const res = await fetch("/api/protected/user/update", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile image");
      }

      console.log("✅ Image uploaded successfully:", data.user.image);

      // CRITICAL: Update all sources immediately
      const newImageUrl = data.user.image;

      // 1. Update local state
      setUser((prev) => ({
        ...prev,
        image: newImageUrl,
      }));

      // 2. Update global context with force refresh flag
      updateUser({
        image: newImageUrl,
        _forceRefresh: Date.now(),
      });

      // 3. Update NextAuth session with the new image
      console.log("🔄 Updating NextAuth session...");
      const sessionResult = await updateSession({
        user: {
          image: newImageUrl,
        }
      });
      console.log("✅ Session updated:", sessionResult);

      // 4. Give the session a moment to propagate
      await new Promise(resolve => setTimeout(resolve, 300));

      // 5. Fetch fresh data from API to confirm
      console.log("🔄 Refreshing from database...");
      await refreshUser();

      // 6. Set localStorage flag to trigger Navbar refresh
      localStorage.setItem('profileImageUpdated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));

      setSuccess("Profile image updated!");
      setError("");

      // 7. Hard reload after a short delay to ensure everything syncs
      setTimeout(() => {
        console.log("🔄 Reloading page to apply changes everywhere...");
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error("❌ Upload error:", err);
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

      console.log("📤 Saving profile changes...");

      const res = await fetch("/api/protected/user/update", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      console.log("✅ Profile updated:", data.user);

      // Update all sources
      const updatedData = {
        name: data.user.name,
        email: data.user.email,
        bio: data.user.bio,
        image: data.user.image,
        _forceRefresh: Date.now(),
      };

      // 1. Update local state
      setUser((prev) => ({
        ...prev,
        ...updatedData,
      }));

      // 2. Update global context
      updateUser(updatedData);

      // 3. Update session
      console.log("🔄 Updating session...");
      await updateSession();

      // 4. Refresh from database
      await refreshUser();

      setSuccess("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
      setError("");

      // Reload after a delay
      setTimeout(() => {
        console.log("🔄 Reloading to apply changes...");
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("❌ Profile update error:", error);
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
      <div
        className={`flex items-center justify-center h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
          }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f75555] mx-auto mb-4"></div>
          <p className={isDarkMode ? "text-white" : "text-black"}>
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        className={`flex justify-center mt-32 text-lg transition-colors duration-500 px-4 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
          }`}
      >
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const isOwnProfile = authUser?.username === user?.username;

  return (
    <div className={`flex flex-col items-center min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      }`}>

      <Navbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        setIsLoginActive={() => { }}
        setIsSignupActive={() => { }}
      />

      <div
        className={`mt-20 sm:mt-24 md:mt-32 flex flex-col w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isDarkMode ? "text-white" : "text-black"
          }`}
      >
        <div className="flex flex-col lg:flex-row items-start justify-between w-full gap-6 sm:gap-8 lg:gap-12">
          {/* Profile Sidebar */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full lg:w-80 flex-shrink-0">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-[#f75555] group">
              <img
                key={`${user?.image}-${user?._timestamp || Date.now()}`}
                src={getRandomProfileImage(user?.image, user?.username)}
                alt={user?.name || "Profile"}
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <>
                  <label
                    htmlFor="profileImageInput"
                    className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs sm:text-sm font-semibold transition-opacity cursor-pointer"
                  >
                    {saving ? "Uploading..." : "Change Picture"}
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

            <div className="flex gap-3 sm:gap-4 text-sm sm:text-base">
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

            <div className="flex gap-3 sm:gap-4 text-sm sm:text-base">
              <p>{userStats?.totalPosts || 0} posts</p>
              <p>Avg Rating: {userStats?.avgRating?.toFixed(2) || "0.00"}</p>
            </div>

            <p
              className={`text-xs sm:text-sm text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
              Member since {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
            </p>

            {isOwnProfile ? (
              <button
                onClick={handleLogout}
                className="border-[1px] border-[#f75555] text-[#f75555] px-4 sm:px-6 py-2 rounded hover:text-red-600 hover:border-red-600 transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={handleFollowClick}
                disabled={followLoading}
                className={`px-6 sm:px-8 py-2 rounded font-medium transition-colors text-sm sm:text-base ${isFollowing
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
          <div className="flex flex-col gap-4 items-start flex-1 w-full">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
              {isOwnProfile ? `Welcome, ${user?.name || "User"}` : user?.name}
            </h1>

            {isOwnProfile ? (
              <>
                {/* Editable fields */}
                {["username", "email", "name", "password", "bio"].map((field) => (
                  <div className="flex flex-col w-full" key={field}>
                    <label
                      htmlFor={field}
                      className="text-xs sm:text-sm font-light mb-1 capitalize"
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
                        className={`w-full px-3 py-2 text-sm sm:text-base font-light rounded h-[100px] sm:h-[120px] resize-none outline-none border-none transition-colors duration-500 ${isDarkMode ? "bg-[#2f2f2f] text-white" : "bg-gray-200 text-black"
                          }`}
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
                        className={`w-full h-[35px] sm:h-[40px] border-none outline-none px-3 py-2 text-sm sm:text-base font-light rounded transition-colors duration-500 ${isDarkMode
                            ? "bg-[#2f2f2f] text-white"
                            : "bg-gray-200 text-black"
                          } ${field === "username"
                            ? "opacity-60 cursor-not-allowed"
                            : ""
                          }`}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSave}
                  className={`px-4 sm:px-6 py-2 rounded font-medium transition-all bg-[#f75555] text-white text-sm sm:text-base ${saving
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-red-600"
                    }`}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>

                {error && (
                  <div className="w-full p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-sm sm:text-base">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="w-full p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded text-sm sm:text-base">
                    <p className="text-green-400">{success}</p>
                  </div>
                )}
              </>
            ) : (
              <div className={`w-full p-4 sm:p-6 rounded-xl ${isDarkMode ? "bg-[#2D2D2D]" : "bg-white"
                } shadow-lg`}>
                <h3 className="text-lg sm:text-xl font-bold mb-3">About</h3>
                <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                  {user?.bio || "No bio yet"}
                </p>
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                    <span className="font-semibold">Email:</span> {user?.email}
                  </p>
                  <p className={`text-xs sm:text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}>
                    <span className="font-semibold">Username:</span> @{user?.username}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User posts */}
        <div className="mt-8 sm:mt-12 lg:mt-16 w-full mb-24 sm:mb-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 justify-between mb-6 sm:mb-10">
            <h1 className={`${isDarkMode ? "text-white" : "text-black"
              } text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight`}>
              {isOwnProfile ? "Your Posts" : `Posts by ${user?.name}`}
            </h1>
            <div className={`hidden sm:block flex-1 h-1 rounded-full ${isDarkMode ? "bg-gradient-to-r from-[#f75555] to-transparent" : "bg-gradient-to-r from-[#f75555] to-transparent"
              }`}></div>
          </div>

          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div
                key={post._id}
                className="w-full mt-4 sm:mt-6 lg:mt-8 cursor-pointer group"
                onClick={() => router.push(`/blog/${post._id}`)}
              >
                <div
                  className={`w-full ${isDarkMode
                      ? "text-white bg-[#2D2D2D] hover:bg-[#353535]"
                      : "text-black bg-[#E8EAEC] hover:bg-[#dfe1e4]"
                    } flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
                >
                  {post.coverImage ? (
                    <img
                      className="w-full sm:w-40 md:w-48 lg:w-52 h-40 sm:h-32 md:h-36 lg:h-40 object-cover rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0"
                      src={post.coverImage}
                      alt={post.title}
                      onError={(e) => {
                        e.target.style.display = "none";
                        const parent = e.target.parentElement;
                        const gradientDiv = document.createElement("div");
                        gradientDiv.className = `w-full sm:w-40 md:w-48 lg:w-52 h-40 sm:h-32 md:h-36 lg:h-40 rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0 ${getGradientForPost(post._id)}`;
                        parent.insertBefore(gradientDiv, parent.firstChild);
                      }}
                    />
                  ) : (
                    <div
                      className={`w-full sm:w-40 md:w-48 lg:w-52 h-40 sm:h-32 md:h-36 lg:h-40 rounded-lg group-hover:shadow-md transition-shadow flex-shrink-0 ${getGradientForPost(post._id)}`}
                    />
                  )}

                  <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                      <h1 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight">
                        {post.title}
                      </h1>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <img
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#f75555]"
                          src={getRandomProfileImage(user?.image, user?.username)}
                          alt={user?.name}
                        />
                        <p className="text-xs sm:text-sm font-medium">{user?.name}</p>
                      </div>
                    </div>
                    {post.description && (
                      <p
                        className={`${isDarkMode ? "text-gray-300" : "text-gray-700"
                          } line-clamp-2 text-sm sm:text-base`}
                      >
                        {post.description}
                      </p>
                    )}
                    <div
                      className={`${isDarkMode ? "text-gray-400" : "text-gray-600"
                        } flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-medium`}
                    >
                      <div className="flex items-center gap-2 hover:text-[#f75555] transition-colors">
                        <FaRegStar className="text-yellow-500 text-sm sm:text-base" />
                        <p>{post.likesCount || post.starRating || 0} {post.starRating ? "rating" : "likes"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRegClock className="text-sm sm:text-base" />
                        <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-12 sm:py-16 ${isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}>
              <p className="text-base sm:text-lg lg:text-xl px-4">
                {isOwnProfile
                  ? "You haven't written any posts yet."
                  : `${user?.name} hasn't written any posts yet.`}
              </p>
            </div>
          )}
        </div>
      </div>

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
          if (modalType === "following" && !isFollowing) {
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