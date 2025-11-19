// src/app/api/search/route.js - OPTIMIZED
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { User } from "@/lib/models/User";

// ✅ Cache for search results
let searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

function getCachedSearch(query) {
  const cached = searchCache.get(query);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedSearch(query, data) {
  // Prevent cache from growing too large
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  searchCache.set(query, {
    data,
    timestamp: Date.now()
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        posts: [],
        users: [],
        message: "Please enter a search query",
      });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // ✅ Check cache first
    const cached = getCachedSearch(normalizedQuery);
    if (cached) {
      console.log("📦 Returning cached search results for:", normalizedQuery);
      return NextResponse.json(cached);
    }

    await dbConnect();

    // ✅ OPTIMIZED: Use text search index (much faster than regex)
    // This requires the text index we created in the Blog model
    const [posts, users] = await Promise.all([
      // Search posts using text index
      Blog.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .select('title description coverImage author tags views commentCount averageRating ratingCount createdAt')
        .populate("author", "name username image")
        .sort({ score: { $meta: "textScore" } })
        .limit(10)
        .lean(),

      // Search users
      User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { bio: { $regex: query, $options: 'i' } },
        ],
      })
        .select("name username image bio followers")
        .limit(10)
        .lean()
    ]);

    const result = {
      posts,
      users,
      query,
    };

    // ✅ Cache the results
    setCachedSearch(normalizedQuery, result);

    console.log(`✅ Search completed: ${posts.length} posts, ${users.length} users`);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error("❌ Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search", details: error.message },
      { status: 500 }
    );
  }
}