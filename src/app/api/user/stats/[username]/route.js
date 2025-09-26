import { NextResponse } from "next/server";
import connectDB from "@/lib/database/db.js";
import { User } from "@/lib/models/User.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { username } = params;

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const blogs = await Blog.find({ author: user._id });

    const totalViews = blogs.reduce((acc, blog) => acc + blog.views, 0);
    const totalPosts = blogs.length;
    const avgRating =
      totalPosts > 0
        ? blogs.reduce((sum, blog) => sum + blog.starRating, 0) / totalPosts
        : 0;

    return NextResponse.json({
      totalViews,
      totalPosts,
      avgRating: Number(avgRating.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
