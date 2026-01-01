import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { NextResponse } from "next/server";

let postsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; 

export async function GET() {
  try {
    const now = Date.now();
    if (postsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log("📦 Returning cached posts");
      return NextResponse.json(postsCache, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        }
      });
    }

    await dbConnect();
    const posts = await Blog.find()
      .select('title description coverImage author tags category averageRating ratingCount views commentCount estimatedRead createdAt updatedAt')
      .populate("author", "name username image")
      .sort({ createdAt: -1 })
      .lean() 
      .exec();

    postsCache = posts;
    cacheTimestamp = now;

    console.log(`Fetched ${posts.length} posts from DB`);

    return NextResponse.json(posts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const newPost = await Blog.create(body);
    await newPost.populate("author", "name username image");

    postsCache = null;
    cacheTimestamp = 0;

    console.log("New post created, cache invalidated");

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}