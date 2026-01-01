import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

let suggestedCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    let currentUserId = null;
    let currentUserFollowing = [];

    if (session?.user?.email) {
      const currentUser = await User.findOne({ email: session.user.email })
        .select('_id following')
        .lean();
      if (currentUser) {
        currentUserId = currentUser._id;
        currentUserFollowing = currentUser.following || [];
      }
    }

    const cacheKey = `${currentUserId || 'anonymous'}`;
    const now = Date.now();
    
    if (suggestedCache?.key === cacheKey && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("📦 Returning cached suggested users");
      return NextResponse.json(suggestedCache.data);
    }

    const excludeIds = currentUserId 
      ? [currentUserId, ...currentUserFollowing]
      : [];

    const users = await User.aggregate([
      { $match: { _id: { $nin: excludeIds.map(id => id) } } },
      
      {
        $lookup: {
          from: 'blogs',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      
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
      
      { $sort: { engagementScore: -1 } },
      
      { $limit: 20 },
      
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

    suggestedCache = {
      key: cacheKey,
      data: validUsers
    };
    cacheTimestamp = now;

    console.log(`Suggested users calculated: ${validUsers.length} users`);

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