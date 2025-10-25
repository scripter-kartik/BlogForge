import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";

/**
 * GET /api/blogposts/for-you
 *
 * Simple "for you" logic:
 *  - Fetches posts sorted by a combination of views, starRating and recency
 *  - Populates author with username, name, image so frontend can link to profiles
 *  - Limits to 21 posts
 *
 * NOTE: This is a server-side starting point. If you later add user interests / following
 * to your User model, you can enhance this endpoint to filter / prioritize per-user.
 */
export async function GET() {
  console.log("🔥 /api/blogposts/for-you route called");
  try {
    await dbConnect();
    console.log("✅ DB connected");

    // Basic ranking: primarily by views, then starRating, then recency
    // This gives a "personalized-feel" feed without needing user data.
    const forYouPosts = await Blog.find({})
      .sort({ views: -1, starRating: -1, createdAt: -1 })
      .limit(21)
      .populate("author", "username name image");

    console.log("✅ /api/blogposts/for-you returned:", forYouPosts.length);
    return NextResponse.json(forYouPosts, { status: 200 });
  } catch (err) {
    console.error("❌ Error in /api/blogposts/for-you:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
