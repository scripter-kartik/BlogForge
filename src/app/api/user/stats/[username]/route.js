// src/app/api/user/stats/[username]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js"; // ✅ Fixed import

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

    // ✅ Case-insensitive search
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    }).select("_id followers following");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's posts and calculate stats
    const posts = await Blog.find({ author: user._id });
    
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    // Calculate average rating using the new rating system
    const postsWithRatings = posts.filter(post => 
      post.ratings && post.ratings.length > 0
    );
    
    let avgRating = 0;
    if (postsWithRatings.length > 0) {
      const totalRating = postsWithRatings.reduce((sum, post) => {
        return sum + (post.averageRating || 0);
      }, 0);
      avgRating = totalRating / postsWithRatings.length;
    }

    return NextResponse.json({
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      totalPosts,
      totalViews,
      avgRating: Math.round(avgRating * 100) / 100, // Round to 2 decimals
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}