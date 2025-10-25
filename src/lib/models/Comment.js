// src/lib/models/Comment.js
// ============================================
import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxlength: 1000 },
    },
    { timestamps: true }
);

const CommentSchema = new mongoose.Schema(
    {
        postId: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        replies: [ReplySchema],
    },
    { timestamps: true }
);

// Index for faster queries
CommentSchema.index({ postId: 1, createdAt: -1 });

export const Comment = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);