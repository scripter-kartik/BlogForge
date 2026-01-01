import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { User } from "@/lib/models/User";

const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({
        posts: [],
        users: [],
        message: "Please enter a search query",
      });
    }

    const cacheKey = query.toLowerCase();
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Cache hit for:", query);
      return NextResponse.json(cached.data);
    }

    await dbConnect();

    const [posts, users] = await Promise.all([
      searchPosts(query),
      searchUsers(query)
    ]);

    console.log(`Found ${posts.length} posts and ${users.length} users for: "${query}"`);

    const result = { posts, users, query };

    if (searchCache.size >= MAX_CACHE_SIZE) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    searchCache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed", posts: [], users: [], details: error.message },
      { status: 500 }
    );
  }
}

async function searchPosts(query) {
  try {
    const results = await Blog.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .select('title description coverImage author createdAt views')
      .populate("author", "name username image")
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean();
    
    console.log(`Text search found ${results.length} posts`);
    return results;
  } catch (error) {
    console.warn("Text search failed, using regex");
    return await Blog.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
      .select('title description coverImage author createdAt views')
      .populate("author", "name username image")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
  }
}

async function searchUsers(query) {
  try {
    const results = await User.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .select("name username image bio")
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .lean();
    
    console.log(`👤 Text search found ${results.length} users`);
    return results;
  } catch (error) {
    console.warn("User text search failed, using regex");
    return await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ]
    })
      .select("name username image bio")
      .limit(10)
      .lean();
  }
}