// src/app/(pages)/write/page.jsx - UPDATED (No localStorage, using API client and auth)
"use client";

import Navbar from "../../../components/Navbar.jsx";
import BlogEditor from "../../../components/BlogEditor.jsx";
import { GrGallery } from "react-icons/gr";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation.js";
import { usePosts } from "@/context/PostsContext.jsx";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

const WritePage = () => {
  const [isLoginActive, setIsLoginActive] = useState(false);
  const [isSignupActive, setIsSignupActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [randomColor, setRandomColor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { posts, setPosts } = usePosts();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      router.push("/");
      return;
    }

    // Set random gradient color for cover image placeholder
    const colors = [
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

    const randomIndex = Math.floor(Math.random() * colors.length);
    setRandomColor(colors[randomIndex]);
  }, [isAuthenticated, loading, router]);

  const validateForm = () => {
    if (!title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (description.length > 250) {
      setError("Description must be less than 250 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setPublishing(true);
    setError("");

    const postData = {
      title: title.trim(),
      description: description.trim(),
      tags: tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage,
      category: "Latest",
      starRating: 0,
      views: 0,
      commentCount: 0,
      estimatedRead: Math.max(
        1,
        Math.ceil(description.trim().split(" ").length / 200)
      ),
    };

    try {
      const newPost = await apiClient.createPost(postData);

      // Update local posts state
      setPosts((prevPosts) => [newPost, ...prevPosts]);

      // Reset form
      setTitle("");
      setDescription("");
      setTag("");
      setCoverImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert("Post published successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error publishing post:", error);
      setError(error.message || "Failed to publish post. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("Image size should be less than 5MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setCoverImage(e.target.result);
          setError("");
        };
        reader.onerror = () => {
          setError("Failed to read image file");
        };
        reader.readAsDataURL(file);
      } else {
        setError("Please select a valid image file (JPG, PNG, GIF)");
      }
    }
  };

  const handleUploadClick = () => {
    if (!publishing) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f75555] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Please login to write a post.</p>
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
      className={`flex flex-col items-center min-h-screen w-full ${
        isDarkMode ? "bg-[#1c1d1d]" : "bg-[#f4f6f8]"
      } transition-colors duration-500`}
    >
      <Navbar
        setIsLoginActive={setIsLoginActive}
        setIsSignupActive={setIsSignupActive}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
      />

      <div className="flex mt-44 w-[1280px] justify-between">
        <div
          className={`flex flex-col gap-6 items-start ${
            isDarkMode ? "text-white" : "text-black"
          } transition-colors duration-500`}
        >
          {/* Title Input */}
          <div className="relative">
            <input
              className={`w-72 h-10 px-3 py-2 border rounded ${
                isDarkMode
                  ? "bg-[#27272A] border-[#3f3f46] text-white"
                  : "bg-[#FFFFFF] border-gray-300 text-black"
              } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-[#f75555]`}
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={publishing}
              maxLength={100}
            />
            <span className="absolute right-2 top-11 text-xs text-gray-500">
              {title.length}/100
            </span>
          </div>

          {/* Description Input */}
          <div className="relative">
            <textarea
              className={`w-72 h-20 px-3 py-2 border rounded resize-none ${
                isDarkMode
                  ? "bg-[#27272A] border-[#3f3f46] text-white"
                  : "bg-[#FFFFFF] border-gray-300 text-black"
              } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-[#f75555]`}
              placeholder="Post description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={250}
              disabled={publishing}
            />
            <span className="absolute right-2 top-[85px] text-xs text-gray-500">
              {description.length}/250
            </span>
          </div>

          {/* Tags Input */}
          <input
            className={`w-72 h-10 px-3 py-2 border rounded ${
              isDarkMode
                ? "bg-[#27272A] border-[#3f3f46] text-white"
                : "bg-[#FFFFFF] border-gray-300 text-black"
            } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-[#f75555]`}
            type="text"
            placeholder="Tags (comma-separated)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={publishing}
          />

          {/* Upload Cover Button */}
          <div className="flex items-center gap-2 font-semibold">
            <GrGallery />
            <button
              onClick={handleUploadClick}
              disabled={publishing}
              className={`hover:text-[#f75555] transition-colors ${
                publishing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Upload Cover Image
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={publishing}
          />

          {/* Cover Image Preview */}
          <div
            className={`w-72 h-40 rounded-lg relative overflow-hidden border-2 border-dashed ${
              coverImage
                ? "border-transparent"
                : isDarkMode
                ? "border-gray-600"
                : "border-gray-300"
            } ${coverImage ? "" : randomColor} ${
              publishing
                ? "pointer-events-none opacity-50"
                : "cursor-pointer hover:opacity-90"
            } transition-all duration-300`}
            onClick={handleUploadClick}
          >
            {coverImage ? (
              <>
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors z-10"
                  title="Remove image"
                  disabled={publishing}
                >
                  ×
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">
                    Click to change image
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <GrGallery className="mx-auto mb-2 text-2xl" />
                  <p className="text-sm">Click to upload cover image</p>
                  <p className="text-xs opacity-75 mt-1">
                    Max 5MB (JPG, PNG, GIF)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-72 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={publishing || !title.trim() || !description.trim()}
            className={`w-72 border p-3 rounded-full transition-colors duration-300 font-medium ${
              publishing || !title.trim() || !description.trim()
                ? "opacity-50 cursor-not-allowed border-gray-400"
                : isDarkMode
                ? "hover:bg-[#FFFFFF] hover:text-black border-white text-white"
                : "hover:bg-[#27272A] hover:text-white border-black text-black"
            }`}
          >
            {publishing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Publishing...
              </div>
            ) : (
              "Publish Post"
            )}
          </button>

          {/* User Info */}
          <div className="text-sm text-gray-500 mt-4">
            Publishing as: <span className="font-medium">{user?.name}</span>
          </div>
        </div>

        {/* Blog Editor */}
        <BlogEditor isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default WritePage;
