import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET() {
  console.log("🔥 /api/blogposts/for-you route called");
  try {
    await dbConnect();
    console.log("DB connected");
    const forYouPosts = await Blog.find({})
      .sort({ views: -1, starRating: -1, createdAt: -1 })
      .limit(21)
      .populate("author", "username name image");

    console.log("/api/blogposts/for-you returned:", forYouPosts.length);
    return NextResponse.json(forYouPosts, { status: 200 });
  } catch (err) {
    console.error("❌ Error in /api/blogposts/for-you:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
