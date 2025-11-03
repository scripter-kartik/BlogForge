// src/app/api/suggested-users/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    let currentUserId = null;
    let currentUserFollowing = [];

    // Get current user if authenticated
    if (session?.user?.email) {
      const currentUser = await User.findOne({ email: session.user.email });
      if (currentUser) {
        currentUserId = currentUser._id;
        currentUserFollowing = currentUser.following || [];
      }
    }

    // Get users that current user is NOT following and NOT themselves
    const excludeIds = currentUserId 
      ? [currentUserId, ...currentUserFollowing]
      : [];

    const users = await User.find({
      _id: { $nin: excludeIds },
    })
      .select("name username email image bio followers following createdAt")
      .limit(20);

    // Calculate engagement score for each user
    const suggestedUsers = [];

    for (const user of users) {
      try {
        // Skip if no username
        if (!user.username) continue;

        // Get user's posts
        const userPosts = await Blog.find({ author: user._id });
        
        const totalViews = userPosts.reduce(
          (sum, post) => sum + (post.views || 0),
          0
        );
        const postsCount = userPosts.length;
        const followersCount = user.followers?.length || 0;

        // Calculate engagement score
        const engagementScore = totalViews + postsCount * 10 + followersCount * 5;

        suggestedUsers.push({
          _id: user._id.toString(),
          name: user.name,
          username: user.username,
          bio: user.bio || "No bio yet",
          image: user.image,
          followersCount,
          postsCount,
          engagementScore,
        });
      } catch (err) {
        console.error(`Error processing user ${user._id}:`, err);
        continue;
      }
    }

    // Sort by engagement score
    suggestedUsers.sort((a, b) => b.engagementScore - a.engagementScore);

    // Return top 10
    return NextResponse.json(suggestedUsers.slice(0, 10));
  } catch (error) {
    console.error("Suggested users error:", error);
    return NextResponse.json([], { status: 200 });
  }
}