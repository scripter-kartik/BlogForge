// src/app/api/blogs/[id]/rating/route.js - FIXED VERSION
import connectDB from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { User } from "@/lib/models/User.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

function toObjectId(id) {
  try {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    // Check if it's a valid 24-char hex string
    if (typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) {
      return new mongoose.Types.ObjectId(id);
    }
    return null;
  } catch (error) {
    console.error("toObjectId conversion error:", error, "Input:", id);
    return null;
  }
}

// Helper function to get MongoDB user ID
async function getMongoUserId(session) {
  if (!session?.user?.email) return null;
  
  // Try to get valid ObjectId from session
  const sessionId = session.user._id || session.user.id || session.user.sub;
  const validId = toObjectId(sessionId);
  
  if (validId) {
    return validId;
  }
  
  // Fallback: Look up by email
  console.log("Invalid ObjectId in session, looking up by email:", session.user.email);
  const dbUser = await User.findOne({ email: session.user.email });
  return dbUser ? dbUser._id : null;
}

// ✅ POST → Add/Update Rating
export async function POST(req, { params }) {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to rate." },
        { status: 401 }
      );
    }

    // ✅ FIX: Await params
    const { id } = await params;
    const { rating } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // ✅ Get valid MongoDB user ID
    const userId = await getMongoUserId(session);

    if (!userId) {
      console.error("❌ FAILED TO GET USER ID:", {
        sessionUser: session.user,
        email: session.user.email
      });
      
      return NextResponse.json(
        { 
          error: "Invalid user ID. Please log out and log back in.",
          debug: process.env.NODE_ENV === 'development' ? {
            message: "Could not extract valid MongoDB user ID from session",
            suggestion: "Please log out and log back in"
          } : undefined
        },
        { status: 400 }
      );
    }

    console.log("✅ Valid userId extracted:", userId.toString());

    // ✅ Check if user is author
    if (blog.author.equals(userId)) {
      return NextResponse.json(
        { error: "You cannot rate your own post" },
        { status: 403 }
      );
    }

    // ✅ Initialize ratings array if it doesn't exist
    if (!blog.ratings) blog.ratings = [];

    // ✅ Find existing rating
    const index = blog.ratings.findIndex(r => r.userId?.equals(userId));

    if (index !== -1) {
      // Update existing rating
      blog.ratings[index].rating = rating;
      blog.ratings[index].createdAt = new Date();
      console.log("✅ Updated existing rating");
    } else {
      // Add new rating
      blog.ratings.push({
        userId,
        rating,
        createdAt: new Date(),
      });
      console.log("✅ Added new rating");
    }

    await blog.save();

    return NextResponse.json(
      {
        success: true,
        averageRating: blog.averageRating || 0,
        ratingCount: blog.ratingCount || 0,
        userRating: rating,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Rating POST error:", err);
    return NextResponse.json(
      { 
        error: err.message || "Failed to rate post",
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

// ✅ GET - Fetch rating info
export async function GET(req, { params }) {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    
    // ✅ FIX: Await params
    const { id } = await params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!blog.ratings) blog.ratings = [];
    let userRating = null;

    if (session?.user) {
      const userId = await getMongoUserId(session);
      
      if (userId) {
        const match = blog.ratings.find(r => r.userId?.equals(userId));
        if (match) userRating = match.rating;
      }
    }

    return NextResponse.json(
      {
        userRating,
        averageRating: blog.averageRating || 0,
        ratingCount: blog.ratingCount || 0,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Rating GET error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch rating" },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Remove user's rating
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ FIX: Await params
    const { id } = await params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const userId = await getMongoUserId(session);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    blog.ratings = blog.ratings.filter(r => !r.userId?.equals(userId));
    await blog.save();

    return NextResponse.json(
      {
        success: true,
        averageRating: blog.averageRating || 0,
        ratingCount: blog.ratingCount || 0,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Rating DELETE error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete rating" },
      { status: 500 }
    );
  }
}