// src/app/api/protected/blogposts/route.js - PROTECTED BLOG POSTS API
import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { User } from "@/lib/models/User.js";

export async function POST(req) {
  try {
    await connectDB();

    const userEmail = req.headers.get("user-email");
    const userName = req.headers.get("user-name");

    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    async function updatePostCategories() {
      const trendingThresholdViews = 100;
      const featuredThresholdRating = 4.5;

      // Mark Trending posts
      await Blog.updateMany(
        { views: { $gte: trendingThresholdViews } },
        { category: "Trending" }
      );

      // Mark Featured posts
      await Blog.updateMany(
        { starRating: { $gte: featuredThresholdRating } },
        { category: "Featured" }
      );

      // Reset other posts to Latest if they do not meet trending or featured
      await Blog.updateMany(
        {
          views: { $lt: trendingThresholdViews },
          starRating: { $lt: featuredThresholdRating },
        },
        { category: "Latest" }
      );
    }

    const body = await req.json();

    // Calculate estimated read time (roughly 200 words per minute)
    const wordCount = body.description ? body.description.split(" ").length : 0;
    const estimatedRead = Math.max(1, Math.ceil(wordCount / 200));

    const newPost = await Blog.create({
      ...body,
      author: user._id,
      authorName: userName || user.name,
      authorImage: user.image || "/imageProfile1.png",
      estimatedRead,
      views: 0,
      commentCount: 0,
      starRating: body.starRating || 0,
    });

    updatePostCategories().catch((err) =>
      console.error("Error updating categories:", err)
    );

    // Populate author info for response
    await newPost.populate("author", "name username image");

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      {
        error: "Failed to create post",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
