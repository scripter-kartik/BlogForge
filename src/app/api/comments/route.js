// src/app/api/comments/route.js - OPTIMIZED
import connectDB from "@/lib/database/db.js";
import { Comment } from "@/lib/models/Comment.js";
import { Blog } from "@/lib/models/Blog.js";
import { User } from "@/lib/models/User.js";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { postId, authorId, content } = body;

    // ✅ Validation
    if (!postId || !authorId || !content?.trim()) {
      return Response.json(
        { error: "Missing required fields: postId, authorId, and content" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(authorId)) {
      return Response.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // ✅ OPTIMIZED: Check user existence with lean()
    const userExists = await User.findById(authorId).select('_id').lean();
    if (!userExists) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // ✅ Create comment and update blog count in parallel
    const [comment] = await Promise.all([
      Comment.create({
        postId,
        author: authorId,
        content: content.trim(),
      }),
      Blog.findByIdAndUpdate(
        postId,
        { $inc: { commentCount: 1 } },
        { new: true }
      )
    ]);

    // ✅ Populate after creation
    await comment.populate("author", "username name image email");

    console.log("✅ Comment created and blog updated");

    return Response.json(comment, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    return Response.json(
      { error: "Failed to create comment", details: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    
    if (!postId) {
      return Response.json([], { status: 200 });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return Response.json({ error: "Invalid postId" }, { status: 400 });
    }

    // ✅ OPTIMIZED: Use lean() for faster queries
    const comments = await Comment.find({ postId })
      .populate("author", "username name image")
      .populate("replies.author", "username name image")
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Fetched ${comments.length} comments`);

    return Response.json(comments, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
      return Response.json({ error: "Invalid commentId" }, { status: 400 });
    }

    // ✅ Delete comment and update blog count in parallel
    const deletedComment = await Comment.findByIdAndDelete(commentId).lean();

    if (!deletedComment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    // ✅ Update blog count asynchronously (don't wait)
    Blog.findByIdAndUpdate(
      deletedComment.postId,
      { $inc: { commentCount: -1 } }
    ).exec();

    console.log("✅ Comment deleted and blog updated");

    return Response.json({ success: true, message: "Comment deleted" }, { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    return Response.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}