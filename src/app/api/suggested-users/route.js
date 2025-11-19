// src/app/api/suggested-users/route.js - OPTIMIZED
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

// ✅ Cache for suggested users
let suggestedCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    let currentUserId = null;
    let currentUserFollowing = [];

    // Get current user if authenticated
    if (session?.user?.email) {
      const currentUser = await User.findOne({ email: session.user.email })
        .select('_id following')
        .lean();
      if (currentUser) {
        currentUserId = currentUser._id;
        currentUserFollowing = currentUser.following || [];
      }
    }

    // ✅ Check cache (but only for non-authenticated users or if no specific exclusions)
    const cacheKey = `${currentUserId || 'anonymous'}`;
    const now = Date.now();
    
    if (suggestedCache?.key === cacheKey && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("📦 Returning cached suggested users");
      return NextResponse.json(suggestedCache.data);
    }

    // Get users that current user is NOT following and NOT themselves
    const excludeIds = currentUserId 
      ? [currentUserId, ...currentUserFollowing]
      : [];

    // ✅ OPTIMIZED: Use aggregation pipeline for better performance
    const users = await User.aggregate([
      // Filter out excluded users
      { $match: { _id: { $nin: excludeIds.map(id => id) } } },
      
      // Lookup user's posts count and views
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      
      // Calculate engagement metrics
      {
        $addFields: {
          postsCount: { $size: '$posts' },
          totalViews: { $sum: '$posts.views' },
          followersCount: { $size: { $ifNull: ['$followers', []] } },
          engagementScore: {
            $add: [
              { $sum: '$posts.views' },
              { $multiply: [{ $size: '$posts' }, 10] },
              { $multiply: [{ $size: { $ifNull: ['$followers', []] } }, 5] }
            ]
          }
        }
      },
      
      // Sort by engagement score
      { $sort: { engagementScore: -1 } },
      
      // Limit to top users
      { $limit: 20 },
      
      // Project only needed fields
      {
        $project: {
          name: 1,
          username: 1,
          image: 1,
          bio: 1,
          followersCount: 1,
          postsCount: 1,
          engagementScore: 1
        }
      }
    ]);

    // Filter out users without username
    const validUsers = users
      .filter(user => user.username)
      .map(user => ({
        _id: user._id.toString(),
        name: user.name,
        username: user.username,
        bio: user.bio || "No bio yet",
        image: user.image,
        followersCount: user.followersCount || 0,
        postsCount: user.postsCount || 0,
        engagementScore: user.engagementScore || 0,
      }))
      .slice(0, 10);

    // ✅ Cache the results
    suggestedCache = {
      key: cacheKey,
      data: validUsers
    };
    cacheTimestamp = now;

    console.log(`✅ Suggested users calculated: ${validUsers.length} users`);

    return NextResponse.json(validUsers, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
      }
    });
  } catch (error) {
    console.error("Suggested users error:", error);
    return NextResponse.json([], { status: 200 });
  }
}