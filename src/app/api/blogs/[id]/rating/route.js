// src/app/api/blogs/[id]/rating/route.js
import connectDB from "@/lib/database/db.js";
import { Blog } from "@/lib/models/Blog.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

function toObjectId(id) {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
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

    const { id } = params;
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

    // ✅ Only use MongoDB ID
    const userIdRaw = session.user._id || session.user.id;
    const userId = toObjectId(userIdRaw);

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user ID. Rating failed." },
        { status: 400 }
      );
    }

    if (blog.author.equals(userId)) {
      return NextResponse.json(
        { error: "You cannot rate your own post" },
        { status: 403 }
      );
    }

    if (!blog.ratings) blog.ratings = [];

    const index = blog.ratings.findIndex(r => r.userId?.equals(userId));

    if (index !== -1) {
      blog.ratings[index].rating = rating;
      blog.ratings[index].createdAt = new Date();
    } else {
      blog.ratings.push({
        userId,
        rating,
        createdAt: new Date(),
      });
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
    console.error("Rating error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to rate post" },
      { status: 500 }
    );
  }
}

// ✅ GET
export async function GET(req, { params }) {
  await connectDB();
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!blog.ratings) blog.ratings = [];
    let userRating = null;

    if (session?.user) {
      const userIdRaw = session.user._id || session.user.id;
      const userId = toObjectId(userIdRaw);

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
    console.error("Error fetching rating:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch rating" },
      { status: 500 }
    );
  }
}

// ✅ DELETE
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

    const { id } = params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const userIdRaw = session.user._id || session.user.id;
    const userId = toObjectId(userIdRaw);

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
    console.error("Error deleting rating:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete rating" },
      { status: 500 }
    );
  }
}
