import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET() {
    console.log("🔥 /api/blogposts/trending route called");
    try {
        console.log("Connecting to DB...");
        await dbConnect();
        console.log("✅ DB connected");

        console.log("Fetching trending posts...");
        const trendingPosts = await Blog.find({})
            .sort({ views: -1 })
            .limit(21)
            .populate("author", "name image");

        console.log("✅ Posts fetched:", trendingPosts.length);
        return NextResponse.json(trendingPosts, { status: 200 });
    } catch (err) {
        console.error("❌ Error fetching trending posts:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
