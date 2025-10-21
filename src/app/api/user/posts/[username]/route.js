// 3. CREATE NEW FILE: src/app/api/user/posts/[username]/route.js
// PUBLIC ROUTE (not protected)
// ============================================

// src/app/api/user/posts/[username]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { username } = params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

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
      _id: post._id.toString(),
      author: post.author
        ? {
            ...post.author,
            _id: post.author._id.toString(),
          }
        : null,
    }));

    return NextResponse.json({ posts: transformedPosts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}