import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js"; 

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select("_id");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const posts = await Blog.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name username email image")
      .lean();

    const formattedPosts = posts.map(post => ({
      _id: post._id.toString(),
      title: post.title,
      description: post.description || "",
      content: post.content,
      coverImage: post.coverImage || null,
      author: {
        _id: post.author._id.toString(),
        name: post.author.name,
        username: post.author.username,
        email: post.author.email,
        image: post.author.image,
      },
      tags: post.tags || [],
      category: post.category || "",
      views: post.views || 0,
      likesCount: 0, 
      commentsCount: post.commentCount || 0,
      starRating: post.averageRating || post.starRating || 0,
      ratingCount: post.ratingCount || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      count: formattedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}