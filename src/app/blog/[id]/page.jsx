"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { FaRegStar, FaRegClock } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { BiComment } from "react-icons/bi";

export default function BlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    async function fetchBlog() {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getBlogById(params.id);

        if (!data) {
          setError("Blog not found");
          setLoading(false);
          return;
        }

        if (data?.author?.username) {
          try {
            const authorInfo = await apiClient.getUserInfoByUsername(
              data.author.username
            );
            data.author = { ...data.author, ...authorInfo };
          } catch (err) {
            console.error("Failed to fetch author info:", err);
          }
        }

        setBlog(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load blog.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1d1d] text-white flex justify-center items-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f75555] mr-3" />
          <p className="text-lg">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1c1d1d] text-white flex justify-center items-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#1c1d1d] text-white flex justify-center items-center">
        <p className="text-lg">Blog not found.</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"
        } transition-colors duration-500`}
    >
      {/* ✅ Navbar now same as Home.jsx */}
      <div className="fixed top-0 w-full flex justify-center bg-[#1c1d1d]">
        <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>

      {/* ✅ Same spacing below Navbar as Home */}
      <div className="max-w-[1280px] mx-auto pt-28 px-6 pb-16">
        <h1 className="text-3xl font-bold">{blog.title}</h1>
        {blog.description && (
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} text-base mt-2 mb-4`}>
            {blog.description}
          </p>
        )}

        {/* Author Section */}
        <div className="flex items-center gap-3 mt-3 mb-3">
          <Link
            href={
              blog.author?.username
                ? `/profile/${blog.author.username}`
                : "#"
            }
            className="flex items-center gap-2"
          >
            <img
              src={blog.author?.image || "/imageProfile1.png"}
              alt={blog.author?.name || "Author"}
              className="w-9 h-9 rounded-full border-2 border-[#f75555] shadow"
            />
            <span className="font-medium hover:underline">
              {blog.author?.name || "Anonymous"}
            </span>
          </Link>

          <span className="text-xs text-gray-400 ml-2">
            Updated: {new Date(blog.updatedAt).toLocaleDateString()}
          </span>

          <span className="ml-4 text-xs text-gray-400">
            {blog.views || 0} views • {blog.starRating?.toFixed(1) || 0}★
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-gray-400 text-sm mb-4">
          <div className="flex items-center gap-1">
            <IoEyeOutline />
            <span>{blog.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRegStar />
            <span>{blog.starRating?.toFixed(1) || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <BiComment />
            <span>{blog.commentCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRegClock />
            <span>{blog.estimatedRead || 3} min read</span>
          </div>
        </div>

        {/* Blog Content */}
        <div className="mb-5 mt-6 text-lg leading-relaxed">
          {blog.content || blog.description}
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-gray-700 px-2 py-0.5 rounded text-xs text-white"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <hr className="border-gray-800 my-6" />

        {/* Rating Section */}
        <div className="mb-6">
          <span className="font-medium text-base">Rate this post:</span>
          <div className="inline-flex ml-4">
            {[...Array(5)].map((_, idx) => (
              <FaRegStar
                key={idx}
                size={24}
                className="text-gray-500 hover:text-[#f75555] cursor-pointer transition-colors"
              />
            ))}
          </div>
        </div>

        {/* Comment Box */}
        <div className="w-full bg-[#23272a] rounded p-3">
          <input
            className="bg-transparent w-full outline-none px-2 py-2 rounded text-sm text-white"
            placeholder="Write a comment..."
            disabled
          />
        </div>
      </div>
    </div>
  );
}
