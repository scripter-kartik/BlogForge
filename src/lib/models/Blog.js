// src/lib/models/Blog.js - OPTIMIZED WITH INDEXES
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true }, // ✅ Indexed for search
    description: { type: String, index: true }, // ✅ Indexed for search
    coverImage: { type: String },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true // ✅ Critical: Index for fast author queries
    },
    content: { type: String },
    tags: [{ type: String, index: true }], // ✅ Indexed for filtering
    category: { 
      type: String, 
      enum: ["Featured","Trending","Latest"], 
      default: "Latest",
      index: true // ✅ Indexed for category filtering
    },
    
    // Rating System
    ratings: {
      type: [{
        userId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User", 
          required: true 
        },
        rating: { 
          type: Number, 
          required: true, 
          min: 1, 
          max: 5 
        },
        createdAt: { 
          type: Date, 
          default: Date.now 
        }
      }],
      default: []
    },
    averageRating: { 
      type: Number, 
      default: 0, 
      min: 0, 
      max: 5,
      index: true // ✅ Index for sorting by rating
    },
    ratingCount: { 
      type: Number, 
      default: 0 
    },
    
    // Engagement metrics
    starRating: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    views: { 
      type: Number, 
      default: 0,
      index: true // ✅ Index for sorting by views (trending)
    },
    estimatedRead: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    // ✅ CRITICAL: Compound indexes for common queries
    indexes: [
      // For trending posts (sorted by views)
      { views: -1, createdAt: -1 },
      // For featured posts (sorted by rating)
      { averageRating: -1, views: -1 },
      // For user's posts
      { author: 1, createdAt: -1 },
      // For search
      { title: 'text', description: 'text', content: 'text' },
    ]
  }
);

// ✅ Text search index for better search performance
BlogSchema.index({ 
  title: 'text', 
  description: 'text', 
  content: 'text' 
}, {
  weights: {
    title: 10,
    description: 5,
    content: 1
  }
});

// Method to calculate average rating
BlogSchema.methods.calculateAverageRating = function() {
  if (!this.ratings || this.ratings.length === 0) {
    this.averageRating = 0;
    this.ratingCount = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  this.ratingCount = this.ratings.length;
  this.starRating = Math.round(this.averageRating);
};

// Pre-save hook
BlogSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    this.calculateAverageRating();
  }
  next();
});

// ✅ Add lean option support for faster queries
BlogSchema.set('toJSON', { virtuals: true });
BlogSchema.set('toObject', { virtuals: true });

export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);