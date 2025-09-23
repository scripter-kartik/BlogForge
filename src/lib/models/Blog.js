import mongoose from "mongoose";

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: User },
  content: { type: String },
  tags: [String],

  starRating: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  Views: { type: Number, default: 0 },
  estimateRead: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Blog =
  mongoose.models.blogs || mongoose.model("user", BlogPostSchema);
