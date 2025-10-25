// ============================================
// UPDATED: src/app/api/comments/route.js
// ============================================
import connectDB from "@/lib/database/db.js";
import { Comment } from "@/lib/models/Comment.js";
import { User } from "@/lib/models/User.js";
import mongoose from "mongoose";

// POST new comment
export async function POST(req) {
  try {
    await connectDB();
    console.log("✅ Database connected");

    const body = await req.json();
    console.log("📝 Request body:", body);

    const { postId, authorId, content } = body;

    // Validation
    if (!postId || !authorId || !content?.trim()) {
      console.log("❌ Missing fields:", { postId, authorId, hasContent: !!content });
      return Response.json(
        { error: "Missing required fields: postId, authorId, and content" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log("❌ Invalid postId:", postId);
      return Response.json(
        { error: "Invalid postId format" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      console.log("❌ Invalid authorId:", authorId);
      return Response.json(
        { error: "Invalid authorId format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const userExists = await User.findById(authorId);
    if (!userExists) {
      console.log("❌ User not found:", authorId);
      return Response.json(
        { 
          error: "User not found. Please make sure the user exists in the database.",
          details: `No user found with ID: ${authorId}`
        },
        { status: 404 }
      );
    }
    console.log("✅ User found:", userExists.name);

    // Create comment
    console.log("📝 Creating comment...");
    const comment = await Comment.create({
      postId,
      author: authorId,
      content: content.trim(),
    });
    console.log("✅ Comment created:", comment._id);

    // Populate author details
    await comment.populate("author", "username name image");
    console.log("✅ Author populated:", comment.author);

    return Response.json(comment, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });

    return Response.json(
      { 
        error: "Failed to create comment",
        details: err.message,
        type: err.name
      },
      { status: 500 }
    );
  }
}

// GET all comments for a post
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    
    if (!postId) {
      return Response.json([], { status: 200 });
    }

    const comments = await Comment.find({ postId })
      .populate("author", "username name image")
      .populate("replies.author", "username name image")
      .sort({ createdAt: -1 })
      .lean();

    return Response.json(comments, { status: 200 });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// DELETE comment
export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return Response.json({ error: "Missing commentId parameter" }, { status: 400 });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    return Response.json({ success: true, message: "Comment deleted" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting comment:", err);
    return Response.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}