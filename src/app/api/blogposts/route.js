// src/app/api/blogposts/route.js

import dbConnect from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  
  // ✅ FIX: Populate author field instead of using .lean()
  const posts = await Blog.find()
    .populate("author", "name username image")
    .sort({ createdAt: -1 });
  
  return NextResponse.json(posts);
}

export async function POST(request) {
  await dbConnect();
  const body = await request.json();

  try {
    const newPost = await Blog.create(body);
    
    // ✅ Populate author before returning
    await newPost.populate("author", "name username image");
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}