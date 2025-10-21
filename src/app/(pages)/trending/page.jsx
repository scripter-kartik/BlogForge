"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/api";
import { IoEyeOutline } from "react-icons/io5";
import { FaRegStar, FaRegClock } from "react-icons/fa";
import { BiComment } from "react-icons/bi";

export default function TrendingPage() {
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        async function fetchTrendingPosts() {
            try {
                setLoading(true);
                setError(null);
                const data = await apiClient.getTrendingBlogs();
                setTrendingPosts(data || []);
            } catch (err) {
                console.error("Failed to load trending blogs:", err);
                setError("Failed to load trending blogs.");
            } finally {
                setLoading(false);
            }
        }
        fetchTrendingPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1c1d1d] text-white flex justify-center items-center">
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f75555] mr-3" />
                    <p className="text-lg">Loading trending posts...</p>
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

    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-[#1c1d1d] text-white" : "bg-[#f6f6f7] text-black"} transition-colors duration-500`}>
            {/* Fixed Navbar */}
            <div className="fixed top-0 w-full flex justify-center z-50 bg-transparent">
                <Navbar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
            </div>

            {/* Main Content */}
            <div className="max-w-[1280px] mx-auto pt-28 px-6 pb-16">
                <h1 className="text-4xl font-bold mb-10 text-center text-[#f75555]">
                    🔥 Trending Posts
                </h1>

                {trendingPosts.length === 0 ? (
                    <p className="text-center text-gray-400s">No trending posts yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingPosts.map((post) => (
                            <Link
                                key={post._id}
                                href={`/blog/${post._id}`}
                                className={`border ${isDarkMode ? "border-[#494949]" : "border-[#dbdada]"} rounded-2xl p-5 hover:shadow-xl transition duration-300`}
                            >
                                <div className="mb-3">
                                    <img
                                        src={post.coverImage || "/defaultBlogImage.png"}
                                        alt={post.title}
                                        className="w-full h-44 object-cover rounded-xl border border-[#333]"
                                    />
                                </div>

                                <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-[#f75555] transition-colors">
                                    {post.title}
                                </h2>
                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.description}</p>

                                {/* Author */}
                                <div className="flex items-center gap-2 mb-4">
                                    <img
                                        src={post.author?.image || "/imageProfile1.png"}
                                        alt={post.author?.name || "Author"}
                                        className="w-8 h-8 rounded-full border border-[#f75555]"
                                    />
                                    <span className="text-sm">{post.author?.name || "Anonymous"}</span>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between text-gray-400 text-xs">
                                    <div className="flex items-center gap-1">
                                        <IoEyeOutline size={14} />
                                        <span>{post.views ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaRegStar size={14} />
                                        <span>{post.starRating ? post.starRating.toFixed(1) : 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BiComment size={14} />
                                        <span>{post.commentCount ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaRegClock size={14} />
                                        <span>{post.estimatedRead ?? 3} min</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
