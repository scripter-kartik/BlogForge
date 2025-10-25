"use client";

import { useRouter } from "next/navigation";
import { getRandomProfileImage } from "@/lib/profileImage";

export default function BlogCard({ post, isDarkMode }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/blog/${post._id}`)}
      className={`w-full flex flex-col sm:flex-row gap-6 p-5 rounded-xl cursor-pointer transition-colors duration-500 hover:shadow-lg ${
        isDarkMode ? "bg-[#2D2D2D] text-white" : "bg-[#f6f6f7] text-black"
      }`}
    >
      <img
        src={
          post.coverImage ||
          "https://dummyimage.com/800x600/cccccc/ffffff&text=No+Image"
        }
        alt={post.title}
        className="w-full sm:w-52 h-40 object-cover rounded-lg"
      />
      <div className="flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg font-semibold">{post.title}</h2>
          <p
            className={`text-sm mt-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {post.description}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <img
            src={getRandomProfileImage(
              post.author?.image,
              post.author?.name || "User"
            )}
            alt="Author"
            className="w-6 h-6 rounded-full"
          />
          <p className="text-sm">{post.author?.name || "Anonymous"}</p>
        </div>
      </div>
    </div>
  );
}
