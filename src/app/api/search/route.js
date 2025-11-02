// src/app/api/search/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/db.js";
import Post from "@/lib/models/Post";
import { User } from "@/lib/models/User";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        posts: [],
        users: [],
        message: "Please enter a search query",
      });
    }

    const searchRegex = new RegExp(query, "i"); // Case-insensitive search

    // Search posts by title, description, or content
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
      ],
    })
      .populate("author", "name username image")
      .sort({ createdAt: -1 })
      .limit(10);

    // Search users by name, username, or bio
    const users = await User.find({
      $or: [
        { name: { $regex: searchRegex } },
        { username: { $regex: searchRegex } },
        { bio: { $regex: searchRegex } },
      ],
    })
      .select("name username image bio followers")
      .limit(10);

    return NextResponse.json({
      posts,
      users,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}