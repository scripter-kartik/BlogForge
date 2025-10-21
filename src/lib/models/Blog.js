// src/lib/models/Blog.js
import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String },
    // reference should be the model name string, not the imported object
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    tags: [String],
    category: {
      type: String,
      enum: ["Featured", "Trending", "Latest"],
      default: "Latest",
    },
    starRating: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    estimatedRead: { type: Number, default: 0 },
  },
  {
    timestamps: true, // uses createdAt and updatedAt automatically
  }
);

// Use consistent PascalCase singular model name "Blog"
export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogPostSchema);
