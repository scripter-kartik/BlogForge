// src/app/api/protected/user/posts/[username]/route.js - USER POSTS API
import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { username } = params;

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await Blog.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name username image")
      .lean();

    // Transform posts to include author info
    const transformedPosts = posts.map((post) => ({
      ...post,
      authorName: post.author?.name || "Anonymous",
      authorImage: post.author?.image || "/imageProfile1.png",
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
