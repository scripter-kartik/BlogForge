// src/app/(pages)/edit/[id]/page.jsx
"use client";

import Navbar from "../../../../components/Navbar.jsx";
import BlogEditor from "../../../../components/BlogEditor.jsx";
import { GrGallery } from "react-icons/gr";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation.js";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";

const EditPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [randomColor, setRandomColor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [content, setContent] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  useEffect(() => {
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
  }, []);

  // Fetch blog data
  useEffect(() => {
    async function fetchBlog() {
      if (!params.id) return;

      try {
        setLoading(true);
        console.log("📖 Fetching blog for edit:", params.id);
        
        const blog = await apiClient.getBlogById(params.id);

        if (!blog) {
          setError("Blog not found");
          return;
        }

        console.log("📝 Blog fetched:", {
          blogId: blog._id,
          authorId: blog.author?._id,
          authorName: blog.author?.name,
          currentUserId: user?.id || user?._id,
          currentUserName: user?.name
        });

        // ✅ Better author check with multiple fallbacks
        const userIdToCheck = user?.id || user?._id || user?.sub;
        const authorIdToCheck = blog.author?._id || blog.author?.id;
        
        const isAuthor = userIdToCheck?.toString() === authorIdToCheck?.toString();

        console.log("🔐 Authorization check:", {
          userIdToCheck,
          authorIdToCheck,
          isAuthor
        });

        if (!isAuthor) {
          setError("You don't have permission to edit this post");
          setTimeout(() => router.push(`/blog/${params.id}`), 2000);
          return;
        }

        // Populate form with existing data
        setTitle(blog.title || "");
        setDescription(blog.description || "");
        setTag(blog.tags?.join(", ") || "");
        setContent(blog.content || "");
        setCoverImage(blog.coverImage || null);
        setError("");
        
        console.log("✅ Edit form initialized");
      } catch (err) {
        console.error("❌ Error fetching blog:", err);
        setError("Failed to load blog data: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && isAuthenticated && user) {
      fetchBlog();
    } else if (!authLoading && !isAuthenticated) {
      setError("Please login to edit posts");
      router.push("/");
    }
  }, [params.id, isAuthenticated, user, authLoading, router]);

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
    if (!content.trim()) {
      setError("Blog content is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setUpdating(true);
    setError("");

    const postData = {
      title: title.trim(),
      description: description.trim(),
      tags: tag
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      coverImage,
      content: content,
    };

    try {
      console.log("📝 Updating post with data:", {
        postId: params.id,
        title: postData.title,
        hasContent: !!postData.content,
        hasCoverImage: !!postData.coverImage,
        tagsCount: postData.tags.length
      });

      const updatedPost = await apiClient.updatePost(params.id, postData);
      
      console.log("✅ Post updated successfully:", updatedPost);
      
      alert("Post updated successfully!");
      router.push(`/blog/${params.id}`);
    } catch (error) {
      console.error("❌ Error updating post:", error);
      
      // Better error handling
      let errorMsg = "Failed to update post. ";
      
      if (error.status === 401) {
        errorMsg += "Please login again.";
      } else if (error.status === 403) {
        errorMsg += "You don't have permission to edit this post.";
      } else if (error.status === 404) {
        errorMsg += "Post not found.";
      } else {
        errorMsg += error.message || "Please try again.";
      }
      
      setError(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
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
    if (!updating) {
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

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f75555] mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">Please login to edit posts.</p>
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
        setIsLoginActive={() => {}}
        setIsSignupActive={() => {}}
        setIsDarkMode={setIsDarkMode}
        isDarkMode={isDarkMode}
      />

      <div className="flex flex-col lg:flex-row mt-20 sm:mt-24 md:mt-32 lg:mt-44 w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 gap-6 lg:gap-8 xl:gap-12 justify-between">
        {/* Left Column - Form Inputs */}
        <div
          className={`flex flex-col gap-4 sm:gap-6 items-start w-full lg:w-80 xl:w-96 ${
            isDarkMode ? "text-white" : "text-black"
          } transition-colors duration-500`}
        >
          <h2 className="text-2xl font-bold text-[#f75555]">Edit Post</h2>

          {/* Title Input */}
          <div className="relative w-full">
            <input
              className={`w-full h-10 sm:h-12 px-3 py-2 border rounded text-sm sm:text-base ${
                isDarkMode
                  ? "bg-[#27272A] border-[#3f3f46] text-white"
                  : "bg-[#FFFFFF] border-gray-300 text-black"
              } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-[#f75555]`}
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={updating}
              maxLength={100}
            />
            <span className="absolute right-2 top-11 sm:top-[52px] text-xs text-gray-500">
              {title.length}/100
            </span>
          </div>

          {/* Description Input */}
          <div className="relative w-full">
            <textarea
              className={`w-full h-20 sm:h-24 px-3 py-2 border rounded resize-none text-sm sm:text-base ${
                isDarkMode
                  ? "bg-[#27272A] border-[#3f3f46] text-white"
                  : "bg-[#FFFFFF] border-gray-300 text-black"
              } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-[#f75555]`}
              placeholder="Post description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={250}
              disabled={updating}
            />
            <span className="absolute right-2 top-[85px] sm:top-[102px] text-xs text-gray-500">
              {description.length}/250
            </span>
          </div>

          {/* Tags Input */}
          <input
            className={`w-full h-10 sm:h-12 px-3 py-2 border rounded text-sm sm:text-base ${
              isDarkMode
                ? "bg-[#27272A] border-[#3f3f46] text-white"
                : "bg-[#FFFFFF] border-gray-300 text-black"
            } transition-colors duration-500 focus:outline-none focus:ring-2 focus:ring-[#f75555]`}
            type="text"
            placeholder="Tags (comma-separated)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={updating}
          />

          {/* Upload Cover Button */}
          <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
            <GrGallery className="text-base sm:text-lg" />
            <button
              onClick={handleUploadClick}
              disabled={updating}
              className={`hover:text-[#f75555] transition-colors ${
                updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              Update Cover Image
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={updating}
          />

          {/* Cover Image Preview */}
          <div
            className={`w-full h-40 sm:h-48 rounded-lg relative overflow-hidden border-2 border-dashed ${
              coverImage
                ? "border-transparent"
                : isDarkMode
                ? "border-gray-600"
                : "border-gray-300"
            } ${coverImage ? "" : randomColor} ${
              updating
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
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-lg sm:text-xl transition-colors z-10"
                  title="Remove image"
                  disabled={updating}
                >
                  ×
                </button>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs sm:text-sm px-4 text-center">
                    Click to change image
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <GrGallery className="mx-auto mb-2 text-xl sm:text-2xl" />
                  <p className="text-xs sm:text-sm">Click to upload cover image</p>
                  <p className="text-[10px] sm:text-xs opacity-75 mt-1">
                    Max 5MB (JPG, PNG, GIF)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleUpdate}
              disabled={updating || !title.trim() || !description.trim() || !content.trim()}
              className={`flex-1 border p-3 rounded-full transition-colors duration-300 font-medium text-sm sm:text-base ${
                updating || !title.trim() || !description.trim() || !content.trim()
                  ? "opacity-50 cursor-not-allowed border-gray-400"
                  : isDarkMode
                  ? "hover:bg-[#FFFFFF] hover:text-black border-white text-white"
                  : "hover:bg-[#27272A] hover:text-white border-black text-black"
              }`}
            >
              {updating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Updating...
                </div>
              ) : (
                "Update Post"
              )}
            </button>

            <button
              onClick={() => router.push(`/blog/${params.id}`)}
              disabled={updating}
              className={`px-6 border p-3 rounded-full transition-colors duration-300 font-medium text-sm sm:text-base ${
                updating
                  ? "opacity-50 cursor-not-allowed"
                  : isDarkMode
                  ? "border-gray-500 text-gray-400 hover:border-gray-300 hover:text-gray-200"
                  : "border-gray-400 text-gray-600 hover:border-gray-600 hover:text-gray-800"
              }`}
            >
              Cancel
            </button>
          </div>

          {/* User Info */}
          <div className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4">
            Editing as: <span className="font-medium">{user?.name}</span>
          </div>
        </div>

        {/* Right Column - Blog Editor */}
        <div className="w-full lg:flex-1 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] mb-24 lg:mb-0">
          <BlogEditor 
            isDarkMode={isDarkMode} 
            onContentChange={handleContentChange}
            initialContent={content}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPage;