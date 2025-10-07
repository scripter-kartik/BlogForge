// src/lib/models/Blog.js

import mongoose from "mongoose";
import { User } from "@/lib/models/User.js";

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: User },
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Blog =
  mongoose.models.blogs || mongoose.model("blogs", BlogPostSchema);
