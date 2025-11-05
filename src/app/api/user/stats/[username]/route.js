// src/app/api/user/stats/[username]/route.js
// ============================================
// FIXED VERSION - Added await params for Next.js 15

import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    // ✅ FIX: Await params
    const { username } = await params;

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

    // Get user's posts
    const userPosts = await Blog.find({ author: user._id });

    // Calculate stats
    const totalPosts = userPosts.length;
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    // Use new rating system if available, fallback to starRating
    const totalRating = userPosts.reduce((sum, post) => {
      return sum + (post.averageRating || post.starRating || 0);
    }, 0);
    const avgRating = totalPosts > 0 ? totalRating / totalPosts : 0;

    return NextResponse.json({
      followers: user.followers?.length || 0,
      following: user.following?.length || 0,
      totalPosts,
      totalViews,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}