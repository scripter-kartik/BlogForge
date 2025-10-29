// ============================================
// COMPLETE: src/app/api/comments/route.js
// ============================================
import connectDB from "@/lib/database/db.js";
import { Comment } from "@/lib/models/Comment.js";
import { Blog } from "@/lib/models/Blog.js";
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
          error: "User not found",
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

    // ✅ UPDATE BLOG'S COMMENT COUNT
    await Blog.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { new: true }
    );
    console.log("✅ Blog comment count updated");

    // Populate author details
    await comment.populate("author", "username name image email");
    console.log("✅ Comment populated:", {
      author: comment.author,
      content: comment.content,
      _id: comment._id
    });

    return Response.json(comment, { status: 201 });
  } catch (err) {
    console.error("❌ Error creating comment:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
    });

    return Response.json(
      { 
        error: "Failed to create comment",
        details: err.message,
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

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return Response.json({ error: "Invalid postId" }, { status: 400 });
    }

    const comments = await Comment.find({ postId })
      .populate("author", "username name image")
      .populate("replies.author", "username name image")
      .sort({ createdAt: -1 });

    console.log("✅ Fetched comments:", comments.length);

    return Response.json(comments, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
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

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return Response.json({ error: "Invalid commentId" }, { status: 400 });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    // ✅ DECREMENT BLOG'S COMMENT COUNT
    await Blog.findByIdAndUpdate(
      deletedComment.postId,
      { $inc: { commentCount: -1 } },
      { new: true }
    );
    console.log("✅ Blog comment count decremented");

    return Response.json({ success: true, message: "Comment deleted" }, { status: 200 });
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    return Response.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}