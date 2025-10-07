// src/app/(pages)/profile/page.jsx - UPDATED (No localStorage, using API client and auth)
"use client";

import Navbar from "../../../components/Navbar.jsx";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getRandomProfileImage } from "@/lib/profileImage.js";

export default function Profile() {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    bio: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        name: user.name || "",
        bio: user.bio || "",
        password: "",
      });
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.username) return;

      try {
        // Fetch user stats
        const statsData = await apiClient.getUserStats(user.username);
        setUserStats(statsData);

        // Fetch user posts
        const postsData = await apiClient.getUserPosts(user.username);
        setUserPosts(postsData.posts || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data");
      }
    };

    if (user?.username) {
      fetchUserData();
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("profileImage", file);
    uploadData.append("username", formData.username);
    uploadData.append("email", formData.email);
    uploadData.append("name", formData.name);
    uploadData.append("bio", formData.bio);
    if (formData.password) {
      uploadData.append("password", formData.password);
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Send PATCH request to user update API with multipart form data
      const res = await fetch("/api/protected/user/update", {
        method: "PATCH",
        headers: {
          "user-email": user.email, // Important for backend authorization
        },
        body: uploadData,
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();

      if (data.user?.image) {
        setFormData((prev) => ({ ...prev, image: data.user.image })); // Update image URL to re-render avatar
        setSuccess("Profile image updated!");
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      const updateData = {
        ...formData,
        ...(formData.password ? { password: formData.password } : {}),
      };

      const response = await apiClient.updateUserProfile(updateData);
      setSuccess("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
      setTimeout(() => setSuccess(""), 3000);
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
    } catch (error) {
      console.error("Logout error:", error);
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

  // Loading state
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

  // Redirect state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Please login to access your profile.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#f75555] text-white rounded hover:bg-red-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center min-h-screen w-screen ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f6f6f7]"
      } transition-colors duration-500`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
      />

      <div
        className={`mt-32 flex flex-col w-[1280px] ${
          isDarkMode ? "text-white" : "text-black"
        } transition-colors duration-500`}
      >
        <div className="flex items-start justify-between w-full">
          {/* Profile Sidebar */}
          <div className="flex flex-col items-center gap-6 w-80">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-[#f75555] cursor-pointer group">
              <img
                src={getRandomProfileImage(
                  user?.image,
                  user?.username || user?.email
                )}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <label
                htmlFor="profileImageInput"
                className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition-opacity"
              >
                Change Picture
              </label>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex gap-4">
              <p>{userStats?.followers || 0} followers</p>
              <p>{userStats?.following || 0} following</p>
            </div>
            <div className="flex gap-4">
              <p>{userStats?.totalPosts || 0} posts</p>
              <p>Avg Rating: {userStats?.avgRating?.toFixed(2) || 0.0}</p>
            </div>
            <p className="text-gray-400 text-sm">
              Member since{" "}
              {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
            </p>
            <button
              onClick={handleLogout}
              className="border-[1px] border-[#f75555] text-[#f75555] px-4 py-1 rounded hover:text-red-600 hover:border-red-600"
            >
              Logout
            </button>
          </div>
          {/* Profile Details */}
          <div className="flex flex-col gap-4 items-start w-[900px]">
            <h1 className="text-4xl font-bold mb-8">
              Welcome, {user?.name || "User"}
            </h1>
            <div className="flex flex-col w-full">
              <label htmlFor="username" className="text-sm font-light">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={`w-full h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
                disabled
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="email" className="text-sm font-light">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="password" className="text-sm font-light">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full h-[35px] border-none outline-none px-3 py-2 font-light rounded ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
                placeholder="Leave blank to keep unchanged"
              />
            </div>
            <div className="flex flex-col w-full">
              <label htmlFor="bio" className="text-sm font-light">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className={`w-full px-3 py-2 font-light rounded h-[120px] resize-none outline-none border-none ${
                  isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
                } transition-colors duration-500`}
                placeholder="Tell us something..."
              />
            </div>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded ${
                isDarkMode ? "bg-[#2f2f2f]" : "bg-gray-200"
              } transition-colors duration-500`}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-green-400">{success}</p>}
          </div>
        </div>

        <div className="mt-32 w-full">
          <div className="flex items-center gap-5 mb-6">
            <h1 className="text-3xl">Your posts</h1>
            <div className="border-t-2 flex-1 border-[#f75555]"></div>
          </div>
          {userPosts?.length > 0 ? (
            userPosts.map((post) => (
              <div key={post._id} className="border p-4 mb-3 rounded w-full">
                <h3 className="text-xl font-bold">{post.title}</h3>
                <p className="text-gray-600">{post.description}</p>
              </div>
            ))
          ) : (
            <p>You haven't written any posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
