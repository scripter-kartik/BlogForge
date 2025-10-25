import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";

export async function GET() {
    console.log("🔥 /api/blogposts/latest route called");
    try {
        console.log("Connecting to DB...");
        await dbConnect();
        console.log("✅ DB connected");

        console.log("Fetching latest posts...");
        const latestPosts = await Blog.find({})
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(21)
            .populate("author", "name image");

        console.log("✅ Posts fetched:", latestPosts.length);
        return NextResponse.json(latestPosts, { status: 200 });
    } catch (err) {
        console.error("❌ Error fetching latest posts:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
