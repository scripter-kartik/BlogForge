import connectDB from "@/lib/database/db.js";
import { Comment } from "@/lib/models/Comment.js";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  await connectDB();
  try {
    const { commentId } = params;
    const body = await req.json();
    const { authorId, content } = body;

    if (!commentId || !authorId || !content?.trim()) {
      return Response.json(
        { error: "Missing required fields: commentId, authorId, and content" },
        { status: 400 }
      );
    }

    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      author: authorId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: { $each: [newReply], $position: 0 } } },
      { new: true }
    )
      .populate("author", "username name image")
      .populate("replies.author", "username name image");

    if (!updatedComment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    const savedReply = updatedComment.replies.find(
      (r) => r._id.toString() === newReply._id.toString()
    );

    return Response.json(savedReply, { status: 201 });
  } catch (err) {
    console.error("Error creating reply:", err);
    return Response.json({ error: "Failed to create reply" }, { status: 500 });
  }
}